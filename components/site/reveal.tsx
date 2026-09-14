"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fade-and-rise a child block into view once it enters the viewport, then
 * hold. Optional stagger via `delay` lets a row of siblings enter one after
 * another. Reduced-motion drops both the fade and the translate and shows
 * the child at its final state.
 *
 * Applied around cards, section headings and other tile-shaped blocks so
 * the page feels alive rather than pre-rendered when the reader scrolls.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  yOffset = 24,
  duration = 700,
  once = true,
}: {
  children: React.ReactNode;
  /** Milliseconds to wait after entering the viewport before starting. */
  delay?: number;
  /** Class on the outer wrapper (e.g. "h-full" for grid children). */
  className?: string;
  /** Pixels the child rises from before landing. */
  yOffset?: number;
  /** Fade + slide duration in ms. */
  duration?: number;
  /** Fire once and hold; set false to fade back out when scrolling away. */
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const reducedMotion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    if (reducedMotion?.matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${yOffset}px)`,
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
        transitionDelay: `${delay}ms`,
        willChange: shown ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
