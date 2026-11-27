"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface OpticalSceneController {
  setProgress: (progress: number) => void;
}

interface OpticalBenchSceneProps {
  onControllerReady?: (ctrl: OpticalSceneController) => void;
  className?: string;
}

export function OpticalBenchScene({
  onControllerReady,
  className = "",
}: OpticalBenchSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<OpticalSceneController | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090c);
    scene.fog = new THREE.FogExp2(0x08090c, 0.045);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(
      42,
      width / height,
      0.1,
      50
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Beam gold accent rim light
    const goldRim = new THREE.PointLight(0xf0b545, 4, 15);
    goldRim.position.set(-3, 3, -1);
    scene.add(goldRim);

    // Cool cyan/blue rim light for contrast
    const coolRim = new THREE.PointLight(0x4080ff, 3, 15);
    coolRim.position.set(6, 4, -4);
    scene.add(coolRim);

    // --- Optical Bench Rail / Base ---
    const benchGroup = new THREE.Group();
    scene.add(benchGroup);

    // Dark brushed aluminum rail
    const railGeo = new THREE.BoxGeometry(1.2, 0.15, 12);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x0f1117,
      roughness: 0.35,
      metalness: 0.85,
    });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(2.4, -0.7, -2.5);
    benchGroup.add(rail);

    // Precision measurement ticks on the rail
    const tickMat = new THREE.MeshBasicMaterial({ color: 0x333b4d });
    for (let i = -5.5; i <= 5.5; i += 0.5) {
      const tickGeo = new THREE.BoxGeometry(0.12, 0.01, 0.02);
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(1.9, -0.62, -2.5 + i);
      benchGroup.add(tick);
    }

    // Helper: Optical Post & Collar
    const createPost = (x: number, z: number, height = 0.9) => {
      const postGroup = new THREE.Group();
      // Collar base
      const baseGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.12, 24);
      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x181c24,
        roughness: 0.25,
        metalness: 0.9,
      });
      const base = new THREE.Mesh(baseGeo, metalMat);
      base.position.set(x, -0.56, z);
      postGroup.add(base);

      // Vertical rod
      const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, height, 16);
      const rod = new THREE.Mesh(rodGeo, metalMat);
      rod.position.set(x, -0.56 + height / 2, z);
      postGroup.add(rod);

      // Knurled thumb screw
      const screwGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16);
      const screwMat = new THREE.MeshStandardMaterial({
        color: 0xf0b545,
        metalness: 0.7,
        roughness: 0.3,
      });
      const screw = new THREE.Mesh(screwGeo, screwMat);
      screw.rotation.z = Math.PI / 2;
      screw.position.set(x - 0.14, -0.4, z);
      postGroup.add(screw);

      benchGroup.add(postGroup);
      return postGroup;
    };

    // --- Station 1: The Triangular Glass Prism ---
    createPost(0, 0, 0.8);

    // Create equilateral triangular prism
    const prismShape = new THREE.Shape();
    const r = 0.75;
    const a0 = Math.PI / 2;
    const a1 = a0 + (2 * Math.PI) / 3;
    const a2 = a1 + (2 * Math.PI) / 3;
    prismShape.moveTo(r * Math.cos(a0), r * Math.sin(a0));
    prismShape.lineTo(r * Math.cos(a1), r * Math.sin(a1));
    prismShape.lineTo(r * Math.cos(a2), r * Math.sin(a2));
    prismShape.closePath();

    const extrudeSettings = {
      depth: 0.85,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    };
    const prismGeo = new THREE.ExtrudeGeometry(prismShape, extrudeSettings);
    prismGeo.center();

    // Physical transmissive glass with Snell's law refraction
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.04,
      ior: 1.54, // Crown glass
      thickness: 1.2,
      specularIntensity: 1.5,
      specularColor: 0xffffff,
      dispersion: 0.07, // Three.js native chromatic dispersion
      attenuationColor: 0xffffff,
      attenuationDistance: 2.0,
    });
    const prismMesh = new THREE.Mesh(prismGeo, glassMat);
    prismMesh.position.set(0, 0.45, 0);
    prismMesh.rotation.y = 0.4;
    scene.add(prismMesh);

    // --- Light Beams & Laser Optics ---
    const beamGroup = new THREE.Group();
    scene.add(beamGroup);

    // Laser Source Housing
    const laserHousingGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 24);
    laserHousingGeo.rotateZ(Math.PI / 2);
    const laserHousingMat = new THREE.MeshStandardMaterial({
      color: 0x12151b,
      roughness: 0.3,
      metalness: 0.8,
    });
    const laserHousing = new THREE.Mesh(laserHousingGeo, laserHousingMat);
    laserHousing.position.set(-2.8, 0.45, 0.9);
    laserHousing.rotation.y = -0.3;
    scene.add(laserHousing);
    createPost(-2.8, 0.9, 0.8);

    const createLaserBeam = (
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      radius = 0.02,
      color = 0xffffff,
      opacity = 0.85
    ) => {
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      const group = new THREE.Group();
      const coreGeo = new THREE.CylinderGeometry(radius, radius, len, 12);
      coreGeo.rotateX(Math.PI / 2);
      const m1 = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
      });
      const core = new THREE.Mesh(coreGeo, m1);

      const haloGeo = new THREE.CylinderGeometry(radius * 2.8, radius * 2.8, len, 12);
      haloGeo.rotateX(Math.PI / 2);
      const m2 = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: opacity * 0.3,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Mesh(haloGeo, m2);

      group.add(core, halo);
      group.position.copy(mid);
      group.lookAt(p2);
      return group;
    };

    // White incoming beam hitting prism
    const pStart = new THREE.Vector3(-2.45, 0.45, 0.78);
    const pPrism = new THREE.Vector3(-0.2, 0.45, 0.1);
    const incomingBeam = createLaserBeam(pStart, pPrism, 0.022, 0xffffff, 0.9);
    beamGroup.add(incomingBeam);

    // Rainbow Dispersion Fan Exiting the Prism (7 distinct wavelengths)
    const rainbowColors = [
      0xff2b2b, // Red ~650nm
      0xff7b1a, // Orange ~600nm
      0xffd400, // Yellow ~580nm
      0x2be052, // Green ~532nm
      0x00d9ff, // Cyan ~490nm
      0x2e6bfe, // Blue ~450nm
      0x8b32ff, // Violet ~400nm
    ];

    const rainbowRays: THREE.Group[] = [];
    const pExit = new THREE.Vector3(0.2, 0.45, -0.05);

    rainbowColors.forEach((col, idx) => {
      const spread = (idx - 3) * 0.08; // Angular fan
      const target = new THREE.Vector3(2.4, 0.45, -0.8 + spread * 2.2);
      const ray = createLaserBeam(pExit, target, 0.016, col, 0.85);
      rainbowRays.push(ray);
      beamGroup.add(ray);
    });

    // --- Station 2: Monochromator Aperture Plate ---
    createPost(2.4, -0.8, 0.8);
    const slitPlateGeo = new THREE.BoxGeometry(0.06, 1.0, 1.4);
    const darkPlateMat = new THREE.MeshStandardMaterial({
      color: 0x14171f,
      roughness: 0.4,
      metalness: 0.6,
    });
    const slitPlate = new THREE.Mesh(slitPlateGeo, darkPlateMat);
    slitPlate.position.set(2.4, 0.45, -0.8);
    scene.add(slitPlate);

    // Slit aperture hole (subtle illuminated slit opening for the green beam)
    const slitHoleGeo = new THREE.BoxGeometry(0.07, 0.35, 0.04);
    const slitHoleMat = new THREE.MeshBasicMaterial({
      color: 0x2be052,
      blending: THREE.AdditiveBlending,
    });
    const slitHole = new THREE.Mesh(slitHoleGeo, slitHoleMat);
    slitHole.position.set(2.4, 0.45, -0.8);
    scene.add(slitHole);

    // --- Station 3: Collimating Lens & Double Slit ---
    createPost(3.4, -1.8, 0.8);
    // Lens ring
    const lensRingGeo = new THREE.TorusGeometry(0.38, 0.04, 16, 32);
    const lensRingMat = new THREE.MeshStandardMaterial({
      color: 0x1f242e,
      metalness: 0.8,
      roughness: 0.2,
    });
    const lensRing = new THREE.Mesh(lensRingGeo, lensRingMat);
    lensRing.rotation.y = Math.PI / 2;
    lensRing.position.set(3.4, 0.45, -1.8);
    scene.add(lensRing);

    // Biconvex Lens Glass
    const lensGlassGeo = new THREE.SphereGeometry(0.36, 32, 16);
    lensGlassGeo.scale(0.18, 1, 1);
    const lensGlass = new THREE.Mesh(lensGlassGeo, glassMat);
    lensGlass.position.set(3.4, 0.45, -1.8);
    scene.add(lensGlass);

    // Double-slit Plate
    createPost(4.2, -2.6, 0.8);
    const doubleSlitGeo = new THREE.BoxGeometry(0.05, 0.9, 0.9);
    const doubleSlit = new THREE.Mesh(doubleSlitGeo, darkPlateMat);
    doubleSlit.position.set(4.2, 0.45, -2.6);
    scene.add(doubleSlit);

    // The isolated green beam from aperture through lens to double-slit
    const greenBeam1 = createLaserBeam(
      new THREE.Vector3(2.4, 0.45, -0.8),
      new THREE.Vector3(3.4, 0.45, -1.8),
      0.02,
      0x2be052,
      0.95
    );
    const greenBeam2 = createLaserBeam(
      new THREE.Vector3(3.4, 0.45, -1.8),
      new THREE.Vector3(4.2, 0.45, -2.6),
      0.02,
      0x2be052,
      0.95
    );
    beamGroup.add(greenBeam1, greenBeam2);

    // --- Station 4: Quantum Wave Interference Pattern & Detector Screen ---
    createPost(5.2, -3.8, 0.8);
    const screenGeo = new THREE.BoxGeometry(0.08, 1.2, 1.4);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0d1017,
      roughness: 0.6,
      metalness: 0.2,
    });
    const detectorScreen = new THREE.Mesh(screenGeo, screenMat);
    detectorScreen.position.set(5.2, 0.45, -3.8);
    scene.add(detectorScreen);

    // Phosphor Quantum Interference Fringes Texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0d1017";
    ctx.fillRect(0, 0, 512, 512);

    // Render quantum fringes: I = I0 * cos^2(beta) * sinc^2(alpha)
    for (let x = 0; x < 512; x++) {
      const u = (x - 256) / 256;
      const interference = Math.pow(Math.cos(u * Math.PI * 8), 2);
      const diffraction = Math.pow(Math.sin(u * Math.PI * 2.5 + 0.001) / (u * Math.PI * 2.5 + 0.001), 2);
      const intensity = Math.min(1, interference * diffraction * 1.4);
      if (intensity > 0.02) {
        ctx.fillStyle = `rgba(43, 224, 82, ${intensity * 0.95})`;
        ctx.fillRect(x, 60, 1, 392);
        // Individual quantum photon dots
        for (let k = 0; k < 12; k++) {
          if (Math.random() < intensity) {
            const py = 60 + Math.random() * 392;
            ctx.fillStyle = "rgba(180, 255, 190, 0.9)";
            ctx.fillRect(x + (Math.random() - 0.5) * 3, py, 2, 2);
          }
        }
      }
    }

    const fringeTexture = new THREE.CanvasTexture(canvas);
    const fringeMat = new THREE.MeshBasicMaterial({
      map: fringeTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const fringePlaneGeo = new THREE.PlaneGeometry(1.3, 1.1);
    fringePlaneGeo.rotateY(-Math.PI / 2);
    const fringePlane = new THREE.Mesh(fringePlaneGeo, fringeMat);
    fringePlane.position.set(5.15, 0.45, -3.8);
    scene.add(fringePlane);

    // Interference wave fans propagating from double slit to detector
    const fanMat = new THREE.MeshBasicMaterial({
      color: 0x2be052,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const waveFanGeo = new THREE.ConeGeometry(0.8, 1.2, 32, 1, true);
    waveFanGeo.rotateZ(Math.PI / 2);
    const waveFan = new THREE.Mesh(waveFanGeo, fanMat);
    waveFan.position.set(4.7, 0.45, -3.2);
    waveFan.rotation.y = 0.5;
    scene.add(waveFan);

    // --- Floating Optical Dust Field ---
    const dustCount = 350;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3 + 0] = (Math.random() - 0.5) * 8 + 2;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 3 + 0.5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1.5;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xf0b545,
      size: 0.035,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // --- Camera Track & Waypoints ---
    // Smooth Catmull-Rom spline path through the 6 chapters
    const cameraWaypoints = [
      // Chapter 0: Sunlight, close on prism face
      { pos: new THREE.Vector3(1.6, 0.85, 2.3), look: new THREE.Vector3(0, 0.45, 0.1) },
      // Chapter 1: Many Colours, rainbow fan emerges
      { pos: new THREE.Vector3(1.2, 1.4, 2.8), look: new THREE.Vector3(0.8, 0.45, -0.3) },
      // Chapter 2: One Hard Question, aperture slit isolating green
      { pos: new THREE.Vector3(2.3, 1.1, 1.0), look: new THREE.Vector3(2.4, 0.45, -0.8) },
      // Chapter 3: Two Slits, collimating lens & double-slit plate
      { pos: new THREE.Vector3(3.3, 1.2, 0.0), look: new THREE.Vector3(3.8, 0.45, -2.2) },
      // Chapter 4: One Photon at a Time, wave interference propagation
      { pos: new THREE.Vector3(4.1, 1.6, -1.2), look: new THREE.Vector3(4.7, 0.45, -3.2) },
      // Chapter 5: Where It's Likely to Land, detector fringes
      { pos: new THREE.Vector3(4.7, 1.0, -2.5), look: new THREE.Vector3(5.2, 0.45, -3.8) },
    ];

    let currentProgress = 0;
    let targetProgress = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Controller implementation
    const controller: OpticalSceneController = {
      setProgress: (p: number) => {
        targetProgress = Math.max(0, Math.min(1, p));
      },
    };
    controllerRef.current = controller;
    if (onControllerReady) onControllerReady(controller);

    // --- Animation & Render Loop ---
    let rafId = 0;
    let clock = new THREE.Clock();

    const interpolateCamera = (p: number) => {
      const n = cameraWaypoints.length - 1;
      const t = p * n;
      const idx = Math.min(Math.floor(t), n - 1);
      const frac = t - idx;
      // Smootherstep interpolation between waypoints
      const smoothFrac = frac * frac * frac * (frac * (frac * 6 - 15) + 10);

      const w0 = cameraWaypoints[idx];
      const w1 = cameraWaypoints[idx + 1] || w0;

      const basePos = new THREE.Vector3().lerpVectors(w0.pos, w1.pos, smoothFrac);
      const baseLook = new THREE.Vector3().lerpVectors(w0.look, w1.look, smoothFrac);

      // Lateral alternating shift:
      // Desktop: t=0 -> -1 (Right), t=1 -> +1 (Left), t=2 -> -1 (Right), etc.
      // On mobile (width < 900): lateralDist = 0 so visual stays centered.
      const isDesktop = typeof window !== "undefined" && window.innerWidth >= 900;
      const lateralDist = isDesktop ? 0.95 : 0;
      const side = -Math.cos(Math.PI * t); // Smooth cosine wave alternating between -1 and +1

      // Compute camera local right vector
      const dir = new THREE.Vector3().subVectors(baseLook, basePos).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();

      // Shifting camera by right * (side * lateralDist) moves the visual across the screen
      basePos.addScaledVector(right, side * lateralDist);
      baseLook.addScaledVector(right, side * lateralDist);

      // Add gentle mouse parallax
      basePos.x += mouseX * 0.15;
      basePos.y += -mouseY * 0.1;

      // Gentle vertical floating descent
      basePos.y += Math.sin(t * Math.PI) * 0.06;

      camera.position.copy(basePos);
      camera.lookAt(baseLook);

      // Dynamic banking angle during diagonal transit
      if (isDesktop) {
        const bank = Math.sin(Math.PI * t) * (idx % 2 === 0 ? -0.03 : 0.03);
        camera.rotation.z += bank;
      }
    };

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth progress & mouse interpolation
      currentProgress += (targetProgress - currentProgress) * 0.08;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      interpolateCamera(currentProgress);

      // Gentle floating prism breathing
      prismMesh.rotation.y = 0.4 + Math.sin(elapsed * 0.8) * 0.02;
      prismMesh.position.y = 0.45 + Math.sin(elapsed * 1.2) * 0.015;

      // Dust gentle drifting
      const posAttr = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i++) {
        let y = posAttr.getY(i) + Math.sin(elapsed + i) * 0.001;
        if (y > 2.5) y = -0.5;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Dynamic light intensity based on active chapter
      rainbowRays.forEach((ray) => {
        ray.visible = currentProgress > 0.05;
        (ray.children[0] as THREE.Mesh).scale.z = THREE.MathUtils.lerp(
          0.1,
          1.0,
          THREE.MathUtils.clamp((currentProgress - 0.05) / 0.2, 0, 1)
        );
      });

      // Wave fan pulses subtly
      waveFan.visible = currentProgress > 0.55;
      if (waveFan.visible) {
        waveFan.scale.set(
          1 + Math.sin(elapsed * 4) * 0.04,
          1 + Math.sin(elapsed * 4) * 0.04,
          1
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      prismGeo.dispose();
      glassMat.dispose();
      railGeo.dispose();
      railMat.dispose();
      fringeTexture.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, [onControllerReady]);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}
