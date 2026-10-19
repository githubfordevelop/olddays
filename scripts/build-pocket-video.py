"""Build the original, bundled offline MP4 sample. Requires Pillow and ffmpeg."""
from pathlib import Path
from PIL import Image, ImageDraw
import subprocess
out=Path('dist/video/pocket-summer.mp4');out.parent.mkdir(exist_ok=True,parents=True)
cmd=['ffmpeg','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s','480x272','-r','15','-i','-','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart','-y',str(out)]
with subprocess.Popen(cmd,stdin=subprocess.PIPE) as video:
 for frame in range(180):
  im=Image.new('RGB',(480,272),'#a0cfdd');d=ImageDraw.Draw(im)
  d.rectangle((0,180,480,272),fill='#62895c');d.rectangle((0,227,480,251),fill='#c9bd9c')
  d.rectangle((40,100,200,200),fill='#e4d5b1');d.polygon([(25,100),(120,50),(215,100)],fill='#8b6754')
  for x in [65,120]:d.rectangle((x,120,x+28,154),fill='#436879')
  d.rectangle((160,151,183,200),fill='#786244');d.ellipse((380,28,410,58),fill='#ffe9a4')
  for offset in [-50,180,390]:
   x=(offset+frame*.23)%560-40
   d.rectangle((x,43,x+50,54),fill='#f4f6e8');d.rectangle((x+12,35,x+35,57),fill='#f4f6e8')
  d.rectangle((290,118,300,200),fill='#7b674c');d.ellipse((260,80,330,140),fill='#457d5a')
  x=int(frame*3.2)%560-40
  for wx in [x,x+28]:d.ellipse((wx,225,wx+17,242),outline='#304454',width=3)
  d.line((x+8,234,x+22,215,x+37,234,x+8,234,x+17,221),fill='#cb6653',width=3)
  d.line((x+20,213,x+29,225,x+22,234),fill='#303e50',width=4);d.ellipse((x+16,198,x+26,208),fill='#e2c29c')
  d.line((x+20,209,x+31,217),fill='#f0da85',width=5)
  d.rectangle((12,12,105,25),fill='#294d59');d.text((17,14),'POCKET SUMMER',fill='#ecf0ce')
  video.stdin.write(im.tobytes())
 video.stdin.close()
 if video.wait()!=0:raise SystemExit('video encoding failed')
print(out)
