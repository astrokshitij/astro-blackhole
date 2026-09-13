"use client";

import { useEffect, useRef, useState } from "react";
import { createRenderer } from "./optimized-black-hole-utils/renderer";

export interface BlackHoleProps {
  /** Push the shadow off centre, in units of screen height. Eased back toward
   * centre on narrow screens so it never slides off a phone. */
  offset?: { x: number; y: number };
  /** Above 1 narrows the field of view, enlarging the hole. */
  zoom?: number;
  /** Silver rather than amber. */
  monochrome?: boolean;
  className?: string;
}

/** Standalone host for the optimized black-hole renderer formerly used by the homepage. */
export function Example({
  offset,
  zoom,
  monochrome,
  className = "",
}: BlackHoleProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Primitives, so the effect does not re-run on a fresh object literal.
  const offsetX = offset?.x ?? 0;
  const offsetY = offset?.y ?? 0;

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createRenderer({
      canvas,
      offset: { x: offsetX, y: offsetY },
      zoom,
      monochrome,
    });
    void renderer.ready.then(() => {
      if (!cancelled) setIsReady(true);
    });
    return () => {
      cancelled = true;
      renderer.dispose();
    };
  }, [offsetX, offsetY, zoom, monochrome]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
      <canvas
        ref={canvasRef}
        className={`block h-full w-full touch-none transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default Example;
