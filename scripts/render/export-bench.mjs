// Writes scripts/render/bench.json for the Blender renders.
// Run from the repo root: node scripts/render/export-bench.mjs
import { writeFileSync } from "node:fs";
import * as scene from "../../lib/light-scene.ts";
import {
  detectionCDF,
  sampleDetection,
  seededRandom,
  slitIntensity,
  OPTICS,
} from "../../lib/light-physics.ts";

const b = scene.buildBench();
const HALF = 0.018; // 36 mm field of view
const cdf = detectionCDF(OPTICS.separation, false, 4096, HALF);
const rand = seededRandom(530);
const dots = [];
for (let i = 0; i < 6000; i++) {
  const x = sampleDetection(cdf, rand(), HALF) / HALF; // -1..1 across the screen
  const g = (rand() + rand() + rand() - 1.5) / 1.5; // soft vertical band
  dots.push([+x.toFixed(5), +g.toFixed(4), +(0.55 + rand() * 0.45).toFixed(3)]);
}
const curve = Array.from({ length: 401 }, (_, i) => {
  const x = (i / 400 - 0.5) * 2 * HALF;
  return +slitIntensity(x).toFixed(5);
});
const out = {
  vertices: b.vertices,
  depth: scene.PRISM_DEPTH,
  mirror: b.mirror,
  sun: b.sun,
  entry: b.entry,
  elevation: b.elevation,
  pinholeY: b.pinholeY,
  card: scene.CARD_X,
  lens: scene.LENS_X,
  slit: scene.SLIT_X,
  detector: scene.DETECTOR_X,
  detHalf: scene.DETECTOR_HALF_WIDTH,
  slitHalfSep: scene.SLIT_HALF_SEPARATION,
  rays: b.rays.map((r) => ({ nm: r.nm, exit: r.exit, out: r.out, hit: r.hit, rgb: r.rgb })),
  dots,
  curve,
};
writeFileSync(new URL("./bench.json", import.meta.url), JSON.stringify(out));
console.log("bench.json written:", out.rays.length, "rays,", dots.length, "detections");
