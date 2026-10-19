from pathlib import Path
import json,zipfile,struct,tarfile
root=Path(__file__).resolve().parents[1]
for m in json.loads((root/'data/classics-sources.json').read_text()):
 b=json.loads((root/f'dist/books/{m["id"]}.json').read_text())
 assert len(b['chapters'])==5
 assert all(len(''.join(c['paragraphs']))>3000 and 'oldid=' in c['source'] for c in b['chapters'])
for name,cls in [('snake','OldSnake'),('calculator','PocketCalculator'),('notes','PocketNotes')]:
 with zipfile.ZipFile(root/f'dist/javame/demos/{name}.jar') as z:
  assert cls in z.read('META-INF/MANIFEST.MF').decode()
  code=z.read(cls+'.class');assert code[:4]==b'\xca\xfe\xba\xbe';assert struct.unpack('>H',code[6:8])[0]<=48
with tarfile.open(root/'dist/javame/runtime-sources.tar.gz') as z:
 names=z.getnames();assert 'pluotsorbet/LICENSE' in names and 'runtime-build/wrapper.js' in names
 for name in names:assert not name.startswith('/') and '..' not in Path(name).parts
 assert z.extractfile('runtime-build/wrapper.js').read()==(root/'dist/javame/wrapper.js').read_bytes()
print('Classic chapter provenance, Java MIDlet bytecode and runtime source bundle checked.')

for game in json.loads((root/'dist/javame/open-games/catalog.json').read_text()):
 with zipfile.ZipFile(root/f'dist/javame/open-games/{game["id"]}.jar') as z:
  assert game['cls'] in z.read('META-INF/MANIFEST.MF').decode()
  code=z.read(game['cls'].replace('.','/')+'.class')
  assert code[:4]==b'\xca\xfe\xba\xbe' and struct.unpack('>H',code[6:8])[0]<=48
assert 'MIT' in (root/'dist/javame/open-games/LICENSE.txt').read_text()
print('12 MIT open-source game archives and Java class entrypoints checked.')
