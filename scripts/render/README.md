# Light journey renders (Blender)

Pre-rendered 3D for the home page visuals. Geometry and beam directions come
from `lib/light-scene.ts` (the same tested Snell's-law solution), exported to
`bench.json`.

1. Export: `node -e "import('./lib/light-scene.ts').then(...)"` (see git history
   of this folder for the exact one-liner) writes `bench.json` beside `scene.py`.
2. Install Blender as a Python module: `python3 -m venv bl && bl/bin/pip install bpy`.
3. Render a still: `bl/bin/python scene.py heroA out.png 1400 1200 224`.
4. Fade edges into the page colour (#08090c): `python3 post.py out.png out.jpg`.

Beams are emission-only volumes standing for light scattered by dust; the
glass is real refractive glass with dispersion. Rendering is CPU Cycles.
