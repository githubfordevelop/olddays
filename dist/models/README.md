# Old Lane Blender assets

Original N73 and phone repair shop meshes created with Blender 4.5.9 LTS. Source `.blend` files: `art/blender/`; reproducible builder: `scripts/blender/build_oldlane.py`.

GLB node `extras.action` identifies power, directions, digits, soft keys, camera cover and shop props. Three.js uses these nodes for hit testing. The phone's CSS3D screen runs the existing handset apps and saves. The shop's physical prop positions use a separate bounded map in the existing save, preserving each collected handset's story state.

Materials use original project scene textures. Three.js, GLTFLoader, CSS3DRenderer and BufferGeometryUtils are vendored under MIT in `dist/vendor/three/LICENSE`. This is a browser recreation, not Nokia firmware.
