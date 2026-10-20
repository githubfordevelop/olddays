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
for image in bpy.data.images:
 if image.size[0]>1024 or image.size[1]>1024:
  scale=1024/max(image.size);image.scale(max(1,round(image.size[0]*scale)),max(1,round(image.size[1]*scale)));image.pack()
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type=='MESH':o.select_set(True)
out=Path(a.output).resolve();out.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_extras=True,export_apply=True,export_cameras=False,export_lights=False)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'art/hyper3d/n73-interactive.blend'))
print('OPERABLE_HYPER3D_EXPORT',out)
