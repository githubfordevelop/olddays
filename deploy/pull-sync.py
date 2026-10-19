#!/usr/bin/env python3
"""Deploy only public main-branch commits whose selected GitHub CI succeeded.
No repository code is executed. Only regular files under dist/ are extracted.
"""
import io, json, os, re, shutil, stat, sys, tempfile, urllib.request, zipfile
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

REPO = os.environ.get('OLDDAYS_REPOSITORY', 'githubfordevelop/olddays')
ROOT = Path(os.environ.get('OLDDAYS_ROOT', '/srv/olddays'))
HOST = os.environ.get('OLDDAYS_HOST', '121.40.22.96')
MAX_ARCHIVE = 40 * 1024 * 1024
MAX_DIST = 20 * 1024 * 1024
HEADERS = {'User-Agent': 'Olddays-Public-CI-Deploy/0.1', 'Accept': 'application/vnd.github+json'}
if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', REPO):
    raise SystemExit('Invalid repository')

def download(url, maximum=MAX_ARCHIVE, headers=None):
    request = urllib.request.Request(url, headers=headers or HEADERS)
    with urllib.request.urlopen(request, timeout=40) as response:
        data=response.read(maximum+1)
    if len(data)>maximum:
        raise RuntimeError('Download exceeds configured size limit')
    return data

def switch(target):
    temporary=ROOT/('.current-'+str(os.getpid()))
    if temporary.is_symlink():temporary.unlink()
    temporary.symlink_to(target)
    os.replace(temporary,ROOT/'current')

def sync():
    url=f'https://api.github.com/repos/{REPO}/actions/workflows/deploy.yml/runs?branch=main&event=push&status=success&per_page=1'
    runs=json.loads(download(url,2*1024*1024)).get('workflow_runs',[])
    runs=[r for r in runs if r.get('conclusion')=='success' and r.get('head_branch')=='main' and r.get('event')=='push' and r.get('head_repository',{}).get('full_name')==REPO]
    if not runs:
        print('No successful main CI run available; current release retained.')
        return
    sha=runs[0]['head_sha']
    if not re.fullmatch(r'[0-9a-f]{40}',sha):raise RuntimeError('Invalid commit SHA')
    release=ROOT/'releases'/sha
    current=ROOT/'current'
    previous=current.resolve() if current.is_symlink() else None
    if previous==release:
        print('Current release already matches successful CI:',sha)
        return
    ROOT.joinpath('releases').mkdir(parents=True,exist_ok=True)
    if not release.exists():
        archive=download(f'https://codeload.github.com/{REPO}/zip/{sha}')
        stage=Path(tempfile.mkdtemp(prefix='.partial-',dir=ROOT/'releases'))
        os.chmod(stage,0o755)
        try:
            total=0;count=0
            with zipfile.ZipFile(io.BytesIO(archive)) as z:
                for member in z.infolist():
                    parts=PurePosixPath(member.filename).parts
                    if len(parts)<3 or parts[1]!='dist':continue
                    relative=PurePosixPath(*parts[2:])
                    if relative.is_absolute() or '..' in relative.parts:raise RuntimeError('Invalid archive path')
                    if stat.S_ISLNK(member.external_attr>>16):raise RuntimeError('Symlinks are not allowed')
                    destination=stage.joinpath(*relative.parts)
                    if member.is_dir():destination.mkdir(parents=True,exist_ok=True);continue
                    total+=member.file_size;count+=1
                    if total>MAX_DIST or member.file_size>10*1024*1024 or count>1000:raise RuntimeError('Static payload exceeds limits')
                    destination.parent.mkdir(parents=True,exist_ok=True)
                    with z.open(member) as source,destination.open('wb') as target:shutil.copyfileobj(source,target)
                    destination.chmod(0o644)
            for required in ['index.html','app.js','annual-news.js','annual-news-extra.js','mobile-scenes.js','style.css']:
                if not (stage/required).is_file() or not (stage/required).stat().st_size:raise RuntimeError('Incomplete release: '+required)
            version={'repository':REPO,'commit':sha,'ci_run':runs[0]['html_url'],'deployed_at':datetime.now(timezone.utc).isoformat()}
            (stage/'version.json').write_text(json.dumps(version)+'\n')
            (stage/'version.json').chmod(0o644)
            os.replace(stage,release)
        except Exception:
            shutil.rmtree(stage,ignore_errors=True)
            raise
    switch(release)
    if previous and previous.exists():
        try:
            health=json.loads(download('http://127.0.0.1/version.json',4096,{'Host':HOST,'Cache-Control':'no-cache'}))
            if health.get('commit')!=sha:raise RuntimeError('HTTP health check returned a different release')
        except Exception:
            switch(previous)
            raise RuntimeError('HTTP health check failed; previous release restored')
    print('Published successful CI commit:',sha)

if __name__=='__main__':
    try:sync()
    except Exception as error:
        print('Deployment retained current version:',type(error).__name__,str(error),file=sys.stderr)
        raise SystemExit(1)
