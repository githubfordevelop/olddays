"""Original synthesized tracks plus a public-domain Beethoven melody performance. No recordings sampled."""
import math,wave,struct,subprocess
from pathlib import Path
Path('work/album').mkdir(parents=True,exist_ok=True);Path('dist/audio').mkdir(exist_ok=True)
tracks=[('moon-letter',80,[69,72,76,79,76,72,71,67,65,69,72,76,72,69,67,64],[45,41,48,43],32),('summer-ringtone',128,[76,79,81,79,76,74,72,74,76,79,84,83,81,79,76,72],[48,43,45,41],30),('elise-memory',100,[76,75,76,75,76,71,74,72,69,60,64,69,71,64,68,71,72,64,76,75,76,75,76,71,74,72,69,60,64,69,71,64,72,71,69],[45,40,45,40],34)]
rate=22050
for name,bpm,notes,roots,dur in tracks:
 frames=bytearray()
 for i in range(rate*dur):
  t=i/rate;phase=t*bpm/60*2;idx=int(phase);p=phase-idx;f=440*2**((notes[idx%len(notes)]-69)/12)
  env=min(1,p/.04)*math.exp(-4*p);mel=(math.sin(2*math.pi*f*t)+.35*math.sin(4*math.pi*f*t)+.13*math.sin(6*math.pi*f*t))*.17*env
  root=roots[int(phase/8)%len(roots)];bf=440*2**((root-69)/12);bass=.08*math.sin(2*math.pi*bf*t)*math.exp(-3*(phase%2))
  fade=max(0,min(1,t/1.3,(dur-t)/2));v=(mel+bass)*fade
  n=int(max(-1,min(1,v))*32767);frames+=struct.pack('<hh',n,int(n*.94))
 wav=f'work/album/{name}.wav'
 with wave.open(wav,'wb') as w:w.setparams((2,2,rate,0,'NONE','not compressed'));w.writeframes(frames)
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',wav,'-c:a','libmp3lame','-b:a','96k',f'dist/audio/{name}.mp3'],check=True)
 print(name,dur,flush=True)
