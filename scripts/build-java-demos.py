#!/usr/bin/env python3
from pathlib import Path
import subprocess,zipfile
root=Path(__file__).resolve().parents[1];build=root/'work/java-demo-build';build.mkdir(parents=True,exist_ok=True)
subprocess.run(['java','-jar',str(root/'work/ecj.jar'),'-source','1.3','-target','1.3','-encoding','UTF-8','-bootclasspath',str(root/'dist/javame/java/classes.jar'),'-d',str(build),*map(str,(root/'java-demos/src').glob('*.java'))],check=True)
for id,cls,title in [('snake','OldSnake','Olddays Snake'),('calculator','PocketCalculator','Pocket Calculator'),('notes','PocketNotes','Pocket Notes')]:
 manifest=f'Manifest-Version: 1.0\nMIDlet-Name: {title}\nMIDlet-Version: 1.0.0\nMIDlet-Vendor: Olddays\nMIDlet-1: {title},,{cls}\nMicroEdition-Configuration: CLDC-1.1\nMicroEdition-Profile: MIDP-2.0\n\n'
 dest=root/f'dist/javame/demos/{id}.jar'
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as z:
  z.writestr('META-INF/MANIFEST.MF',manifest)
  for p in build.glob(cls+'*.class'):z.write(p,p.name)
 (dest.with_suffix('.jad')).write_text(manifest+f'MIDlet-Jar-URL: {id}.jar\nMIDlet-Jar-Size: {dest.stat().st_size}\n')
with zipfile.ZipFile(root/'dist/javame/demos/sources.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in (root/'java-demos/src').glob('*.java'):z.write(p,p.name)
