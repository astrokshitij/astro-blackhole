import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  /** Upper bound on devicePixelRatio. Defaults to 2. */
  maxPixelRatio?: number;
  /** Upper bound on backing-store pixels. Defaults to 2.6 million. */
  maxPixels?: number;
  /** Geodesic integration steps at full quality. 120 to 220. Defaults to 180. */
  steps?: number;
  /**
   * Moves the shadow away from the centre, in units of screen height.
   * Positive x pushes it right, positive y pushes it up. Eased back toward
   * centre automatically on narrow screens. Defaults to centred.
   */
  offset?: { x: number; y: number };
  /** Above 1 narrows the field of view, enlarging the hole. Defaults to 1. */
  zoom?: number;
  /**
   * Static warm-to-silver mix. `false` (default) is full colour, `true` is
   * full silver, a number in `[0, 1]` picks any point on the ramp. Overridden
   * each frame by `getMonochrome` when it is supplied.
   */
  monochrome?: boolean | number;
  /**
   * Read the current warm-to-silver mix each frame. Return a value in `[0, 1]`
   * where 0 is the warm disk and 1 is silver. Lets a scroll or timeline drive
   * the palette without recreating the renderer.
   */
  getMonochrome?: () => number;
}

export interface BlackHoleRenderer {
  /** Resolves once the first frame is on screen, or immediately for the 2D fallback. */
  ready: Promise<void>;
  dispose(): void;
}

const UNIFORM_NAMES = [
  "uResolution",
  "uTime",
  "uCamera",
  "uSteps",
  "uMotion",
  "uOffset",
  "uZoom",
  "uMono",
] as const;

type UniformName = (typeof UNIFORM_NAMES)[number];
type Uniforms = Record<UniformName, WebGLUniformLocation | null>;

function normaliseMono(value: boolean | number | undefined): number {
  if (typeof value === "number") return Math.min(1, Math.max(0, value));
  return value ? 1 : 0;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log ?? "unknown error"}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  // Shaders can be detached as soon as the program is linked.
  gl.detachShader(program, vertex);
  gl.detachShader(program, fragment);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${log ?? "unknown error"}`);
  }
  return program;
}

/** Static gradient stand-in for browsers without WebGL2. */
function paintFallback(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = Math.max(canvas.clientWidth, 1);
  const height = Math.max(canvas.clientHeight, 1);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = "#04050a";
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.22;

  const halo = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 3.4);
  halo.addColorStop(0, "rgba(255, 186, 104, 0.55)");
  halo.addColorStop(0.35, "rgba(255, 122, 40, 0.18)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.14);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 3.1, 0, Math.PI * 2);
  const disk = ctx.createRadialGradient(0, 0, radius * 1.2, 0, 0, radius * 3.1);
  disk.addColorStop(0, "rgba(255, 244, 232, 0.95)");
  disk.addColorStop(0.45, "rgba(255, 168, 72, 0.65)");
  disk.addColorStop(1, "rgba(120, 40, 8, 0)");
  ctx.fillStyle = disk;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();
}

export function createRenderer(options: RendererOptions): BlackHoleRenderer {
  const {
    canvas,
    maxPixelRatio = 2,
    maxPixels = 2_600_000,
    steps = 180,
    offset = { x: 0, y: 0 },
    zoom = 1,
    monochrome = false,
    getMonochrome,
  } = options;

  const baseMono = normaliseMono(monochrome);
  // Eased actual value the shader sees, so a sudden scroll jump does not snap
  // the palette. Starts at the target to avoid a fade on first paint.
  let monoCurrent = getMonochrome ? Math.min(1, Math.max(0, getMonochrome())) : baseMono;

  let disposed = false;
  let frame = 0;
  let resolveReady: (() => void) | null = null;
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });
  const settle = () => {
    if (readySafety !== 0) {
      clearTimeout(readySafety);
      readySafety = 0;
    }
    if (resolveReady) {
      resolveReady();
      resolveReady = null;
    }
  };
  // `ready` gates the component's fade-in, so it must resolve even if the GPU
  // never gives us a frame. Worst case the canvas fades in showing black.
  let readySafety: ReturnType<typeof setTimeout> | 0 = setTimeout(settle, 2500);

  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    desynchronized: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });

  if (!gl) {
    paintFallback(canvas);
    const onResize = () => paintFallback(canvas);
    window.addEventListener("resize", onResize);
    settle();
    return {
      ready,
      dispose() {
        window.removeEventListener("resize", onResize);
      },
    };
  }

  let program: WebGLProgram | null = null;
  let uniforms: Uniforms | null = null;

  const reducedMotion =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
  const prefersReducedMotion = () => reducedMotion?.matches ?? false;

  // Pointer parallax, eased toward the target so it never snaps.
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  // Adaptive quality: a moving average of frame cost drives both the render
  // scale and the number of integration steps.
  const quality = { scale: 1, steps, frameMs: 16 };
  let visible = true;
  let contextLost = false;
  let width = 0;
  let height = 0;
  let startTime = performance.now();
  let elapsed = 0;
  let lastFrameTime = startTime;

  function setup() {
    if (!gl) return;
    program = link(gl);
    gl.useProgram(program);
    const located = {} as Uniforms;
    for (const name of UNIFORM_NAMES) {
      located[name] = gl.getUniformLocation(program, name);
    }
    uniforms = located;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
  }

  function resize() {
    if (!gl) return false;
    const cssWidth = Math.max(canvas.clientWidth, 1);
    const cssHeight = Math.max(canvas.clientHeight, 1);
    const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio);

    let targetWidth = Math.round(cssWidth * dpr * quality.scale);
    let targetHeight = Math.round(cssHeight * dpr * quality.scale);

    const pixels = targetWidth * targetHeight;
    if (pixels > maxPixels) {
      const shrink = Math.sqrt(maxPixels / pixels);
      targetWidth = Math.max(1, Math.round(targetWidth * shrink));
      targetHeight = Math.max(1, Math.round(targetHeight * shrink));
    }

    if (targetWidth === width && targetHeight === height) return false;
    width = targetWidth;
    height = targetHeight;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    return true;
  }

  function draw(now: number): boolean {
    if (!gl || !uniforms || contextLost || gl.isContextLost()) return false;

    const delta = Math.min(now - lastFrameTime, 100);
    lastFrameTime = now;
    quality.frameMs += (delta - quality.frameMs) * 0.1;

    // Back off above ~22ms a frame, recover below ~13ms. Hysteresis keeps it
    // from oscillating between two scales.
    if (quality.frameMs > 22 && quality.scale > 0.6) {
      quality.scale = Math.max(0.6, quality.scale - 0.05);
      quality.steps = Math.max(110, quality.steps - 6);
      resize();
    } else if (quality.frameMs < 13 && quality.scale < 1) {
      quality.scale = Math.min(1, quality.scale + 0.02);
      quality.steps = Math.min(steps, quality.steps + 2);
      resize();
    }

    const still = prefersReducedMotion();
    if (!still) elapsed = (now - startTime) / 1000;

    pointer.x += (pointer.targetX - pointer.x) * 0.06;
    pointer.y += (pointer.targetY - pointer.y) * 0.06;

    // Ease the palette toward the target so scroll jumps do not snap.
    const monoTarget = getMonochrome
      ? Math.min(1, Math.max(0, getMonochrome()))
      : baseMono;
    monoCurrent += (monoTarget - monoCurrent) * 0.18;
    // Snap once close enough, so the shader receives a clean 0 or 1 at the
    // ends of the ramp rather than a value like 0.9998.
    if (Math.abs(monoTarget - monoCurrent) < 0.001) monoCurrent = monoTarget;

    gl.uniform2f(uniforms.uResolution, width, height);
    gl.uniform1f(uniforms.uTime, elapsed);
    gl.uniform2f(uniforms.uCamera, pointer.x, pointer.y);
    gl.uniform1f(uniforms.uSteps, quality.steps);
    gl.uniform1f(uniforms.uMotion, still ? 0 : 1);
    gl.uniform2f(uniforms.uOffset, offset.x, offset.y);
    gl.uniform1f(uniforms.uZoom, zoom);
    gl.uniform1f(uniforms.uMono, monoCurrent);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  }

  function loop(now: number) {
    if (disposed) return;
    resize();
    // Only fade in once real pixels have landed.
    if (draw(now)) settle();
    if (prefersReducedMotion()) {
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (disposed || frame !== 0) return;
    lastFrameTime = performance.now();
    startTime = performance.now() - elapsed * 1000;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    pointer.targetX = nx * 0.5;
    pointer.targetY = -ny * 0.28;
  };

  const onPointerLeave = () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  };

  const onVisibilityChange = () => {
    if (document.hidden) stop();
    else if (visible) start();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    stop();
    // preventDefault above lets the browser restore it. Nudge a programmatic
    // loss, which the browser will not restore on its own.
    setTimeout(() => {
      if (disposed || !contextLost) return;
      try {
        gl.getExtension("WEBGL_lose_context")?.restoreContext();
      } catch {
        // Not a programmatic loss. Wait for webglcontextrestored instead.
      }
    }, 0);
  };

  const onContextRestored = () => {
    contextLost = false;
    width = 0;
    height = 0;
    try {
      setup();
      resize();
      start();
    } catch {
      paintFallback(canvas);
    }
  };

  const onMotionChange = () => {
    if (prefersReducedMotion()) {
      // Draw one static frame, then idle.
      start();
    } else {
      start();
    }
  };

  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  canvas.addEventListener("pointermove", onPointerMove, { passive: true });
  canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  reducedMotion?.addEventListener?.("change", onMotionChange);

  const resizeObserver =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          if (resize() && frame === 0 && !disposed) start();
        })
      : null;
  resizeObserver?.observe(canvas);

  // Skip the work entirely while the canvas is scrolled out of view.
  const intersectionObserver =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
            if (visible && !document.hidden) start();
            else stop();
          },
          { rootMargin: "120px" },
        )
      : null;
  intersectionObserver?.observe(canvas);

  try {
    setup();
    resize();
    start();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[optimized-black-hole]", error);
    }
    paintFallback(canvas);
    settle();
  }

  return {
    ready,
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion?.removeEventListener?.("change", onMotionChange);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      settle();
      if (program) gl.deleteProgram(program);
      program = null;
      uniforms = null;
      // Only drop the GPU context if this canvas is leaving the document.
      // React Strict Mode runs effect, cleanup, effect again against the SAME
      // canvas node, and loseContext() is queued rather than immediate: the
      // second renderer would acquire a context that dies a tick later and
      // never paints. A connected canvas keeps its context for the remount.
      if (!canvas.isConnected) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    },
  };
}
