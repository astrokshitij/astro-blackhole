import { refract2, type V2 } from "./light-physics.ts";

export const PRISM_SCALE = 1.8;
export const DISPLAY_DISPERSION = 4;
export const SCREEN_HALF_WIDTH = 0.018;
export const SOURCE: V2 = [-12, -0.15];

const cross = (a: V2, b: V2) => a[0] * b[1] - a[1] * b[0];
const difference = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
export function prismVertices(angle: number): V2[] {
  const c = Math.cos(angle),
    s = Math.sin(angle);
  return [
    [-1, -1],
    [1, -1],
    [0, 1],
  ].map(([x, y]) => [
    PRISM_SCALE * (x * c - y * s),
    PRISM_SCALE * (x * s + y * c),
  ]);
}
export function cauchyIndex(nm: number, magnification = DISPLAY_DISPERSION) {
  const reference = 1.5046 + 0.0042 / 0.55 ** 2;
  return (
    reference + magnification * (1.5046 + 0.0042 / (nm / 1000) ** 2 - reference)
  );
}
function intersect(origin: V2, direction: V2, vertices: V2[], exclude = -1) {
  let nearest: {
    point: V2;
    normal: V2;
    face: number;
    distance: number;
  } | null = null;
  for (let i = 0; i < vertices.length; i++) {
    if (i === exclude) continue;
    const a = vertices[i],
      edge = difference(vertices[(i + 1) % 3], a);
    const denominator = cross(direction, edge);
    if (Math.abs(denominator) < 1e-10) continue;
    const offset = difference(a, origin);
    const t = cross(offset, edge) / denominator,
      u = cross(offset, direction) / denominator;
    if (t <= 1e-6 || u < 0 || u > 1 || (nearest && t >= nearest.distance))
      continue;
    const length = Math.hypot(...edge);
    nearest = {
      point: [origin[0] + t * direction[0], origin[1] + t * direction[1]],
      normal: [edge[1] / length, -edge[0] / length],
      face: i,
      distance: t,
    };
  }
  return nearest;
}
/** Both intersections and both refractions are solved on the rotating triangle. */
export function tracePrism(
  angle: number,
  nm: number,
  magnification = DISPLAY_DISPERSION,
) {
  const vertices = prismVertices(angle),
    index = cauchyIndex(nm, magnification);
  const entry = intersect(SOURCE, [1, 0], vertices);
  if (!entry) return null;
  const inside = refract2([1, 0], entry.normal, 1 / index);
  if (!inside) return null;
  const exit = intersect(entry.point, inside, vertices, entry.face);
  if (!exit) return null;
  const direction = refract2(inside, [-exit.normal[0], -exit.normal[1]], index);
  if (!direction) return null;
  return { entry: entry.point, exit: exit.point, inside, direction, index };
}
