import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import {
  detectionCDF,
  sampleDetection,
  seededRandom,
  slitIntensity,
  smooth,
  wavelengthRGB,
} from "@/lib/light-physics";
import {
  PRISM_SCALE,
  SCREEN_HALF_WIDTH,
  SOURCE,
  tracePrism,
} from "@/lib/optical-bench";

export type OpticalState = {
  progress: number;
  rotation: number;
  paused: boolean;
  reduced: boolean;
  exposure: number;
};
export type OpticalWorld = { invalidate(): void; dispose(): void };

const vertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const green = new THREE.Color(0x8af09c);
const beamVertex = `uniform vec3 uStart,uEnd;uniform float uWidth;varying vec2 vUv;
void main(){vUv=uv;vec3 centre=mix(uStart,uEnd,uv.x);vec3 tangent=normalize(uEnd-uStart+vec3(.00001,0.,0.));vec3 side=normalize(cross(tangent,normalize(cameraPosition-centre)));vec3 p=centre+side*(uv.y-.5)*uWidth;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`;
const beamFragment = `uniform vec3 uColor;uniform float uOpacity;varying vec2 vUv;
void main(){float y=abs(vUv.y-.5)*2.;float glow=exp(-y*y*9.)*.11+exp(-y*y*350.);float ends=smoothstep(0.,.015,vUv.x)*(1.-smoothstep(.985,1.,vUv.x));gl_FragColor=vec4(uColor,glow*ends*uOpacity);
#include <colorspace_fragment>
}`;

function beam(opacity = 1, color = new THREE.Color(0xfff3dc), width = 0.3) {
  const material = new THREE.ShaderMaterial({
    vertexShader: beamVertex,
    fragmentShader: beamFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      uStart: { value: new THREE.Vector3() },
      uEnd: { value: new THREE.Vector3(1, 0, 0) },
      uWidth: { value: width },
      uColor: { value: color },
      uOpacity: { value: opacity },
    },
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  return {
    mesh,
    material,
    set(a: THREE.Vector3, b: THREE.Vector3, amount = opacity) {
      material.uniforms.uStart.value.copy(a);
      material.uniforms.uEnd.value.copy(b);
      material.uniforms.uOpacity.value = amount;
    },
  };
}
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const point = (a: [number, number]) => V(a[0], a[1], 0);
const phase = (p: number, start: number, end: number) =>
  smooth((p - start) / (end - start));

function plate(
  width: number,
  height: number,
  holes: { centre: number; width: number; height: number }[],
  material: THREE.Material,
) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -height / 2);
  shape.lineTo(width / 2, -height / 2);
  shape.lineTo(width / 2, height / 2);
  shape.lineTo(-width / 2, height / 2);
  shape.closePath();
  for (const h of holes) {
    const hole = new THREE.Path();
    hole.moveTo(h.centre - h.width / 2, -h.height / 2);
    hole.lineTo(h.centre - h.width / 2, h.height / 2);
    hole.lineTo(h.centre + h.width / 2, h.height / 2);
    hole.lineTo(h.centre + h.width / 2, -h.height / 2);
    hole.closePath();
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.065,
    bevelEnabled: true,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    bevelSegments: 2,
  });
  geometry.applyMatrix4(
    new THREE.Matrix4().makeBasis(V(0, 1, 0), V(0, 0, 1), V(1, 0, 0)),
  );
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function detectorQuad(x: number, width: number, height: number) {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        x,
        -width / 2,
        -height / 2,
        x,
        width / 2,
        -height / 2,
        x,
        width / 2,
        height / 2,
        x,
        -width / 2,
        height / 2,
      ],
      3,
    ),
  );
  g.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2),
  );
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  return g;
}

/** One real 3D scene. No apparatus photographs or storyboard textures are used. */
export function createOpticalWorld(
  canvas: HTMLCanvasElement,
  state: OpticalState,
): OpticalWorld {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x08090c, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color().setRGB(0.0067, 0.0075, 0.009);
  scene.fog = new THREE.FogExp2(0x08090c, 0.014);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.05, 150);
  camera.up.set(0, 1, 0);
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x030407);
  for (const [x, y, z, w, h, r, g, b] of [
    [-3, 0, 4, 0.35, 7, 8, 7, 6],
    [4, 1, 3, 0.18, 6, 4, 5, 7],
    [0, 5, 3, 5, 0.18, 5, 4.5, 4],
    [0, 0, 7, 4, 5, 0.3, 0.34, 0.4],
  ]) {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setRGB(r, g, b),
        side: THREE.DoubleSide,
      }),
    );
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    studio.add(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.65;
  studio.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0x97a6c1, 0.15));
  const key = new THREE.DirectionalLight(0xffefd8, 2.4);
  key.position.set(-3, -4, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc3d7f4, 2);
  rim.position.set(2, 5, 4);
  scene.add(rim);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color().setRGB(0.0067, 0.0075, 0.009),
    }),
  );
  floor.position.z = -1.7;
  scene.add(floor);

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xf4f8ff,
    roughness: 0.025,
    metalness: 0,
    transmission: 1,
    transparent: true,
    opacity: 0.38,
    thickness: 2.35,
    ior: 1.5185,
    dispersion: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    envMapIntensity: 1,
    attenuationColor: new THREE.Color(0xe8f1fa),
    attenuationDistance: 15,
    depthWrite: false,
  });
  const shape = new THREE.Shape();
  shape.moveTo(-PRISM_SCALE, -PRISM_SCALE);
  shape.lineTo(PRISM_SCALE, -PRISM_SCALE);
  shape.lineTo(0, PRISM_SCALE);
  shape.closePath();
  const prismGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 2.7,
    bevelEnabled: true,
    bevelSize: 0.024,
    bevelThickness: 0.024,
    bevelSegments: 3,
    curveSegments: 1,
  });
  prismGeometry.translate(0, 0, -1.64);
  const prism = new THREE.Group();
  prism.add(new THREE.Mesh(prismGeometry, glass));
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(1.6, 1.75, 1.9),
    transparent: true,
    opacity: 0.6,
    toneMapped: false,
  });
  prism.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(prismGeometry, 35),
      edgeMaterial,
    ),
  );
  scene.add(prism);
  const rays = Array.from({ length: 26 }, (_, i) => {
    const nm = 400 + i * 12;
    const b = beam(0.36, new THREE.Color(...wavelengthRGB(nm)), 0.22);
    scene.add(b.mesh);
    const inner = beam(0.14, new THREE.Color(...wavelengthRGB(nm)), 0.055);
    scene.add(inner.mesh);
    return { nm, beam: b, inner };
  });
  const incoming = beam(1.25, new THREE.Color(0xfff4df), 0.32);
  scene.add(incoming.mesh);
  const selected = beam(0.95, green, 0.27);
  scene.add(selected.mesh);
  const beforeLens = beam(0.65, green, 0.22);
  scene.add(beforeLens.mesh);

  const bench = new THREE.Group();
  scene.add(bench);
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x20252c,
    metalness: 0,
    roughness: 0.7,
    envMapIntensity: 0,
  });
  const edgeMetal = new THREE.MeshStandardMaterial({
    color: 0x4b4232,
    metalness: 0.6,
    roughness: 0.3,
    envMapIntensity: 0.12,
  });
  const filter = plate(
    1.9,
    2.7,
    [{ centre: 0, width: 0.1, height: 1.9 }],
    darkMetal,
  );
  filter.position.x = 4;
  bench.add(filter);
  const lens = new THREE.Mesh(
    new THREE.SphereGeometry(1, 40, 24),
    glass.clone(),
  );
  lens.scale.set(0.13, 1.02, 1.02);
  lens.position.x = 5.35;
  bench.add(lens);
  const slitAssembly = new THREE.Group();
  bench.add(slitAssembly);
  const slits = plate(
    3.35,
    3.05,
    [
      { centre: -0.27, width: 0.075, height: 2.15 },
      { centre: 0.27, width: 0.075, height: 2.15 },
    ],
    darkMetal,
  );
  slits.position.x = 8;
  slitAssembly.add(slits);
  for (const y of [-0.27, 0.27]) {
    const slitGlow = new THREE.Mesh(
      detectorQuad(7.975, 0.065, 2.1),
      new THREE.MeshBasicMaterial({
        color: green,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    slitGlow.position.y = y;
    slitAssembly.add(slitGlow);
  }

  const incomingField = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: `varying vec2 vUv;uniform float uTime,uReveal;void main(){float transverse=(vUv.y-.5)*2.;float edge=pow(max(0.,1.-transverse*transverse),1.5);float front=1.-smoothstep(uReveal-.025,uReveal,vUv.x);float wave=pow(max(0.,cos(vUv.x*42.-uTime*2.5)),20.);gl_FragColor=vec4(.35,.9,.4,edge*front*(.018+wave*.09));}`,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uReveal: { value: 0 } },
  });
  const illumination = new THREE.Mesh(
    new THREE.PlaneGeometry(2.65, 1.9, 1, 1),
    incomingField,
  );
  illumination.position.set(6.675, 0, 0);
  bench.add(illumination);

  // Finite-aperture phasor summation adapted from Nicolas Adamini (MIT), see THIRD_PARTY.md.
  // The travelling field is deliberately schematic: visual wavelength, time and slit scale are magnified.
  // The detector below independently uses SI geometry and 530 nm, including its diffraction envelope.
  const waveMaterial = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: `
varying vec2 vUv;uniform float uTime,uReveal,uOpacity;
const float PI=3.14159265359;
void slitGroups(vec2 p,float k,out vec2 a,out vec2 b,out float env){a=vec2(0.);b=vec2(0.);env=0.;
for(int i=0;i<2;i++){float centre=(float(i)-.5)*.54;vec2 sum=vec2(0.);
for(int j=0;j<8;j++){float t=float(j)/7.-.5;vec2 d=p-vec2(0.,centre+t*.075);float r=max(length(d),.01);float A=1./sqrt(r);float K=max(0.,.5*(1.+d.x/r));sum+=K*A*vec2(cos(k*r),sin(k*r));env+=A;}if(i==0)a=sum;else b=sum;}}
void main(){vec2 p=vec2(vUv.x*6.,(vUv.y-.5)*4.8);vec2 a,b;float env;slitGroups(p,15.,a,b,env);vec2 total=(a+b)/max(env,.001);float phase=uTime*2.8;float signedField=total.x*cos(phase)+total.y*sin(phase);float crest=pow(abs(signedField),2.4);float edge=1.-smoothstep(1.5,2.4,abs(p.y));float front=1.-smoothstep(uReveal-.04,uReveal,vUv.x);float start=smoothstep(0.,.12,p.x);gl_FragColor=vec4(.38,.95,.47,(.012+crest*.55)*edge*front*start*uOpacity);}`,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uOpacity: { value: 1 },
    },
  });
  const field = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.8), waveMaterial);
  field.position.x = 11;
  bench.add(field);
  const surfaceGeometry = new THREE.PlaneGeometry(6, 4.8, 100, 40);
  const surfaceMaterial = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv;uniform float uTime;void main(){vUv=uv;vec3 p=position;float x=(uv.x)*6.;float y=(uv.y-.5)*4.8;float a=length(vec2(x,y-.27));float b=length(vec2(x,y+.27));p.z+=.045*(sin(a*15.-uTime*2.8)+sin(b*15.-uTime*2.8));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec2 vUv;uniform float uReveal,uOpacity;void main(){float edge=(1.-smoothstep(.6,1.,abs(vUv.y-.5)*2.))*smoothstep(0.,.1,vUv.x)*(1.-smoothstep(uReveal-.03,uReveal,vUv.x));float lines=pow(max(0.,cos(vUv.x*92.)),28.);gl_FragColor=vec4(.4,.9,.48,lines*.075*edge*uOpacity);}`,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uOpacity: { value: 1 },
    },
  });
  const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
  surface.position.x = 11;
  bench.add(surface);

  const screenMaterial = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: `varying vec2 vUv;uniform float uIntensity,uProbability;
void main(){float x=(vUv.x-.5)*.036;float s=x/sqrt(1.+x*x);float beta=3.14159265359*35.e-6*s/530.e-9;float delta=3.14159265359*180.e-6*s/530.e-9;float sinc=abs(beta)<.00001?1.:sin(beta)/beta;float I=sinc*sinc*cos(delta)*cos(delta);float vertical=pow(sin(3.14159265*vUv.y),.3);vec3 color=vec3(.008,.013,.012)+vec3(.22,.82,.32)*pow(I,.72)*vertical*uIntensity; color+=vec3(.12,.42,.2)*I*vertical*uProbability;gl_FragColor=vec4(color,1.);}`,
    side: THREE.DoubleSide,
    uniforms: { uIntensity: { value: 0 }, uProbability: { value: 0 } },
    toneMapped: false,
  });
  const screen = new THREE.Mesh(detectorQuad(14, 4.8, 3.0), screenMaterial);
  bench.add(screen);
  for (const y of [-2.42, 2.42]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.018, 3.05),
      edgeMetal,
    );
    rail.position.set(14, y, 0);
    bench.add(rail);
  }
  for (const z of [-1.52, 1.52]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 4.84, 0.018),
      edgeMetal,
    );
    rail.position.set(14, 0, z);
    bench.add(rail);
  }
  const dotPositions = new Float32Array(10000 * 3),
    cdf = detectionCDF(180e-6, false, 4096, SCREEN_HALF_WIDTH),
    random = seededRandom(8272026);
  for (let i = 0; i < 10000; i++) {
    const y =
      (sampleDetection(cdf, random(), SCREEN_HALF_WIDTH) / SCREEN_HALF_WIDTH) *
      2.4;
    dotPositions.set([13.975, y, (random() - 0.5) * 2.88], i * 3);
  }
  const dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dotPositions, 3),
  );
  dotGeometry.computeBoundingSphere();
  const dotMaterial = new THREE.ShaderMaterial({
    vertexShader: `uniform float uSize;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=uSize;}`,
    fragmentShader: `uniform float uOpacity;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float a=exp(-r*r*15.)*uOpacity;gl_FragColor=vec4(.46,1.,.57,a);}`,
    uniforms: { uSize: { value: 2.2 }, uOpacity: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const dots = new THREE.Points(dotGeometry, dotMaterial);
  bench.add(dots);
  dotGeometry.setDrawRange(0, 0);
  const curvePoints = Array.from({ length: 512 }, (_, i) => {
    const x = ((i / 511) * 2 - 1) * SCREEN_HALF_WIDTH;
    return V(
      13.95,
      (x / SCREEN_HALF_WIDTH) * 2.4,
      -1.4 + slitIntensity(x) * 0.75,
    );
  });
  const probabilityMaterial = new THREE.LineBasicMaterial({
    color: 0xb1eebd,
    transparent: true,
    opacity: 0,
  });
  bench.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curvePoints),
      probabilityMaterial,
    ),
  );

  const sensor = new THREE.PointLight(0x80ff9c, 0, 7, 2);
  sensor.position.set(13, -1, 1);
  bench.add(sensor);
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera),
    outputPass = new OutputPass();
  composer.addPass(renderPass);
  composer.addPass(outputPass);
  let width = 1,
    height = 1,
    compact = false,
    pixelRatio = 1,
    frame = 0,
    disposed = false,
    visible = true,
    dirty = true,
    last = 0,
    time = 0,
    current = state.progress,
    exposure = 0,
    exposureId = 0,
    replaying = false,
    quality = 1,
    slow = 0;
  const target = new THREE.Vector3(),
    desired = new THREE.Vector3(),
    position = new THREE.Vector3(),
    basis = new THREE.Matrix4();
  const canvasObserver = new ResizeObserver(() => {
    resize();
    invalidate();
  });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) invalidate();
  });
  canvasObserver.observe(canvas);
  intersection.observe(canvas);
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    compact = window.innerWidth < 900;
    pixelRatio = Math.min(devicePixelRatio || 1, compact ? 1 : 1.4) * quality;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);
    camera.aspect = width / height;
    camera.fov = compact ? 44 : 39;
    camera.updateProjectionMatrix();
    dotMaterial.uniforms.uSize.value = (compact ? 2.0 : 2.35) * pixelRatio;
    dirty = true;
  }
  resize();
  let hdri: THREE.DataTexture | null = null;
  new HDRLoader()
    .loadAsync("/images/light-story/environment/studio_small_09_1k.hdr")
    .then((texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      hdri = texture;
      scene.environment = texture;
      scene.environmentRotation.set(0.5, 0.4, 0.3);
      invalidate();
    })
    .catch(() => {
      /* The procedural studio remains a fully local fallback. */
    });
  function render(now: number) {
    frame = 0;
    if (disposed || document.hidden || !visible) return;
    const dt = last ? Math.min((now - last) / 1000, 0.08) : 1 / 30;
    if (!dirty && now - last < 32) {
      frame = requestAnimationFrame(render);
      return;
    }
    if (last && now - last > 65 && now - last < 200) slow++;
    else slow = Math.max(0, slow - 1);
    if (slow > 35 && quality > 0.65) {
      quality -= 0.15;
      slow = 0;
      resize();
    }
    last = now;
    current = state.reduced
      ? Math.round(state.progress)
      : THREE.MathUtils.lerp(current, state.progress, Math.min(1, dt * 12));
    const p = Math.max(0, Math.min(5, current));
    const ambient = !state.paused && !state.reduced && p > 2.3 && p < 4.3;
    if (ambient) time += dt;
    if (state.exposure !== exposureId) {
      exposureId = state.exposure;
      exposure = state.paused || state.reduced ? 1 : 0;
      replaying = true;
    }
    if (p < 3.65) replaying = false;
    if (replaying && !state.paused && !state.reduced)
      exposure = Math.min(1, exposure + dt / 3.5);
    const angle =
      -0.09 -
      0.25 * phase(p, 0.05, 1.3) +
      state.rotation * (1 - phase(p, 1.4, 2));
    prism.rotation.z = angle;
    filter.visible = p > 1.2;
    lens.visible = p > 1.45;
    // A cutaway clears the foreground as the camera enters the detector close-up.
    slitAssembly.visible = p > 1.9 && p < 4.2;
    const central = tracePrism(angle, 530)!;
    const origin = point(central.exit),
      d = point(central.direction),
      n = V(-d.y, d.x, 0),
      z = V(0, 0, 1);
    basis.makeBasis(d, n, z);
    bench.quaternion.setFromRotationMatrix(basis);
    bench.position.copy(origin);
    const world = (x: number, y = 0, z = 0) =>
      origin
        .clone()
        .addScaledVector(d, x)
        .addScaledVector(n, y)
        .add(V(0, 0, z));
    incoming.set(point(SOURCE), point(central.entry), 1.15);
    const fanReveal = 0.4 + 0.6 * phase(p, 0, 0.6);
    for (const r of rays) {
      const ray = tracePrism(angle, r.nm)!;
      const start = point(ray.exit),
        direction = point(ray.direction);
      const length = (4 - start.clone().sub(origin).dot(d)) / direction.dot(d);
      r.beam.set(
        start,
        start.clone().addScaledVector(direction, length),
        0.36 * fanReveal,
      );
      r.inner.set(point(ray.entry), start, 0.12 * fanReveal);
    }
    selected.set(origin, world(4), 0.55 * phase(p, 1.2, 1.9));
    beforeLens.set(
      world(4.07),
      world(4.07 + 1.18 * phase(p, 1.85, 2.25)),
      0.8 * phase(p, 1.85, 2.05),
    );
    incomingField.uniforms.uTime.value = time;
    incomingField.uniforms.uReveal.value = phase(p, 2.1, 2.85);
    waveMaterial.uniforms.uTime.value = time;
    surfaceMaterial.uniforms.uTime.value = time;
    waveMaterial.uniforms.uReveal.value = phase(p, 2.8, 3.55);
    surfaceMaterial.uniforms.uReveal.value = phase(p, 2.8, 3.55);
    waveMaterial.uniforms.uOpacity.value = 1 - phase(p, 3.8, 4.35);
    surfaceMaterial.uniforms.uOpacity.value = 1 - phase(p, 3.8, 4.35);
    field.visible = p > 2.65 && p < 4.4;
    surface.visible = field.visible;
    const counting = phase(p, 3.65, 4.05),
      buildup = replaying ? exposure : phase(p, 3.85, 5);
    screenMaterial.uniforms.uIntensity.value =
      phase(p, 3.25, 3.65) * (1 - counting);
    screenMaterial.uniforms.uProbability.value = 0.16 * phase(p, 4.7, 5);
    const count = Math.floor(10000 * buildup);
    dotGeometry.setDrawRange(0, count);
    dots.visible = count > 0;
    dotMaterial.uniforms.uOpacity.value = counting;
    probabilityMaterial.opacity = 0.26 * phase(p, 4.7, 5);
    sensor.intensity = 0.22 * phase(p, 3.1, 3.7);
    const cameras = [
      V(-0.7, -0.7, 9.5),
      V(0.8, -1.2, 8.2),
      world(3.2, -5.8, 3.5),
      world(10.5, -11, 6),
      world(8.5, -3.8, 2.4),
      world(8.35, -0.15, 0.35),
    ];
    const targets = [
      V(0.1, 0, -0.1),
      V(0.1, -0.2, -0.2),
      world(4.9, 0, -0.1),
      world(11, 0, -0.1),
      world(14, 0, 0),
      world(14, 0, 0),
    ];
    const index = Math.min(5, Math.floor(p)),
      next = Math.min(5, index + 1),
      mix = smooth(p - index);
    desired.lerpVectors(cameras[index], cameras[next], mix);
    target.lerpVectors(targets[index], targets[next], mix);
    if (compact)
      desired
        .sub(target)
        .multiplyScalar(p < 1.7 ? 0.84 : p > 3.7 ? 1.18 : 1.08)
        .add(target);
    position.copy(desired);
    camera.position.copy(position);
    camera.up
      .lerpVectors(V(0, 1, 0), V(0, 0, 1), phase(p, 1.1, 2.2))
      .normalize();
    camera.lookAt(target);
    // Render only the reserved visual column on desktop. Text and photos never share its pixels.
    camera.aspect = width / height;
    camera.fov = compact ? 44 : 39 + 5 * phase(p, 4, 5);
    camera.updateProjectionMatrix();
    renderer.setViewport(0, 0, width, height);
    composer.render();
    canvas.dataset.scene = String(Math.min(5, Math.floor(p + 0.001)));
    canvas.dataset.detections = String(count);
    canvas.dataset.rotation = angle.toFixed(3);
    canvas.dataset.progress = p.toFixed(3);
    dirty = false;
    if (
      ambient ||
      (!state.reduced && Math.abs(current - state.progress) > 0.0004) ||
      (replaying && exposure < 1 && !state.paused && !state.reduced)
    )
      frame = requestAnimationFrame(render);
  }
  function invalidate() {
    dirty = true;
    if (!frame && !disposed) frame = requestAnimationFrame(render);
  }
  invalidate();
  return {
    invalidate,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      canvasObserver.disconnect();
      intersection.disconnect();
      environment.dispose();
      hdri?.dispose();
      composer.dispose();
      outputPass.dispose();
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) geometries.add(m.geometry);
        if (m.material)
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) =>
            materials.add(x),
          );
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
