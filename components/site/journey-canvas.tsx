"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const DEFAULT_TOTAL_FRAMES = 145;
const DEFAULT_WIDTH = 1440;
const DEFAULT_HEIGHT = 1260;
const VOID_BG = "#08090c";

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

  push(0);
  push(count - 1);
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
  progress = 0,
  progressRef,
  className = "",
  totalFrames = DEFAULT_TOTAL_FRAMES,
}: JourneyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const fallbackProgressRef = useRef(progress);
  const smoothedProgressRef = useRef<number | null>(null);
  const lastRenderedFloatRef = useRef<number>(-1);
  const dirtyRef = useRef(true);
  const [frameCount, setFrameCount] = useState(totalFrames);
  const [manifestReady, setManifestReady] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [loadedCount, setLoadedCount] = useState(0);

  fallbackProgressRef.current = progress;

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
        // Fallback to default frame count when manifest is unavailable.
      })
      .finally(() => {
        if (active) setManifestReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!manifestReady) return;
    let cancelled = false;
    const frames: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    framesRef.current = frames;
    lastRenderedFloatRef.current = -1;
    dirtyRef.current = true;
    setLoadedCount(0);

    const priority = buildPriorityOrder(frameCount);
    let loaded = 0;
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
          loaded += 1;
          dirtyRef.current = true;
          setLoadedCount(loaded);
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
    let lastTime = performance.now();
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const rawTarget = progressRef ? progressRef.current : fallbackProgressRef.current;
      const target = Math.max(0, Math.min(1, rawTarget));

      if (smoothedProgressRef.current === null || reducedMotion) {
        smoothedProgressRef.current = target;
      } else {
        const diff = target - smoothedProgressRef.current;
        if (Math.abs(diff) < 0.0002) {
          smoothedProgressRef.current = target;
        } else {
          const alpha = 1 - Math.exp(-10 * dt);
          smoothedProgressRef.current += diff * alpha;
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const maxIdx = Math.max(0, frameCount - 1);
        const floatIdx = smoothedProgressRef.current * maxIdx;
        const loIdx = Math.floor(floatIdx);
        const hiIdx = Math.min(maxIdx, loIdx + 1);
        const frac = floatIdx - loIdx;

        const imgLo = findClosestLoaded(framesRef.current, loIdx);
        const exactHi = framesRef.current[hiIdx];
        const imgHi =
          exactHi && exactHi.complete && exactHi.naturalWidth > 0 ? exactHi : null;

        if (imgLo) {
          const sizeChanged =
            canvas.width !== imgLo.naturalWidth || canvas.height !== imgLo.naturalHeight;
          const floatMoved = Math.abs(lastRenderedFloatRef.current - floatIdx) > 0.002;

          if (dirtyRef.current || sizeChanged || floatMoved) {
            if (sizeChanged) {
              canvas.width = imgLo.naturalWidth;
              canvas.height = imgLo.naturalHeight;
            }
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.globalCompositeOperation = "source-over";
              ctx.globalAlpha = 1;
              ctx.drawImage(imgLo, 0, 0, canvas.width, canvas.height);

              if (imgHi && imgHi !== imgLo && frac > 0.01 && !reducedMotion) {
                ctx.globalAlpha = frac;
                ctx.drawImage(imgHi, 0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1;
              }

              // Lift pure black render void cleanly to match page #08090c
              ctx.globalCompositeOperation = "lighten";
              ctx.fillStyle = VOID_BG;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.globalCompositeOperation = "source-over";

              lastRenderedFloatRef.current = floatIdx;
              dirtyRef.current = false;
            }
          }
        }
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [frameCount, progressRef]);

  return (
    <div
      className={`relative w-full h-full bg-transparent overflow-hidden ${className}`}
      style={{
        maskImage:
          "radial-gradient(ellipse 88% 86% at 50% 50%, #000 62%, rgba(0,0,0,0.5) 82%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 88% 86% at 50% 50%, #000 62%, rgba(0,0,0,0.5) 82%, transparent 100%)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full object-contain"
      />
      {loadedCount < 1 && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none transition-opacity">
          <div className="w-6 h-6 border-2 border-[#f0b545] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
