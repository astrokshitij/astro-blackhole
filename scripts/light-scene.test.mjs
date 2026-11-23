import test from "node:test";
import assert from "node:assert/strict";
import {
  buildBench,
  cauchyIndex,
  tracePrism,
  MIN_DEVIATION,
  PRISM_VERTICES,
  CARD_X,
  GREEN_NM,
  WAVELENGTHS,
} from "../lib/light-scene.ts";

const bench = buildBench();

test("green leaves the prism level, so the bench can sit at one height", () => {
  assert.ok(Math.abs(bench.green.out[1]) < 1e-9, `${bench.green.out[1]}`);
  assert.ok(bench.green.out[0] > 0.999);
});

test("the prism sits at minimum deviation for green (symmetric passage)", () => {
  const n = cauchyIndex(GREEN_NM);
  // Inside the glass the ray runs parallel to the base at minimum deviation.
  const base = [
    PRISM_VERTICES[1][0] - PRISM_VERTICES[0][0],
    PRISM_VERTICES[1][1] - PRISM_VERTICES[0][1],
  ];
  const l = Math.hypot(...base);
  const cross = (bench.green.inside[0] * base[1] - bench.green.inside[1] * base[0]) / l;
  assert.ok(Math.abs(cross) < 1e-9);
  assert.ok(Math.abs(MIN_DEVIATION - (2 * Math.asin(n / 2) - Math.PI / 3)) < 1e-12);
});

test("every visible wavelength refracts through two faces; violet bends most", () => {
  for (const r of bench.rays) assert.ok(Math.abs(Math.hypot(...r.out) - 1) < 1e-12);
  // Longer wavelength -> lower index -> less deviation -> higher exit angle.
  const angles = bench.rays.map((r) => Math.atan2(r.out[1], r.out[0]));
  for (let i = 1; i < angles.length; i++) assert.ok(angles[i] > angles[i - 1]);
});

test("rotation of the source direction changes ray directions, not colour indices", () => {
  const a = tracePrism(bench.mirror, [Math.cos(0.6), Math.sin(0.6)], 600);
  const b = tracePrism(bench.mirror, [Math.cos(0.7), Math.sin(0.7)], 600);
  assert.ok(a && b);
  assert.equal(a.index, b.index);
  assert.notDeepEqual(a.out, b.out);
});

test("the whole spectrum lands on the selection card and the pinhole is on green", () => {
  // Card plate spans y 0.84..1.52 in the scene.
  for (const r of bench.rays) {
    assert.equal(r.hit[0], CARD_X);
    assert.ok(r.hit[1] > 0.9 && r.hit[1] < 1.45, `${r.nm}: ${r.hit[1]}`);
  }
  const violet = bench.rays[0].hit[1];
  const red = bench.rays[WAVELENGTHS.length - 1].hit[1];
  assert.ok(bench.pinholeY > violet && bench.pinholeY < red);
  assert.ok(Math.abs(bench.pinholeY - bench.green.exit[1]) < 1e-9);
});

test("the sunbeam reaches the prism via a flat mirror on the floor", () => {
  assert.equal(bench.mirror[1], 0);
  const down = Math.atan2(bench.mirror[1] - bench.sun[1], bench.mirror[0] - bench.sun[0]);
  assert.ok(Math.abs(down + bench.elevation) < 1e-12);
});
