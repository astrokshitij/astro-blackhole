"use client";

import { useEffect, useRef, useState } from "react";

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
  progress: number;
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
  progress,
  className = "",
  totalFrames = DEFAULT_TOTAL_FRAMES,
}: JourneyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const progressRef = useRef(progress);
  const lastRenderedIdxRef = useRef<number>(-1);
  const [frameCount, setFrameCount] = useState(totalFrames);
  const [manifestReady, setManifestReady] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [loadedCount, setLoadedCount] = useState(0);

  progressRef.current = progress;

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
    lastRenderedIdxRef.current = -1;
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

      const done = () => {
        if (cancelled) return;
        if (img.naturalWidth > 0) {
          frames[idx] = img;
          loaded += 1;
          setLoadedCount(loaded);
          if (idx === 0 || lastRenderedIdxRef.current === -1) {
            lastRenderedIdxRef.current = -1;
          }
        }
        loadNext();
      };

      img.onload = done;
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

    const renderFrame = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const clamped = Math.max(0, Math.min(1, progressRef.current));
        const maxIdx = Math.max(0, frameCount - 1);
        const targetIdx = Math.round(clamped * maxIdx);
        const img = findClosestLoaded(framesRef.current, targetIdx);

        if (img) {
          const idxChanged = lastRenderedIdxRef.current !== targetIdx;
          const sizeChanged =
            canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight;

          if (idxChanged || sizeChanged || lastRenderedIdxRef.current === -1) {
            if (sizeChanged) {
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
            }
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.globalCompositeOperation = "source-over";
              ctx.fillStyle = VOID_BG;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.globalCompositeOperation = "lighten";
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              ctx.globalCompositeOperation = "source-over";
              lastRenderedIdxRef.current = framesRef.current[targetIdx] ? targetIdx : -2;
            }
          }
        }
      }
      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [frameCount]);

  return (
    <div
      className={`relative w-full h-full bg-transparent overflow-hidden ${className}`}
      style={{
        maskImage:
          "radial-gradient(ellipse 94% 92% at 50% 50%, #000 72%, rgba(0,0,0,0.65) 88%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 94% 92% at 50% 50%, #000 72%, rgba(0,0,0,0.65) 88%, transparent 100%)",
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
