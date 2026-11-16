"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const Prism = dynamic(() => import("@/components/ui/prism-hero"), {
  ssr: false,
});
/** The page background shows before hydration and whenever WebGL is unavailable. */
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
    <div className="simulation-host" aria-hidden="true">
      <Prism key={String(reduced)} paused={reduced} />
    </div>
  );
}
