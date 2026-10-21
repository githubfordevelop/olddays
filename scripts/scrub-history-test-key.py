#!/usr/bin/env python3
"""Remove the known upstream test key from reachable history and downloadable archives."""
import argparse,hashlib,importlib.util,io,json,os,pathlib,re,subprocess,sys,tarfile,tempfile,urllib.request,urllib.error,urllib.parse,zipfile
KNOWN='b950683a209422071c6018a95cae890a577d9a6acde0cef88a529142d92dc00c'
MAX_BYTES=600_000_000
stats={'removed_test_key_files':0,'archives_opened':0,'assets_checked':0,'assets_replaced':0,'artifacts_checked':0,'artifacts_deleted':0}
cache={}
def git(*args,input=None):return subprocess.check_output(['git',*args],input=input)
def clean(data,depth=0):
    if hashlib.sha256(data).hexdigest()==KNOWN:
        stats['removed_test_key_files']+=1;return None
    if len(data)>MAX_BYTES or depth>8:raise RuntimeError('Archive resource limit: explicit review required')
    digest=hashlib.sha256(data).digest()
    if digest in cache:return cache[digest]
    if data.startswith(b'PK\x03\x04'):
        stats['archives_opened']+=1;changed=False;out=io.BytesIO()
        with zipfile.ZipFile(io.BytesIO(data)) as src,zipfile.ZipFile(out,'w') as dst:
            dst.comment=src.comment
            for info in src.infolist():
                if info.file_size>MAX_BYTES:raise RuntimeError('Oversized ZIP member')
                old=src.read(info);new=clean(old,depth+1) if not info.is_dir() else old
                if new!=old:changed=True
                if new is not None:dst.writestr(info,new)
        result=out.getvalue() if changed else data
    elif data.startswith(b'\x1f\x8b') or (len(data)>262 and data[257:262]==b'ustar'):
        try:src=tarfile.open(fileobj=io.BytesIO(data))
        except tarfile.TarError:return data
        stats['archives_opened']+=1;changed=False;out=io.BytesIO()
        with src,tarfile.open(fileobj=out,mode='w:gz' if data.startswith(b'\x1f\x8b') else 'w') as dst:
            for info in src:
                if not info.isfile():dst.addfile(info);continue
                if info.size>MAX_BYTES:raise RuntimeError('Oversized TAR member')
                old=src.extractfile(info).read();new=clean(old,depth+1)
                if new!=old:changed=True
                if new is not None:
                    info.size=len(new);dst.addfile(info,io.BytesIO(new))
        result=out.getvalue() if changed else data
    else:result=data
    # Keep only rewritten archive data in cache; ordinary source files need no retained copy.
    if result!=data and len(result)<25_000_000:cache[digest]=result
    return result

def load_auditor(path):
    s=importlib.util.spec_from_file_location('credential_audit',path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

def verify_blob(auditor,data,path):
    f=[];s={'items':0,'archives':0,'historical_public_test_fixtures':0,'skipped':[]}
    auditor.inspect(data,path,f,s,False)
    if f or s['skipped']:
        # Findings contain path/type/line only, never credential values.
        print(json.dumps({'credential_findings':f,'skipped':s['skipped']}),flush=True)
        raise RuntimeError('Credential audit failed; do not publish')

def public_refs():
    rows=git('for-each-ref','--format=%(refname) %(objectname)','refs/heads','refs/tags').decode().splitlines()
    return dict(row.split(' ',1) for row in rows)

def blob_rows():
    return [r.split(' ',1) for r in git('rev-list','--objects','--branches','--tags').decode().splitlines()]

def all_blobs():
    p=subprocess.Popen(['git','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE)
    try:
        for row in blob_rows():
            p.stdin.write((row[0]+'\n').encode());p.stdin.flush();h=p.stdout.readline().split();data=p.stdout.read(int(h[2]));p.stdout.read(1)
            if h[1]==b'blob':yield row[0],row[1] if len(row)>1 else row[0],data
    finally:p.stdin.close();p.wait()

def rewrite(auditor,workspace,push):
    # Checkout fetch-depth=0 provides remote branches; create corresponding local heads.
    for row in git('for-each-ref','--format=%(refname) %(objectname)','refs/remotes/origin').decode().splitlines():
        ref,sha=row.split();name=ref.removeprefix('refs/remotes/origin/')
        if name!='HEAD' and name!='main':git('update-ref','refs/heads/'+name,sha)
    before=public_refs();replacements={};scanned=0
    for sha,path,data in all_blobs():
        scanned+=1;new=clean(data)
        if new is None:raise RuntimeError('Unexpected loose test-key blob; review before removal')
        verify_blob(auditor,new,path)
        if new!=data:replacements[sha]=git('hash-object','-w','--stdin',input=new).decode().strip()
    (workspace/'replacement-map.json').write_text(json.dumps(replacements))
    (workspace/'index_filter.py').write_text('''import json,subprocess,pathlib
m=json.loads((pathlib.Path(__file__).parent/'replacement-map.json').read_text())
rows=subprocess.check_output(['git','ls-files','--stage','-z']).split(b'\\0')
updates=[]
for row in rows:
 if not row:continue
 meta,path=row.split(b'\\t',1);mode,sha,stage=meta.split()
 if sha.decode() in m:
  updates.append(mode+b' '+m[sha.decode()].encode()+b' '+stage+b'\\t'+path+b'\\0')
if updates:subprocess.run(['git','update-index','-z','--index-info'],input=b''.join(updates),check=True)
''')
    env=dict(os.environ,FILTER_BRANCH_SQUELCH_WARNING='1')
    if replacements:
        with (workspace/'filter-branch.log').open('wb') as log:
            subprocess.run(['git','filter-branch','--force','--index-filter','python3 '+str(workspace/'index_filter.py'),'--tag-name-filter','cat','--','--branches','--tags'],env=env,stdout=log,stderr=log,check=True)
    after=public_refs();assert set(before)==set(after)
    # Remove backup and remote-tracking refs so the next audit does not retain original history.
    for ref in git('for-each-ref','--format=%(refname)','refs/original','refs/remotes').decode().splitlines():git('update-ref','-d',ref)
    for sha,path,data in all_blobs():verify_blob(auditor,data,path)
    changes={r:after[r] for r in before if before[r]!=after[r]}
    if push and changes:
        cmd=['git','push','--atomic','origin']
        cmd+=['--force-with-lease='+r+':'+before[r] for r in changes]
        cmd+=[r+':'+r for r in changes]
        result=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
        (workspace/'push.log').write_bytes(result.stdout)
        if result.returncode:raise RuntimeError('Atomic leased push failed; see local push log')
    (workspace/'ref-map-offline.json').write_text(json.dumps({'before':before,'after':after}))
    return {'historical_blobs_checked':scanned,'archive_blob_versions_rewritten':len(replacements),'refs_rewritten':len(changes),'branches':sum(r.startswith('refs/heads/') for r in after),'tags':sum(r.startswith('refs/tags/') for r in after),'main':after['refs/heads/main']}

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*a,**k):return None

def request(method,url,token=None,data=None,headers=None):
    h={'User-Agent':'olddays-security-cleanup','Accept':'application/vnd.github+json'}
    if token:
        if urllib.parse.urlsplit(url).hostname!='api.github.com' and urllib.parse.urlsplit(url).hostname!='uploads.github.com':raise RuntimeError('Refusing credential transmission to unknown host')
        h['Authorization']='Bearer '+token
    if headers:h.update(headers)
    req=urllib.request.Request(url,data=data,headers=h,method=method)
    return urllib.request.build_opener(NoRedirect).open(req,timeout=120)

def api(method,path,token,payload=None):
    with request(method,'https://api.github.com'+path,token,json.dumps(payload).encode() if payload is not None else None,{'Content-Type':'application/json'}) as r:
        b=r.read();return json.loads(b) if b else None

def pages(path,token):
    result=[];page=1
    while True:
        batch=api('GET',path+('&' if '?' in path else '?')+'per_page=100&page='+str(page),token)
        items=batch['artifacts'] if isinstance(batch,dict) else batch;result+=items
        if len(items)<100:return result
        page+=1

def download_api(path,token):
    try:
        with request('GET','https://api.github.com'+path,token,headers={'Accept':'application/octet-stream'}) as r:return r.read(MAX_BYTES+1)
    except urllib.error.HTTPError as e:
        if e.code not in (301,302,303,307,308):raise RuntimeError('Download API failed: HTTP '+str(e.code)) from None
        url=e.headers['Location'];parts=urllib.parse.urlsplit(url)
        if parts.scheme!='https' or not(parts.hostname.endswith('.githubusercontent.com') or parts.hostname in ('github.com','codeload.github.com')):raise RuntimeError('Unexpected download host')
        # Authorization is deliberately omitted from the signed download URL.
        with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'olddays-security-cleanup'}),timeout=180) as r:return r.read(MAX_BYTES+1)

def assets(auditor,token,repository):
    root='/repos/'+repository;releases=pages(root+'/releases',token)
    inventory=[]
    for release in releases:
        for asset in pages(root+'/releases/'+str(release['id'])+'/assets',token):
            data=download_api(root+'/releases/assets/'+str(asset['id']),token)
            if len(data)>MAX_BYTES:raise RuntimeError('Release asset too large; do not silently skip')
            new=clean(data)
            if new is None:raise RuntimeError('Unexpected loose private key release asset')
            verify_blob(auditor,new,asset['name']);stats['assets_checked']+=1
            changed=new!=data
            if changed:
                if release.get('immutable'):raise RuntimeError('Immutable release needs owner action: '+release['tag_name'])
                upload=release['upload_url'].split('{',1)[0]+'?'+urllib.parse.urlencode({'name':asset['name']+'.sanitized-'+os.environ.get('GITHUB_RUN_ID','local')})
                with request('POST',upload,token,new,{'Content-Type':asset.get('content_type') or 'application/octet-stream'}) as r:staged=json.loads(r.read())
                check=download_api(root+'/releases/assets/'+str(staged['id']),token)
                if hashlib.sha256(check).digest()!=hashlib.sha256(new).digest():raise RuntimeError('Uploaded release verification failed; old asset retained')
                api('DELETE',root+'/releases/assets/'+str(asset['id']),token)
                api('PATCH',root+'/releases/assets/'+str(staged['id']),token,{'name':asset['name'],'label':asset.get('label') or ''})
                stats['assets_replaced']+=1
            inventory.append({'tag':release['tag_name'],'asset':asset['name'],'cleaned':changed,'sha256':hashlib.sha256(new).hexdigest()})
    for release in releases:
        data=download_api(root+'/tarball/'+urllib.parse.quote(release['tag_name'],safe=''),token)
        if len(data)>MAX_BYTES:raise RuntimeError('Generated source archive too large')
        cleaned=clean(data)
        if cleaned!=data:raise RuntimeError('Generated tag archive still contains test key')
        verify_blob(auditor,data,'generated-source-'+release['tag_name'])
        inventory.append({'tag':release['tag_name'],'asset':'GitHub generated source archive','cleaned':False,'sha256':hashlib.sha256(data).hexdigest()})
    for artifact in pages(root+'/actions/artifacts',token):
        if artifact['expired']:continue
        data=download_api(root+'/actions/artifacts/'+str(artifact['id'])+'/zip',token);new=clean(data)
        if new is None:raise RuntimeError('Unexpected loose key artifact')
        verify_blob(auditor,new,artifact['name']);stats['artifacts_checked']+=1
        if new!=data:
            api('DELETE',root+'/actions/artifacts/'+str(artifact['id']),token);stats['artifacts_deleted']+=1
    return {'releases':len(releases),'download_assets':inventory}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--auditor',required=True);p.add_argument('--rewrite',action='store_true');p.add_argument('--push',action='store_true');p.add_argument('--assets',action='store_true');p.add_argument('--report',required=True);a=p.parse_args()
    auditor=load_auditor(pathlib.Path(a.auditor).resolve());workspace=pathlib.Path(tempfile.mkdtemp(prefix='olddays-scrub-'));report={}
    if a.rewrite:report['history']=rewrite(auditor,workspace,a.push)
    if a.assets:report['downloads']=assets(auditor,os.environ['GH_TOKEN'],os.environ['GITHUB_REPOSITORY'])
    report['stats']=stats;report['unreachable_cache_note']='GitHub may retain dangling commit objects or cached views; these cannot be purged by a repository force-push.'
    pathlib.Path(a.report).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'history':report.get('history'),'stats':stats,'release_count':report.get('downloads',{}).get('releases')},ensure_ascii=False),flush=True)
