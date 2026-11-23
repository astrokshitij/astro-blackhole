"use client";
/**
 * The home page as one light journey. A single fixed canvas renders the
 * optical bench behind six real HTML chapters. Each chapter has an empty
 * `.lj-stage` box; the camera frames the current station inside that box, so
 * the visual sits beside the words on desktop and between them on phones.
 * Native scroll drives everything; nothing is pinned or hijacked.
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LIGHT_JOURNEY } from "@/lib/content";
import { ArrowGlyph } from "@/components/site/icons";
import type { FrameState, LightRenderer, Vec3 } from "./light-journey-gl";

type Station = { pos: Vec3; look: Vec3; radius: number };

/** Camera stations, one per chapter. Art direction lives here. */
const DESKTOP: Station[] = [
  { pos: [1.4, 2.1, 6.0], look: [0.3, 0.98, 0], radius: 1.55 },
  { pos: [2.6, 1.9, 5.2], look: [0.45, 1.02, 0], radius: 1.6 },
  { pos: [1.2, 1.85, 3.6], look: [2.75, 1.12, 0], radius: 0.85 },
  { pos: [3.5, 2.7, 3.1], look: [5.0, 1.05, 0], radius: 1.3 },
  { pos: [4.3, 2.0, 2.9], look: [6.55, 1.15, 0], radius: 1.2 },
  { pos: [4.75, 1.45, 1.9], look: [6.7, 1.2, 0], radius: 1.0 },
];
const MOBILE: Station[] = [
  { pos: [1.1, 2.1, 6.0], look: [0.2, 0.95, 0], radius: 1.6 },
  { pos: [2.4, 1.9, 5.0], look: [0.6, 1.05, 0], radius: 1.6 },
  { pos: [1.2, 1.85, 3.6], look: [2.75, 1.12, 0], radius: 0.8 },
  { pos: [3.5, 2.7, 3.1], look: [5.0, 1.05, 0], radius: 1.25 },
  { pos: [4.5, 2.0, 2.9], look: [6.6, 1.15, 0], radius: 1.1 },
  { pos: [4.9, 1.45, 1.9], look: [6.7, 1.2, 0], radius: 0.95 },
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];

function External({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith("http"))
    return (
      <a className="lj-link" href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  if (href.startsWith("#"))
    return (
      <a className="lj-link" href={href}>
        {children}
      </a>
    );
  return (
    <Link className="lj-link" href={href}>
      {children}
    </Link>
  );
}

export function LightJourney() {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"loading" | "live" | "still">("loading");
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    pausedRef.current = paused;
    kick.current();
  }, [paused]);

  useEffect(() => {
    const el = root.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    let disposed = false;
    let renderer: LightRenderer | null = null;
    let raf = 0;
    let cleanup = () => {};

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = async () => {
      const [{ createLightRenderer, PATH }, { createDetectorScreen, MAX_DETECTIONS }] =
        await Promise.all([import("./light-journey-gl"), import("./light-journey-screen")]);
      if (disposed) return;
      renderer = createLightRenderer(canvas);
      if (!renderer) {
        setMode("still");
        return;
      }
      const r = renderer;
      const screen = createDetectorScreen();
      r.setScreen(screen.canvas);
      setMode("live");

      const sections = Array.from(el.querySelectorAll<HTMLElement>(".lj-chapter"));
      const stages = sections.map((s) => s.querySelector<HTMLElement>(".lj-stage")!);
      const maskEls = Array.from(el.querySelectorAll<HTMLElement>(".lj-mask"));

      const maxScale = Math.min(window.devicePixelRatio || 1, 1.5);
      let scale = maxScale;
      let cssW = 0,
        cssH = 0,
        viewH = 0;
      const resize = () => {
        // The canvas is 100lvh tall so phone toolbars never force a resize.
        cssW = canvas.clientWidth;
        cssH = canvas.clientHeight;
        viewH = window.innerHeight;
        // Phones start lighter; the frame-time governor adjusts from there.
        if (cssW < 900) scale = Math.min(scale, 1.2);
        r.resize(cssW, cssH, scale);
        dirty = true;
      };

      let dirty = true;
      let visible = true;
      let lastFrame = 0;
      let frameAvg = 16;
      const t0 = performance.now();
      let lastStill = 0;

      const frame = (now: number) => {
        raf = 0;
        if (disposed) return;
        const reduced = reduce.matches;
        const animating = !reduced && !pausedRef.current;
        const time = animating ? (now - t0) / 1000 : lastStill;
        if (animating) lastStill = time;

        const H = viewH;
        const centers = stages.map((s) => {
          const b = s.getBoundingClientRect();
          return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height };
        });
        // Which pair of chapters are we between?
        let i = 0;
        while (i < centers.length - 1 && centers[i + 1].y <= H / 2) i++;
        const a = centers[i];
        const b = centers[Math.min(i + 1, centers.length - 1)];
        const span = b.y - a.y;
        const t = i >= centers.length - 1 || span <= 0 ? 0 : clamp01((H / 2 - a.y) / span);
        const e = reduced ? (t < 0.5 ? 0 : 1) : smooth(0.16, 0.84, t);
        const p = i + t;

        const stations = cssW < 900 ? MOBILE : DESKTOP;
        const sa = stations[Math.min(i, stations.length - 1)];
        const sb = stations[Math.min(i + 1, stations.length - 1)];
        // Arc the camera a little higher mid-move so it glides over the bench.
        const lift = Math.sin(e * Math.PI) * 0.35;
        const camPos = mix3(sa.pos, sb.pos, e);
        camPos[1] += lift;

        // Light reveal: an opening sweep, then scroll carries it down the bench.
        const intro = reduced ? 1 : smooth(0.15, 2.8, time);
        let front = mix(PATH.mirror - 3.2, PATH.card + 0.4, intro);
        front = Math.max(front, mix(PATH.card + 0.4, PATH.lens + 0.05, smooth(1.45, 2.0, p)));
        front = Math.max(front, mix(PATH.lens + 0.05, PATH.slit + 0.02, smooth(2.0, 2.75, p)));
        const field = smooth(2.45, 2.95, p);
        const screenOn = smooth(2.9, 3.35, p);
        const count = MAX_DETECTIONS * Math.pow(clamp01((p - 3.15) / 1.4), 1.35);
        const curve = smooth(4.45, 4.95, p);
        if (screen.update(count, curve)) r.setScreen(screen.canvas);

        const masks: FrameState["masks"] = [];
        for (const m of maskEls) {
          const bb = m.getBoundingClientRect();
          if (bb.bottom < -40 || bb.top > H + 40 || bb.width === 0) continue;
          masks.push([bb.left, bb.top, bb.width, bb.height]);
          if (masks.length === 8) break;
        }

        const lastBottom = sections[sections.length - 1].getBoundingClientRect().bottom;
        const onScreen = lastBottom > 0;
        canvas.style.opacity = reduced ? String(1 - 0.85 * Math.sin(Math.PI * smooth(0.35, 0.65, t))) : "";
        if (onScreen) {
          r.render({
            camPos,
            look: mix3(sa.look, sb.look, e),
            radius: mix(sa.radius, sb.radius, e),
            stage: {
              x: mix(a.x, b.x, e),
              y: mix(a.y, b.y, e),
              w: mix(a.w, b.w, e),
              h: mix(a.h, b.h, e),
            },
            front,
            field,
            screen: screenOn,
            time,
            masks,
          });
          // Frame-time governor: keep it smooth rather than sharp.
          if (lastFrame) {
            frameAvg = frameAvg * 0.9 + (now - lastFrame) * 0.1;
            if (frameAvg > 26 && scale > 0.55) {
              scale = Math.max(0.55, scale * 0.85);
              r.resize(cssW, cssH, scale);
              frameAvg = 16;
              // Resizing clears the canvas: always draw again afterwards.
              dirty = true;
            } else if (frameAvg < 13 && scale < maxScale) {
              scale = Math.min(maxScale, scale * 1.08);
              r.resize(cssW, cssH, scale);
              frameAvg = 16;
              dirty = true;
            }
          }
          lastFrame = now;
        }
        canvas.style.visibility = onScreen ? "" : "hidden";

        // Keep going while something moves on its own; otherwise wait for scroll.
        const moving = animating && (intro < 1 || field > 0.01);
        if (visible && onScreen && (moving || dirty)) {
          dirty = false;
          raf = requestAnimationFrame(frame);
        } else {
          lastFrame = 0;
        }
      };
      const request = () => {
        dirty = true;
        if (!raf && !disposed) raf = requestAnimationFrame(frame);
      };
      kick.current = request;
      const onVis = () => {
        visible = document.visibilityState === "visible";
        if (visible) request();
      };
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("scroll", request, { passive: true });
      document.addEventListener("visibilitychange", onVis);
      reduce.addEventListener("change", request);
      const ro = new ResizeObserver(() => {
        resize();
        request();
      });
      ro.observe(el);
      request();
      // Test hook: lets automated checks render a settled frame on demand.
      (window as unknown as { __lightJourney?: unknown }).__lightJourney = { request };
      cleanup = () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", request);
        document.removeEventListener("visibilitychange", onVis);
        reduce.removeEventListener("change", request);
        ro.disconnect();
      };
    };
    start().catch((err) => {
      console.warn("[light-journey]", err);
      setMode("still");
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
      renderer?.dispose();
    };
  }, []);

  const chapters = LIGHT_JOURNEY.chapters;
  return (
    <div className={`lj lj-${mode}`} ref={root}>
      <canvas className="lj-canvas" ref={canvasRef} aria-hidden="true" />
      {chapters.map((c, i) => {
        const Heading = i === 0 ? "h1" : "h2";
        return (
          <section
            key={c.id}
            id={c.id}
            className={`lj-chapter lj-chapter-${i} ${i % 2 === 0 ? "copy-left" : "copy-right"}`}
            aria-labelledby={`${c.id}-title`}
          >
            <div className="lj-copy lj-mask">
              <p className="lj-eyebrow">{c.eyebrow}</p>
              <Heading id={`${c.id}-title`} className="lj-title">
                {c.title}
              </Heading>
              <p className="lj-line">{c.line}</p>
              <div className="lj-links">
                {c.links.map((l) => (
                  <External key={l.href} href={l.href}>
                    {l.label}
                    <ArrowGlyph className="h-4 w-4" />
                  </External>
                ))}
              </div>
            </div>
            <figure className="lj-photo lj-mask">
              <Image
                src={c.photo}
                alt={c.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 900px) 34vw, 92vw"
                style={{ objectPosition: c.focus }}
              />
            </figure>
            <div className="lj-stage" aria-hidden="true">
              <span
                className="lj-poster"
                style={{ backgroundImage: `url(/images/light-journey/station-${i}.webp)` }}
              />
            </div>
          </section>
        );
      })}
      <div className="lj-tools site-width">
        {mode === "live" ? (
          <button type="button" className="lj-pause" onClick={() => setPaused((v) => !v)} aria-pressed={paused}>
            {paused ? LIGHT_JOURNEY.resume : LIGHT_JOURNEY.pause}
          </button>
        ) : null}
        <details className="lj-notes">
          <summary>{LIGHT_JOURNEY.notesLabel}</summary>
          <p>{LIGHT_JOURNEY.notes}</p>
        </details>
      </div>
    </div>
  );
}
