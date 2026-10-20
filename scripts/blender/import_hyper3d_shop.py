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

helpers=(root/'scripts/blender/build_oldlane.py').read_text().split("reset();silver=mat('Brushed metal'")[0]
exec(helpers,globals())
def real_surface(name,file,repeat=1):
 m=mat(name,(.55,.5,.4),0,.83);n=m.node_tree.nodes;ntex=n.new('ShaderNodeTexImage');im=bpy.data.images.load(str(root/file));im.pack();ntex.image=im
 uv=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeVectorMath');mapping.operation='SCALE';mapping.inputs[3].default_value=repeat;m.node_tree.links.new(uv.outputs['UV'],mapping.inputs[0]);m.node_tree.links.new(mapping.outputs[0],ntex.inputs['Vector']);m.node_tree.links.new(ntex.outputs['Color'],n.get('Principled BSDF').inputs['Base Color'])
 return m
wall=real_surface('Photographed worn plaster - Amal Kumar CC0','dist/images/materials/plaster-diff.jpg',2)
wood=real_surface('Photographed worn tabletop - Poly Haven CC0','dist/images/materials/wood-diff.jpg',1)
for obj in bpy.context.scene.objects:
 if obj.name in ['Rear_wall','Left_wall']:obj.data.materials.clear();obj.data.materials.append(wall)
 if obj.name.startswith(('Cabinet_','Drawer_','Repair_bench','Bench_leg')):obj.data.materials.clear();obj.data.materials.append(wood)
# Enclose the player's view: avoid showing the cut edge of a dollhouse floor.
floor=bpy.data.objects.get('Floor');floor.scale.x*=3;floor.scale.y*=4
left=bpy.data.objects.get('Left_wall');left.scale.y*=3
box('Shop_ceiling',(8,.1,16),(0,3.75,2.5),wall,.005)
# Real period objects stay distinct from the story's clues.
black=mat('Worn charger plastic',(.025,.027,.026),.05,.72)
charger=box('Period_charger',(.34,.25,.52),(-.28,1.56,-1.62),black,.06,'inspect:charger')
spare=box('Period_BL5C',(.34,.045,.52),(-.2,1.28,-1.5),black,.012,'inspect:bl5c')
def image_top(name,file,size,loc,action):
 m=real_surface(name,file);obj=box(name,(size[0],.012,size[1]),loc,m,.003,action);return obj
image_top('Period_battery_label','dist/images/references/battery-bl5c-2007.jpg',(.34,.52),(-.2,1.312,-1.5),'inspect:bl5c')
# Real accessory photo cards on the wall are part of the shop, not fictional evidence.
for index,(file,title) in enumerate([('nokia-n73-real.jpg','N73 catalogue'),('battery-bl5c-2007.jpg','Battery catalogue'),('charger-2008.jpg','Charger catalogue')]):
 im=bpy.data.images.load(str(root/'dist/images/references'/file));im.pack();m=mat(title,(.6,.6,.6),0,.9);n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=im;m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 obj=box('Period_accessory_card_'+str(index),(.65,.85,.012),(-3.25+index*.82,2.45,-2.36),m,.005)
for image in bpy.data.images:
 limit=256 if any(k in image.name for k in ['texture_normal','texture_metallic','texture_roughness']) else 512 if image.name.startswith(('texture_','plaster-diff','wood-diff')) else 1024
 if max(image.size)>limit:
  scale=limit/max(image.size);image.scale(max(1,round(image.size[0]*scale)),max(1,round(image.size[1]*scale)));image.pack()
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
 if obj.type in {'MESH','CURVE','FONT'}:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(root/'dist/models/oldlane-shop-hyper3d.glb'),export_format='GLB',use_selection=True,export_extras=True,export_apply=True,export_cameras=False,export_lights=False)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'art/hyper3d/shop-interactive.blend'))
print('OPERABLE_SHOP_EXPORT')
