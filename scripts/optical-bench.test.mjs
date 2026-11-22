import test from "node:test";
import assert from "node:assert/strict";
import {
  tracePrism,
  prismVertices,
  SCREEN_HALF_WIDTH,
} from "../lib/optical-bench.ts";
import {
  detectionCDF,
  sampleDetection,
  seededRandom,
  slitIntensity,
  OPTICS,
} from "../lib/light-physics.ts";

test("all film poses keep the visible spectrum transmitted through two real faces", () => {
  for (let a = -0.42; a <= -0.01; a += 0.015) {
    for (let nm = 400; nm <= 700; nm += 10) {
      const r = tracePrism(a, nm);
      assert.ok(r, `${a}, ${nm}`);
      assert.ok(Math.abs(Math.hypot(...r.direction) - 1) < 1e-10);
      const vertices = prismVertices(a);
      for (const point of [r.entry, r.exit]) {
        const distances = vertices.map((p, i) => {
          const q = vertices[(i + 1) % 3];
          return (
            Math.abs(
              (point[0] - p[0]) * (q[1] - p[1]) -
                (point[1] - p[1]) * (q[0] - p[0]),
            ) / Math.hypot(q[0] - p[0], q[1] - p[1])
          );
        });
        assert.ok(Math.min(...distances) < 1e-10);
      }
    }
  }
});
test("rotation changes outgoing directions, and violet deviates more than red", () => {
  const a = tracePrism(-0.12, 530),
    b = tracePrism(-0.32, 530);
  assert.ok(Math.abs(a.direction[1] - b.direction[1]) > 0.01);
  assert.ok(
    tracePrism(-0.2, 400).direction[1] < tracePrism(-0.2, 700).direction[1],
  );
});
test("the larger detector includes the first envelope zero and samples its whole width", () => {
  const zero = Math.tan(Math.asin(OPTICS.wavelength / OPTICS.slitWidth));
  assert.ok(zero < SCREEN_HALF_WIDTH);
  assert.ok(slitIntensity(zero) < 1e-20);
  const cdf = detectionCDF(OPTICS.separation, false, 2048, SCREEN_HALF_WIDTH);
  const random = seededRandom(2026);
  let min = Infinity,
    max = -Infinity;
  for (let i = 0; i < 20000; i++) {
    const x = sampleDetection(cdf, random(), SCREEN_HALF_WIDTH);
    min = Math.min(min, x);
    max = Math.max(max, x);
    assert.ok(Math.abs(x) <= SCREEN_HALF_WIDTH);
  }
  assert.ok(min < -0.015 && max > 0.015);
});
