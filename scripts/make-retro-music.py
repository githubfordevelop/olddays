# Original synthesized demo music. No samples or existing song melodies.
import math,wave,struct
from pathlib import Path
Path("work").mkdir(exist_ok=True)
rate=22050;duration=30;notes=[72,76,79,83,79,76,74,71,69,72,76,79,76,72,71,67,65,69,72,76,72,69,67,64,67,71,74,79,74,71,69,67];chords=[48,45,41,43]
with wave.open('work/nostalgia-original.wav','wb') as w:
 w.setparams((2,2,rate,0,'NONE','not compressed'))
 data=bytearray()
 for n in range(rate*duration):
  t=n/rate;beat=t*2;step=int(beat*2);frac=beat*2-step
  midi=notes[step%len(notes)];f=440*2**((midi-69)/12)
  env=min(1,frac/0.06)*max(0,1-frac)**1.7
  lead=(math.sin(2*math.pi*f*t)+0.22*math.sin(6*math.pi*f*t))*0.13*env
  base=chords[int(beat/4)%4];bf=440*2**((base-69)/12)
  bass=math.sin(2*math.pi*bf*t)*0.11*math.exp(-3*(beat%1))
  arp=base+[12,16,19,24][step%4];af=440*2**((arp-69)/12)
  pad=math.sin(2*math.pi*af*t)*0.055*(1-frac)
  fade=min(1,t/1.5,(duration-t)/2.5)
  v=(lead+bass+pad)*max(0,fade)
  left=int(max(-1,min(1,v))*32767);right=int(max(-1,min(1,v*0.94+pad*0.09))*32767)
  data+=struct.pack('<hh',left,right)
 w.writeframes(data)
