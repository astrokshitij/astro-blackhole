"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const DEFAULT_TOTAL_FRAMES = 145;
const DEFAULT_WIDTH = 1440;
const DEFAULT_HEIGHT = 1260;
const STATION_1_RATIO = 26 / 144;
const STATION_KEY_RATIOS = [43 / 144, 71 / 144, 96 / 144, 116 / 144, 143 / 144];
const INTRO_DURATION_MS = 2400;
const LOOP_HOLD_MS = 1000;
const REPLAY_SCROLL_GRACE_MS = 1400;

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
  maxFrameCount?: number;
  introSweep?: boolean;
  replayNonce?: number;
  loopIntro?: boolean;
  skipScrollControl?: boolean;
}

function getStation1Index(count: number, hasMaxCap: boolean): number {
  const maxIdx = Math.max(0, count - 1);
  if (hasMaxCap) return maxIdx;
  return Math.min(maxIdx, Math.round(STATION_1_RATIO * maxIdx));
}

function buildPriorityOrder(count: number, hasMaxCap: boolean): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  const push = (idx: number) => {
    if (idx >= 0 && idx < count && !seen.has(idx)) {
      seen.add(idx);
      order.push(idx);
    }
  };

  const station1Idx = getStation1Index(count, hasMaxCap);

  // Load intro sweep frames (0..station1Idx) first so light->mirror->prism->rainbow plays smoothly
  for (let i = 0; i <= station1Idx; i += 2) {
    push(i);
  }
  for (let i = 1; i <= station1Idx; i += 2) {
    push(i);
  }

  // Then load remaining station key milestones (ratio-normalized for 145 or 289 frames)
  const maxIdx = Math.max(1, count - 1);
  STATION_KEY_RATIOS.map((r) => Math.round(r * maxIdx)).forEach(push);
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
  progressRef,
  className = "",
  totalFrames = DEFAULT_TOTAL_FRAMES,
  maxFrameCount,
  introSweep = true,
  replayNonce = 0,
  loopIntro = false,
  skipScrollControl = false,
}: JourneyCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const fallbackProgressRef = useRef(progress ?? 0);
  const smoothedProgressRef = useRef<number | null>(null);
  const lastDrawnImgRef = useRef<HTMLImageElement | null>(null);
  const boxSizeRef = useRef<{ w: number; h: number }>({ w: 720, h: 630 });
  const dirtyRef = useRef(true);
  const hasDrawnRef = useRef(false);
  const wakeRef = useRef<(() => void) | null>(null);

  const introReadyRef = useRef(false);
  const introActiveRef = useRef(false);
  const introStartRef = useRef(0);
  const replayGraceUntilRef = useRef(0);
  const loopIntroRef = useRef(loopIntro);
  loopIntroRef.current = loopIntro;

  const [frameCount, setFrameCount] = useState(maxFrameCount ?? totalFrames);
  const [manifestReady, setManifestReady] = useState(Boolean(maxFrameCount));
  const [dimensions, setDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [hasFirstFrame, setHasFirstFrame] = useState(false);

  if (typeof progress === "number") {
    fallbackProgressRef.current = progress;
  }

  useEffect(() => {
    wakeRef.current?.();
  }, [progress, loopIntro]);

  useEffect(() => {
    if (replayNonce <= 0) return;
    const now = performance.now();
    replayGraceUntilRef.current = now + REPLAY_SCROLL_GRACE_MS;
    introActiveRef.current = true;
    introStartRef.current = now;
    smoothedProgressRef.current = 0;
    dirtyRef.current = true;
    wakeRef.current?.();
  }, [replayNonce]);

  useEffect(() => {
    if (maxFrameCount) {
      setFrameCount(maxFrameCount);
      setManifestReady(true);
      return;
    }
    let active = true;
    fetch("/frames/journey/manifest.json")
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
  }, [maxFrameCount]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const updateSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        boxSizeRef.current = { w, h };
        dirtyRef.current = true;
        wakeRef.current?.();
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!manifestReady) return;
    let cancelled = false;
    const frames: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    framesRef.current = frames;
    lastDrawnImgRef.current = null;
    introReadyRef.current = false;
    dirtyRef.current = true;

    const station1Idx = getStation1Index(frameCount, Boolean(maxFrameCount));
    const checkpoints = [
      0,
      Math.round(station1Idx * 0.31),
      Math.round(station1Idx * 0.62),
      station1Idx,
    ];
    const priority = buildPriorityOrder(frameCount, Boolean(maxFrameCount));
    let cursor = 0;
    const concurrency = 6;

    const checkIntroReady = () => {
      if (introReadyRef.current) return;
      const allCheckpointsLoaded = checkpoints.every(
        (idx) => frames[idx] && frames[idx]!.naturalWidth > 0
      );
      if (allCheckpointsLoaded) {
        introReadyRef.current = true;
        if (introActiveRef.current) {
          introStartRef.current = performance.now();
        }
        dirtyRef.current = true;
        wakeRef.current?.();
      }
    };

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
          checkIntroReady();
          const currentTargetIdx = Math.round(
            (smoothedProgressRef.current ?? 0) * Math.max(0, frameCount - 1)
          );
          if (!hasDrawnRef.current || Math.abs(idx - currentTargetIdx) <= 2) {
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
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const station1Idx = getStation1Index(frameCount, Boolean(maxFrameCount));
    const station1Ratio = station1Idx / Math.max(1, frameCount - 1);

    if (
      introSweep &&
      !reducedMotion &&
      (skipScrollControl || (typeof window !== "undefined" && window.scrollY < 48))
    ) {
      introActiveRef.current = true;
      introStartRef.current = performance.now();
      smoothedProgressRef.current = 0;
    } else {
      introActiveRef.current = false;
      smoothedProgressRef.current = station1Ratio;
    }

    const tick = (now: number) => {
      rafId = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const userScrolledAway =
        !skipScrollControl &&
        window.scrollY >= 48 &&
        now >= replayGraceUntilRef.current;
      if (userScrolledAway && introActiveRef.current) {
        introActiveRef.current = false;
      }

      const rawTarget = progressRef
        ? progressRef.current
        : fallbackProgressRef.current;
      let target = Math.max(0, Math.min(1, rawTarget));
      if (reducedMotion && target < station1Ratio) {
        target = station1Ratio;
      }

      let introAnimating = false;
      if (!userScrolledAway && !reducedMotion) {
        if (!introReadyRef.current && introActiveRef.current) {
          // Hold frame 0 while the first intro batch decodes so the light sweep starts from dark
          target = 0;
          introAnimating = true;
        } else if (introActiveRef.current) {
          const elapsedMs = now - introStartRef.current;
          if (elapsedMs < INTRO_DURATION_MS) {
            const p = elapsedMs / INTRO_DURATION_MS;
            const eased = p * p * (3 - 2 * p);
            target = eased * station1Ratio;
            introAnimating = true;
          } else if (loopIntroRef.current) {
            if (elapsedMs < INTRO_DURATION_MS + LOOP_HOLD_MS) {
              target = station1Ratio;
              introAnimating = true;
            } else {
              introStartRef.current = now;
              target = 0;
              introAnimating = true;
            }
          } else {
            introActiveRef.current = false;
            target = station1Ratio;
          }
        } else if (loopIntroRef.current) {
          introActiveRef.current = true;
          introStartRef.current = now;
          target = 0;
          introAnimating = true;
        }
      }

      if (smoothedProgressRef.current === null || reducedMotion || introAnimating) {
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
          const ratio = img.naturalHeight / img.naturalWidth;
          const maxWByWidth = boxSizeRef.current.w * dpr;
          const maxWByHeight = (boxSizeRef.current.h * dpr) / ratio;
          const targetW = Math.max(
            320,
            Math.min(img.naturalWidth, Math.round(Math.min(maxWByWidth, maxWByHeight)))
          );
          const targetH = Math.round(targetW * ratio);

          const sizeChanged =
            canvas.width !== targetW || canvas.height !== targetH;
          const imgChanged = lastDrawnImgRef.current !== img;

          if (dirtyRef.current || sizeChanged || imgChanged) {
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
              lastDrawnImgRef.current = img;
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
        introAnimating ||
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

    if (!skipScrollControl) {
      window.addEventListener("scroll", wake, { passive: true });
    }
    window.addEventListener("resize", wake, { passive: true });

    return () => {
      running = false;
      wakeRef.current = null;
      if (rafId) cancelAnimationFrame(rafId);
      if (!skipScrollControl) {
        window.removeEventListener("scroll", wake);
      }
      window.removeEventListener("resize", wake);
    };
  }, [frameCount, progressRef, introSweep, skipScrollControl]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-[#08090c] overflow-hidden ${className}`}
    >
      {/* Initial dark prism silhouette poster until 0->26 intro frames decode */}
      <img
        src="/frames/journey/f_000.webp"
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
