"use client";

import { useEffect, useRef, useState } from "react";
import { createRenderer } from "./optimized-black-hole-utils/renderer";

export interface BlackHoleProps {
  /** Push the shadow off centre, in units of screen height. Eased back toward
   * centre on narrow screens so it never slides off a phone. */
  offset?: { x: number; y: number };
  /** Above 1 narrows the field of view, enlarging the hole. */
  zoom?: number;
  /** Silver rather than amber. `true` locks to silver; a number in `[0, 1]`
   * picks any point on the warm-to-silver ramp. */
  monochrome?: boolean | number;
  /** Drive the warm-to-silver ramp from window scroll: full colour when the
   * canvas is at the top of the viewport, full silver by the time roughly
   * seven-tenths of it has scrolled out of view. Overrides `monochrome`.
   * Ignored under `prefers-reduced-motion`, which locks to silver. */
  scrollColorShift?: boolean;
  className?: string;
}

/** Standalone host for the optimized black-hole renderer formerly used by the homepage. */
export function Example({
  offset,
  zoom,
  monochrome,
  scrollColorShift = false,
  className = "",
}: BlackHoleProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  // Live palette value read by the renderer each frame. When scrollColorShift
  // is on, a scroll listener updates it; otherwise it holds the static value.
  const monoTargetRef = useRef(0);

  // Primitives, so the effect does not re-run on a fresh object literal.
  const offsetX = offset?.x ?? 0;
  const offsetY = offset?.y ?? 0;
  const staticMono =
    typeof monochrome === "number"
      ? Math.min(1, Math.max(0, monochrome))
      : monochrome
      ? 1
      : 0;

  // Keep the ref in sync when static settings change and scroll is off.
  useEffect(() => {
    if (!scrollColorShift) monoTargetRef.current = staticMono;
  }, [scrollColorShift, staticMono]);

  // Scroll listener that maps canvas position in the viewport to 0..1.
  useEffect(() => {
    if (!scrollColorShift) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      if (reducedMotion?.matches) {
        monoTargetRef.current = 1;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      // Fully coloured while the canvas is anchored to the top of the
      // viewport; fully silver by the time roughly 70% of it has scrolled off.
      const scrolled = Math.max(0, -rect.top);
      const range = Math.max(1, rect.height * 0.7);
      monoTargetRef.current = Math.min(1, scrolled / range);
    };
    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reducedMotion?.addEventListener?.("change", schedule);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion?.removeEventListener?.("change", schedule);
    };
  }, [scrollColorShift]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createRenderer({
      canvas,
      offset: { x: offsetX, y: offsetY },
      zoom,
      monochrome: staticMono,
      getMonochrome: () => monoTargetRef.current,
    });
    void renderer.ready.then(() => {
      if (!cancelled) setIsReady(true);
    });
    return () => {
      cancelled = true;
      renderer.dispose();
    };
  }, [offsetX, offsetY, zoom, staticMono]);

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
