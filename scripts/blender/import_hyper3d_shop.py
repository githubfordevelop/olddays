"""Use the generated display counter while preserving all separately operated props.
The full Rodin set is kept as source; the generated drawer is deliberately excluded.
"""
import bpy,bmesh
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root/'art/blender/oldlane-shop.blend'))
for o in list(bpy.context.scene.objects):
 if o.name.startswith(('Glass_counter_base','Counter_frame','Glass_front','Display_battery')):bpy.data.objects.remove(o,do_unlink=True)
# Generated countertop replaces this surface visually; original click target stays separate.
top=bpy.data.objects.get('Glass_top')
if top:
 m=bpy.data.materials.new('Counter interaction only');m.use_nodes=True;m.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=0;m.surface_render_method='DITHERED';top.data.materials.clear();top.data.materials.append(m)
before=set(bpy.context.scene.objects)
bpy.ops.import_scene.gltf(filepath=str(root/'art/hyper3d/shop-raw/base_basic_pbr.glb'))
meshes=[o for o in bpy.context.scene.objects if o not in before and o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();o=bpy.context.object
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bm=bmesh.new();bm.from_mesh(o.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.y>-.015 or v.co.x>.25],context='VERTS');bm.to_mesh(o.data);bm.free()
pts=[v.co.copy() for v in o.data.vertices];lo=Vector([min(v[i] for v in pts) for i in range(3)]);hi=Vector([max(v[i] for v in pts) for i in range(3)]);span=hi-lo
for v in o.data.vertices:
 p=v.co.copy();v.co=Vector((-2.9+(p.x-lo.x)*4/span.x,-1.78+(p.y-lo.y)*1.35/span.y,.12+(p.z-lo.z)*1.32/span.z))
o.name='Hyper3D_display_counter';o['provider']='Hyper3D Rodin';o['role']='static visual counter; drawer and evidence remain separate'
for image in bpy.data.images:
 if max(image.size)>1024:
  scale=1024/max(image.size);image.scale(max(1,round(image.size[0]*scale)),max(1,round(image.size[1]*scale)));image.pack()
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
 if obj.type in {'MESH','CURVE','FONT'}:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(root/'dist/models/oldlane-shop-hyper3d.glb'),export_format='GLB',use_selection=True,export_extras=True,export_apply=True,export_cameras=False,export_lights=False)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'art/hyper3d/shop-interactive.blend'))
print('OPERABLE_SHOP_EXPORT')
