"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const DEFAULT_TOTAL_FRAMES = 145;
const DEFAULT_WIDTH = 1440;
const DEFAULT_HEIGHT = 1260;
const STATION_1_RATIO = 17 / 144; // Luminous crystal prism & beam entry

interface JourneyManifest {
  count?: number;
  width?: number;
  height?: number;
}

interface JourneyCanvasProps {
  progress?: number;
  progressRef?: RefObject<number>;
  className?: string;
  totalFrames?: number;
  introSweep?: boolean;
}

function buildPriorityOrder(count: number): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  const push = (idx: number) => {
    if (idx >= 0 && idx < count && !seen.has(idx)) {
      seen.add(idx);
      order.push(idx);
    }
  };

  // Prioritize station hero frames and key sweep frames first
  [17, 0, 43, 71, 96, 116, 143, count - 1].forEach(push);
  for (let stride = 8; stride >= 1; stride = Math.floor(stride / 2)) {
    for (let i = 0; i < count; i += stride) {
      push(i);
    }
  }
  return order;
}

function findClosestLoaded(
  frames: (HTMLImageElement | null)[],
  target: number
): HTMLImageElement | null {
  const direct = frames[target];
  if (direct && direct.complete && direct.naturalWidth > 0) {
    return direct;
  }
  for (let offset = 1; offset < frames.length; offset++) {
    const down = frames[target - offset];
    if (down && down.complete && down.naturalWidth > 0) return down;
    const up = frames[target + offset];
    if (up && up.complete && up.naturalWidth > 0) return up;
  }
  return null;
}

export function JourneyCanvas({
  progress = STATION_1_RATIO,
  progressRef,
  className = "",
  totalFrames = DEFAULT_TOTAL_FRAMES,
  introSweep = true,
}: JourneyCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const fallbackProgressRef = useRef(progress);
  const smoothedProgressRef = useRef<number | null>(null);
  const lastDrawnIdxRef = useRef<number>(-1);
  const boxWidthRef = useRef<number>(720);
  const dirtyRef = useRef(true);
  const hasDrawnRef = useRef(false);
  const wakeRef = useRef<(() => void) | null>(null);

  const [frameCount, setFrameCount] = useState(totalFrames);
  const [manifestReady, setManifestReady] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [hasFirstFrame, setHasFirstFrame] = useState(false);

  fallbackProgressRef.current = progress;
  useEffect(() => {
    wakeRef.current?.();
  }, [progress]);

  useEffect(() => {
    let active = true;
    fetch("/frames/journey/manifest.json", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<JourneyManifest>) : null))
      .then((manifest) => {
        if (!active || !manifest) return;
        if (typeof manifest.count === "number" && manifest.count > 0) {
          setFrameCount(manifest.count);
        }
        if (
          typeof manifest.width === "number" &&
          typeof manifest.height === "number" &&
          manifest.width > 0 &&
          manifest.height > 0
        ) {
          setDimensions({ width: manifest.width, height: manifest.height });
        }
      })
      .catch(() => {
        // Fallback to defaults when manifest is unavailable.
      })
      .finally(() => {
        if (active) setManifestReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const updateWidth = () => {
      const w = el.clientWidth;
      if (w > 0) {
        boxWidthRef.current = w;
        dirtyRef.current = true;
        wakeRef.current?.();
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!manifestReady) return;
    let cancelled = false;
    const frames: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    framesRef.current = frames;
    lastDrawnIdxRef.current = -1;
    dirtyRef.current = true;

    const priority = buildPriorityOrder(frameCount);
    let cursor = 0;
    const concurrency = 6;

    const loadNext = () => {
      if (cancelled || cursor >= priority.length) return;
      const idx = priority[cursor++];
      const img = new Image();
      const numStr = String(idx).padStart(3, "0");
      img.decoding = "async";
      img.src = `/frames/journey/f_${numStr}.webp`;

      const commitDecoded = () => {
        if (cancelled) return;
        if (img.naturalWidth > 0) {
          frames[idx] = img;
          const currentTargetIdx = Math.round(
            (smoothedProgressRef.current ?? STATION_1_RATIO) *
              Math.max(0, frameCount - 1)
          );
          if (
            lastDrawnIdxRef.current < 0 ||
            Math.abs(idx - currentTargetIdx) <= 2
          ) {
            dirtyRef.current = true;
            wakeRef.current?.();
          }
        }
        loadNext();
      };

      img.onload = () => {
        if (typeof img.decode === "function") {
          img.decode().then(commitDecoded, commitDecoded);
        } else {
          commitDecoded();
        }
      };
      img.onerror = () => {
        if (!cancelled) loadNext();
      };
    };

    for (let w = 0; w < concurrency; w++) {
      loadNext();
    }

    return () => {
      cancelled = true;
    };
  }, [frameCount, manifestReady]);

  useEffect(() => {
    let rafId = 0;
    let running = false;
    let lastTime = performance.now();
    const introStart = performance.now();
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldSweepIntro = introSweep && !reducedMotion;

    const tick = (now: number) => {
      rafId = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const rawTarget = progressRef
        ? progressRef.current
        : fallbackProgressRef.current;
      let target = Math.max(0, Math.min(1, rawTarget));

      // On first arrival near top of page, play frames 0 -> f_017 smoothly so light refracts live
      let introActive = false;
      if (shouldSweepIntro && window.scrollY < 48) {
        const elapsed = (now - introStart) / 1350;
        if (elapsed < 1) {
          const easeOut = 1 - Math.pow(1 - elapsed, 3);
          target = Math.max(target, easeOut * STATION_1_RATIO);
          introActive = true;
        }
      }

      if (smoothedProgressRef.current === null || reducedMotion) {
        smoothedProgressRef.current = target;
      } else if (introActive) {
        smoothedProgressRef.current = target;
      } else {
        const diff = target - smoothedProgressRef.current;
        if (Math.abs(diff) < 0.00025) {
          smoothedProgressRef.current = target;
        } else {
          const alpha = 1 - Math.exp(-20 * dt);
          smoothedProgressRef.current += diff * alpha;
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const maxIdx = Math.max(0, frameCount - 1);
        const targetIdx = Math.round(smoothedProgressRef.current * maxIdx);
        const img = findClosestLoaded(framesRef.current, targetIdx);

        if (img) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const targetW = Math.max(
            320,
            Math.min(img.naturalWidth, Math.round(boxWidthRef.current * dpr))
          );
          const targetH = Math.round(
            targetW * (img.naturalHeight / img.naturalWidth)
          );

          const sizeChanged =
            canvas.width !== targetW || canvas.height !== targetH;
          const idxChanged = lastDrawnIdxRef.current !== targetIdx;

          if (dirtyRef.current || sizeChanged || idxChanged) {
            if (sizeChanged) {
              canvas.width = targetW;
              canvas.height = targetH;
              ctxRef.current = null;
            }
            if (!ctxRef.current) {
              ctxRef.current = canvas.getContext("2d", {
                alpha: false,
                desynchronized: true,
              });
            }
            const ctx = ctxRef.current;
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              lastDrawnIdxRef.current = framesRef.current[targetIdx]
                ? targetIdx
                : -2;
              dirtyRef.current = false;
              if (!hasDrawnRef.current) {
                hasDrawnRef.current = true;
                setHasFirstFrame(true);
              }
            }
          }
        }
      }

      const stillMoving =
        introActive ||
        dirtyRef.current ||
        (!reducedMotion &&
          smoothedProgressRef.current !== null &&
          Math.abs(target - smoothedProgressRef.current) >= 0.00025);

      if (stillMoving) {
        rafId = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    wakeRef.current = wake;
    wake();

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake, { passive: true });

    return () => {
      running = false;
      wakeRef.current = null;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
    };
  }, [frameCount, progressRef, introSweep]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-[#08090c] overflow-hidden ${className}`}
    >
      {/* SSR instant hero poster eliminates spinner flash before WebPs decode */}
      <img
        src="/frames/journey/f_017.webp"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className={`pointer-events-none absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
          hasFirstFrame ? "opacity-0" : "opacity-100"
        }`}
      />
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className={`relative w-full h-full object-contain transition-opacity duration-150 ${
          hasFirstFrame ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 88% at 50% 50%, transparent 64%, rgba(8, 9, 12, 0.5) 84%, #08090c 100%)",
        }}
      />
    </div>
  );
}
