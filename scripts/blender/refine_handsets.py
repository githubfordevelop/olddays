"""Refine the other two independently operable handset rigs without changing save IDs."""
import bpy,math
from pathlib import Path
root=Path(__file__).resolve().parents[2]
helpers=(root/'scripts/blender/build_oldlane.py').read_text().split("reset();silver=mat('Brushed metal'")[0]
exec(helpers,globals())
def traced_photo(obj,outline,crop,w,h,depth,back=False):
 a,b,top,bottom=crop;verts=[(((.5-(u-a)/(b-a)) if back else ((u-a)/(b-a)-.5))*w,depth,(.5-(v-top)/(bottom-top))*h) for u,v in outline]
 mesh=bpy.data.meshes.new(obj.name+' traced contour');mesh.from_pydata(verts,[],[tuple(range(len(verts)-1,-1,-1))]);mesh.update();mesh.materials.append(obj.data.materials[0]);obj.data=mesh;uv=mesh.uv_layers.new()
 for li in mesh.polygons[0].loop_indices:
  u,v=outline[mesh.loops[li].vertex_index];uv.data[li].uv=(u,1-v)
for model in ['6600','5230']:
 bpy.ops.wm.open_mainfile(filepath=str(root/f'art/blender/{model}-blender.blend'))
 # Correct rear text orientation on both devices.
 brand=bpy.data.objects.get('Rear_brand')
 if brand:brand.rotation_euler=(math.pi/2,0,math.pi)
 if model=='6600':
  # CC0 front/side/back photo: map the rear independently, mirrored for rear viewing.
  im=bpy.data.images.load(str(root/'dist/images/references/nokia-6600-real.jpg'));im.scale(1024,round(im.size[1]*1024/im.size[0]));im.pack()
  m=mat('6600 CC0 photographed rear',(.55,.55,.55),.18,.55);n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=im;m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
  rear=ovalbody('6600_photo_rear',(2.02,4.05,.008),(0,0,-.47),m);uv=rear.data.uv_layers.new()
  for poly in rear.data.polygons:
   for li in poly.loop_indices:
    v=rear.data.vertices[rear.data.loops[li].vertex_index].co;uv.data[li].uv=(.982-(v.x/2.02+.5)*(.982-.646),.046+(v.z/4.05+.5)*.902)
  for name in ['Rear_brand','Rear_camera_ring','Rear_camera']:
   obj=bpy.data.objects.get(name)
   if obj:bpy.data.objects.remove(obj,do_unlink=True)
  for obj in bpy.context.scene.objects:
   action=obj.get('action','')
   if action.startswith('digit:'):
    i='123456789*0#'.index(action[6:]);obj.location.z=[-.97,-1.23,-1.49,-1.73][i//3]-(.07 if i%3==1 else 0)
   if obj.name=='Side_key_home':obj.location.z=-.72
   if obj.name=='Side_key_clear':obj.location.z=-.62
   if obj.name.startswith('Call_'):obj.location.z=-.23
  traced_photo(bpy.data.objects['6600_photo_front'],[(.102,.047),(.285,.047),(.325,.06),(.342,.10),(.356,.25),(.365,.43),(.353,.67),(.32,.85),(.295,.92),(.26,.945),(.14,.945),(.105,.92),(.08,.85),(.054,.69),(.033,.46),(.035,.26),(.05,.12),(.075,.06)],(.032,.367,.046,.954),2.02,4.05,-.64)
  traced_photo(rear,[(.75,.045),(.87,.045),(.94,.06),(.965,.1),(.98,.3),(.98,.60),(.96,.83),(.935,.91),(.90,.945),(.75,.945),(.70,.93),(.67,.88),(.65,.75),(.643,.55),(.645,.3),(.66,.12),(.69,.065)],(.646,.982,.046,.954),2.02,4.05,.47,True)
  for name in ['6600_rounded_body','6600_silver_face']:
   obj=bpy.data.objects.get(name)
   for v in obj.data.vertices:
    v.co.x*=1-.28*(max(0,-v.co.z)/2.025)**1.3-.15*(max(0,v.co.z)/2.025)**3
  charcoal=bpy.data.materials.get('Charcoal rubber')
  box('6600_Edit_key',(.13,.26,.05),(-.85,-1.1,.48),charcoal,.035,'edit')
 else:
  ivory=bpy.data.objects['5230_white_rim'].data.materials[0];ink=bpy.data.objects['5230_LCD'].data.materials[0];silver=bpy.data.objects['Rear_brand'].data.materials[0];red=bpy.data.objects['5230_red_back'].data.materials[0];charcoal=bpy.data.objects['5230_black_front'].data.materials[0]
  for name,dimensions,loc,material in [('5230_red_back',(1.87,4.03,.42),(0,0,0),red),('5230_white_rim',(1.88,4.03,.15),(0,0,.24),ivory),('5230_black_front',(1.69,3.8,.07),(0,0,.34),charcoal)]:
   bpy.data.objects.remove(bpy.data.objects[name],do_unlink=True);ovalbody(name,dimensions,loc,material)
  traced_photo(bpy.data.objects['5230_real_front'],[(.36,.008),(.64,.008),(.69,.025),(.725,.06),(.735,.12),(.735,.90),(.72,.95),(.68,.985),(.60,.995),(.38,.995),(.325,.98),(.286,.95),(.271,.9),(.271,.10),(.286,.05),(.32,.02)],(.271,.735,.005,.995),1.87,4.03,-.49)
  lock=bpy.data.objects.get('5230_lock');lock['action']='lock'
  box('5230_Volume_up',(.07,.24,.1),(.96,1.25,0),silver,.02,'volume:up')
  box('5230_Volume_down',(.07,.24,.1),(.96,.97,0),silver,.02,'volume:down')
  box('5230_Media_key',(.19,.16,.025),(.65,1.34,.42),ivory,.025,'music')
  # Model-specific rear details; no fictitious flash or N73 slider on a 5230.
  for i in range(5):box('5230_Speaker_slot_'+str(i),(.018,.085,.01),(-.9,.8+i*.11,-.01),ink,.004)
  text('5230_camera_mark','2.0 megapixel',(0,.86,-.26),.07,ivory,True).rotation_euler=(math.pi/2,0,math.pi)
 # Export optimized runtime copies; preserve editable originals for comparison.
 for image in bpy.data.images:
  if max(image.size)>1024:
   k=1024/max(image.size);image.scale(round(image.size[0]*k),round(image.size[1]*k));image.pack()
 bpy.ops.object.select_all(action='DESELECT')
 for o in bpy.context.scene.objects:
  if o.type in {'MESH','CURVE','FONT'}:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(root/f'dist/models/{model}-refined.glb'),export_format='GLB',use_selection=True,export_extras=True,export_apply=True,export_cameras=False,export_lights=False)
 bpy.ops.wm.save_as_mainfile(filepath=str(root/f'art/hyper3d/{model}-refined.blend'))
 print('REFINED_HANDSET',model)
