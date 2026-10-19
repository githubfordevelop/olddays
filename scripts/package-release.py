#!/usr/bin/env python3
"""Create public static-site and source downloads. No credentials are included."""
import hashlib, os, re, subprocess, zipfile
from pathlib import Path

tag = os.environ.get('RELEASE_TAG', 'v0.1.0')
if not re.fullmatch(r'v[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?', tag):
    raise SystemExit('Expected a semantic version tag')
out = Path('release')
out.mkdir(exist_ok=True)
with zipfile.ZipFile(out / f'olddays-{tag}-web.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for file in sorted(Path('dist').rglob('*')):
        if file.is_file(): z.write(file, str(file.relative_to('dist')))
    for name in ['LICENSE', 'CHANGELOG.md']:
        z.write(name, name)
    z.writestr('START-HERE.txt', 'Run: python3 -m http.server 4173\nOpen http://localhost:4173\nUse an HTTP server rather than opening index.html via file://.\n')
subprocess.run(['git', 'archive', '--format=zip', f'--prefix=olddays-{tag}/', '-o', str(out / f'olddays-{tag}-source.zip'), 'HEAD'], check=True)
rows=[]
for file in sorted(out.glob(f'olddays-{tag}-*.zip')):
    rows.append(f'{hashlib.sha256(file.read_bytes()).hexdigest()}  {file.name}')
(out/'SHA256SUMS.txt').write_text('\n'.join(rows)+'\n')
print('\n'.join(rows))
