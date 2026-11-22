import * as THREE from "three";
import {
  detectionCDF,
  OPTICS,
  photoelectric,
  sampleDetection,
  seededRandom,
  slitIntensity,
  smooth,
  wavelengthRGB,
} from "@/lib/light-physics";

export interface LightState {
  progress: number;
  localProgress: number;
  separation: number;
  recorded: boolean;
  wavelength: number;
  paused: boolean;
  reduced: boolean;
  detections?: number;
}
export interface LightEngine {
  invalidate(): void;
  dispose(): void;
}

const pointVertex = `uniform float uSize; void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_PointSize=uSize;}`;
const pointFragment = `uniform vec3 uColor; uniform float uOpacity; void main(){float r=length(gl_PointCoord-.5); if(r>.5) discard; gl_FragColor=vec4(uColor,smoothstep(.5,.10,r)*uOpacity);}`;

/** Cinematic apparatus imagery on a 3D camera stage, with live calculated optics.
 * The hardware is an illustration, not a geometrically scaled simulation. The pattern and
 * detection probabilities are calculated independently in SI units. This hybrid deliberately
 * preserves the photographic finish of the original site instead of using crude substitute models.
 */
export async function createLightEngine(
  canvas: HTMLCanvasElement,
  state: LightState,
): Promise<LightEngine> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x08090c);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const loader = new THREE.TextureLoader();
  let images: THREE.Texture[];
  try {
    images = await Promise.all([
      loader.loadAsync("/images/light-story/double-slit-studio.webp"),
      loader.loadAsync("/images/light-story/photoelectric-studio.webp"),
    ]);
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  images.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  });
  const double = new THREE.Group(),
    electric = new THREE.Group();
  electric.position.x = 22;
  scene.add(double, electric);
  const plane = new THREE.PlaneGeometry(16, (16 * 1024) / 1536);
  const doubleImage = new THREE.Mesh(
    plane,
    new THREE.MeshBasicMaterial({ map: images[0], toneMapped: false }),
  );
  const energyImage = new THREE.Mesh(
    plane,
    new THREE.MeshBasicMaterial({ map: images[1], toneMapped: false }),
  );
  double.add(doubleImage);
  electric.add(energyImage);
  const pixel = (x: number, y: number, z = 0.025) =>
    new THREE.Vector3(
      (x / 1536 - 0.5) * 16,
      (0.5 - y / 1024) * ((16 * 1024) / 1536),
      z,
    );
  const screenCorners = [
    pixel(1018, 295),
    pixel(1459, 340),
    pixel(1459, 734),
    pixel(1018, 648),
  ];
  function quad(corners: THREE.Vector3[]) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        corners.flatMap((v) => v.toArray()),
        3,
      ),
    );
    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2),
    );
    geometry.setIndex([0, 2, 1, 0, 3, 2]);
    geometry.computeVertexNormals();
    return geometry;
  }
  const screenPoint = (u: number, v: number) => {
    const top = screenCorners[0].clone().lerp(screenCorners[1], u);
    const bottom = screenCorners[3].clone().lerp(screenCorners[2], u);
    return top.lerp(bottom, v);
  };

  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = 1024;
  patternCanvas.height = 64;
  const context = patternCanvas.getContext("2d")!;
  const patternTexture = new THREE.CanvasTexture(patternCanvas);
  patternTexture.colorSpace = THREE.SRGBColorSpace;
  const patternMaterial = new THREE.MeshBasicMaterial({
    map: patternTexture,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
  const screen = new THREE.Mesh(quad(screenCorners), patternMaterial);
  double.add(screen);

  const pointPositions = new Float32Array(6000 * 3),
    dotsGeometry = new THREE.BufferGeometry();
  dotsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(pointPositions, 3),
  );
  const dotsMaterial = new THREE.ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSize: { value: 2.6 },
      uColor: { value: new THREE.Color(0x9feb83) },
      uOpacity: { value: 1 },
    },
  });
  const dots = new THREE.Points(dotsGeometry, dotsMaterial);
  double.add(dots);

  // Very faint schematic Huygens wavefronts. The photographic apparatus is deliberately unscaled.
  const waveMaterial = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv;uniform float uTime,uOpacity;
      void main(){vec2 p=vec2(vUv.x*4.,(vUv.y-.5)*3.);float d1=length(p-vec2(0.,.1));float d2=length(p+vec2(0.,.1));
      float a=pow(max(0.,cos(15.*d1-uTime*2.)),32.);float b=pow(max(0.,cos(15.*d2-uTime*2.)),32.);
      float fade=smoothstep(0.,.15,p.x)*(1.-smoothstep(3.4,4.,p.x))*(1.-smoothstep(.8,1.5,abs(p.y)));
      gl_FragColor=vec4(.3,.72,.21,(a+b)*fade*.18*uOpacity);}`,
  });
  const waves = new THREE.Mesh(
    quad([
      pixel(665, 453),
      pixel(1018, 295),
      pixel(1018, 648),
      pixel(665, 559),
    ]),
    waveMaterial,
  );
  double.add(waves);

  let previousSeparation = -1,
    previousRecorded = false;
  function updatePattern() {
    const separation = state.separation * 1e-6;
    const image = context.createImageData(1024, 64);
    for (let x = 0; x < 1024; x++) {
      const metres = ((x / 1023) * 2 - 1) * OPTICS.halfScreen;
      const intensity = Math.pow(
        slitIntensity(metres, separation, state.recorded),
        0.7,
      );
      for (let y = 0; y < 64; y++) {
        const index = (y * 1024 + x) * 4;
        const falloff = Math.sin((Math.PI * (y + 0.5)) / 64) ** 0.2;
        image.data[index] = 60 * intensity * falloff;
        image.data[index + 1] = 190 * intensity * falloff;
        image.data[index + 2] = 35 * intensity * falloff;
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    patternTexture.needsUpdate = true;
    const cdf = detectionCDF(separation, state.recorded),
      random = seededRandom(state.recorded ? 2026 : 1801);
    for (let i = 0; i < 6000; i++) {
      const u = (sampleDetection(cdf, random()) / OPTICS.halfScreen + 1) / 2;
      const point = screenPoint(u, 0.025 + random() * 0.95);
      point.z = 0.04;
      pointPositions.set(point.toArray(), i * 3);
    }
    dotsGeometry.attributes.position.needsUpdate = true;
    dotsGeometry.computeBoundingSphere();
    previousSeparation = state.separation;
    previousRecorded = state.recorded;
  }
  updatePattern();

  // New photoelectric apparatus. The collector is on the illuminated side of the metal.
  const source = pixel(505, 598, 0.06),
    impact = pixel(1195, 562, 0.06),
    collector = pixel(955, 393, 0.06);
  const energyBeam = new THREE.Group();
  electric.add(energyBeam);
  const delta = impact.clone().sub(source),
    centre = source.clone().add(impact).multiplyScalar(0.5);
  for (const [radius, opacity] of [
    [0.008, 0.9],
    [0.028, 0.13],
    [0.075, 0.025],
  ]) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x8651ff,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, delta.length(), 8, 1, true),
      material,
    );
    mesh.position.copy(centre);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.clone().normalize(),
    );
    energyBeam.add(mesh);
  }
  const electronPositions = new Float32Array(36 * 3),
    electronGeometry = new THREE.BufferGeometry();
  electronGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(electronPositions, 3),
  );
  const electronMaterial = new THREE.ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSize: { value: 4 },
      uColor: { value: new THREE.Color(0xc6e4ff) },
      uOpacity: { value: 0.85 },
    },
  });
  const electrons = new THREE.Points(electronGeometry, electronMaterial);
  electrons.frustumCulled = false;
  electric.add(electrons);

  const positions = [
    new THREE.Vector3(0, 0, 15.5),
    new THREE.Vector3(0, 0, 15.5),
    new THREE.Vector3(4.9, 0.0, 8.6),
    new THREE.Vector3(22, 0, 15.5),
  ];
  const targets = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(4.9, 0, 0),
    new THREE.Vector3(22, 0, 0),
  ];
  const offsets = [0, 0, 0.22, 0];
  let width = 1,
    height = 1,
    compact = false,
    pixelRatio = 1,
    quality = 1,
    disposed = false,
    frame = 0,
    dirty = true,
    lastFrame = 0,
    time = 0,
    slowFrames = 0,
    visible = true;
  const target = new THREE.Vector3();
  function resize() {
    const b = canvas.getBoundingClientRect();
    width = Math.max(1, b.width);
    height = Math.max(1, b.height);
    compact = width < 900;
    pixelRatio =
      Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5) * quality;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    dotsMaterial.uniforms.uSize.value = (compact ? 2 : 2.6) * pixelRatio;
    electronMaterial.uniforms.uSize.value = 4 * pixelRatio;
    dirty = true;
  }
  const resizeObserver = new ResizeObserver(() => {
    resize();
    invalidate();
  });
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    invalidate();
  });
  visibilityObserver.observe(canvas);
  resize();
  function render(now: number) {
    frame = 0;
    if (disposed || document.hidden || !visible) return;
    const moving = !(state.paused || state.reduced) && state.progress > 0.2;
    if (!dirty && !moving) return;
    const elapsed = lastFrame ? now - lastFrame : 33;
    if (!dirty && elapsed < 32) {
      frame = requestAnimationFrame(render);
      return;
    }
    if (moving) time += Math.min(elapsed / 1000, 0.08);
    lastFrame = now;
    if (elapsed > 60 && elapsed < 250 && moving) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 45 && quality > 0.65) {
      quality -= 0.15;
      resize();
      slowFrames = 0;
    }
    if (
      previousSeparation !== state.separation ||
      previousRecorded !== state.recorded
    )
      updatePattern();
    const progress =
      state.reduced || state.paused
        ? Math.round(state.progress)
        : state.progress;
    const index = Math.min(3, Math.floor(progress)),
      next = Math.min(3, index + 1),
      mix = smooth(progress - index);
    camera.position.lerpVectors(positions[index], positions[next], mix);
    target.lerpVectors(targets[index], targets[next], mix);
    if (compact) camera.position.z *= 1.35;
    camera.lookAt(target);
    const regionHeight = compact ? Math.round(height * 0.47) : height;
    camera.aspect = width / regionHeight;
    const offset = compact
      ? index === 2
        ? 0.1
        : 0
      : THREE.MathUtils.lerp(offsets[index], offsets[next], mix);
    camera.setViewOffset(
      width,
      regionHeight,
      width * offset,
      0,
      width,
      regionHeight,
    );
    camera.updateProjectionMatrix();
    double.visible = progress > 0.2 && progress < 2.88;
    electric.visible = progress > 2.12;
    const quantum = smooth((progress - 1.65) / 0.35);
    patternMaterial.opacity = (1 - quantum) * 0.9;
    dots.visible = progress > 1.55;
    dotsMaterial.uniforms.uOpacity.value = quantum;
    dotsGeometry.setDrawRange(
      0,
      Math.min(6000, state.reduced ? 6000 : (state.detections ?? 80)),
    );
    waveMaterial.uniforms.uOpacity.value = 1 - quantum;
    waveMaterial.uniforms.uTime.value = moving ? time : 2.5;
    if (electric.visible) {
      const color = new THREE.Color(...wavelengthRGB(state.wavelength));
      energyBeam.children.forEach((child) => {
        ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).color.copy(
          color,
        );
      });
      const energy = photoelectric(state.wavelength);
      electrons.visible = energy.emits;
      const speed = 0.2 + Math.sqrt(energy.maximumKineticEnergy) * 0.35;
      for (let i = 0; i < 36; i++) {
        const t = ((moving ? time * speed : 0.32) + i / 36) % 1;
        const point = impact.clone().lerp(collector, t);
        point.y += Math.sin(i * 5.7) * 0.12 * (1 - t);
        point.x += Math.cos(i * 3.9) * 0.08 * (1 - t);
        electronPositions.set(point.toArray(), i * 3);
      }
      electronGeometry.attributes.position.needsUpdate = true;
    }
    renderer.setViewport(0, 0, width, height);
    renderer.clear();
    renderer.setViewport(
      0,
      compact ? Math.round(height * 0.045) : 0,
      width,
      regionHeight,
    );
    renderer.render(scene, camera);
    dirty = false;
    if (moving) frame = requestAnimationFrame(render);
  }
  function invalidate() {
    dirty = true;
    if (!disposed && !frame) frame = requestAnimationFrame(render);
  }
  invalidate();
  return {
    invalidate,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) geometries.add(mesh.geometry);
        if (mesh.material)
          (Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]
          ).forEach((m) => materials.add(m));
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      images.forEach((t) => t.dispose());
      patternTexture.dispose();
      renderer.dispose();
    },
  };
}
