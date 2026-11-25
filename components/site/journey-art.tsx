"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { OpticalState, OpticalWorld } from "./optical-world";

const Prism = dynamic(() => import("@/components/ui/prism-hero"), {
  ssr: false,
});

/** An inline optical composition, anchored to its own chapter in normal flow. */
export function JourneyArt({
  chapter,
  paused,
  reduced,
}: {
  chapter: number;
  paused: boolean;
  reduced: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<OpticalWorld | null>(null);
  const state = useRef<OpticalState>({
    progress: chapter,
    rotation: 0,
    paused,
    reduced,
    exposure: chapter === 5 ? 1 : 0,
  });
  const [near, setNear] = useState(chapter === 0),
    [turn, setTurn] = useState(0),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    state.current.paused = paused;
    state.current.reduced = reduced;
    engine.current?.invalidate();
  }, [paused, reduced]);
  useEffect(() => {
    const element = host.current,
      target = canvas.current;
    if (!element) return;
    let active = false,
      cancelled = false,
      frame = 0,
      loading = false;
    const update = () => {
      frame = 0;
      if (!active) return;
      const rect = element.getBoundingClientRect();
      const t = Math.max(
        0,
        Math.min(
          1,
          (innerHeight * 0.85 - rect.top) /
            (innerHeight * 0.7 + rect.height * 0.3),
        ),
      );
      state.current.progress = chapter === 5 ? 5 : chapter + t * 0.82;
      if (chapter < 2) setTurn(t);
      engine.current?.invalidate();
    };
    const ensure = () => {
      if (chapter < 2 || !target || engine.current || loading) return;
      loading = true;
      import("./optical-world")
        .then(({ createOpticalWorld }) => {
          if (!cancelled && active && !engine.current) {
            try {
              engine.current = createOpticalWorld(target, state.current);
              update();
            } catch {
              setFailed(true);
            }
          }
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        })
        .finally(() => {
          loading = false;
        });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        setNear(active);
        if (active) {
          update();
          ensure();
        } else {
          engine.current?.dispose();
          engine.current = null;
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(element);
    const scroll = () => {
      if (active && !frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      engine.current?.dispose();
      engine.current = null;
    };
  }, [chapter]);
  return (
    <div
      className={`journey-art journey-art-${chapter}`}
      ref={host}
      aria-hidden="true"
    >
      {chapter < 2 ? (
        near && (
          <Prism
            key={String(reduced)}
            focus={[0.48, 0.43]}
            compactFocus={[0.43, 0.43]}
            size={0.53}
            rotation={(chapter === 0 ? 0 : -8) + turn * 8}
            incidence={19}
            swing={paused || reduced ? 0 : 0.7}
            dispersion={8}
            exposure={0.9}
            resolution={0.9}
            maxDpr={1.5}
            interactive={false}
            paused={paused || reduced}
          />
        )
      ) : (
        <canvas className="journey-canvas" ref={canvas} />
      )}
      {failed && <div className="journey-art-unavailable" />}
    </div>
  );
}
