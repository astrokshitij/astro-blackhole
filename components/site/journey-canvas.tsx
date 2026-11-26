"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 289; // f_000.webp to f_288.webp

interface JourneyCanvasProps {
  progress: number; // 0.0 to 1.0
  className?: string;
}

export function JourneyCanvas({ progress, className = "" }: JourneyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Preload images
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = [];

    // Prioritize frame 0 for instant initial display
    const firstImg = new Image();
    firstImg.src = "/frames/journey/f_000.webp";
    firstImg.onload = () => {
      if (!isCancelled) {
        images[0] = firstImg;
        setLoadedCount((c) => c + 1);
        drawFrame(0);
      }
    };
    images[0] = firstImg;

    // Load remaining frames
    let loaded = 1;
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, "0");
      img.src = `/frames/journey/f_${numStr}.webp`;
      img.onload = () => {
        if (!isCancelled) {
          loaded++;
          if (loaded % 20 === 0 || loaded === TOTAL_FRAMES) {
            setLoadedCount(loaded);
          }
        }
      };
      images[i] = img;
    }

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, []);

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      // Find nearest loaded frame if current frame is still loading
      for (let offset = 1; offset < 20; offset++) {
        const prev = imagesRef.current[frameIndex - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          ctx.drawImage(prev, 0, 0, canvas.width, canvas.height);
          break;
        }
        const next = imagesRef.current[frameIndex + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          ctx.drawImage(next, 0, 0, canvas.width, canvas.height);
          break;
        }
      }
    }
  };

  // Update target frame when progress changes
  useEffect(() => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    targetFrameRef.current = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(clampedProgress * (TOTAL_FRAMES - 1))
    );
  }, [progress]);

  // Smooth render loop with requestAnimationFrame
  useEffect(() => {
    const renderLoop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;

      if (current !== target) {
        // Direct assignment for instantaneous 0ms response, or 1-step lerp if jump is small
        const diff = target - current;
        const step = Math.abs(diff) > 4 ? Math.round(diff * 0.45) : diff > 0 ? 1 : -1;
        const nextFrame = current + step;

        currentFrameRef.current = nextFrame;
        drawFrame(nextFrame);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={960}
        height={840}
        className="w-full h-full object-cover"
      />
      {loadedCount < 10 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none transition-opacity">
          <div className="w-6 h-6 border-2 border-[#f0b545] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
