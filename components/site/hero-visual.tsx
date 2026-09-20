"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const Simulation = dynamic(
  () => import("@/components/ui/black-hole-hero-section"),
  { ssr: false },
);
/** CSS paints a still before hydration and whenever WebGL is unavailable. */
export function HeroVisual() {
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
          midColor="#E99542"
          coolColor="#8C351B"
          hotColor="#FFF0D4"
          glow={0.3}
          spinSpeed={0.025}
          maxDpr={1.25}
          resolution={0.6}
          steps={220}
          paused={reduced}
        />
      </div>
    </>
  );
}
