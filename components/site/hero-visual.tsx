"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const Simulation = dynamic(
  () => import("@/components/ui/black-hole-hero-section"),
  { ssr: false },
);
/** CSS paints a still before hydration and whenever WebGL is unavailable. */
export function HeroVisual() {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <>
      <div className="simulation-host" aria-hidden="true">
        <Simulation
          key={String(reduced)}
          focus={[0.68, 0.43]}
          scrim="none"
          midColor="#CBA775"
          coolColor="#594332"
          hotColor="#F2EFE8"
          glow={0.3}
          spinSpeed={0.025}
          maxDpr={1.25}
          resolution={0.6}
          steps={220}
          paused={paused || reduced}
        />
      </div>
      <button
        className="motion-toggle"
        type="button"
        aria-pressed={paused || reduced}
        onClick={() => setPaused((value) => !value)}
        disabled={reduced}
      >
        {reduced
          ? "Still view · Reduced motion"
          : paused
            ? "Play motion"
            : "Pause motion"}
      </button>
    </>
  );
}
