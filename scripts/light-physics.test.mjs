import test from "node:test";
import assert from "node:assert/strict";
import {
  slitIntensity,
  detectionCDF,
  sampleDetection,
  OPTICS,
  photoelectric,
  prismRay,
  refract2,
  seededRandom,
} from "../lib/light-physics.ts";

test("fringes have a central maximum and the expected first dark fringe", () => {
  assert.equal(slitIntensity(0), 1);
  const theta = Math.asin(OPTICS.wavelength / (2 * OPTICS.separation));
  const dark = OPTICS.distance * Math.tan(theta);
  assert.ok(slitIntensity(dark) < 1e-20);
  assert.ok(slitIntensity(dark, OPTICS.separation, true) > 0.4);
  assert.ok(Math.abs(dark - 0.001472224) < 1e-8);
});
test("wider slit separation gives smaller fringe spacing", () => {
  const dark = (d) => Math.tan(Math.asin(OPTICS.wavelength / (2 * d)));
  assert.ok(dark(300e-6) < dark(150e-6));
});
test("seeded sampling matches the coherent and incoherent distributions", () => {
  for (const recorded of [false, true]) {
    const cdf = detectionCDF(OPTICS.separation, recorded);
    assert.equal(cdf[0], 0);
    assert.equal(cdf.at(-1), 1);
    const random = seededRandom(1921);
    let sum = 0,
      central = 0;
    const count = 40000;
    for (let i = 0; i < count; i++) {
      const x = sampleDetection(cdf, random());
      sum += x;
      assert.ok(Math.abs(x) <= OPTICS.halfScreen);
      if (Math.abs(x) < 0.00035) central++;
    }
    assert.ok(Math.abs(sum / count) < 0.0001);
    // Relative probability of the same small central strip differs with path information.
    assert.ok(central / count > (recorded ? 0.04 : 0.08));
  }
});
test("photoemission threshold and kinetic-energy equation", () => {
  assert.equal(photoelectric(650).emits, false);
  assert.equal(photoelectric(650).maximumKineticEnergy, 0);
  assert.equal(photoelectric(400).emits, true);
  assert.ok(
    Math.abs(photoelectric(400).maximumKineticEnergy - 0.59960496) < 1e-8,
  );
});
test("Snell refraction preserves unit length and handles total internal reflection", () => {
  assert.equal(refract2([Math.sqrt(3) / 2, -0.5], [0, 1], 1.5), null);
  for (const wavelength of [400, 550, 700]) {
    const ray = prismRay(wavelength);
    assert.ok(ray.outgoing);
    assert.ok(Math.abs(Math.hypot(...ray.outgoing) - 1) < 1e-12);
    assert.ok(Math.abs(2 * ray.exit[0] + ray.exit[1] - 1) < 1e-12);
  }
  assert.ok(prismRay(400).outgoing[1] < prismRay(700).outgoing[1]);
});
