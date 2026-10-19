from pathlib import Path
import subprocess,zipfile,json
r=Path('.');src=r/'work/j2me-open-games';out=r/'dist/javame/open-games';out.mkdir(exist_ok=True)
# Adapt optional native tones before building and include the modified source in the archive.
sfx=src/'common/src/gamekit/Sfx.java'
t=sfx.read_text();a=t.index('    public static void tone(');b=t.index('\n    public static void click()',a)
sfx.write_text(t[:a]+'    // Olddays browser adaptation: native tone bridge disabled.\n    public static void tone(int note, int ms) { }\n'+t[b:])
items=[]
for slug,title in [('076-grid-tactics','口袋战棋'),('058-pocket-saga','口袋勇者传'),('026-monster-duel','幻兽对决'),('002-pixel-paddle','像素乒乓'),('006-brick-buster','打砖块'),('008-pixel-jumper','像素跳跃'),('009-traffic-dash','公路闪避'),('003-block-fall','方块下落'),('004-mine-sweep','扫雷'),('005-keypad-chess','国际象棋'),('007-number-place','数独'),('010-tower-guard','塔防'),('011-star-defender','星际防御'),('015-dungeon-quest','地牢冒险'),('017-pocket-farm','口袋农场')]:
 d=src/'games'/slug;props=dict(l.split('=',1) for l in (d/'game.properties').read_text().splitlines() if '=' in l);build=r/'work/open-build'/slug;build.mkdir(parents=True,exist_ok=True)
 subprocess.run(['java','-jar','work/ecj.jar','-source','1.3','-target','1.3','-encoding','UTF-8','-bootclasspath','dist/javame/java/classes.jar','-d',str(build),*map(str,(src/'common/src').rglob('*.java')),*map(str,(d/'src').rglob('*.java'))],check=True,stdout=subprocess.DEVNULL)
 id=props['game.slug'];mf=f"Manifest-Version: 1.0\nMIDlet-Name: {props['game.name']}\nMIDlet-Version: 1.0.0\nMIDlet-Vendor: agneay\nMIDlet-1: {props['game.name']},,{props['game.midlet']}\nMicroEdition-Configuration: CLDC-1.0\nMicroEdition-Profile: MIDP-2.0\n\n"
 jar=out/(id+'.jar')
 with zipfile.ZipFile(jar,'w',zipfile.ZIP_DEFLATED) as z:
  z.writestr('META-INF/MANIFEST.MF',mf)
  for p in build.rglob('*.class'):z.write(p,str(p.relative_to(build)))
 (out/(id+'.jad')).write_text(mf+f'MIDlet-Jar-URL: {id}.jar\nMIDlet-Jar-Size: {jar.stat().st_size}\n')
 items.append(dict(id=id,title=title,cls=props['game.midlet'],controls=props['game.controls']))
(out/'catalog.json').write_text(json.dumps(items,ensure_ascii=False));(out/'LICENSE.txt').write_text((src/'LICENSE').read_text());(out/'NOTICE.txt').write_text('Recent open-source recreations, not historical commercial games. Olddays adaptation: optional native tone generation disabled for VM compatibility. MIT. https://github.com/agneay/j2me-100-games\nCommit '+subprocess.check_output(['git','-C',str(src),'rev-parse','HEAD']).decode())
with zipfile.ZipFile(out/'sources.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in src.rglob('*.java'):z.write(p,str(p.relative_to(src)))
 z.write(src/'LICENSE','LICENSE');z.write(src/'README.md','README.md')
