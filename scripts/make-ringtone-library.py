"""Synthesize public-domain melody excerpts; no commercial recordings or samples."""
import math,wave,struct,subprocess,json
from pathlib import Path
tracks=[('ode-joy','欢乐颂', '贝多芬',120,[64,64,65,67,67,65,64,62,60,60,62,64,64,62,62]),('twinkle','小星星','传统旋律',100,[60,60,67,67,69,69,67,65,65,64,64,62,62,60]),('greensleeves','绿袖子','传统旋律',88,[69,72,74,76,77,76,74,71,67,69,71,72,69,69,68,69,71,68,64]),('jingle-bells','铃儿响叮当','James Lord Pierpont',130,[64,64,64,64,64,64,64,67,60,62,64,65,65,65,65,65,64,64,64,64,62,62,64,62,67]),('new-year','友谊地久天长','传统苏格兰旋律',95,[67,72,71,72,76,74,72,74,76,74,72,72,76,79,81,79,76,76,72,74,72,74,76,74,72,69,69,67,72]),('canon-bells','卡农 · 铃声片段','帕赫贝尔',94,[78,76,74,73,71,69,71,73,74,73,71,69,67,66,67,64]),('morning','晨景 · 口袋铃声','格里格',90,[76,74,72,74,76,79,81,79,76,74,72,74,76,74,72]),('gran-vals','大圆舞曲 · 老手机铃声','塔雷加',112,[76,74,66,68,73,71,62,64,71,69,61,64,69])]
root=Path('work/album');root.mkdir(exist_ok=True);rate=22050;dur=24
for id,title,author,bpm,notes in tracks:
 frames=bytearray()
 for i in range(rate*dur):
  t=i/rate;phase=t*bpm/60*2;p=phase%1;n=notes[int(phase)%len(notes)];f=440*2**((n-69)/12);env=min(1,p/.04)*math.exp(-3.2*p);v=(math.sin(2*math.pi*f*t)+.25*math.sin(4*math.pi*f*t))*.20*env*max(0,min(1,t,(dur-t)/2));a=int(v*32767);frames+=struct.pack('<hh',a,int(a*.95))
 wav=root/(id+'.wav')
 with wave.open(str(wav),'wb') as w:w.setparams((2,2,rate,0,'NONE','not compressed'));w.writeframes(frames)
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a','96k','dist/audio/'+id+'.mp3'],check=True)
 print(id,flush=True)
Path('data/ringtones.json').write_text(json.dumps([{'id':id,'name':title,'credit':author+'公版旋律 · 本站合成演奏','seconds':dur} for id,title,author,bpm,notes in tracks],ensure_ascii=False,indent=2)+'\n')
