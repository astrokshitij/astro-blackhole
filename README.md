# Optimized Black Hole

A Next.js + TypeScript + Tailwind v4 project set up with the shadcn/ui structure,
hosting a single-pass WebGL2 black hole renderer.

## Run it

```bash
npm install
npm run dev
```

## Where things live

```
components.json                                     shadcn config (aliases, css path)
lib/utils.ts                                        cn() helper
components/ui/optimized-black-hole.tsx              the component
components/ui/optimized-black-hole-utils/
  renderer.ts                                       createRenderer({ canvas })
  shaders.ts                                        GLSL sources
app/page.tsx                                        full-screen demo
app/globals.css                                     Tailwind v4 + shadcn tokens
```

## Adding more shadcn components

```bash
npx shadcn@latest add button card
```

They land in `components/ui` because `components.json` points there.

## How the renderer works

Null geodesics are integrated per pixel in a Schwarzschild metric
(`d2x/dl2 = -1.5 h^2 x / r^5`, units r_s = 1), so the secondary disk image over
the shadow and the photon ring come out of the physics rather than a faked
distortion. Horizon at r = 1, photon sphere at 1.5, disk from the ISCO at 3 out
to 11. The disk is shaded with rotating fbm in the co-rotating frame, with a
Keplerian shear and relativistic beaming on the approaching limb.

Cost control:

- attribute-less full-screen triangle, one program, no per-frame allocation
- devicePixelRatio capped at 2 and total backing pixels capped at 2.6M
- adaptive render scale and step count driven by a moving average of frame cost
- paused via IntersectionObserver when off screen and on `visibilitychange`
- one static frame only when `prefers-reduced-motion: reduce`
- context loss and restore handled, 2D gradient fallback without WebGL2

`createRenderer` options: `canvas`, `maxPixelRatio`, `maxPixels`, `steps`.
