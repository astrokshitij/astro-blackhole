"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/*  What this draws                                                           */
/*                                                                            */
/*  White light going through a glass prism and coming out as a spectrum.     */
/*                                                                            */
/*  The rainbow is not painted on. Every frame the beam is split into         */
/*  RAYS wavelengths between violet and deep red. Each one gets its own       */
/*  refractive index (Cauchy's law: n = A + B/λ²), is bent by Snell's law     */
/*  going into the glass, bent again coming out, and only then drawn. Violet  */
/*  has the higher index, so it bends most, which is why it lands on the      */
/*  base side of the fan and red on the apex side. When the beam swings, the  */
/*  fan swings with it, because it is the same calculation.                   */
/*                                                                            */
/*  Two honest liberties. Real crown glass spreads the spectrum over about    */
/*  two degrees, which at hero size is a white line with coloured edges, so   */
/*  the dispersion (B) is turned up roughly eight times. And the beam is      */
/*  visible in empty air, as if the room were faintly dusty, which is how    */
/*  every photograph of this experiment is actually taken.                    */
/*                                                                            */
/*  On load the light is switched on and travels in from the left. It slows   */
/*  to c/n inside the glass: the head of the beam covers the optical path,    */
/*  not the geometric one.                                                    */
/* -------------------------------------------------------------------------- */

export interface PrismHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Prism centre as fractions of width and height, top-left origin. */
  focus?: [number, number];
  /** Prism centre when the frame is taller than it is wide. */
  compactFocus?: [number, number];
  /** Side of the prism as a fraction of the frame's shorter side. */
  size?: number;
  /** Prism rotation in degrees, positive is anticlockwise. */
  rotation?: number;
  /** Angle the white beam rises at, in degrees, before the slow swing. */
  incidence?: number;
  /** Half-amplitude of the slow swing of the beam, in degrees. */
  swing?: number;
  /** Multiplier on the physical dispersion. 1 is real crown glass. */
  dispersion?: number;
  /** Overall exposure. */
  exposure?: number;
  /** Render scale, 0.5 to 1. */
  resolution?: number;
  /** Cap on device pixel ratio. */
  maxDpr?: number;
  /** Let a fine pointer nudge the beam. */
  interactive?: boolean;
  /** Freeze on a finished frame (reduced motion). */
  paused?: boolean;
  /** Draw the glass outline. Off when another layer supplies the prism. */
  glass?: boolean;
}

const RAYS = 20;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define N ${RAYS}

uniform vec2 uRes;
uniform vec2 uCenter;   // prism centroid, render pixels
uniform float uUnit;    // render pixels per scene unit
uniform vec2 uA, uB, uC;   // front face of the prism
uniform vec2 uBack;        // offset of the back face (fakes depth)
uniform vec2 uE;           // where the beam enters
uniform vec2 uD0;          // incoming direction
uniform float uTime;
uniform float uHead;       // how far the light has travelled since switch-on
uniform float uL0;         // path length from the frame edge to uE
uniform float uWidth;      // beam half-width
uniform float uSpread;     // growth of each band's width per unit travelled
uniform float uExposure;
uniform vec4 uRay[N];      // exit point xy, exit direction zw
uniform vec4 uCol[N];      // linear rgb (sums to SUN), w = n (0 = total internal reflection)
uniform float uGlass;      // 1 draws the glass, 0 leaves it to another layer
// Sunlight rather than lamp-white: the warm white all the bands add up to.
const vec3 SUN = vec3(1.0, 0.93, 0.80);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float cross2(vec2 a, vec2 b) { return a.x * b.y - a.y * b.x; }
float seg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
// Signed distance to a triangle, negative inside (Inigo Quilez).
float sdTri(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
  vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
  vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;
  vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
  vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
  vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
                   vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
                   vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}
float gauss(float x, float s) { return exp(-0.5 * x * x / (s * s)); }
float headMask(float s) { return smoothstep(uHead, uHead - 0.08, s); }

void main() {
  vec2 p = (gl_FragCoord.xy - uCenter) / uUnit;
  float px = 1.0 / uUnit;
  float w = uWidth;

  float tri = sdTri(p, uA, uB, uC);
  float inside = 1.0 - smoothstep(-px, px, tri);

  // Dust in the air: the beam is only visible where something scatters it.
  vec2 drift = vec2(-uTime * 0.018, uTime * 0.007);
  float dust = 0.55 * noise(p * 5.0 + drift) + 0.3 * noise(p * 13.0 - drift * 1.7) + 0.15 * noise(p * 31.0 + drift * 2.3);
  float air = mix(0.55, 1.45, dust);

  vec3 outside = vec3(0.0);
  vec3 glass = vec3(0.0);

  /* --- the white beam --------------------------------------------------- */
  float along = dot(p - uE, uD0);
  float perp = abs(cross2(uD0, p - uE));
  float incoming = smoothstep(0.004, -0.004, along) * headMask(uL0 + along);
  outside += SUN * incoming * (1.6 * gauss(perp, w) + 0.16 * exp(-perp / (w * 7.0)));

  // The prism stands on a dark surface at the height of its base.
  float floorY = min(uB.y, uC.y);
  vec3 splash = vec3(0.0);

  /* --- one band per wavelength ------------------------------------------ */
  for (int i = 0; i < N; i++) {
    vec4 ray = uRay[i];
    vec4 col = uCol[i];
    if (col.w == 0.0) continue;
    vec2 X = ray.xy;
    vec2 d = ray.zw;
    vec2 ex = X - uE;
    float lin = length(ex);

    // Inside the glass: the bands start together and part only slightly.
    float din = seg(p, uE, X);
    float sIn = uL0 + col.w * clamp(dot(p - uE, ex) / lin, 0.0, lin);
    glass += col.rgb * (1.5 * gauss(din, w * 0.95) + 0.22 * exp(-din / (w * 9.0))) * headMask(sIn);

    // Out in the air: each band spreads, so its peak dims as it widens.
    // Bent towards the base, every band falls, and it ends where it meets
    // the surface: there it spreads into a soft pool of its own colour.
    float fall = d.y < -0.01 ? (X.y - floorY) / -d.y : 40.0;
    float t = dot(p - X, d);
    if (t > 0.0) {
      float pd = abs(cross2(d, p - X));
      float sg = w + t * uSpread;
      float amp = w / sg;
      float sOut = uL0 + col.w * lin + t;
      outside += col.rgb * amp * (1.7 * gauss(pd, sg) + 0.11 * exp(-pd / (sg * 4.0)))
               * smoothstep(fall + 0.004, fall - 0.012, t) * headMask(sOut);
    }
    if (fall < 40.0) {
      vec2 H = X + d * fall;
      float sgH = w + fall * uSpread;
      // Seen at a grazing angle, the pool is long and thin, and a little
      // light scatters past it along the surface.
      float sx = max(0.03, sgH * 4.0);
      float pool = exp(-pow((p.x - H.x) / sx, 2.0) - pow((p.y - floorY) / 0.006, 2.0))
                 + 0.12 * exp(-pow((p.x - H.x) / (sx * 1.8), 2.0) - pow((p.y - floorY) / 0.02, 2.0));
      splash += col.rgb * pool * (w / sgH) * headMask(uL0 + col.w * lin + fall);
    }
  }

  vec3 lightAir = outside * (1.0 - inside);
  vec3 light = lightAir * air + glass * inside + splash * 1.6;

  /* --- motes caught in the light ---------------------------------------- */
  vec2 q = p * 46.0 + vec2(uTime * 0.35, sin(uTime * 0.13) * 1.5);
  vec2 id = floor(q);
  vec2 f = fract(q) - 0.5;
  float h = hash(id);
  vec2 o = (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * 0.6;
  float mote = smoothstep(0.16, 0.0, length(f - o)) * step(0.86, h) * (0.4 + 0.6 * sin(uTime * 1.3 + h * 50.0));
  light += lightAir * max(mote, 0.0) * 5.0;

  /* --- the glass -------------------------------------------------------- */
  // Seen from a little above and to the right: the front face, and the right
  // side face receding to a back face. The other faces are hidden.
  vec2 A2 = uA + uBack, B2 = uB + uBack, C2 = uC + uBack;
  float on = headMask(0.0) * uGlass;
  vec3 tint = vec3(0.86, 0.92, 1.0);
  vec3 spill = (outside + glass) * 1.5;
  float slow = uTime * 0.09;

  // Right side face as a parallelogram: p = C + u (A - C) + v back.
  vec2 ca = uA - uC;
  float det = cross2(ca, uBack);
  float fu = cross2(p - uC, uBack) / det;
  float fv = cross2(ca, p - uC) / det;
  float side = step(0.0, fu) * step(fu, 1.0) * step(0.0, fv) * step(fv, 1.0) * (1.0 - inside);
  // A studio strip light reflected in it, drifting slowly along the face.
  float band = exp(-pow((fu - 0.42 - 0.18 * sin(slow)) / 0.09, 2.0));
  light += tint * side * (0.022 + 0.17 * band * (0.55 + 0.45 * fv)) * on;
  light += outside * side * 0.25 * on;

  // Front face: dark glass with a soft sheen falling from the top, brighter
  // at the rims where the glass is seen through more of its thickness.
  float rim = exp(tri / 0.016) * inside;
  float sheenF = 0.5 + 0.5 * clamp((p.y - uB.y) / (uA.y - uB.y), 0.0, 1.0);
  float diag = exp(-pow((dot(p, normalize(vec2(1.0, -0.6))) + 0.03 * sin(slow * 1.3)) / 0.05, 2.0));
  light += tint * inside * (0.014 * sheenF + 0.055 * rim + 0.05 * diag) * on;

  // Edges. Front edges and the outer silhouette are bright and doubled (a
  // bevel has two lines of light), edges seen through the glass are faint.
  float glint = pow(0.5 + 0.5 * sin(dot(p, vec2(7.0, 4.0)) - uTime * 0.5), 24.0);
  // Like a photograph, edges are bright only where light reaches them.
  vec2 xmid = uRay[N / 2].xy;
  float reach = exp(-length(p - uE) * 4.5) + exp(-length(p - xmid) * 4.5) + 0.35 * exp(-length(p - uA) * 9.0);
  float lw = px * 1.1;
  float front = min(seg(p, uA, uB), min(seg(p, uB, uC), seg(p, uC, uA)));
  float bevel = exp(-abs(tri + 0.0065) / lw) * inside;
  float outer = min(seg(p, A2, C2), min(seg(p, uA, A2), seg(p, uC, C2)));
  float hidden = min(seg(p, A2, B2), min(seg(p, B2, C2), seg(p, uB, B2)));
  light += (tint * (0.02 + 0.45 * reach + 0.4 * glint) + spill) * exp(-front / lw) * on;
  light += (tint * 0.07 + spill * 0.35) * bevel * on;
  light += (tint * (0.035 + 0.22 * reach + 0.25 * glint) + spill * 0.4) * exp(-outer / lw) * on;
  light += (tint * 0.012 + spill * 0.08) * exp(-hidden / lw) * on;
  // A point of light where the apex catches the overhead strip.
  light += tint * on * (0.35 * exp(-length(p - uA) * 90.0) + 0.06 * exp(-length(p - uA) * 22.0)) * (0.7 + 0.3 * sin(slow * 2.0));

  // The surface it stands on: a pool of light under the glass, and a faint,
  // quickly fading reflection of the prism and its beam.
  float baseY = min(uB.y, uC.y);
  float below = baseY - p.y;
  float midX = 0.5 * (uB.x + uC.x);
  float halfW = 0.5 * abs(uC.x - uB.x);
  if (below > 0.0) {
    vec2 r = vec2(p.x, baseY + below);
    float rtri = sdTri(r, uA, uB, uC);
    float rin = 1.0 - smoothstep(-px, px, rtri);
    float rfront = min(seg(r, uA, uB), min(seg(r, uB, uC), seg(r, uC, uA)));
    vec2 xm2 = uRay[N / 2].xy;
    float rbeam = gauss(seg(r, uE, xm2), w * 1.4);
    float fade = exp(-below * 16.0) * smoothstep(halfW * 2.2, halfW * 0.6, abs(p.x - midX));
    light += (tint * (0.22 * exp(-rfront / lw) + 0.02 * rin) + vec3(1.0) * rbeam * 0.9 * rin) * fade * 0.22 * on;
  }
  float pool = exp(-pow((p.x - midX) / (halfW * 1.25), 2.0) - pow(p.y - baseY, 2.0) / 0.0016);
  light += vec3(1.0, 0.98, 0.95) * pool * 0.045 * headMask(uL0 + 0.1) * on;
  light += tint * exp(-abs(p.y - baseY) / lw) * smoothstep(halfW * 1.8, halfW * 0.9, abs(p.x - midX)) * 0.05 * on;

  /* --- flare where the beam hits, softer glow where it leaves ----------- */
  float hit = headMask(uL0);
  vec2 e = p - uE;
  light += vec3(1.0, 0.97, 0.92) * hit * (0.5 * exp(-length(e) * 40.0) + 0.08 * exp(-length(e) * 9.0)
         + 0.25 * exp(-abs(e.y) * 180.0 - abs(e.x) * 7.0));
  vec2 xm = uRay[N / 2].xy;
  light += vec3(0.95, 0.95, 1.0) * headMask(uL0 + 1.55 * length(xm - uE)) * 0.06 * exp(-length(p - xm) * 14.0);

  /* --- the room, graded like a photograph ----------------------------- */
  // Warm haze where the beam strikes: light scattered in the air near the
  // brightest point, which is what makes a single glow read as cinematic.
  light += SUN * hit * (0.028 * exp(-length(p - uE) * 3.5) + 0.004 * exp(-length(p - uE) * 1.5));
  vec3 base = vec3(0.0024, 0.0027, 0.0034); // #08090c, linear
  float sky = fract(sin(dot(floor(gl_FragCoord.xy * 0.5), vec2(12.9898, 78.233))) * 43758.5453);
  float star = step(0.9975, sky) * (0.35 + 0.35 * sin(uTime * 0.7 + sky * 300.0)) * 0.04;
  vec3 col = base + vec3(star) + (1.0 - exp(-light * uExposure));
  // Darker corners pull the eye to the glass.
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  col *= mix(0.62, 1.0, smoothstep(0.85, 0.2, length(uv * vec2(0.9, 1.25))));
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  // Fine film grain; it also hides banding in the dark gradients.
  col += (fract(sin(dot(gl_FragCoord.xy + fract(uTime) * 61.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.014;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* -------------------------------------------------------------------------- */
/*  Light, colour and glass                                                   */
/* -------------------------------------------------------------------------- */

type V2 = [number, number];
const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
const mul = (a: V2, k: number): V2 => [a[0] * k, a[1] * k];
const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
const norm = (a: V2): V2 => mul(a, 1 / Math.hypot(a[0], a[1]));
const rot = (a: V2, r: number): V2 => [a[0] * Math.cos(r) - a[1] * Math.sin(r), a[0] * Math.sin(r) + a[1] * Math.cos(r)];

/** Snell's law in vector form. `n` faces against `i`. Null on total internal reflection. */
function refract(i: V2, n: V2, eta: number): V2 | null {
  const c = dot(n, i);
  const k = 1 - eta * eta * (1 - c * c);
  if (k < 0) return null;
  return sub(mul(i, eta), mul(n, eta * c + Math.sqrt(k)));
}

/** CIE 1931 colour matching, multi-lobe fit (Wyman, Sloan & Shirley 2013), to linear sRGB. */
function wavelengthToRgb(l: number): [number, number, number] {
  const g = (x: number, m: number, s1: number, s2: number) => {
    const t = (x - m) / (x < m ? s1 : s2);
    return Math.exp(-0.5 * t * t);
  };
  const x = 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
  const y = 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
  const z = 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);
  return [
    Math.max(0, 3.2406 * x - 1.5372 * y - 0.4986 * z),
    Math.max(0, -0.9689 * x + 1.8758 * y + 0.0415 * z),
    Math.max(0, 0.0557 * x - 0.204 * y + 1.057 * z),
  ];
}

const LAMBDA = Array.from({ length: RAYS }, (_, i) => 668 - (250 * i) / (RAYS - 1));
/** Each band's colour, scaled so that all bands together add up to white. */
const BAND_COLOURS = (() => {
  // A touch more weight at the red end, which the eye sees dimly, and a
  // little desaturation so the bands blend like light, not paint.
  const raw = LAMBDA.map((l) => {
    const c = wavelengthToRgb(l);
    const k = l > 610 ? 1 + (l - 610) / 120 : 1;
    const y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return c.map((v) => (v * 0.88 + y * 0.12) * k) as [number, number, number];
  });
  const sum = raw.reduce((s, c) => [s[0] + c[0], s[1] + c[1], s[2] + c[2]], [0, 0, 0]);
  // Normalised so all bands together make the beam's warm white (SUN in the shader).
  const sun = [1.0, 0.93, 0.8];
  return raw.map((c) => [(c[0] / sum[0]) * sun[0], (c[1] / sum[1]) * sun[1], (c[2] / sum[2]) * sun[2]]);
})();

/** Crown glass (BK7) fitted to Cauchy's law, λ in micrometres. */
const indexOf = (lambdaNm: number, dispersion: number) => {
  const um = lambdaNm / 1000;
  const B = 0.00420 * dispersion;
  // Keep the middle of the spectrum (550 nm) at BK7's 1.5185 as B grows.
  return 1.5185 - B / 0.3025 + B / (um * um);
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function PrismHero({
  focus = [0.66, 0.46],
  compactFocus = [0.36, 0.42],
  size = 0.34,
  rotation = 0,
  incidence = 19,
  swing = 2.2,
  dispersion = 10,
  exposure = 1.1,
  resolution = 0.75,
  maxDpr = 1.5,
  interactive = true,
  paused = false,
  glass = true,
  className = "",
  ...rest
}: PrismHeroProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const props = useRef({ focus, compactFocus, size, rotation, incidence, swing, dispersion, exposure, resolution, maxDpr, interactive, paused, glass });
  useEffect(() => {
    props.current = { focus, compactFocus, size, rotation, incidence, swing, dispersion, exposure, resolution, maxDpr, interactive, paused, glass };
  });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power", preserveDrawingBuffer: false });
    const giveUp = (why: string) => {
      host.dataset.webgl = why;
      canvas.style.display = "none";
    };
    if (!gl) return giveUp("unavailable");

    const reduced = props.current.paused;
    let program: WebGLProgram | null = null;
    let vbo: WebGLBuffer | null = null;
    let loc: Record<string, WebGLUniformLocation | null> = {};
    let width = 0;
    let height = 0;
    let running = true;
    let visible = true;
    let raf = 0;
    let lastFrame = 0;
    let clock = 0;
    let head = reduced ? 1e3 : 0;
    let nudge = 0;
    let introStart = 0;
    let nudgeTarget = 0;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.warn("prism shader:", gl!.getShaderInfoLog(s));
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    function build() {
      if (gl!.getParameter(gl!.MAX_FRAGMENT_UNIFORM_VECTORS) < RAYS * 2 + 24) return false;
      const vs = compile(gl!.VERTEX_SHADER, VERT);
      const fs = compile(gl!.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const p = gl!.createProgram()!;
      gl!.attachShader(p, vs);
      gl!.attachShader(p, fs);
      gl!.bindAttribLocation(p, 0, "aPos");
      gl!.linkProgram(p);
      gl!.deleteShader(vs);
      gl!.deleteShader(fs);
      if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) {
        console.warn("prism link:", gl!.getProgramInfoLog(p));
        return false;
      }
      program = p;
      vbo = gl!.createBuffer();
      gl!.bindBuffer(gl!.ARRAY_BUFFER, vbo);
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl!.STATIC_DRAW);
      gl!.enableVertexAttribArray(0);
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);
      loc = {};
      for (const n of ["uRes", "uCenter", "uUnit", "uA", "uB", "uC", "uBack", "uE", "uD0", "uTime", "uHead", "uL0", "uWidth", "uSpread", "uExposure", "uRay", "uCol", "uGlass"]) {
        loc[n] = gl!.getUniformLocation(p, n);
      }
      return true;
    }

    function resize() {
      const o = props.current;
      const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
      const scale = dpr * Math.min(1, Math.max(0.5, o.resolution));
      let w = Math.max(1, Math.round(host!.clientWidth * scale));
      let h = Math.max(1, Math.round(host!.clientHeight * scale));
      const cap = 1_800_000;
      if (w * h > cap) {
        const k = Math.sqrt(cap / (w * h));
        w = Math.round(w * k);
        h = Math.round(h * k);
      }
      if (w === width && h === height) return;
      width = canvas!.width = w;
      height = canvas!.height = h;
      gl!.viewport(0, 0, w, h);
    }

    const rayData = new Float32Array(RAYS * 4);
    const colData = new Float32Array(RAYS * 4);

    function render() {
      const o = props.current;
      const g = gl!;
      g.useProgram(program);

      const compact = width / height < 1.15;
      const f = compact ? o.compactFocus : o.focus;
      const unit = Math.min(width, height);
      const center: V2 = [f[0] * width, (1 - f[1]) * height];

      // The prism, centroid at the origin, apex up, then turned.
      const s = o.size;
      const r = (o.rotation * Math.PI) / 180;
      const A = rot([0, s / Math.sqrt(3)], r);
      const B = rot([-s / 2, -s / (2 * Math.sqrt(3))], r);
      const C = rot([s / 2, -s / (2 * Math.sqrt(3))], r);
      const back = rot([s * 0.16, s * 0.1], 0);

      // The beam enters the left face a little below its middle.
      const E = add(B, mul(sub(A, B), 0.44));
      const faceN = norm(rot(sub(A, B), Math.PI / 2)); // outward, up-left
      const swingNow = o.swing * Math.sin(clock * 0.11) + nudge;
      const a = ((o.incidence + swingNow) * Math.PI) / 180 + r;
      const d0: V2 = [Math.cos(a), Math.sin(a)];

      // Distance from the frame's left edge to E along the beam.
      const left = -center[0] / unit;
      const L0 = Math.max(0.2, (E[0] - left) / Math.max(0.2, d0[0]));

      const exits: [V2, V2, V2][] = [[A, C, A], [B, C, B]];
      for (let i = 0; i < RAYS; i++) {
        const n = indexOf(LAMBDA[i], o.dispersion);
        const c = BAND_COLOURS[i];
        const inside = refract(d0, faceN, 1 / n);
        let ok = false;
        if (inside) {
          // Leave through whichever of the other two faces the ray reaches first.
          let best = Infinity;
          let X: V2 = E;
          let N: V2 = [0, 0];
          for (const [P, Q] of exits) {
            const e = sub(Q, P);
            const den = inside[0] * e[1] - inside[1] * e[0];
            if (Math.abs(den) < 1e-9) continue;
            const w = sub(P, E);
            const t = (w[0] * e[1] - w[1] * e[0]) / den;
            const u = (w[0] * inside[1] - w[1] * inside[0]) / den;
            if (t > 1e-5 && u >= 0 && u <= 1 && t < best) {
              best = t;
              X = add(E, mul(inside, t));
              let nn = norm(rot(e, -Math.PI / 2));
              if (dot(nn, sub(X, [0, 0])) < 0) nn = mul(nn, -1);
              N = nn;
            }
          }
          const out = best < Infinity ? refract(inside, mul(N, -1), n) : null;
          if (out) {
            const d = norm(out);
            rayData.set([X[0], X[1], d[0], d[1]], i * 4);
            colData.set([c[0], c[1], c[2], n], i * 4);
            ok = true;
          }
        }
        if (!ok) colData.set([0, 0, 0, 0], i * 4);
      }

      // Each band must stay wide enough to blend into its neighbours.
      const first = [rayData[2], rayData[3]] as V2;
      const last = [rayData[(RAYS - 1) * 4 + 2], rayData[(RAYS - 1) * 4 + 3]] as V2;
      const fan = Math.acos(Math.min(1, Math.max(-1, dot(first, last))));
      const spread = (fan / (RAYS - 1)) * 1.0 + 0.004;

      g.uniform2f(loc.uRes, width, height);
      g.uniform2f(loc.uCenter, center[0], center[1]);
      g.uniform1f(loc.uUnit, unit);
      g.uniform2f(loc.uA, A[0], A[1]);
      g.uniform2f(loc.uB, B[0], B[1]);
      g.uniform2f(loc.uC, C[0], C[1]);
      g.uniform2f(loc.uBack, back[0], back[1]);
      g.uniform2f(loc.uE, E[0], E[1]);
      g.uniform2f(loc.uD0, d0[0], d0[1]);
      g.uniform1f(loc.uTime, clock);
      g.uniform1f(loc.uHead, head);
      g.uniform1f(loc.uL0, L0);
      g.uniform1f(loc.uWidth, 0.0042 * (s / 0.34));
      g.uniform1f(loc.uSpread, spread);
      g.uniform1f(loc.uExposure, o.exposure);
      g.uniform1f(loc.uGlass, o.glass ? 1 : 0);
      g.uniform4fv(loc.uRay, rayData);
      g.uniform4fv(loc.uCol, colData);
      g.drawArrays(g.TRIANGLES, 0, 3);
    }

    function tick(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || props.current.paused) {
        lastFrame = now;
        return;
      }
      if (lastFrame && now - lastFrame < 1000 / 40) return;
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
      lastFrame = now;
      clock += dt;
      // The switch-on runs on the wall clock, not frame time, so a slow
      // device skips frames instead of dragging the intro out.
      if (head < 1e3) {
        if (!introStart) introStart = now;
        head = Math.max(0, (now - introStart) / 1000 - 0.35) * 1.15;
        if (head > 12) head = 1e3;
      }
      nudge += (nudgeTarget - nudge) * Math.min(1, dt * 2.5);
      render();
    }

    if (!build()) return giveUp("build-failed");
    resize();
    if (reduced) clock = 4;
    render();
    canvas.style.opacity = "1";
    if (!reduced) raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      resize();
      render();
    });
    ro.observe(host);
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    io.observe(host);
    const onVisibility = () => {
      visible = !document.hidden;
      lastFrame = 0;
    };
    const fine = window.matchMedia("(pointer: fine)");
    const onPointer = (e: PointerEvent) => {
      if (!props.current.interactive || !fine.matches) return;
      const rect = host.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      nudgeTarget = -y * 5; // pointer up, beam tilts up
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      canvas.style.display = "none";
    };
    const onRestored = () => {
      width = height = 0;
      if (!build()) return giveUp("lost");
      canvas.style.display = "";
      resize();
      running = true;
      lastFrame = 0;
      render();
      if (!reduced) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointer, { passive: true });
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (vbo) gl.deleteBuffer(vbo);
      if (program) gl.deleteProgram(program);
      // The context is left alive on purpose: see black-hole-hero-section.tsx
      // (StrictMode re-runs effects on the same canvas).
    };
  }, []);

  return (
    <div ref={hostRef} className={`relative isolate h-full w-full overflow-hidden ${className}`} {...rest}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700" />
    </div>
  );
}

export default PrismHero;
