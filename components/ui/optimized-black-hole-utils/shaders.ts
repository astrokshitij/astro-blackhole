/**
 * GLSL sources for the black-hole renderer.
 *
 * The vertex shader is attribute-less: it builds a full-screen triangle from
 * gl_VertexID, so there are no buffers to allocate, bind or tear down.
 *
 * The fragment shader integrates null geodesics in a Schwarzschild metric using
 * the standard weak-field-free acceleration form
 *
 *     d2x/dl2 = -3/2 * h^2 * x / |x|^5      (units: r_s = 1)
 *
 * where h is the conserved angular momentum of the ray. The event horizon sits
 * at r = 1, the photon sphere at r = 1.5 and the ISCO at r = 3, which is where
 * the accretion disk begins. Bending the ray rather than faking it with a UV
 * distortion is what produces the secondary disk image over the shadow and the
 * photon ring for free.
 */

export const VERTEX_SHADER = /* glsl */ `#version 300 es
void main() {
  // (-1,-1), (3,-1), (-1,3) covers the viewport with a single triangle.
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)) * 2.0 - 1.0;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uCamera;   // pointer-driven azimuth / elevation offset, radians
uniform float uSteps;   // integration steps, lowered when frames get expensive
uniform float uMotion;  // 0 when the viewer prefers reduced motion

const float HORIZON = 1.0;
const float DISK_INNER = 3.0;
const float DISK_OUTER = 11.0;
const float ESCAPE = 34.0;

float hash13(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float valueNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i + vec3(0, 0, 0)), hash13(i + vec3(1, 0, 0)), f.x),
        mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x),
        mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * valueNoise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

// Procedural sky: sparse stars on a lattice plus a very faint nebula wash.
vec3 sky(vec3 dir) {
  vec3 cell = dir * 300.0;
  vec3 id = floor(cell);
  float seed = hash13(id);
  float star = 0.0;
  if (seed > 0.978) {
    vec3 jitter = vec3(hash13(id + 1.7), hash13(id + 3.1), hash13(id + 5.3)) - 0.5;
    float d = length(fract(cell) - 0.5 - jitter * 0.55);
    star = smoothstep(0.32, 0.0, d) * ((seed - 0.978) / 0.022);
  }
  vec3 tint = mix(vec3(0.72, 0.83, 1.0), vec3(1.0, 0.86, 0.66), hash13(id + 9.1));
  vec3 col = tint * star * 1.9;

  float n = fbm(dir * 2.1 + 4.0);
  col += mix(vec3(0.010, 0.013, 0.030), vec3(0.045, 0.018, 0.062), n) * (0.3 + 0.7 * n);
  return col;
}

// Rough blackbody ramp: amber at the outer edge, near-white at the ISCO.
vec3 diskColor(float inner) {
  vec3 c = mix(vec3(1.0, 0.30, 0.05), vec3(1.0, 0.72, 0.28), smoothstep(0.0, 0.45, inner));
  return mix(c, vec3(1.0, 0.96, 0.90), smoothstep(0.6, 1.0, inner));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float time = uTime * uMotion;

  // Camera orbits just above the disk plane, so the disk reads as near edge-on.
  float azimuth = 0.42 + uCamera.x;
  float elevation = 0.10 + uCamera.y;
  vec3 camPos = vec3(sin(azimuth) * cos(elevation), sin(elevation), cos(azimuth) * cos(elevation)) * 13.5;

  vec3 forward = normalize(-camPos);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);

  vec3 pos = camPos;
  vec3 dir = normalize(forward * 1.55 + right * uv.x + up * uv.y);

  vec3 angularMomentum = cross(pos, dir);
  float h2 = dot(angularMomentum, angularMomentum);

  vec3 color = vec3(0.0);
  float transmittance = 1.0;
  bool captured = false;
  float closest = 1e9;

  int steps = int(uSteps);
  for (int i = 0; i < 220; i++) {
    if (i >= steps) break;

    float r = length(pos);
    closest = min(closest, r);
    float dt = clamp(0.06 * r, 0.03, 0.60);

    vec3 previous = pos;
    dir += (-1.5 * h2 * pos / pow(r, 5.0)) * dt;
    pos += dir * dt;

    // Equatorial plane crossing: the disk is thin, so test for a sign flip.
    if (previous.y * pos.y < 0.0) {
      float k = previous.y / (previous.y - pos.y);
      vec3 hit = mix(previous, pos, k);
      float rd = length(hit.xz);

      if (rd > DISK_INNER && rd < DISK_OUTER) {
        float inner = clamp((DISK_OUTER - rd) / (DISK_OUTER - DISK_INNER), 0.0, 1.0);

        // Keplerian shear: sample the noise in the frame co-rotating with the gas.
        float omega = 2.6 * pow(rd, -1.5);
        float phi = atan(hit.z, hit.x) + omega * time;
        vec3 np = vec3(cos(phi), sin(phi), 0.0) * rd * 0.85 + vec3(0.0, 0.0, rd * 0.42);

        float bands = fbm(np * 1.5);
        float filaments = fbm(np * 5.2 + 13.0);
        float density = smoothstep(0.22, 0.86, bands * 0.72 + filaments * 0.38);

        float edges = smoothstep(0.0, 1.1, rd - DISK_INNER) * smoothstep(0.0, 3.2, DISK_OUTER - rd);

        // Relativistic beaming: the limb rotating toward us is much brighter.
        vec3 orbit = normalize(cross(vec3(0.0, 1.0, 0.0), hit));
        float beta = 0.46 * pow(rd, -0.5);
        float doppler = 1.0 / max(1.0 - beta * dot(orbit, normalize(camPos - hit)), 0.30);
        float brightness = pow(rd / DISK_INNER, -2.0) * clamp(pow(doppler, 3.0), 0.12, 4.5);

        float alpha = clamp(density * edges * 1.05, 0.0, 1.0);
        color += transmittance * diskColor(inner) * brightness * 1.25 * alpha;
        transmittance *= 1.0 - alpha * 0.86;
      }
    }

    float rr = length(pos);
    if (rr < HORIZON * 1.02) { captured = true; break; }
    if (rr > ESCAPE) break;
  }

  if (!captured) {
    color += transmittance * sky(normalize(dir));
    // Thin warm halo in the band just outside the photon sphere. Rays that fell
    // through the horizon get nothing, so the shadow stays properly black.
    float halo = smoothstep(3.0, 1.62, closest) * smoothstep(1.42, 1.62, closest);
    color += transmittance * vec3(1.0, 0.76, 0.46) * 0.22 * halo;
  }

  // ACES-style filmic curve, then gamma, vignette and a dither to kill banding.
  color *= 0.95;
  color = (color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14);
  color = pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2));
  color *= mix(0.80, 1.0, smoothstep(1.4, 0.25, length(uv)));
  color += (hash13(vec3(gl_FragCoord.xy, fract(uTime))) - 0.5) / 255.0;

  fragColor = vec4(color, 1.0);
}
`;
