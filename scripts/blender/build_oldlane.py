import bpy, math, random, os, json, sys
from mathutils import Vector
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
OUT=os.path.join(ROOT,'dist/models'); SOURCE=os.path.join(ROOT,'art/blender');os.makedirs(OUT,exist_ok=True);os.makedirs(SOURCE,exist_ok=True)
def reset():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
def wood():
 m=mat('Worn walnut grain',(.22,.11,.045),0,.65);im=bpy.data.images.new('Original worn wood',width=256,height=256);r=random.Random(731);pix=[]
 for y in range(256):
  for x in range(256):
   v=.65+.18*math.sin(y*.6+math.sin(x*.02)*2)+r.random()*.17
   pix.extend((.32*v,.17*v,.074*v,1))
 im.pixels=pix;im.pack();n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=im;m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color']);return m
def box(name,size,loc,ma,bevel=.03,action=None,parent=None):
 # input axes follow Three.js: x width, y up, z towards viewer
 bpy.ops.mesh.primitive_cube_add(size=1,location=(loc[0],-loc[2],loc[1]));o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
 if bevel:
  b=o.modifiers.new('Machined rounded edges','BEVEL');b.width=bevel;b.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
  for p in o.data.polygons:p.use_smooth=True
  o.modifiers.new('Surface normals','WEIGHTED_NORMAL')
 if action:o['action']=action
 if parent:o.parent=parent
 return o
def ovalbody(name,size,loc,ma):
 w,h,d=size;verts=[];N=64
 for z in [-d/2,d/2]:
  for i in range(N):
   a=2*math.pi*i/N;c=math.cos(a);t=math.sin(a)
   x=w/2*math.copysign(abs(c)**.3,c);y=h/2*math.copysign(abs(t)**.3,t)
   verts.append((x+loc[0],-(z+loc[2]),y+loc[1]))
 faces=[tuple(range(N-1,-1,-1)),tuple(range(N,2*N))]+[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.data.materials.append(ma)
 for p in mesh.polygons:p.use_smooth=True
 b=o.modifiers.new('Rounded shell seam','BEVEL');b.width=.045;b.segments=3;o.modifiers.new('Normals','WEIGHTED_NORMAL');return o
def text(name,body,loc,size,ma,back=False):
 c=bpy.data.curves.new(name,'FONT');c.body=body;c.align_x='CENTER';c.align_y='CENTER';c.size=size;c.extrude=.001;o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.location=(loc[0],-loc[2],loc[1]);o.rotation_euler=(math.pi/2 if not back else -math.pi/2,0,math.pi if back else 0);o.data.materials.append(ma);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return o
def cyl(name,r,depth,loc,ma,action=None):
 bpy.ops.mesh.primitive_cylinder_add(vertices=40,radius=r,depth=depth,location=(loc[0],-loc[2],loc[1]),rotation=(math.pi/2,0,0));o=bpy.context.object;o.name=name;o.data.materials.append(ma)
 if action:o['action']=action
 return o
def export(name):
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE,name+'.blend'));bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',export_extras=True,export_apply=True,export_cameras=False,export_lights=True)
def preview(name,position,target):
 bpy.ops.object.camera_add(location=(position[0],-position[2],position[1]));cam=bpy.context.object;direction=Vector((target[0],-target[2],target[1]))-cam.location;cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();bpy.context.scene.camera=cam;cam.data.lens=44
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=12;scene.render.resolution_x=900;scene.render.resolution_y=700;scene.render.resolution_percentage=100;scene.world.color=(.18,.18,.18);scene.render.filepath=os.path.join(OUT,name+'-preview.png');bpy.ops.render.render(write_still=True)
def light(loc,power,size):
 bpy.ops.object.light_add(type='AREA',location=(loc[0],-loc[2],loc[1]));o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(0,0,0);d=Vector((0,0,1))-o.location;o.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
reset();silver=mat('Brushed metal',(.36,.39,.41),.85,.3);black=mat('Graphite housing',(.035,.043,.05),.25,.4);keys=mat('Dark keycaps',(.1,.12,.14),.35,.36);white=mat('Key legends',(.8,.85,.84),0,.45);glass=mat('Screen glass',(.015,.03,.045),.4,.15);lens=mat('Lens blue coating',(.025,.065,.12),.65,.13)
box('N73_midframe',(1.82,4.15,.47),(0,0,0),silver,.13)
box('Front_housing',(1.7,4.03,.15),(0,0,.24),black,.12)
box('Rear_shell',(1.73,4,.12),(0,0,-.255),black,.12)
box('LCD_bezel',(1.53,2.05,.055),(0,.65,.34),black,.025)
box('LCD_glass',(1.38,1.82,.02),(0,.65,.38),glass,.005)
text('NOKIA Nseries','NOKIA  Nseries',(-.15,1.81,.345),.115,white)
for i in range(6):box('Speaker_slot_'+str(i),(.075,.025,.025),(-.25+i*.1,1.98,.33),black,.008)
cyl('Front_camera',.045,.03,(.65,1.82,.35),lens)
for x,side in [(-.56,'left'),(.56,'right')]:
 for y,kind in [(-.52,'soft'),(-.76,'call')]:
  a=('soft:'+side) if kind=='soft' else ('contacts' if side=='left' else 'home')
  box('Key_'+a,(.43,.16,.065),(x,y,.36),keys,.035,a)
  text('Legend_'+a,'—' if kind=='soft' else ('+' if side=='left' else '-'),(x,y,.405),.12,white)
box('Joystick_base',(.34,.36,.08),(0,-.64,.37),keys,.05)
box('Joystick_OK',(.19,.21,.1),(0,-.64,.43),silver,.04,'ok')
for x,y,a in [(0,-.43,'up'),(0,-.87,'down'),(-.2,-.64,'left'),(.2,-.64,'right')]:box('Joystick_'+a,(.13,.13,.03),(x,y,.39),black,.015,'dir:'+a)
for i,n in enumerate('123456789*0#'):
 x=(i%3-1)*.39;y=-1.03-(i//3)*.25
 box('Digit_'+n,(.34,.19,.055),(x,y,.36),keys,.025,'digit:'+n);text('Digit_label_'+n,n,(x,y,.403),.115,white)
for x,a,b in [(-.74,'home','edit'),(.74,'music','clear')]:
 box('Rail_'+a,(.14,.39,.05),(x,-1.13,.35),keys,.025,a);box('Rail_'+b,(.14,.39,.05),(x,-1.7,.35),keys,.025,b);text('RailLabel_'+b,'C' if b=='clear' else '/', (x,-1.7,.39),.09,white)
box('Power_button',(.27,.09,.12),(.47,2.09,0),keys,.02,'power')
for y,a in [(1,'volume'),(.45,'capture')]:box('Side_'+a,(.08,.35,.12),(.93,y,0),keys,.02,a)
cyl('Camera_chrome_ring',.28,.045,(0,1,-.35),silver);cyl('Camera_lens',.2,.06,(0,1,-.39),lens)
box('Lens_cover',(1.52,1.13,.07),(0,1,-.46),keys,.09,'cover')
text('Rear_label','NOKIA',(0,-.55,-.335),.18,white,True)
for x in [-.65,.65]:cyl('Rear_screw',.025,.015,(x,-1.7,-.33),silver)
export('n73-blender');light((3,5,5),500,4);preview('n73-blender',(3,1.7,7),(0,0,0))
# Two independently modelled generations: 6600 joystick / 5230 touch slab.
for model in ['6600','5230']:
 reset();silver=mat('Satin silver',(.63,.65,.63),.7,.32);charcoal=mat('Charcoal rubber',(.055,.065,.068),.1,.65);ivory=mat('Ivory plastic',(.82,.81,.76),.05,.4);red=mat('Red rear shell',(.48,.035,.055),.15,.45);ink=mat('Display glass',(.018,.03,.035),.3,.18);legend=mat('Printed legends',(.8,.83,.8));greenkey=mat('Call green',(.04,.42,.15));redkey=mat('End red',(.6,.04,.04))
 if model=='6600':
  ovalbody('6600_rounded_body',(2.02,4.05,.73),(0,0,0),charcoal)
  ovalbody('6600_silver_face',(1.91,3.94,.19),(0,0,.36),silver)
  box('6600_display_surround',(1.6,2.17,.07),(0,.62,.48),charcoal,.13)
  box('6600_LCD',(1.35,1.66,.02),(0,.66,.53),ink,.01)
  text('Brand','NOKIA',(0,1.69,.5),.15,charcoal)
  for i in range(5):box('Earpiece',(.1,.025,.02),(-.24+i*.12,1.88,.49),charcoal,.01)
  cyl('6600_Joystick',.16,.11,(0,-.78,.54),charcoal,'ok')
  for x,y,a in [(0,-.64,'up'),(0,-.92,'down'),(-.15,-.78,'left'),(.15,-.78,'right')]:box('Stick_'+a,(.15,.14,.03),(x,y,.48),silver,.02,'dir:'+a)
  for x,side in [(-.64,'left'),(.64,'right')]:
   box('Select_'+side,(.4,.18,.06),(x,-.62,.53),silver,.07,'soft:'+side)
   box('Call_'+side,(.35,.2,.06),(x*1.3,-.32,.53),greenkey if side=='left' else redkey,.07,'contacts' if side=='left' else 'home')
  for i,n in enumerate('123456789*0#'):
   x=(i%3-1)*.43;y=-1.04-(i//3)*.21
   box('Digit_'+n,(.42,.21,.065),(x,y,.49),silver,.085,'digit:'+n);text('Legend_'+n,n,(x,y,.532),.12,charcoal)
  for x,a in [(-.85,'home'),(.85,'clear')]:box('Side_key_'+a,(.13,.38,.05),(x,-1.05,.48),charcoal,.04,a)
  cyl('Rear_camera_ring',.23,.06,(0,1.05,-.41),silver);cyl('Rear_camera',.14,.07,(0,1.05,-.46),ink)
  box('Power',(.3,.08,.12),(0,2.04,0),charcoal,.03,'power')
 else:
  box('5230_red_back',(1.87,4.03,.42),(0,0,0),red,.21)
  box('5230_white_rim',(1.88,4.03,.15),(0,0,.24),ivory,.18)
  box('5230_black_front',(1.69,3.8,.07),(0,0,.34),charcoal,.11)
  box('5230_LCD',(1.47,2.64,.02),(0,.15,.39),ink,.01)
  text('5230_brand','NOKIA',(0,1.69,.39),.13,ivory)
  box('5230_earpiece',(.47,.035,.025),(0,1.87,.39),charcoal,.01)
  for x,a,ma,label in [(-.58,'contacts',greenkey,'+'),(0,'home',ivory,'='),(.58,'soft:right',redkey,'-')]:
   box('5230_bottom_'+a,(.42,.23,.06),(x,-1.55,.4),ma,.06,a);text('5230_legend_'+a,label,(x,-1.55,.44),.12,charcoal)
  box('5230_power',(.22,.09,.14),(.5,2.04,0),charcoal,.025,'power')
  box('5230_lock',(.07,.3,.1),(.96,.35,0),silver,.02)
  cyl('5230_camera_ring',.17,.04,(0,1.25,-.25),silver);cyl('5230_camera',.11,.045,(0,1.25,-.28),ink)
 if model=='6600':
  # CC0 front photograph becomes a UV skin on the shaped shell, not a loose image.
  im=bpy.data.images.load(os.path.join(ROOT,'dist/images/references/nokia-6600-real.jpg'));im.pack();fm=mat('6600 Drummyfish CC0 photo skin',(.6,.6,.6),.12,.58);n=fm.node_tree.nodes.new('ShaderNodeTexImage');n.image=im;fm.node_tree.links.new(n.outputs['Color'],fm.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
  o=ovalbody('6600_photo_front',(2.02,4.05,.004),(0,0,.64),fm);uv=o.data.uv_layers.new()
  for poly in o.data.polygons:
   for li in poly.loop_indices:
    v=o.data.vertices[o.data.loops[li].vertex_index].co
    uv.data[li].uv=(.032+(v.x/2.02+.5)*.335,.046+(v.z/4.05+.5)*.908)
 text('Rear_brand','NOKIA',(0,-.4,-.4 if model=='6600' else -.24),.18,silver,True)
 export(model+'-blender');light((3,5,5),500,4);preview(model+'-blender',(2,1,7),(0,0,0))
reset();walnut=wood();wall=mat('Aged plaster',(.34,.35,.29),0,.95);floor=mat('Old floor tiles',(.21,.23,.2),0,.85);green=mat('Repair mat',(.04,.16,.13),0,.9);metal=mat('Oxidized aluminium',(.25,.32,.29),.7,.35);dark=mat('Cable rubber',(.022,.027,.025),0,.8);paper=mat('Yellowed repair slips',(.63,.55,.36),0,.95);beige=mat('Landline plastic',(.5,.48,.35),0,.5);blue=mat('Phone packaging blue',(.065,.12,.17),0,.65)
glass=mat('Counter glass',(.31,.48,.44),.05,.15);p=glass.node_tree.nodes.get('Principled BSDF');p.inputs['Transmission Weight'].default_value=.72;p.inputs['Alpha'].default_value=.3;glass.surface_render_method='DITHERED'
box('Floor',(8,.12,6),(0,-.08,0),floor,.01)
box('Rear_wall',(8,3.7,.15),(0,1.8,-2.5),wall,.01)
box('Left_wall',(.12,3.7,5),(-4,1.8,0),wall,.01)
for x in range(-4,5):box('Tile_grout_'+str(x),(.012,.005,6),(x,.001,0),metal,0)
for z in range(-3,4):box('Tile_line_'+str(z),(8,.005,.012),(0,.002,z),metal,0)
box('Repair_bench',(4.2,.15,1.35),(1.35,1.12,-1.65),walnut,.045,'bench')
for x in [-.6,3.2]:box('Bench_leg',(.15,1.1,.9),(x,.55,-1.65),walnut,.025)
box('Cutting_mat',(2.1,.035,1.05),(1.25,1.22,-1.55),green,.005)
box('Glass_counter_base',(4,.17,1.3),(-.9,.2,1.1),walnut,.025)
for x in [-2.8,1]:
 for z in [.5,1.75]:box('Counter_frame',(.08,1.2,.08),(x,.8,z),metal,.01)
box('Glass_top',(4,.04,1.35),(-.9,1.4,1.1),glass,.008,'counter')
box('Glass_front',(4,1.1,.03),(-.9,.85,1.75),glass,.005)
for i in range(12):box('Display_battery_'+str(i),(.32,.13,.45),(-2.5+(i%6)*.55,.38,.8+(i//6)*.55),blue,.015)
box('Cabinet_left',(.09,1.4,1.2),(2.15,.7,.85),walnut,.03)
box('Cabinet_right',(.09,1.4,1.2),(3.45,.7,.85),walnut,.03)
box('Cabinet_top',(1.3,.08,1.2),(2.8,1.4,.85),walnut,.03)
box('Cabinet_back',(1.3,1.4,.08),(2.8,.7,.25),walnut,.02)
box('Cabinet_lower_front',(1.21,.6,.08),(2.8,.36,1.5),walnut,.025)
box('Drawer_front',(1.21,.36,.09),(2.8,1.15,1.5),walnut,.03,'drawer')
box('Drawer_handle',(.38,.04,.09),(2.8,1.15,1.59),metal,.015,'drawer')
box('Drawer_inside',(1.15,.04,.9),(2.8,.99,1.08),walnut,.015)
box('Warranty_cards',(.5,.018,.45),(2.6,1.04,1.2),paper,.005,'drag:cards')
box('Loose_battery',(.23,.055,.35),(2.85,1.07,1.2),dark,.015,'drag:battery')
box('Old_photo',(.42,.008,.3),(2.82,1.035,1.18),paper,.003,'photo')
box('Repair_receipt',(.38,.008,.5),(-.6,1.45,1.1),paper,.004,'receipt')
box('Landline_base',(.65,.13,.45),(-2.1,1.48,.95),beige,.05,'call')
box('Landline_handset',(.72,.09,.17),(-2.1,1.59,.96),beige,.06,'call')
for i in range(12):box('Landline_digit',(.06,.015,.04),(-2.23+(i%3)*.1,1.56,1.12+(i//3)*.055),dark,.005,'call')
for i in range(21):
 x=-2.4+(i%7)*.72;y=1.8+(i//7)*.43
 box('Hanging_pack_'+str(i),(.32,.36,.07),(x,y,-2.36),blue if i%2 else paper,.015)
for i in range(6):box('Spare_parts_box',(.42,.25,.3),(2.8,1.6+i*.26,-2.25),beige,.015)
for i,id in enumerate(['silver','black','white']):
 ma=mat('Handset_'+id,[(.45,.48,.43),(.025,.03,.035),(.72,.73,.67)][i],.4,.3)
 o=box('Phone_'+id,(.29,.07,.66),(.45+i*.53,1.29,-1.4),ma,.04,'phone:'+id)
 box('Phone_screen_'+id,(.22,.009,.3),(.45+i*.53,1.335,-1.53),green,.01,'phone:'+id)
box('Charging_tray',(.6,.06,.7),(2.6,1.24,-1.6),metal,.02,'tray')
box('Small_brass_key',(.18,.018,.045),(2.55,1.29,-1.5),mat('Brass',(.46,.31,.1),.75,.4),.008,'key')
for i in range(9):
 bpy.ops.mesh.primitive_torus_add(major_radius=.12+i*.005,minor_radius=.015,major_segments=24,minor_segments=6,location=(2.6,-(-1.6),1.3+i*.012));bpy.context.object.name='Tangled_charging_cable';bpy.context.object.data.materials.append(dark)
box('Door_frame',(.13,3,.13),(-3.85,1.5,1.8),metal,.01,'door')
box('Clock_body',(.6,.6,.1),(-2.7,2.9,-2.32),beige,.2,'clock')
text('Clock_face','11:48',(-2.7,2.9,-2.25),.13,dark)
# Printed posters and blister-pack contents add period detail to the room.
photo=bpy.data.images.load(os.path.join(ROOT,'dist/images/shop/oldlane-interior.jpg'));photo.pack()
for j,(u0,u1) in enumerate([(.38,.51),(.52,.66),(.69,.84)]):
 pm=mat('Period poster '+str(j),(.7,.65,.5),0,.9);n=pm.node_tree.nodes.new('ShaderNodeTexImage');n.image=photo;pm.node_tree.links.new(n.outputs['Color'],pm.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 o=box('Faded phone poster '+str(j),(1.05,.78,.015),(-1.5+j*1.2,3,-2.37),pm,.005)
 uv=o.data.uv_layers.active
 if uv:
  for loop in uv.data:loop.uv=(u0+loop.uv.x*(u1-u0),.75+loop.uv.y*.23)
for i in range(21):
 x=-2.4+(i%7)*.72;y=1.8+(i//7)*.43
 box('Packed charger '+str(i),(.12,.18,.06),(x,y,-2.3),dark,.02)
for i in range(16):
 x=.1+(i%8)*.24;z=-1.9+(i//8)*.6
 box('Bench screw '+str(i),(.025,.02,.025),(x,1.26,z),metal,.004)
box('Soldering station',(.45,.32,.4),(2.2,1.4,-1.9),dark,.025)
box('Soldering iron',(.035,.035,.46),(1.9,1.3,-1.5),metal,.009)
box('Soldering grip',(.07,.07,.25),(1.9,1.3,-1.3),dark,.02)
# The readable clue remains in the HTML inspection view; these are original prop textures.
drawer_image=bpy.data.images.load(os.path.join(ROOT,'dist/images/shop/drawer.jpg'));drawer_image.pack()
for objname,crop in [('Warranty_cards',(.04,.43,.2,.88)),('Loose_battery',(.44,.65,.4,.78)),('Old_photo',(.4,.77,.15,.43))]:
 o=bpy.data.objects.get(objname);m=mat('Texture '+objname,(.5,.45,.35),0,.7);n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=drawer_image;m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color']);o.data.materials.clear();o.data.materials.append(m)
 uv=o.data.uv_layers.active
 if uv:
  a,b,c,d=crop
  for loop in uv.data:loop.uv=(a+loop.uv.x*(b-a),c+loop.uv.y*(d-c))
box('Fluorescent_tube',(2,.09,.1),(.5,2.7,-2.25),mat('Tube glow',(.85,.9,.76),0,.2),.03)
# Scuffed plinths, scattered era accessories and repair debris.
rng=random.Random(6600)
for i in range(40):
 x=rng.uniform(-3.8,3.8);z=rng.uniform(-2.3,2.8)
 box('Floor_scuff_'+str(i),(rng.uniform(.08,.4),.002,.015),(x,.009,z),dark,0)
for i in range(17):
 x=rng.uniform(-.5,2.8);z=rng.uniform(-2.08,-1.15)
 box('Used_SIM_'+str(i),(.09,.012,.13),(x,1.245,z),paper,.009)
 box('SIM_contacts_'+str(i),(.055,.006,.07),(x,1.255,z),metal,.002)
for i in range(9):
 box('Secondhand_box_'+str(i),(.48,.19,.68),(-3.3, .2+i*.19,-1.8),blue if i%2 else paper,.015)
for i in range(14):
 box('Paper_scrap_'+str(i),(.12,.003,.2),(rng.uniform(-2.6,.7),1.43,rng.uniform(.6,1.6)),paper,.001)
for i in range(8):
 box('Wall_damp_'+str(i),(.32+rng.random()*.6,.08,.007),(-3.5+i, .2+rng.random()*.3,-2.415),dark,.02)
for i in range(5):
 box('Cassette_case_'+str(i),(.45,.08,.3),(-2.7+i*.48,.5,1.3),beige,.01)
box('Old_radio',(.8,.45,.28),(-3.3,1.5,-2.1),beige,.04)
for i in range(7):box('Radio_grille_'+str(i),(.22,.018,.015),(-3.45,1.35+i*.045,-1.95),dark,.004)
text('Radio_scale','FM 88 108',(-3.05,1.56,-1.945),.055,dark)
export('oldlane-shop');light((1,4,1),700,5);light((-3,3,3),300,3);preview('oldlane-shop',(7,5,8),(0,1,0))
print('BLENDER_OLDDAYS_EXPORT_COMPLETE')
