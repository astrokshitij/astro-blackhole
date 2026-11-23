/**
 * The optical bench behind the home page, solved once in plain numbers.
 *
 * World units are arbitrary (roughly decimetres). The floor is y = 0, the
 * bench runs along +x and every beam lies in the vertical plane z = 0.
 *
 *   sun -> flat mirror on the floor -> prism -> spectrum on a card with a
 *   pinhole -> lens -> two vertical slits -> detector screen
 *
 * The prism is an equilateral triangle in the x-y plane, standing on its base
 * and extruded along z. Rays are solved with Snell's law at both faces for
 * each wavelength (Cauchy index, dispersion magnified for visibility). The
 * input angle is solved so that 530 nm leaves horizontally, which lets the
 * rest of the bench sit at one height.
 */
import { refract2, wavelengthRGB, type V2 } from "./light-physics.ts";

export const DISPERSION_MAGNIFICATION = 4;
export const PRISM_SIDE = 1.6;
export const PRISM_DEPTH = 1.0;
export const PRISM_HEIGHT = (PRISM_SIDE * Math.sqrt(3)) / 2;
export const GREEN_NM = 530;

export const CARD_X = 2.75;
export const LENS_X = 3.65;
export const SLIT_X = 4.6;
export const DETECTOR_X = 6.7;
/** Half the visible detector width in world units; it maps to 18 mm. */
export const DETECTOR_HALF_WIDTH = 0.9;
export const SLIT_HALF_SEPARATION = 0.13;

export const WAVELENGTHS = Array.from(
  { length: 24 },
  (_, i) => 405 + (i * (690 - 405)) / 23,
);

export function cauchyIndex(nm: number, magnification = DISPERSION_MAGNIFICATION) {
  const base = (um: number) => 1.5046 + 0.0042 / (um * um);
  const reference = base(0.55);
  return reference + magnification * (base(nm / 1000) - reference);
}

/** Minimum deviation for green: the symmetric, least-reflective pose. */
export const MIN_DEVIATION = (() => {
  const n = cauchyIndex(GREEN_NM);
  return 2 * Math.asin(n * Math.sin(Math.PI / 6)) - Math.PI / 3;
})();
/**
 * The prism floats, turned anticlockwise by half the minimum deviation. In
 * that pose green leaves level, so the bench beyond stays at one height,
 * while the white beam enters well away from grazing incidence.
 */
export const PRISM_TILT = MIN_DEVIATION / 2;
export const PRISM_LIFT = 0.24;

function placePrism(): { vertices: V2[]; centroid: V2 } {
  const c = Math.cos(PRISM_TILT),
    s = Math.sin(PRISM_TILT);
  const local: V2[] = [
    [-PRISM_SIDE / 2, -PRISM_HEIGHT / 3],
    [PRISM_SIDE / 2, -PRISM_HEIGHT / 3],
    [0, (2 * PRISM_HEIGHT) / 3],
  ];
  const rotated = local.map(([x, y]) => [x * c - y * s, x * s + y * c] as V2);
  const lowest = Math.min(...rotated.map((v) => v[1]));
  const centroid: V2 = [0, PRISM_LIFT - lowest];
  return {
    centroid,
    vertices: rotated.map(([x, y]) => [x + centroid[0], y + centroid[1]] as V2),
  };
}
const PLACED = placePrism();
export const PRISM_VERTICES: V2[] = PLACED.vertices;
export const PRISM_CENTROID: V2 = PLACED.centroid;

const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
const cross = (a: V2, b: V2) => a[0] * b[1] - a[1] * b[0];
const norm = (a: V2): V2 => {
  const l = Math.hypot(a[0], a[1]);
  return [a[0] / l, a[1] / l];
};

/** Nearest triangle edge hit. The returned normal points out of the glass. */
function hitTriangle(origin: V2, dir: V2, skip = -1) {
  let best: { t: number; point: V2; normal: V2; face: number } | null = null;
  for (let i = 0; i < 3; i++) {
    if (i === skip) continue;
    const a = PRISM_VERTICES[i];
    const edge = sub(PRISM_VERTICES[(i + 1) % 3], a);
    const den = cross(dir, edge);
    if (Math.abs(den) < 1e-12) continue;
    const off = sub(a, origin);
    const t = cross(off, edge) / den;
    const u = cross(off, dir) / den;
    if (t <= 1e-9 || u < 0 || u > 1 || (best && t >= best.t)) continue;
    // Vertices run anticlockwise, so (edge.y, -edge.x) points outwards.
    best = {
      t,
      point: [origin[0] + dir[0] * t, origin[1] + dir[1] * t],
      normal: norm([edge[1], -edge[0]]),
      face: i,
    };
  }
  return best;
}

export type PrismTrace = {
  nm: number;
  index: number;
  entry: V2;
  exit: V2;
  inside: V2;
  out: V2;
};

/** Refraction into and back out of the prism for one wavelength. */
export function tracePrism(origin: V2, dir: V2, nm: number): PrismTrace | null {
  const index = cauchyIndex(nm);
  const a = hitTriangle(origin, dir);
  if (!a) return null;
  const inside = refract2(dir, a.normal, 1 / index);
  if (!inside) return null;
  const b = hitTriangle(a.point, inside, a.face);
  if (!b) return null;
  const out = refract2(inside, [-b.normal[0], -b.normal[1]], index);
  if (!out) return null;
  return { nm, index, entry: a.point, exit: b.point, inside, out: norm(out) };
}

/**
 * At minimum deviation the ray inside runs parallel to the base. Aim it at a
 * fixed fraction of the height above the base so it crosses the thick glass.
 */
const INSIDE_FRACTION = 0.42;
function insideLine() {
  const [a, b, apex] = PRISM_VERTICES;
  const base = norm(sub(b, a));
  const lerp = (p: V2, q: V2, t: number): V2 => [
    p[0] + (q[0] - p[0]) * t,
    p[1] + (q[1] - p[1]) * t,
  ];
  // Left face a->apex, right face b->apex: equal fractions keep it parallel.
  return { entry: lerp(a, apex, INSIDE_FRACTION), exit: lerp(b, apex, INSIDE_FRACTION), base };
}

export type Bench = ReturnType<typeof buildBench>;

export function buildBench() {
  const elevation = MIN_DEVIATION;
  const up: V2 = [Math.cos(elevation), Math.sin(elevation)];
  const target = insideLine().entry;
  // Back along the rising beam to the floor: a flat mirror sits there.
  const mirror: V2 = [target[0] - (target[1] / up[1]) * up[0], 0];
  // A flat mirror: sunlight comes down at the same angle it leaves.
  const sunDistance = 16;
  const sun: V2 = [mirror[0] - up[0] * sunDistance, up[1] * sunDistance];
  const start: V2 = [mirror[0], 0];
  const rays = WAVELENGTHS.map((nm) => {
    const r = tracePrism(start, up, nm);
    if (!r) throw new Error(`No transmission at ${nm} nm`);
    const t = (CARD_X - r.exit[0]) / r.out[0];
    const hit: V2 = [CARD_X, r.exit[1] + r.out[1] * t];
    return { ...r, hit, rgb: wavelengthRGB(nm) };
  });
  const green = tracePrism(start, up, GREEN_NM)!;
  const pinholeY =
    green.exit[1] + green.out[1] * ((CARD_X - green.exit[0]) / green.out[0]);
  return {
    elevation,
    tilt: PRISM_TILT,
    vertices: PRISM_VERTICES,
    centroid: PRISM_CENTROID,
    sun,
    mirror,
    entry: rays[0].entry,
    rays,
    green,
    pinholeY,
  };
}
