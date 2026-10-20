"""Distinct low-poly interactive reconstructions, not factory CAD/firmware.
Coordinates and mechanisms are explicit per model; generic players are labelled concepts.
"""
import bpy, math, json, os
from pathlib import Path
root=Path(__file__).resolve().parents[2]
exec((root/'scripts/blender/build_oldlane.py').read_text().split("reset();silver=mat('Brushed metal'")[0],globals())
def reference_face(name,file,crop,w,h,z,parent=None,outline=None,y=0,back=False):
 # Source photos are licensed independently; source/changes live in the manifest.
 a,b,c,d=crop;outline=outline or [(a,c),(b,c),(b,d),(a,d)]
 image=bpy.data.images.load(str(root/'dist/images/references'/file));k=min(1,1024/max(image.size));image.scale(round(image.size[0]*k),round(image.size[1]*k));image.pack()
 material=mat(name+' licensed photo',(.7,.7,.7),.08,.6);n=material.node_tree.nodes.new('ShaderNodeTexImage');n.image=image;material.node_tree.links.new(n.outputs['Color'],material.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 verts=[(((u-a)/(b-a)-.5)*w,-z,((v-c)/(d-c)-.5 if back else .5-(v-c)/(d-c))*h+y) for u,v in outline]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],[tuple(range(len(verts)-1,-1,-1))]);mesh.update();mesh.materials.append(material);uv=mesh.uv_layers.new()
 for li in mesh.polygons[0].loop_indices:
  u,v=outline[mesh.loops[li].vertex_index];uv.data[li].uv=(u,1-v)
 obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
 if parent:obj.parent=parent
 return obj
profiles={}
def group(name):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);return o
def label(s,x,y,z=.32,size=.105,parent=None):
 o=text('Legend_'+s,s,(x,y,z),size,white)
 if parent:o.parent=parent
 return o
def key(name,s,x,y,w=.45,h=.21,parent=None,z=.34):
 o=box(name,(w,h,.05),(x,y,z),keys,.035,s,parent);return o
def legendkey(action,s,x,y,w=.45,h=.21,parent=None,z=.34):
 key('Key_'+action,action,x,y,w,h,parent,z);label(s,x,y,z+.032,min(.12,h*.6),parent)
def pad(y=-.45,parent=None):
 for x,dy,a,s in [(0,.13,'dir:up','^'),(0,-.13,'dir:down','v'),(-.17,0,'dir:left','<'),(.17,0,'dir:right','>'),(0,0,'ok','o')]:
  legendkey(a,s,x,y+dy,.15,.12,parent,z=.40)
 for x,a,s in [(-.62,'soft:left','--'),(.62,'soft:right','--')]:legendkey(a,s,x,y+.16,.35,.18,parent)
 for x,a,s in [(-.62,'contacts','+'),(.62,'end','-')]:legendkey(a,s,x,y-.14,.35,.18,parent)
def numbers(y=-.94,parent=None,width=1.8):
 for i,c in enumerate('123456789*0#'):
  x=(i%3-1)*width/3;dy=y-(i//3)*.26
  legendkey('digit:'+c,c,x,dy,width/3-.055,.205,parent)
def body(name,w,h,color,depth=.45,parent=None):
 o=ovalbody(name,(w,h,depth),(0,0,0),color)
 if parent:o.parent=parent
 return o
def display(x,y,w,h,z=.31,parent=None):
 o=box('Display_glass',(w,h,.02),(x,y,z-.015),glass,.025,parent=parent)
 return [x,y,z,w,h]
def camera_back(y=1.35,x=-.48,z=-.27):
 cyl('Rear_camera_ring',.19,.035,(x,y,z),silver);cyl('Rear_lens',.12,.04,(x,y,z-.03),glass)
def brand(s,y=1.75,parent=None):label(s,0,y,.32,.13,parent)
def speaker(y=1.92,parent=None):box('Earpiece',(.40,.035,.02),(0,y,.32),black,.014,parent=parent)
def common_power(x=.5,y=2.03,z=0):box('Power',(.26,.06,.16),(x,y,z),keys,.02,'power')
def rearbrand(s='NOKIA',y=.45):
 o=text('Rear_brand',s,(0,y,-.27),.17,silver,True);o.rotation_euler=(math.pi/2,0,math.pi)
def finish(id,name,screen,kind='classic',brandname='NOKIA',mechanism=None,screenGroup=None,distance=8):
 profiles[id]={'name':name,'model':id,'file':id+'-collection','kind':kind,'brand':brandname,'screen':screen,'height':round(260*screen[4]/screen[3]),'distance':distance}
 if id in ['nokia3310','razr','n95']:
  profiles[id]['reference']=id
 if mechanism:profiles[id]['mechanism']=mechanism
 if screenGroup:profiles[id]['screenGroup']=screenGroup
 if id in ['nokia3310','razr','n95']:
  for obj in list(bpy.context.scene.objects):
   if obj.name.startswith('Legend_') and (id!='n95' or obj.parent and obj.parent.name=='Slide_panel'):bpy.data.objects.remove(obj,do_unlink=True)
 if os.environ.get('OLDDAYS_HANDSET') and id not in os.environ['OLDDAYS_HANDSET'].split(','):return
 for o in bpy.context.scene.objects:
  if o.get('photoHit'):
   m=mat('Invisible photo-aligned input',(.1,.1,.1));m.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=0;m.surface_render_method='DITHERED';o.data.materials.clear();o.data.materials.append(m)
 for im in bpy.data.images:
  if im.name!='Render Result' and im.has_data:im.pack()
 bpy.ops.export_scene.gltf(filepath=str(root/f'dist/models/{id}-collection.glb'),export_format='GLB',export_extras=True,export_apply=True,export_cameras=False,export_lights=False)
 bpy.ops.wm.save_as_mainfile(filepath=str(root/f'art/blender/{id}-collection.blend'))
 print('COLLECTION_MODEL',id)
def start():
 global silver,black,keys,white,glass,blue,orange,cream
 reset();silver=mat('Brushed alloy',(.57,.59,.61),.75,.28);black=mat('Graphite plastic',(.025,.032,.041),.08,.36);keys=mat('Satin key caps',(.16,.18,.20),.3,.4);white=mat('Printed white legends',(.9,.91,.87));glass=mat('Dark glass',(.015,.035,.045),.15,.13);blue=mat('2000 navy cover',(.035,.08,.19),.05,.42);orange=mat('Music orange',(.95,.29,.035));cream=mat('Ivory plastic',(.76,.76,.69),.05,.5)
for id,name in [('nokia3310','Nokia 3310'),('nokia1100','Nokia 1100')]:
 start();body('Rounded_removable_cover',1.85,4.1,blue if id=='nokia3310' else cream,.65);body('Dark_front_insert',1.56,3.73,black,.07).location.y=-.34
 screen=display(0,.56,1.30,.93,.49);speaker();brand('NOKIA',1.6)
 # Navi key and separate clear/up/down, not a later S60 joystick.
 legendkey('ok','Navi',0,-.10,.65,.25,z=.43);legendkey('clear','C',-.57,-.38,.35,.24,z=.43)
 legendkey('dir:up','^',.57,-.19,.30,.22,z=.43);legendkey('dir:down','v',.57,-.49,.30,.22,z=.43);numbers(-.75,width=1.6);common_power();rearbrand()
 if id=='nokia3310':
  reference_face('3310_real_cover','nokia3310-archive-reference.jpg',(.10,.90,.03,.98),1.85,4.1,.46,outline=[(.30,.03),(.70,.03),(.80,.05),(.87,.10),(.90,.30),(.90,.80),(.87,.94),(.79,.98),(.22,.98),(.14,.95),(.10,.80),(.10,.30),(.13,.10),(.20,.05)])
  # Rendering comes from the photo, while independent geometry still owns every hit key.
  for o in bpy.context.scene.objects:
   if o.get('action') and o.get('action')!='power':o.hide_render=True;o['photoHit']=True
 finish(id,name,screen,'mono')
start();body('7610_asymmetric_cover',1.98,4.0,silver)
# Shape both lower corners differently, characteristic leaf outline.
for v in bpy.data.objects['7610_asymmetric_cover'].data.vertices:
 if v.co.z<0:v.co.x+=.17*(-v.co.z/2);v.co.x*=1-.15*(-v.co.z/2)
body('7610_black_face',1.8,3.8,black,.08).location.y=-.26
s=display(-.09,.63,1.42,1.68,.34);speaker();brand('NOKIA',1.71);pad(-.53)
for i,c in enumerate('123456789*0#'):
 x=(i%3-1)*.54+.09*(i//3);y=-1.05-(i//3)*.24+.06*(i%3-1)
 legendkey('digit:'+c,c,x,y,.48,.19)
legendkey('home','Menu',-.78,-.78,.3,.17);legendkey('clear','C',.78,-.76,.24,.17);camera_back();common_power();rearbrand();finish('nokia7610','Nokia 7610',s)
for id,name in [('k750','Sony Ericsson K750'),('walkman','音乐手机 / 风格重制')]:
 start();body('Camera_phone_shell',1.82,4.0,black if id=='k750' else cream);box('Front_alloy', (1.65,3.6,.08),(0,0,.24),silver if id=='k750' else cream,.12)
 s=display(0,.68,1.32,1.62,.31);speaker();brand('Sony Ericsson' if id=='k750' else 'MUSIC',1.72)
 if id=='k750':
  for x,dy,a,t in [(0,.13,'dir:up','^'),(0,-.13,'dir:down','v'),(-.16,0,'dir:left','<'),(.16,0,'dir:right','>'),(0,0,'ok','o')]:legendkey(a,t,x,-.50+dy,.14,.12,z=.40)
  for x,y,a,t in [(-.58,-.24,'soft:left','--'),(.58,-.24,'soft:right','--'),(-.58,-.65,'soft:right','<'),(.58,-.65,'clear','C')]:legendkey(a,t,x,y,.39,.22)
 else:pad(-.48)
 numbers(-1.02,width=1.55)
 legendkey('music','M',-.85,.2,.12,.3)
 if id!='k750':legendkey('home','Menu',-.59,-.8,.38,.16);legendkey('clear','C',.59,-.8,.28,.16)
 camera_back(1.15,0);box('Sliding_camera_cover',(1.45,.9,.07),(0,.3,-.29),silver,.08);rearbrand('2.0 MEGAPIXEL',-.5);common_power();finish(id,name,s,brandname='Sony Ericsson' if id=='k750' else 'MUSIC')
# Clamshell: lower keypad stays fixed, upper panel hinges at its bottom edge.
start();body('V3_lower_alloy',1.92,2.55,silver,.24).location.z=-.95
hinge=group('Flip_panel');hinge.location=(0,0,.35)
body('V3_upper_lid',1.92,2.5,silver,.22,hinge).location.z=1.25
box('V3_inner_black',(1.73,2.26,.06),(0,1.22,.16),black,.08,parent=hinge)
s=display(0,1.13,1.48,1.86,.30,hinge);speaker(2.3,hinge);brand('MOTOROLA',2.14,hinge)
# Exterior mini-display and camera are on the other face of lid.
box('V3_external_display',(.7,.65,.025),(0,1.25,-.15),glass,.025,parent=hinge)
o=text('V3_external_clock','12:03',(0,1.25,-.17),.12,white,True);o.parent=hinge;o.rotation_euler=(math.pi/2,0,math.pi)
c=cyl('V3_outer_camera',.12,.03,(0,1.92,-.15),glass);c.parent=hinge
pad(-.20);numbers(-.70,width=1.6);common_power(.96,-.2,0)
reference_face('V3_real_inner_lid','razr-archive-reference.png',(.553,.936,.029,.420),1.92,2.5,.27,hinge,y=1.25,outline=[(.72,.030),(.80,.030),(.87,.043),(.92,.06),(.932,.075),(.932,.39),(.916,.418),(.575,.418),(.556,.39),(.558,.075),(.573,.055),(.64,.04)])
reference_face('V3_real_outer_lid','razr-archive-reference.png',(.05,.46,.225,.715),1.92,2.5,-.21,hinge,y=1.25,back=True,outline=[(.19,.228),(.325,.228),(.34,.235),(.405,.235),(.445,.245),(.455,.27),(.455,.65),(.435,.68),(.375,.700),(.30,.71),(.20,.71),(.12,.70),(.07,.685),(.05,.66),(.05,.27),(.06,.245),(.12,.235),(.18,.235)])
reference_face('V3_real_lower_keys','razr-archive-reference.png',(.553,.94,.468,.974),1.92,2.55,.43,y=-.95,outline=[(.58,.468),(.92,.468),(.94,.50),(.94,.94),(.88,.974),(.62,.974),(.553,.94),(.553,.50)])
for o in bpy.context.scene.objects:
 if o.get('action') and o.get('action')!='power':o['photoHit']=True
for o in bpy.context.scene.objects:
 if o.parent==hinge:o.location.y+=.5
hinge.location.y=-.5;s[2]-=.5
finish('razr','Motorola RAZR V3',s,brandname='MOTOROLA',mechanism='flip',screenGroup='Flip_panel',distance=10)
# Dual slider: screen/control panel moves up for number keys and down for media keys.
start();body('N95_lower_chassis',1.95,3.55,black,.48);numbers(-.86,width=1.65)
for x,a,sym in [(-.6,'track:prev','<<'),(0,'play','>'),(.6,'track:next','>>')]:legendkey(a,sym,x,1.45,.47,.24)
slider=group('Slide_panel');body('N95_upper_shell',1.95,3.55,silver,.23,slider).location.y=-.39
s=display(.02,.37,1.54,2.01,.71,slider);brand('NOKIA Nseries',1.65,slider);pad(-1.24,slider);legendkey('home','Menu',-.62,-1.43,.4,.18,slider,z=.55);legendkey('clear','C',.62,-1.43,.4,.18,slider,z=.55);
for o in bpy.context.scene.objects:
 if o.parent==slider and (o.get('action') or o.name.startswith('Legend_')):o.location.y-=.23
reference_face('N95_real_slide_panel','n95-archive-reference.jpg',(.20,.83,.09,.925),1.95,3.55,.68,slider,outline=[(.27,.09),(.72,.09),(.82,.11),(.83,.90),(.78,.925),(.25,.925),(.20,.90),(.20,.12)])
for o in bpy.context.scene.objects:
 if o.parent==slider and o.get('action'):
  o['photoHit']=True;o.location.y=-.705
  layout={'home':(-.44,-1.22,.26,.28),'soft:left':(-.73,-1.03,.20,.16),'soft:right':(.73,-1.03,.20,.16),'contacts':(-.71,-1.43,.22,.18),'end':(.71,-1.43,.22,.18),'clear':(.34,-1.535,.17,.12)}
  if o.get('action') in layout:
   x,y,w,h=layout[o['action']];o.location.x=x;o.location.z=y;o.dimensions=(w,.05,h)
common_power(.5,1.80,0);camera_back();rearbrand();finish('n95','Nokia N95',s,mechanism='dual',screenGroup='Slide_panel',distance=9)
# Side-sliding landscape touch display, real separate QWERTY deck.
start();body('N97_keyboard_chassis',4.0,1.95,black,.38)
for row,letters in enumerate(['QWERTYUIOP','ASDFGHJKL','ZXCVBNM']):
 for col,c in enumerate(letters):legendkey('letter:'+c,c,-1.69+col*.365,.48-row*.34,.31,.29,z=.25)
for x,a,sym,w in [(-1.62,'shift','SHIFT',.55),(-.55,'letter: ','SPACE',1.3),(1.25,'clear','DEL',.7)]:legendkey(a,sym,x,-.65,w,.28,z=.25)
slide=group('Qwerty_screen');body('N97_touch_panel',4.0,1.95,silver,.20,slide).location.y=-.40
box('N97_gloss_bezel',(3.86,1.8,.04),(0,0,.53),black,.06,parent=slide);s=display(0,0,3.12,1.72,.57,slide)
legendkey('home','◆',1.78,-.72,.19,.23,slide,z=.56)
for action,y,color in [('contacts',-.25,(.12,.65,.26)),('end',.45,(.82,.14,.12))]:
 ink=mat('N97_'+action+'_ink',color,.05,.6)
 box('Key_'+action,(.12,.23,.008),(1.78,y,.555),black,.012,action,slide)
 box('N97_'+action+'_mark',(.015,.12,.005),(1.78,y,.565),ink,.005,parent=slide)
 for dy in [-.065,.065]:box('N97_'+action+'_ear',(.04,.025,.005),(1.79,y+dy,.565),ink,.007,parent=slide)
box('N97_Earpiece',(.035,.42,.02),(-1.78,0,.56),black,.012,parent=slide)
c=cyl('N97_front_camera',.045,.012,(-1.78,.53,.56),glass);c.parent=slide
label('NOKIA',-1.45,.85,.56,.085,slide)
box('N97_rear_camera_plate',(.85,1.30,.055),(-1.39,0,-.225),silver,.08)
camera_back(.38,-1.40,-.28)
box('N97_dual_LED',(.13,.31,.014),(-1.68,.38,-.295),white,.025)
box('N97_lens_cover',(.68,.64,.045),(-1.39,-.27,-.29),silver,.045)
text('N97_rear_brand','NOKIA Nseries',(.35,0,-.205),.12,silver,True).rotation_euler=(math.pi/2,0,math.pi)
box('Power',(.06,.26,.12),(-2.0,.40,0),keys,.02,'power');finish('n97','Nokia N97',s,'qwerty',mechanism='qwerty',screenGroup='Qwerty_screen',distance=12)
# Rotating lower music grip. This entry is explicitly a period-inspired concept.
start();body('Twist_upper',1.8,2.7,black);s=display(0,.45,1.40,1.8,.25);brand('MUSIC',1.18);speaker(1.27);pad(-.69)
rot=group('Twist_grip');rot.location.z=-1.38
body('Twist_lower',1.8,1.3,orange,.5,rot).location.z=-.65
numbers(-.17,rot,width=1.55)
musicface=group('Twist_music_face');musicface.parent=rot;musicface.rotation_euler.z=math.pi
for x,a,t in [(-.55,'track:prev','<<'),(0,'play','>'),(.55,'track:next','>>')]:legendkey(a,t,x,-.65,.42,.3,musicface)
common_power(.5,1.37,0);finish('twist','旋转音乐手机 / 概念重制',s,brandname='MUSIC',mechanism='twist',distance=9)
for id,name in [('iphone','初代 iPhone'),('fullscreen','全面屏触控手机'),('mp5','联网 MP5 / 概念重制')]:
 start();h=4.1;body('Aluminium_rear',2.1,h,silver,.28);body('Black_glass_front',2.02,h-.06,black,.08).location.y=-.18
 full=id=='fullscreen';s=display(0,.03,1.88 if full else 1.83,3.72 if full else 2.74,.25)
 speaker(1.87);common_power(.65,2.05)
 if full:box('Gesture_bar',(.55,.025,.01),(0,-1.84,.27),white,.01,'home')
 else:
  cyl('Round_Home_key',.19,.02,(0,-1.7,.26),black,'home');box('Home_symbol',(.12,.12,.01),(0,-1.7,.275),silver,.025)
 if id=='iphone':box('Black_antenna_cover',(2.04,.88,.03),(0,-1.58,-.17),black,.06);camera_back(1.66,-.77,-.16)
 elif id=='fullscreen':camera_back(1.60,-.73,-.16)
 label('iPhone' if id=='iphone' else 'PLAYER' if id=='mp5' else '',0,-.65,-.17,.14).rotation_euler=(math.pi/2,0,math.pi)
 finish(id,name,s,'touch',brandname='Apple' if id=='iphone' else 'PLAYER' if id=='mp5' else 'OLDDAYS',distance=8.5)
# Separate player families. No green/red call keys, SIM UI or digit decks.
start();body('MP3_rounded_aluminium',1.70,3.3,silver,.55);s=display(0,.85,1.30,.75,.32)
for x,y,a,t in [(0,-.15,'home','MENU'),(-.5,-.65,'track:prev','<<'),(.5,-.65,'track:next','>>'),(0,-1.10,'play','>')]:legendkey(a,t,x,y,.44,.28)
cyl('MP3_centre_select',.26,.06,(0,-.65,.32),white,'ok');label('OK',0,-.65,.37);common_power(.45,1.68);rearbrand('MP3 PLAYER');finish('mp3','口袋 MP3 播放器',s,'player','MP3',distance=7)
start();body('MP4_player',2.65,3.70,black,.40);s=display(0,.65,2.25,1.70,.25);brand('VIDEO PLAYER',1.65)
for x,y,a,t in [(-.65,-.85,'track:prev','<<'),(.65,-.85,'track:next','>>'),(0,-1.25,'play','>'),(0,-.4,'home','MENU')]:legendkey(a,t,x,y,.45,.28)
common_power(.9,1.88);rearbrand('MP4 VIDEO');finish('mp4','彩屏 MP4 播放器',s,'player','MP4',distance=9)
start();body('Portable_landscape_body',5.0,2.15,black,.42);s=display(0,0,2.90,1.65,.27)
for x,y,a,t in [(-1.9,.27,'dir:up','^'),(-1.9,-.27,'dir:down','v'),(-2.17,0,'dir:left','<'),(-1.63,0,'dir:right','>'),(1.9,.32,'ok','O'),(1.62,0,'soft:left','X'),(2.18,0,'soft:right','[]'),(1.9,-.32,'home','MENU')]:legendkey(a,t,x,y,.28,.25)
legendkey('ok','START',.65,-.94,.6,.14);legendkey('home','HOME',-.65,-.94,.6,.14);common_power(2.5,0);rearbrand('PORTABLE GAME');finish('psp','横向掌机 / 风格重制',s,'console','PORTABLE',distance=14)
(root/'data/handset-collection.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2)+'\n')
(root/'dist/handset-collection.js').write_text('"use strict";\n// Per-device dimensions and mechanisms; generated by build_handset_collection.py.\nObject.assign(blenderHandsets,'+json.dumps(profiles,ensure_ascii=False,separators=(',',':'))+');\n')

with (root/'dist/handset-collection.js').open('a') as out:out.write('\nconst handsetReferenceSources='+ (root/'data/handset-reference-sources.json').read_text().strip()+';\n')

# Preserve separately maintained share-link behavior when rebuilding geometry.
with (root/'dist/handset-collection.js').open('a') as out:out.write((root/'scripts/blender/handset-share.js').read_text())
