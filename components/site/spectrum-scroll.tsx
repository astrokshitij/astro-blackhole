"use client";
import { useEffect, useRef } from "react";

/**
 * The light that leaves the hero prism keeps travelling down the page.
 *
 * A fixed layer behind the home sections holds a dim fan of spectrum light
 * anchored above the top-right corner, where the prism sits. Scrolling widens
 * and turns the fan, as dispersed light spreads with distance. Only a CSS
 * variable changes per frame; the fan moves by transform and opacity, so the
 * gradient is painted once and never repainted while scrolling.
 *
 * Kept dim enough that every text colour still clears 4.5:1 over it.
 */
export function SpectrumScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let heroH = 1;
    let range = 1;

    const measure = () => {
      const hero = document.querySelector<HTMLElement>(".home-hero");
      heroH = Math.max(1, hero?.offsetHeight ?? window.innerHeight);
      range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const smooth = (x: number) => {
      const t = Math.min(1, Math.max(0, x));
      return t * t * (3 - 2 * t);
    };
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      // Fades in as the hero leaves, spreads over the whole page.
      el.style.setProperty("--spectrum-o", (smooth(y / (heroH * 0.85))).toFixed(3));
      el.style.setProperty("--spectrum-p", Math.min(1, Math.max(0, y / range)).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Images and fonts change the page height after first paint.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="spectrum-scroll" aria-hidden="true">
      <div className="spectrum-fan" />
      <div className="spectrum-fan spectrum-fan--soft" />
    </div>
  );
}
