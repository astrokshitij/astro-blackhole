"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Count a number up from 0 to `to` the first time it enters the viewport.
 * Ease-out cubic over `duration` ms. Reduced-motion or IntersectionObserver
 * absence snap to the final value. Renders a `<span>` so it slots into any
 * heading without adding block layout.
 */
export function CountUp({
  to,
  suffix = "",
  duration = 1600,
  className = "",
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      const frame = window.requestAnimationFrame(() => setValue(to));
      return () => window.cancelAnimationFrame(frame);
    }
    const reducedMotion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    if (reducedMotion?.matches || typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setValue(to));
      return () => window.cancelAnimationFrame(frame);
    }

    let disposed = false;
    let raf = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          const start = performance.now();
          const tick = (now: number) => {
            if (disposed) return;
            const t = Math.min(1, (now - start) / duration);
            // Ease-out cubic: hits target smoothly, no overshoot.
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(to * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
