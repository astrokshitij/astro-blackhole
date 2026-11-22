/** SI units unless a name explicitly includes a unit. Pure models, independent of rendering. */
export const OPTICS = {
  wavelength: 530e-9,
  slitWidth: 35e-6,
  separation: 180e-6,
  distance: 1,
  halfScreen: 0.009,
};
export const PHOTON_EV_NM = 1239.841984;
export const WORK_FUNCTION_EV = 2.5; // An illustrative surface, not a claim about a named metal.
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
export const sinc = (v: number) => (Math.abs(v) < 1e-10 ? 1 : Math.sin(v) / v);

/** Fraunhofer two-slit intensity including the finite-width diffraction envelope.
 * With perfectly distinguishable paths the interference term is removed; diffraction remains.
 * Both distributions are relative intensities, normalized separately before sampling.
 */
export function slitIntensity(
  x: number,
  separation = OPTICS.separation,
  recorded = false,
) {
  const sinTheta = x / Math.hypot(OPTICS.distance, x);
  const envelope =
    sinc((Math.PI * OPTICS.slitWidth * sinTheta) / OPTICS.wavelength) ** 2;
  return (
    envelope *
    (recorded
      ? 0.5
      : Math.cos((Math.PI * separation * sinTheta) / OPTICS.wavelength) ** 2)
  );
}

export function detectionCDF(
  separation = OPTICS.separation,
  recorded = false,
  bins = 2048,
  halfScreen = OPTICS.halfScreen,
) {
  const values = new Float64Array(bins + 1);
  let sum = 0;
  for (let i = 1; i <= bins; i++) {
    const x = -halfScreen + ((i - 0.5) / bins) * halfScreen * 2;
    sum += slitIntensity(x, separation, recorded);
    values[i] = sum;
  }
  for (let i = 1; i <= bins; i++) values[i] /= sum;
  return values;
}

export function sampleDetection(cdf: Float64Array, u: number, halfScreen = OPTICS.halfScreen) {
  u = Math.min(1 - Number.EPSILON, Math.max(0, u));
  let lo = 0,
    hi = cdf.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >>> 1;
    if (cdf[m] < u) lo = m;
    else hi = m;
  }
  const fraction = (u - cdf[lo]) / Math.max(Number.EPSILON, cdf[hi] - cdf[lo]);
  return (((lo + fraction) / (cdf.length - 1)) * 2 - 1) * halfScreen;
}

export function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function photoelectric(wavelengthNm: number) {
  const photonEnergy = PHOTON_EV_NM / wavelengthNm;
  return {
    photonEnergy,
    maximumKineticEnergy: Math.max(0, photonEnergy - WORK_FUNCTION_EV),
    emits: photonEnergy > WORK_FUNCTION_EV,
  };
}

export type V2 = [number, number];
/** Normal points into the incident medium. null means total internal reflection. */
export function refract2(incident: V2, normal: V2, ratio: number): V2 | null {
  const cos = -(incident[0] * normal[0] + incident[1] * normal[1]);
  const k = 1 - ratio * ratio * (1 - cos * cos);
  if (k < 0) return null;
  return [
    ratio * incident[0] + (ratio * cos - Math.sqrt(k)) * normal[0],
    ratio * incident[1] + (ratio * cos - Math.sqrt(k)) * normal[1],
  ];
}

/** Triangle (-1,-1),(1,-1),(0,1). Physical Cauchy dispersion by default.
 * Rendering may opt into an explicitly labelled magnified dispersion for legibility.
 */
export function prismRay(wavelengthNm: number, dispersionMagnification = 1) {
  const um = wavelengthNm / 1000;
  const reference = 1.5046 + 0.0042 / 0.55 ** 2;
  const index =
    reference +
    dispersionMagnification * (1.5046 + 0.0042 / um ** 2 - reference);
  const n = Math.sqrt(5);
  const entry: V2 = [-0.55, -0.1];
  const inside = refract2([1, 0], [-2 / n, 1 / n], 1 / index)!;
  const t = (1 - 2 * entry[0] - entry[1]) / (2 * inside[0] + inside[1]);
  const exit: V2 = [entry[0] + inside[0] * t, entry[1] + inside[1] * t];
  const outgoing = refract2(inside, [-2 / n, -1 / n], index);
  return { index, entry, inside, exit, outgoing };
}

/** Display RGB approximation. Wavelength remains a physical scalar in the models. */
export function wavelengthRGB(nm: number): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;
  if (nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else r = 1;
  return [clamp01(r), clamp01(g), clamp01(b)];
}
