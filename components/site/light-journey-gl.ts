/**
 * One full-window WebGL2 scene for the home page's light journey.
 *
 * Everything is drawn by a single fragment shader that ray-traces the bench:
 * the prism is intersected analytically as a convex solid (three sides and
 * two caps) and refracted per colour channel with internal reflection; the
 * apparatus is ray-marched inside tight bounds; the floor is a dark polished
 * plane with a faded reflection. Beams are not geometry: every beam lies in
 * the vertical plane z = 0, so each view ray reads the light where it
 * crosses that plane, scaled for how obliquely it crosses. The glow stands
 * for scattering in a slightly dusty room.
 */
import {
  buildBench,
  CARD_X,
  DETECTOR_HALF_WIDTH,
  DETECTOR_X,
  LENS_X,
  PRISM_DEPTH,
  SLIT_HALF_SEPARATION,
  SLIT_X,
  WAVELENGTHS,
} from "@/lib/light-scene";

export type Vec3 = [number, number, number];
export type FrameState = {
  camPos: Vec3;
  look: Vec3;
  /** World radius that should fill the stage box. */
  radius: number;
  /** Stage centre and size in CSS pixels (y down). */
  stage: { x: number; y: number; w: number; h: number };
  /** Revealed light path length, world units. */
  front: number;
  field: number;
  screen: number;
  time: number;
  /** Text and photo boxes in CSS pixels (x, y, w, h), y down. */
  masks: [number, number, number, number][];
};

const f = (v: number) => (Number.isInteger(v) ? v.toFixed(1) : v.toFixed(6));
const v2 = (a: readonly number[]) => `vec2(${f(a[0])}, ${f(a[1])})`;

export const BENCH = buildBench();
const B = BENCH;
const N = WAVELENGTHS.length;

/** Path lengths so the light can be revealed as one continuous journey. */
const len = (a: readonly number[], b: readonly number[]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1]);
const SUN_LEAD = 7; // only the last stretch of the sunbeam is ever seen
const S_MIRROR = SUN_LEAD;
const S_ENTRY = S_MIRROR + len(B.mirror, B.entry);
const S_EXIT = S_ENTRY + len(B.entry, B.green.exit);
const S_CARD = S_EXIT + len(B.green.exit, [CARD_X, B.pinholeY]);
const S_LENS = S_CARD + (LENS_X - CARD_X);
const S_SLIT = S_LENS + (SLIT_X - LENS_X);
const S_DETECTOR = S_SLIT + (DETECTOR_X - SLIT_X);
export const PATH = {
  mirror: S_MIRROR,
  entry: S_ENTRY,
  exit: S_EXIT,
  card: S_CARD,
  lens: S_LENS,
  slit: S_SLIT,
  detector: S_DETECTOR,
};

const sunDir = (() => {
  const dx = B.mirror[0] - B.sun[0],
    dy = B.mirror[1] - B.sun[1];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
})();

/** Prism side planes in x-y (outward normal, offset) and the two caps. */
const prismPlanes = (() => {
  const v = B.vertices;
  const planes: string[] = [];
  for (let i = 0; i < 3; i++) {
    const a = v[i],
      b = v[(i + 1) % 3];
    const ex = b[0] - a[0],
      ey = b[1] - a[1];
    const l = Math.hypot(ex, ey);
    const nx = ey / l,
      ny = -ex / l;
    planes.push(`vec4(${f(nx)}, ${f(ny)}, 0.0, ${f(nx * a[0] + ny * a[1])})`);
  }
  planes.push(`vec4(0.0, 0.0, 1.0, ${f(PRISM_DEPTH / 2)})`);
  planes.push(`vec4(0.0, 0.0, -1.0, ${f(PRISM_DEPTH / 2)})`);
  return planes;
})();

const rayData = B.rays
  .map(
    (r, i) =>
      `  RA[${i}] = vec4(${f(r.exit[0])}, ${f(r.exit[1])}, ${f(r.out[0])}, ${f(r.out[1])});\n` +
      `  RH[${i}] = ${f(r.hit[1])};\n` +
      `  RC[${i}] = vec3(${f(r.rgb[0])}, ${f(r.rgb[1])}, ${f(r.rgb[2])});`,
  )
  .join("\n");

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes;          // backing pixels
uniform float uPx;          // backing pixels per CSS pixel
uniform vec3 uCamPos, uCamF, uCamR, uCamU;
uniform float uFocal;       // backing pixels
uniform vec2 uCenter;       // backing pixels, y up
uniform float uFront, uField, uScreen, uTime;
uniform vec4 uMask[8];
uniform int uMaskCount;
uniform sampler2D uScreenTex;

#define N ${N}
#define PI 3.14159265
const vec3 BG = vec3(0.00048, 0.00063, 0.00118); // #08090c through display gamma
const vec3 WARM = vec3(1.0, 0.9, 0.76);
const vec3 GREEN = vec3(0.32, 1.0, 0.36);
const vec2 SUN = ${v2(B.sun)};
const vec2 SUN_DIR = ${v2(sunDir)};
const vec2 MIRROR = ${v2(B.mirror)};
const vec2 ENTRY = ${v2(B.entry)};
const float CARD_X = ${f(CARD_X)};
const float PIN_Y = ${f(B.pinholeY)};
const float LENS_X = ${f(LENS_X)};
const float SLIT_X = ${f(SLIT_X)};
const float DET_X = ${f(DETECTOR_X)};
const float DET_HW = ${f(DETECTOR_HALF_WIDTH)};
const float SLIT_A = ${f(SLIT_HALF_SEPARATION)};
const float S_MIRROR = ${f(S_MIRROR)};
const float S_ENTRY = ${f(S_ENTRY)};
const float S_EXIT = ${f(S_EXIT)};
const float S_CARD = ${f(S_CARD)};
const float S_LENS = ${f(S_LENS)};
const float S_SLIT = ${f(S_SLIT)};
const float CARD_TURN = -0.62;  // radians the card is turned toward the room

vec4 RA[N]; float RH[N]; vec3 RC[N];
vec4 PL[5];
void initData() {
${rayData}
${prismPlanes.map((p, i) => `  PL[${i}] = ${p};`).join("\n")}
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

/* ---------------- environment: a dark studio with soft strip lights ---------------- */
float strip(vec3 d, vec3 c, vec3 axis, float halfLen, float halfW, float soft) {
  // Angular rectangle around direction c, long along axis.
  float along = dot(d, axis);
  vec3 side = normalize(cross(c, axis));
  float across = dot(d, side);
  float facing = dot(d, c);
  float m = smoothstep(halfW + soft, halfW, abs(across)) *
            smoothstep(halfLen + soft, halfLen, abs(along));
  return m * smoothstep(0.0, 0.25, facing);
}
vec3 env(vec3 d, float rough) {
  float s = rough * 0.35;
  vec3 col = BG;
  // Overhead softbox, warm.
  col += vec3(1.0, 0.94, 0.86) * 1.6 * strip(d, normalize(vec3(-0.25, 1.0, 0.35)), vec3(1.0, 0.0, 0.0), 0.55, 0.12, 0.03 + s);
  // Tall strip behind-left, cool.
  col += vec3(0.86, 0.92, 1.0) * 2.6 * strip(d, normalize(vec3(-1.0, 0.25, -0.35)), vec3(0.0, 1.0, 0.0), 0.5, 0.045, 0.012 + s);
  // Tall strip front-right, neutral.
  col += vec3(1.0, 0.98, 0.95) * 2.2 * strip(d, normalize(vec3(0.9, 0.3, 0.75)), vec3(0.0, 1.0, 0.0), 0.45, 0.035, 0.01 + s);
  // Low warm kicker from behind.
  col += vec3(1.0, 0.74, 0.4) * 0.9 * strip(d, normalize(vec3(0.3, 0.12, -1.0)), vec3(1.0, 0.0, 0.0), 0.9, 0.05, 0.03 + s);
  // Big dim panels: never seen directly, only through and in the glass,
  // so the prism reads clear and luminous instead of smoked.
  col += vec3(0.75, 0.8, 0.9) * 0.22 * strip(d, normalize(vec3(0.1, 0.35, -1.0)), vec3(0.0, 1.0, 0.0), 0.75, 0.9, 0.5 + s);
  col += vec3(1.0, 0.97, 0.92) * 0.12 * smoothstep(-0.1, 0.9, d.y);
  // Thin top rim for edge glints.
  col += vec3(1.0) * 0.8 * strip(d, normalize(vec3(0.5, 1.0, -0.6)), normalize(vec3(1.0, 0.0, 0.6)), 0.6, 0.02, 0.008 + s);
  return col;
}

/* ---------------- beams in the bench plane z = 0 ---------------- */
float segDist(vec2 p, vec2 a, vec2 b, out float h) {
  vec2 pa = p - a, ba = b - a;
  h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
float glow(float d, float w) {
  float x = d / w;
  // Tight core plus a short scattering halo that is gone well before the cutoff.
  return exp(-x * x) + 0.07 * exp(-x * 0.55);
}
// Reveal along the path: s is the path length at this point.
float reveal(float s) {
  float on = smoothstep(uFront, uFront - 0.12, s);
  float head = exp(-pow((s - uFront) / 0.08, 2.0)) * step(uFront, S_SLIT + 0.01);
  return on + head * 1.5;
}
vec3 beam(vec2 p, vec2 a, vec2 b, float w, vec3 col, float s0, float sLen, float k) {
  float h;
  float d = segDist(p, a, b, h);
  if (d > w * 18.0) return vec3(0.0);
  return col * glow(d, w) * reveal(s0 + h * sLen) * k;
}

// Light seen where a ray crosses the bench plane; obliq = |rd.z|.
vec3 benchLight(vec2 p, float obliq, bool inGlass) {
  float o = clamp(obliq, 0.32, 1.0);
  float sw = 0.022 / o;              // apparent beam width grows edge-on
  float gain = 1.0 / o;
  vec3 L = vec3(0.0);
  // Sunbeam down to the mirror, then up into the prism.
  // The sunbeam only shows where it meets dust near the bench: a shaft out of the dark.
  vec2 sunA = MIRROR - SUN_DIR * 7.0;
  {
    float hs;
    float ds = segDist(p, sunA, MIRROR, hs);
    if (ds < sw * 18.0)
      L += WARM * glow(ds, sw) * reveal(hs * 7.0) * smoothstep(0.66, 0.9, hs);
  }
  L += beam(p, MIRROR, ENTRY, sw, WARM, S_MIRROR, S_ENTRY - S_MIRROR, 1.0);
  // Hot spots where light meets a surface.
  float spot = reveal(S_MIRROR);
  L += WARM * 2.5 * exp(-dot(p - MIRROR, p - MIRROR) / 0.0018) * spot;
  L += WARM * 1.6 * exp(-dot(p - ENTRY, p - ENTRY) / 0.0025) * reveal(S_ENTRY);
  // Inside the glass and the spreading spectrum.
  vec3 fan = vec3(0.0);
  float fanW = 0.03 / o;
  for (int i = 0; i < N; i++) {
    vec2 ex = RA[i].xy;
    vec2 hit = vec2(CARD_X, RH[i]);
    if (inGlass) fan += beam(p, ENTRY, ex, sw * 1.1, RC[i], S_ENTRY, S_EXIT - S_ENTRY, 2.0);
    fan += beam(p, ex, hit, fanW, RC[i], S_EXIT, S_CARD - S_EXIT, 1.0);
  }
  L += fan * (3.2 / float(N));
  // Selected green: pinhole -> lens (diverging) -> two slits (collimated).
  float h;
  float d = segDist(p, vec2(CARD_X, PIN_Y), vec2(LENS_X, PIN_Y), h);
  float w = mix(0.012, 0.19, h) / o;
  float cone = exp(-pow(d / w, 4.0)) * mix(0.9, 0.22, h) + glow(d, 0.014 / o) * (1.0 - h) * 0.9;
  L += GREEN * cone * reveal(S_CARD + h * (S_LENS - S_CARD));
  d = segDist(p, vec2(LENS_X, PIN_Y), vec2(SLIT_X, PIN_Y), h);
  float band = smoothstep(0.24, 0.16, d);
  L += GREEN * (band * 0.22 + glow(d, 0.05 / o) * 0.25) * reveal(S_LENS + h * (S_SLIT - S_LENS));
  L += GREEN * 2.0 * exp(-dot(p - vec2(CARD_X, PIN_Y), p - vec2(CARD_X, PIN_Y)) / 0.0012) * reveal(S_CARD);
  return L * gain;
}

/* ---------------- interference field on the plane y = PIN_Y ---------------- */
vec3 fieldLight(vec2 xz) {
  if (uField <= 0.001) return vec3(0.0);
  vec3 L = vec3(0.0);
  float k = 2.0 * PI / 0.075;
  float w = uTime * 2.4;
  // Plane wave arriving at the slits.
  if (xz.x > LENS_X && xz.x < SLIT_X) {
    float m = smoothstep(0.24, 0.12, abs(xz.y)) * smoothstep(LENS_X, LENS_X + 0.3, xz.x);
    float c = cos(k * xz.x - w);
    L += GREEN * pow(max(c, 0.0), 3.0) * m * 0.45;
  }
  if (xz.x > SLIT_X && xz.x < DET_X - 0.05 && abs(xz.y) < DET_HW) {
    float x = xz.x - SLIT_X;
    float r1 = length(vec2(x, xz.y - SLIT_A));
    float r2 = length(vec2(x, xz.y + SLIT_A));
    float a1 = cos(k * r1 - w) / sqrt(r1 + 0.04);
    float a2 = cos(k * r2 - w) / sqrt(r2 + 0.04);
    float v = a1 + a2;
    float crest = pow(max(v * 0.35, 0.0), 2.0);
    float fade = exp(-x * 1.6) * smoothstep(DET_HW, DET_HW - 0.3, abs(xz.y));
    L += GREEN * crest * fade * 1.4;
  }
  return L * uField;
}

/* ---------------- prism (analytic convex solid) ---------------- */
bool prismHit(vec3 ro, vec3 rd, out float tN, out float tF, out int iN, out int iF) {
  tN = -1e9; tF = 1e9; iN = 0; iF = 0;
  for (int i = 0; i < 5; i++) {
    vec3 n = PL[i].xyz;
    float dn = dot(n, rd);
    float dist = PL[i].w - dot(n, ro);
    if (abs(dn) < 1e-6) { if (dist < 0.0) return false; continue; }
    float t = dist / dn;
    if (dn < 0.0) { if (t > tN) { tN = t; iN = i; } }
    else { if (t < tF) { tF = t; iF = i; } }
  }
  return tN < tF && tF > 0.0;
}
// Rounded edges: lean the normal toward neighbouring faces near an edge.
vec3 bevelNormal(vec3 p, int face, float sgn) {
  vec3 n = PL[face].xyz;
  vec3 acc = n;
  for (int j = 0; j < 5; j++) {
    if (j == face) continue;
    float d = PL[j].w - dot(PL[j].xyz, p);
    float m = 1.0 - smoothstep(0.0, 0.028, d);
    acc += PL[j].xyz * m * m * 1.4;
  }
  return normalize(acc) * sgn;
}

float fresnel(float c, float f0) { return f0 + (1.0 - f0) * pow(1.0 - clamp(c, 0.0, 1.0), 5.0); }

/* ---------------- apparatus (ray-marched in bounds) ---------------- */
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdRBox(vec3 p, vec3 b, float r) { return sdBox(p, b - r) - r; }
float sdCylY(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
float sdTorusX(vec3 p, float R, float r) { vec2 q = vec2(length(p.yz) - R, p.x); return length(q) - r; }

vec3 cardLocal(vec3 p) {
  vec3 q = p - vec3(CARD_X, 0.0, 0.0);
  float c = cos(CARD_TURN), s = sin(CARD_TURN);
  return vec3(c * q.x + s * q.z, q.y, -s * q.x + c * q.z);
}
// Returns distance; mat: 1 metal, 2 card face, 3 lens glass, 4 screen, 5 slit plate
vec2 mapObjects(vec3 p) {
  vec2 res = vec2(1e5, 0.0);
  // Selection card on a post, with a pinhole at the green.
  {
    vec3 q = cardLocal(p);
    float plate = sdRBox(q - vec3(0.0, 1.18, 0.0), vec3(0.014, 0.34, 0.34), 0.008);
    float hole = length(q.yz - vec2(PIN_Y, 0.0)) - 0.022;
    plate = max(plate, -hole);
    float post = sdCylY(q - vec3(0.06, 0.42, 0.0), 0.022, 0.42);
    float base = sdCylY(q - vec3(0.06, 0.012, 0.0), 0.17, 0.012);
    float stand = min(post, base);
    if (plate < res.x) res = vec2(plate, 2.0);
    if (stand < res.x) res = vec2(stand, 1.0);
  }
  // Lens: a ring holding a thin biconvex glass.
  {
    vec3 q = p - vec3(LENS_X, PIN_Y, 0.0);
    float ring = sdTorusX(q, 0.27, 0.024);
    float glass = max(length(q - vec3(0.75, 0.0, 0.0)) - 0.79, length(q + vec3(0.75, 0.0, 0.0)) - 0.79);
    glass = max(glass, length(q.yz) - 0.265);
    float post = sdCylY(p - vec3(LENS_X, (PIN_Y - 0.29) * 0.5, 0.0), 0.02, (PIN_Y - 0.29) * 0.5);
    float base = sdCylY(p - vec3(LENS_X, 0.012, 0.0), 0.15, 0.012);
    float stand = min(min(ring, post), base);
    if (stand < res.x) res = vec2(stand, 1.0);
    if (glass < res.x) res = vec2(glass, 3.0);
  }
  // Double-slit plate: two vertical slits separated along z.
  {
    vec3 q = p - vec3(SLIT_X, PIN_Y, 0.0);
    float plate = sdRBox(q, vec3(0.02, 0.4, 0.46), 0.01);
    float slits = min(sdBox(q - vec3(0.0, 0.0, SLIT_A), vec3(0.04, 0.24, 0.011)),
                      sdBox(q - vec3(0.0, 0.0, -SLIT_A), vec3(0.04, 0.24, 0.011)));
    plate = max(plate, -slits);
    float post = sdCylY(p - vec3(SLIT_X, (PIN_Y - 0.4) * 0.5, 0.0), 0.024, (PIN_Y - 0.4) * 0.5);
    float base = sdRBox(p - vec3(SLIT_X, 0.02, 0.0), vec3(0.16, 0.02, 0.24), 0.01);
    if (plate < res.x) res = vec2(plate, 5.0);
    float stand = min(post, base);
    if (stand < res.x) res = vec2(stand, 1.0);
  }
  // Detector: a framed screen on two legs.
  {
    vec3 q = p - vec3(DET_X, PIN_Y, 0.0);
    float frame = sdRBox(q, vec3(0.05, 0.52, DET_HW + 0.08), 0.02);
    float face = sdBox(q - vec3(-0.05, 0.0, 0.0), vec3(0.012, 0.46, DET_HW));
    frame = max(frame, -face);
    vec3 lq = vec3(q.x, p.y, abs(q.z) - 0.7);
    float legs = sdCylY(lq - vec3(0.0, (PIN_Y - 0.52) * 0.5, 0.0), 0.022, (PIN_Y - 0.52) * 0.5);
    float feet = sdRBox(lq - vec3(0.0, 0.015, 0.0), vec3(0.16, 0.015, 0.05), 0.01);
    float metal = min(frame, min(legs, feet));
    float screen = sdBox(q - vec3(-0.035, 0.0, 0.0), vec3(0.004, 0.46, DET_HW));
    if (metal < res.x) res = vec2(metal, 1.0);
    if (screen < res.x) res = vec2(screen, 4.0);
  }
  return res;
}
vec3 objNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    mapObjects(p + e.xyy).x - mapObjects(p - e.xyy).x,
    mapObjects(p + e.yxy).x - mapObjects(p - e.yxy).x,
    mapObjects(p + e.yyx).x - mapObjects(p - e.yyx).x));
}
// Bounds of all apparatus.
bool boxRange(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax, out float t0, out float t1) {
  vec3 inv = 1.0 / rd;
  vec3 a = (bmin - ro) * inv, b = (bmax - ro) * inv;
  vec3 lo = min(a, b), hi = max(a, b);
  t0 = max(max(lo.x, lo.y), max(lo.z, 0.0));
  t1 = min(min(hi.x, hi.y), hi.z);
  return t1 > t0;
}
vec2 marchObjects(vec3 ro, vec3 rd, float tMax, int steps) {
  float t0, t1;
  if (!boxRange(ro, rd, vec3(CARD_X - 0.5, 0.0, -1.1), vec3(DET_X + 0.2, 1.9, 1.1), t0, t1)) return vec2(-1.0);
  t1 = min(t1, tMax);
  float t = t0;
  for (int i = 0; i < 96; i++) {
    if (i >= steps || t > t1) break;
    vec2 h = mapObjects(ro + rd * t);
    if (h.x < 0.0012 * t) return vec2(t, h.y);
    t += max(h.x * 0.9, 0.002);
  }
  return vec2(-1.0);
}

/* ---------------- shading helpers ---------------- */
vec3 floorBase(vec3 p) {
  vec3 c = BG * 0.85;
  // Soft pools where light lands or scatters near the floor.
  float m = reveal(S_MIRROR);
  c += WARM * 0.05 * exp(-dot(p.xz - vec2(MIRROR.x, 0.0), p.xz - vec2(MIRROR.x, 0.0)) / 0.12) * m;
  c += vec3(0.6, 0.62, 0.7) * 0.012 * exp(-dot(p.xz - vec2(0.1, 0.0), p.xz - vec2(0.1, 0.0)) / 0.9) * reveal(S_EXIT);
  c += GREEN * 0.03 * uScreen * exp(-dot(p.xz - vec2(DET_X - 0.4, 0.0), p.xz - vec2(DET_X - 0.4, 0.0)) / 0.4);
  // Fade into the page colour with distance so no horizon line shows.
  return c;
}

vec3 screenColor(vec3 p) {
  vec2 uv = vec2(p.z / DET_HW * 0.5 + 0.5, (p.y - PIN_Y) / 0.92 + 0.5);
  vec3 tex = texture(uScreenTex, uv).rgb;
  return vec3(0.004, 0.005, 0.006) + tex * uScreen * 1.6;
}

vec3 cardFace(vec3 p) {
  // Illumination by the spectrum where it lands, in card coordinates.
  vec3 q = cardLocal(p);
  vec3 c = vec3(0.012);
  vec3 L = vec3(0.0);
  for (int i = 0; i < N; i++) {
    float dy = q.y - RH[i];
    L += RC[i] * exp(-dy * dy / 0.0011 - q.z * q.z / 0.0016);
  }
  float on = reveal(S_CARD - 0.02);
  return c + L * (4.0 / float(N)) * on;
}

vec3 metal(vec3 p, vec3 n, vec3 rd, float rough) {
  vec3 r = reflect(rd, n);
  float fr = fresnel(dot(n, -rd), 0.08);
  return env(r, rough) * fr * 0.55 + vec3(0.006, 0.0065, 0.008) * (0.5 + 0.5 * n.y);
}

// Lightweight view of what lies beyond a point (no further bounces).
vec3 beyond(vec3 ro, vec3 rd, bool inGlass) {
  vec3 col = env(rd, 0.0);
  float tFloor = rd.y < 0.0 ? -ro.y / rd.y : 1e9;
  if (tFloor < 1e8) {
    vec3 fp = ro + rd * tFloor;
    col = floorBase(fp) + env(reflect(rd, vec3(0.0, 1.0, 0.0)), 0.6) * 0.04;
  }
  float tz = -ro.z / rd.z;
  if (tz > 0.0 && tz < tFloor) {
    vec3 cp = ro + rd * tz;
    col += benchLight(cp.xy, abs(rd.z), inGlass);
  }
  return col;
}

vec3 shadePrism(vec3 ro, vec3 rd, float tN, int iN, bool full) {
  vec3 p = ro + rd * tN;
  vec3 n = bevelNormal(p, iN, 1.0);
  float cosi = dot(-rd, n);
  float fr = fresnel(cosi, 0.045);
  vec3 col = env(reflect(rd, n), 0.0) * fr;
  // Transmission, per colour channel for dispersion in the glass itself.
  vec3 ior = full ? vec3(1.508, 1.52, 1.535) : vec3(1.52);
  vec3 trans = vec3(0.0);
  int chans = full ? 3 : 1;
  for (int c = 0; c < 3; c++) {
    if (c >= chans) break;
    float eta = ior[c];
    vec3 d = refract(rd, n, 1.0 / eta);
    vec3 q = p;
    vec3 inner = vec3(0.0);
    vec3 outC = vec3(0.0);
    float path = 0.0;
    float carry = 1.0 - fr;
    for (int b = 0; b < 4; b++) {
      // Exit plane: nearest plane the ray is heading out of.
      float tE = 1e9; int iE = 0;
      for (int i = 0; i < 5; i++) {
        float dn = dot(PL[i].xyz, d);
        if (dn > 1e-5) {
          float t = (PL[i].w - dot(PL[i].xyz, q)) / dn;
          if (t < tE) { tE = t; iE = i; }
        }
      }
      vec3 q2 = q + d * tE;
      // Beams inside the glass, where this inner path crosses z = 0.
      if (q.z * q2.z < 0.0) {
        float tz = -q.z / d.z;
        inner += benchLight((q + d * tz).xy, abs(d.z), true) * carry;
      }
      path += tE;
      vec3 ne = bevelNormal(q2, iE, 1.0);
      vec3 o = refract(d, -ne, eta);
      float fe = fresnel(dot(d, ne), 0.045);
      if (dot(o, o) < 0.5) {
        d = reflect(d, -ne);
        q = q2;
        continue;
      }
      outC += beyond(q2, o, false) * carry * (1.0 - fe);
      // The rest reflects internally once more and is dropped (dim).
      carry *= fe;
      d = reflect(d, -ne);
      q = q2;
      if (carry < 0.05) break;
    }
    vec3 absorb = exp(-path * vec3(0.05, 0.02, 0.04));
    vec3 v = (outC + inner) * absorb;
    if (full) trans[c] = v[c]; else trans = v;
  }
  return col + trans;
}

vec3 shadeObject(vec3 p, vec3 rd, float mat, bool full) {
  vec3 n = objNormal(p);
  if (mat < 1.5) return metal(p, n, rd, 0.25);
  if (mat < 2.5) {
    vec3 q = cardLocal(p);
    vec3 m = metal(p, n, rd, 0.6) * 0.5;
    // Only the face toward the prism catches the spectrum.
    return m + (q.x < -0.005 ? cardFace(p) : vec3(0.008));
  }
  if (mat < 3.5) {
    float fr = fresnel(dot(n, -rd), 0.05);
    vec3 o = refract(rd, n, 1.0 / 1.5);
    vec3 b = beyond(p + rd * 0.06, normalize(mix(rd, o, 0.35)), false);
    return env(reflect(rd, n), 0.0) * fr + b * (1.0 - fr) * vec3(0.92, 0.97, 0.95);
  }
  if (mat < 4.5) return screenColor(p) + env(reflect(rd, n), 0.05) * fresnel(dot(n, -rd), 0.03) * 0.6;
  // Slit plate: dark satin metal; the slits glow where green passes.
  vec3 q = p - vec3(SLIT_X, PIN_Y, 0.0);
  vec3 c = metal(p, n, rd, 0.4);
  float lit = reveal(S_SLIT - 0.02);
  float nearSlit = exp(-pow((abs(q.z) - SLIT_A) / 0.02, 2.0)) * smoothstep(0.27, 0.2, abs(q.y));
  float onFace = smoothstep(0.26, 0.12, length(q.yz * vec2(0.9, 1.0)));
  c += GREEN * (nearSlit * 0.8 + onFace * 0.12) * lit * step(q.x, 0.0);
  return c;
}

float maskAt(vec2 frag) {
  float m = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uMaskCount) break;
    vec4 r = uMask[i];
    vec2 c = r.xy + r.zw * 0.5;
    vec2 d = abs(frag - c) - r.zw * 0.5;
    float feather = 28.0 * uPx;
    float inside = 1.0 - smoothstep(0.0, feather, max(d.x, d.y));
    m = max(m, inside);
  }
  return m;
}

void main() {
  initData();
  vec2 frag = gl_FragCoord.xy;
  vec2 rel = (frag - uCenter) / uFocal;
  vec3 rd = normalize(uCamF + uCamR * rel.x + uCamU * rel.y);
  vec3 ro = uCamPos;

  float tN, tF; int iN, iF;
  bool hitP = prismHit(ro, rd, tN, tF, iN, iF) && tN > 0.0;
  float tP = hitP ? tN : 1e9;
  float tFloor = rd.y < 0.0 ? -ro.y / rd.y : 1e9;
  float tMax = min(min(tP, tFloor), 40.0);
  vec2 obj = marchObjects(ro, rd, tMax, 80);
  float tO = obj.x > 0.0 ? obj.x : 1e9;
  // Mirror disc lying on the floor.
  float tMir = 1e9;
  if (rd.y < 0.0) {
    float t = (0.022 - ro.y) / rd.y;
    vec3 mp = ro + rd * t;
    if (length(mp.xz - vec2(MIRROR.x, 0.0)) < 0.3) tMir = t;
  }
  float tHit = min(min(tP, tO), min(tFloor, tMir));

  vec3 solid = BG;
  vec3 light = vec3(0.0);
  if (tHit > 1e8) {
    solid = BG;
  } else if (tHit == tP) {
    solid = shadePrism(ro, rd, tN, iN, true);
  } else if (tHit == tO) {
    solid = shadeObject(ro + rd * tO, rd, obj.y, true);
  } else if (tHit == tMir) {
    vec3 mp = ro + rd * tMir;
    vec3 r = reflect(rd, vec3(0.0, 1.0, 0.0));
    float rim = smoothstep(0.27, 0.3, length(mp.xz - vec2(MIRROR.x, 0.0)));
    vec3 refl = env(r, 0.0) * 0.85;
    float tz = -mp.z / r.z;
    if (tz > 0.0) refl += benchLight((mp + r * tz).xy, abs(r.z), false) * 0.9;
    solid = mix(refl, vec3(0.02), rim);
  } else if (tHit == tFloor) {
    vec3 fp = ro + rd * tFloor;
    vec3 col = floorBase(fp);
    // Polished floor: faded reflection with a faint ripple.
    vec2 jit = vec2(hash12(fp.xz * 61.0), hash12(fp.zx * 47.0)) - 0.5;
    vec3 r = normalize(reflect(rd, vec3(0.0, 1.0, 0.0)) + vec3(jit.x, 0.0, jit.y) * 0.006);
    float fr = fresnel(dot(-rd, vec3(0.0, 1.0, 0.0)), 0.05) * 0.85;
    vec3 refl = vec3(0.0);
    float pN, pF; int pi, pf;
    float tr = 1e9;
    if (prismHit(fp, r, pN, pF, pi, pf) && pN > 0.0) tr = pN;
    vec2 ro2 = marchObjects(fp, r, min(tr, 8.0), 48);
    if (ro2.x > 0.0 && ro2.x < tr) {
      vec3 hp = fp + r * ro2.x;
      refl = shadeObject(hp, r, ro2.y, false) * exp(-hp.y * 2.2);
      tr = ro2.x;
    } else if (tr < 1e8) {
      vec3 hp = fp + r * tr;
      refl = shadePrism(fp, r, tr, pi, false) * exp(-hp.y * 2.0);
    }
    float tz = -fp.z / r.z;
    if (tz > 0.0 && tz < tr) {
      vec3 cp = fp + r * tz;
      refl += benchLight(cp.xy, abs(r.z), false) * exp(-cp.y * 1.4);
    }
    float tf = (PIN_Y - fp.y) / r.y;
    if (tf > 0.0 && tf < tr) refl += fieldLight((fp + r * tf).xz) * 0.6;
    float dist = tFloor;
    col += refl * fr * 1.25;
    float fog = exp(-max(dist - 4.0, 0.0) * 0.16);
    solid = mix(BG, col, fog);
  }

  // Scattered light crossing the bench plane in front of whatever we hit.
  float tz = -ro.z / rd.z;
  if (tz > 0.0 && tz < tHit) {
    vec3 cp = ro + rd * tz;
    light += benchLight(cp.xy, abs(rd.z), false);
  }
  float tf = (PIN_Y - ro.y) / rd.y;
  if (tf > 0.0 && tf < tHit) light += fieldLight((ro + rd * tf).xz);

  float m = maskAt(frag);
  vec3 col = solid * (1.0 - 0.6 * m) + light * (1.0 - 0.92 * m);
  // Gentle filmic shoulder, then display gamma.
  col = col / (1.0 + col * 0.55);
  col = pow(max(col, 0.0), vec3(1.0 / 2.2));
  col += (hash12(frag + fract(uTime) * 91.0) - 0.5) / 255.0;
  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(log || "shader compile failed");
  }
  return s;
}

const sub3 = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm3 = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

export type LightRenderer = {
  render: (state: FrameState) => void;
  resize: (cssW: number, cssH: number, scale: number) => void;
  setScreen: (source: TexImageSource) => void;
  dispose: () => void;
};

export function createLightRenderer(canvas: HTMLCanvasElement): LightRenderer | null {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;
  let program: WebGLProgram;
  try {
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) || "link failed");
  } catch (e) {
    console.warn("[light-journey]", e);
    return null;
  }
  gl.useProgram(program);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const U = {
    res: u("uRes"),
    px: u("uPx"),
    camPos: u("uCamPos"),
    camF: u("uCamF"),
    camR: u("uCamR"),
    camU: u("uCamU"),
    focal: u("uFocal"),
    center: u("uCenter"),
    front: u("uFront"),
    field: u("uField"),
    screen: u("uScreen"),
    time: u("uTime"),
    mask: u("uMask"),
    maskCount: u("uMaskCount"),
    tex: u("uScreenTex"),
  };
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(U.tex, 0);

  let pxPerCss = 1;
  const maskData = new Float32Array(32);

  return {
    resize(cssW, cssH, scale) {
      pxPerCss = scale;
      const w = Math.max(1, Math.round(cssW * scale));
      const h = Math.max(1, Math.round(cssH * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    },
    setScreen(source) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    },
    render(s) {
      const W = canvas.width,
        H = canvas.height;
      const fwd = norm3(sub3(s.look, s.camPos));
      const right = norm3(cross3(fwd, [0, 1, 0]));
      const up = cross3(right, fwd);
      const dist = Math.hypot(...sub3(s.look, s.camPos));
      const stageSize = Math.min(s.stage.w, s.stage.h) * pxPerCss;
      const focal = (dist * stageSize * 0.5) / s.radius;
      gl.uniform2f(U.res, W, H);
      gl.uniform1f(U.px, pxPerCss);
      gl.uniform3fv(U.camPos, s.camPos);
      gl.uniform3fv(U.camF, fwd);
      gl.uniform3fv(U.camR, right);
      gl.uniform3fv(U.camU, up);
      gl.uniform1f(U.focal, focal);
      gl.uniform2f(U.center, s.stage.x * pxPerCss, H - s.stage.y * pxPerCss);
      gl.uniform1f(U.front, s.front);
      gl.uniform1f(U.field, s.field);
      gl.uniform1f(U.screen, s.screen);
      gl.uniform1f(U.time, s.time);
      const count = Math.min(8, s.masks.length);
      for (let i = 0; i < count; i++) {
        const [x, y, w, h] = s.masks[i];
        maskData[i * 4] = x * pxPerCss;
        maskData[i * 4 + 1] = H - (y + h) * pxPerCss;
        maskData[i * 4 + 2] = w * pxPerCss;
        maskData[i * 4 + 3] = h * pxPerCss;
      }
      gl.uniform4fv(U.mask, maskData);
      gl.uniform1i(U.maskCount, count);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
