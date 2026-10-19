#!/usr/bin/env python3
"""Publish the tagged build with the job-scoped GitHub Actions token."""
import json, os, re, urllib.request, urllib.parse, urllib.error
from pathlib import Path
repo=os.environ['GITHUB_REPOSITORY']
tag=os.environ['RELEASE_TAG']
if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',repo):raise SystemExit('Invalid repository')
headers={'Authorization':'Bearer '+os.environ['GITHUB_TOKEN'],'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'olddays-release'}
def call(url,data=None,method='GET',content_type='application/json'):
    h={**headers,'Content-Type':content_type}
    with urllib.request.urlopen(urllib.request.Request(url,data=data,headers=h,method=method),timeout=60) as r:return json.load(r)
base=f'https://api.github.com/repos/{repo}/releases'
try:release=call(base+'/tags/'+urllib.parse.quote(tag,safe=''))
except urllib.error.HTTPError as e:
    if e.code!=404:raise
    body={'tag_name':tag,'name':f'Olddays {tag} · 把记忆里的互联网，重新打开一次','body':Path('CHANGELOG.md').read_text(),'draft':False,'prerelease':False}
    release=call(base,json.dumps(body).encode(),'POST')
existing={a['name'] for a in release.get('assets',[])}
for file in sorted(Path('release').iterdir()):
    if not file.is_file() or file.name in existing:continue
    url=f'https://uploads.github.com/repos/{repo}/releases/{release["id"]}/assets?name='+urllib.parse.quote(file.name)
    call(url,file.read_bytes(),'POST','application/octet-stream')
print(release['html_url'])
