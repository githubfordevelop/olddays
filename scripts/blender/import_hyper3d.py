"""Attach a generated N73 visual shell to the existing independently operable rig.
Run with installed Blender; raw downloaded assets remain unmodified in art/hyper3d.
"""
import bpy, sys, math, argparse
from pathlib import Path
from mathutils import Vector
p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--yaw',type=float,default=0);p.add_argument('--output',required=True);a=p.parse_args(sys.argv[sys.argv.index('--')+1:])
root=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root/'art/blender/n73-blender.blend'))
# Keep operation geometry as transparent hit targets, rather than baking keys into the shell.
transparent=bpy.data.materials.new('Independent interaction target');transparent.use_nodes=True
nodes=transparent.node_tree.nodes;nodes.clear();out=nodes.new('ShaderNodeOutputMaterial');shader=nodes.new('ShaderNodeBsdfPrincipled');shader.inputs['Alpha'].default_value=0
transparent.node_tree.links.new(shader.outputs['BSDF'],out.inputs['Surface']);transparent.surface_render_method='DITHERED'
for o in list(bpy.context.scene.objects):
 if o.type not in {'MESH','CURVE'}:continue
 if o.get('action'):
  if o.get('action')!='cover':o.data.materials.clear();o.data.materials.append(transparent)
 else:bpy.data.objects.remove(o,do_unlink=True)
before=set(bpy.context.scene.objects);bpy.ops.import_scene.gltf(filepath=str(Path(a.input).resolve()))
added=[o for o in bpy.context.scene.objects if o not in before];meshes=[o for o in added if o.type=='MESH']
if not meshes:raise RuntimeError('Downloaded asset contains no mesh')
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();shell=bpy.context.object;shell.name='Hyper3D_N73_shell';shell['provider']='Hyper3D Rodin';shell['role']='visual-only; independent keys provide actions'
shell.rotation_euler.rotate_axis('Z',math.radians(a.yaw));bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
coords=[shell.matrix_world@Vector(c) for c in shell.bound_box];lo=Vector([min(v[i] for v in coords) for i in range(3)]);hi=Vector([max(v[i] for v in coords) for i in range(3)]);span=hi-lo
if min(span)<.00001:raise RuntimeError('Degenerate model bounds')
# Blender Z is vertical, negative Y is the front used by the original rig.
center=(lo+hi)/2
for v in shell.data.vertices:
 world=shell.matrix_world@v.co
 v.co=Vector(((world.x-center.x)*1.82/span.x,(world.y-center.y)*.57/span.y,(world.z-center.z)*4.15/span.z))
shell.matrix_world.identity()
for poly in shell.data.polygons:poly.use_smooth=True
# Replace hallucinated printed details with the public-domain 2007 front photograph.
# Keep generated side curvature, but rebuild the rear as separately operated hardware.
helpers=(root/'scripts/blender/build_oldlane.py').read_text().split("reset();silver=mat('Brushed metal'")[0]
exec(helpers,globals())
for obj in list(bpy.context.scene.objects):
 if obj.name=='Lens_cover':bpy.data.objects.remove(obj,do_unlink=True)
front=photoFace('N73_real_front',1.82,4.15,.56,'nokia-n73-real.jpg',(.218,.804,.019,.982))
# Trace the photographed silhouette so notebook background is not part of the shell.
outline=[(.255,.035),(.70,.027),(.75,.037),(.773,.065),(.79,.2),(.804,.90),(.791,.947),(.76,.965),(.67,.974),(.32,.974),(.265,.96),(.24,.933),(.218,.86),(.218,.1),(.23,.055)]
mesh=bpy.data.meshes.new('Photo traced N73 silhouette');mesh.from_pydata([(((u-.218)/(.804-.218)-.5)*1.82,-.56,(.5-(v-.019)/(.982-.019))*4.15) for u,v in outline],[],[tuple(range(len(outline)-1,-1,-1))]);mesh.update();mesh.materials.append(front.data.materials[0]);front.data=mesh;uv=mesh.uv_layers.new()
for li in mesh.polygons[0].loop_indices:
 u,v=outline[mesh.loops[li].vertex_index];uv.data[li].uv=(u,1-v)

plum=mat('N73 plum rear plastic',(.135,.035,.055),.16,.5)
chrome=mat('N73 camera satin chrome',(.64,.67,.65),.8,.25)
ink=mat('N73 optical glass',(.015,.03,.045),.5,.12)
white=mat('N73 printed legends',(.82,.83,.8),0,.65)
flash=mat('N73 flash diffuser',(.82,.79,.58),.1,.25)
ovalbody('N73_accurate_rear',(1.75,4.04,.075),(0,0,-.34),plum)
ovalbody('Camera_chrome_plate',(1.25,.77,.065),(.02,1.35,-.405),chrome)
box('Camera_square_surround',(.57,.57,.045),(.19,1.35,-.45),ink,.12)
box('Camera_lens_glass',(.4,.4,.025),(.19,1.35,-.49),ink,.085)
cyl('Camera_optical_highlight',.1,.015,(.19,1.35,-.51),mat('Lens coating',(.055,.12,.18),.6,.12))
box('Camera_flash',(.24,.32,.035),(-.48,1.35,-.465),flash,.055)
text('Camera_specification','Carl Zeiss Tessar',(.0,1.75,-.465),.087,ink,True)
text('Camera_resolution','2.8/5.6  AF  3.2 megapixel',(.0,.94,-.465),.065,ink,True)
cover=ovalbody('Lens_cover',(1.64,2.6,.075),(0,.6,-.57),plum);cover['action']='cover'
brand=text('Rear_NOKIA','NOKIA',(0,.48,-.615),.19,white,True)
from mathutils import Quaternion
for name in ['Camera_specification','Camera_resolution','Rear_NOKIA']:
 bpy.data.objects[name].rotation_euler=(math.pi/2,0,math.pi)
brand.rotation_mode='QUATERNION';brand.rotation_quaternion=Quaternion(Vector((0,1,0)),math.pi/2)@brand.rotation_quaternion
brand.parent=cover;brand.matrix_parent_inverse=cover.matrix_world.inverted()
for x in [-.45,-.27,-.09,.09,.27,.45]:
 box('Rear_top_speaker',(.075,.026,.02),(x,1.96,-.39),ink,.01)

# Connect the photo-front to the generated curvature; no floating card-like face.
midframe=mat('N73 connected satin midframe',(.30,.32,.34),.65,.4)
ovalbody('N73_front_support',(1.80,4.10,.28),(0,0,.41),midframe)
for x in [-.77,.77]:box('Rear_cover_rail',(.10,2.58,.23),(x,.6,-.455),plum,.04)
# Calibrate physical hit centers against the same front photograph (no generic key grid).
for obj in bpy.context.scene.objects:
 action=obj.get('action','')
 if action.startswith('digit:'):
  i='123456789*0#'.index(action[6:]);obj.location.x=[-.364,.023,.455][i%3];obj.location.z=[-1.184,-1.386,-1.564,-1.79][i//3]
 if obj.name.startswith('Rail_'):
  obj.location.x=-.66 if obj.location.x<0 else .694;obj.location.z=-1.24 if action in ['home','music'] else -1.65
 if obj.name.startswith('Key_'):
  obj.location.z=-.73 if action.startswith('soft:') else -.945
for image in bpy.data.images:
 limit=256 if any(k in image.name for k in ['texture_normal','texture_metallic','texture_roughness']) else 512 if image.name.startswith(('texture_','plaster-diff','wood-diff')) else 1024
 if max(image.size)>limit:
  scale=limit/max(image.size);image.scale(max(1,round(image.size[0]*scale)),max(1,round(image.size[1]*scale)));image.pack()
depth_rig=bpy.data.objects.new('N73_depth_calibration',None);bpy.context.collection.objects.link(depth_rig)
for obj in list(bpy.context.scene.objects):
 if obj is not depth_rig and obj.parent is None:obj.parent=depth_rig
depth_rig.scale.y=.65
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type in {'MESH','EMPTY'}:o.select_set(True)
out=Path(a.output).resolve();out.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_extras=True,export_apply=True,export_cameras=False,export_lights=False)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'art/hyper3d/n73-interactive.blend'))
print('OPERABLE_HYPER3D_EXPORT',out)
