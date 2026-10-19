"""Recompile RMS finally blocks without JSR/RET for the browser interpreter."""
from pathlib import Path
import argparse,subprocess,zipfile
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--sources',type=Path,default=root/'work/pluotsorbet-source')
parser.add_argument('--ecj',type=Path,default=root/'work/ecj.jar')
parser.add_argument('--classes',type=Path,default=root/'dist/javame/java/classes.jar')
parser.add_argument('--output',type=Path,default=root/'work/rms-inline')
args=parser.parse_args();out=args.output;out.mkdir(parents=True,exist_ok=True)
subprocess.run(['java','-jar',str(args.ecj),'-source','1.3','-target','1.3','-inlineJSR','-encoding','UTF-8','-bootclasspath',str(args.classes),'-d',str(out),str(args.sources/'java/custom/com/sun/midp/rms/RecordStoreImpl.java'),str(args.sources/'java/midp/javax/microedition/rms/RecordStore.java')],check=True,stdout=subprocess.DEVNULL)
jar=args.classes;temporary=jar.with_suffix('.new.jar')
patches={str(p.relative_to(out)):p.read_bytes() for p in out.rglob('*.class')}
with zipfile.ZipFile(jar) as original,zipfile.ZipFile(temporary,'w',zipfile.ZIP_DEFLATED) as result:
 for item in original.infolist():result.writestr(item,patches.pop(item.filename,original.read(item.filename)))
 for name,data in patches.items():result.writestr(name,data)
temporary.replace(jar)
