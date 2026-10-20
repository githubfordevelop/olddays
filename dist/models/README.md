# Old Lane Blender assets

Original N73 and phone repair shop meshes created with Blender 4.5.9 LTS. Source `.blend` files: `art/blender/`; reproducible builder: `scripts/blender/build_oldlane.py`.

GLB node `extras.action` identifies power, directions, digits, soft keys, camera cover and shop props. Three.js uses these nodes for hit testing. The phone's CSS3D screen runs the existing handset apps and saves. The shop's physical prop positions use a separate bounded map in the existing save, preserving each collected handset's story state.

Materials use original project scene textures. Three.js, GLTFLoader, CSS3DRenderer and BufferGeometryUtils are vendored under MIT in `dist/vendor/three/LICENSE`. This is a browser recreation, not Nokia firmware.

6600 and 5230 are separately generated Blender models with separate screen mappings and action extras. 6600 uses Drummyfish's CC0 real-device photograph as a UV front skin; see ../images/references/SOURCES.md. 5230 is touch-first with only call/menu/end hardware keys. Stories and save namespaces follow the device ID, not the model material.

2026-10-20 real-materials update: N73 uses Paul3vanz's 2007 public-domain front photograph; 5230 uses Anton Bagrin's 2009 CC BY-SA 3.0 front photograph. Screen planes and hardware action meshes are calibrated to the photographed positions. The photo-textured 5230 and shop GLB/.blend derivatives are licensed CC BY-SA 3.0; original photos and complete attribution links are in ../images/references/SOURCES.md. The fictional scene remains a reconstruction, distinct from dated documentary photographs in the reference folder.
