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
  { pos: [2.7, 2.15, 5.7], look: [0.25, 0.98, 0], radius: 1.6 },
  { pos: [2.2, 2.05, 5.4], look: [1.15, 1.05, 0], radius: 1.9 },
  { pos: [1.5, 1.75, 3.3], look: [2.9, 1.12, 0], radius: 0.75 },
  { pos: [3.6, 2.5, 2.9], look: [4.95, 1.1, 0], radius: 1.05 },
  { pos: [4.5, 1.95, 2.7], look: [6.6, 1.15, 0], radius: 1.0 },
  { pos: [5.35, 1.35, 1.55], look: [6.72, 1.22, 0], radius: 0.86 },
];
const MOBILE: Station[] = [
  { pos: [2.3, 2.1, 5.8], look: [0.2, 0.95, 0], radius: 1.55 },
  { pos: [2.5, 1.95, 4.8], look: [0.6, 1.05, 0], radius: 1.45 },
  { pos: [1.5, 1.75, 3.3], look: [2.9, 1.12, 0], radius: 0.75 },
  { pos: [3.6, 2.5, 2.9], look: [4.95, 1.1, 0], radius: 1.05 },
  { pos: [4.6, 1.95, 2.7], look: [6.6, 1.15, 0], radius: 1.0 },
  { pos: [5.35, 1.35, 1.55], look: [6.72, 1.17, 0], radius: 0.8 },
];
/** World points the small object labels attach to, one per chapter. */
const LABEL_AT: Vec3[] = [
  [-1.25, 0.32, 0.05],
  [1.75, 1.42, 0],
  [2.75, 1.62, 0],
  [4.6, 1.78, 0],
  [6.7, 1.84, 0],
  [6.7, 0.5, 0],
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
      const copies = sections.map((s) => Array.from(s.querySelectorAll<HTMLElement>(".lj-fade")));
      const labels = Array.from(el.querySelectorAll<HTMLElement>(".lj-label"));

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
        // Phones: each experiment stays in its own band and scrolls with the page,
        // swapping out of sight, so it never slides across the next headline.
        const phone = cssW < 900;
        const e = reduced ? (t < 0.5 ? 0 : 1) : phone ? smooth(0.47, 0.53, t) : smooth(0.16, 0.84, t);
        const dip = reduced || phone ? Math.sin(Math.PI * smooth(0.28, 0.72, t)) : 0;
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
        // Green only appears once the card chapter arrives.
        let front = mix(PATH.mirror - 3.2, PATH.card - 0.03, intro);
        front = Math.max(front, mix(PATH.card - 0.03, PATH.lens + 0.05, smooth(1.45, 2.05, p)));
        front = Math.max(front, mix(PATH.lens + 0.05, PATH.slit + 0.02, smooth(2.0, 2.75, p)));
        const field = smooth(2.45, 2.95, p);
        const screenOn = smooth(2.9, 3.35, p);
        const count = MAX_DETECTIONS * Math.pow(clamp01((p - 3.15) / 1.4), 1.35);
        const curve = smooth(4.45, 4.95, p);
        if (screen.update(count, curve)) r.setScreen(screen.canvas);

        // Desktop: a chapter's words and photo leave before the next arrive,
        // so two chapters never share the screen mid-move.
        const desktop = cssW >= 900;
        sections.forEach((_, k) => {
          const d = Math.abs(centers[k].y - H / 2) / H;
          const vis = desktop ? 1 - smooth(0.16, 0.4, d) : 1;
          const dir = centers[k].y < H / 2 ? -1 : 1;
          for (const node of copies[k]) {
            node.style.opacity = desktop ? vis.toFixed(3) : "";
            node.style.transform = desktop ? `translate3d(0, ${(dir * (1 - vis) * 28).toFixed(1)}px, 0)` : "";
            node.style.visibility = desktop && vis < 0.02 ? "hidden" : "";
          }
        });

        // Each chapter's words and photo are masked as one block on desktop,
        // so light never shows in the gap between them.
        const masks: FrameState["masks"] = [];
        const pad = 14;
        for (const group of desktop ? copies : maskEls.map((m) => [m])) {
          let l = Infinity,
            t2 = Infinity,
            r2 = -Infinity,
            b2 = -Infinity;
          for (const m of group) {
            if (m.style.visibility === "hidden" || Number(m.style.opacity || 1) < 0.25) continue;
            const bb = m.getBoundingClientRect();
            if (bb.width === 0) continue;
            l = Math.min(l, bb.left);
            t2 = Math.min(t2, bb.top);
            r2 = Math.max(r2, bb.right);
            b2 = Math.max(b2, bb.bottom);
          }
          if (!(r2 > l) || b2 < -40 || t2 > H + 40) continue;
          masks.push([l - pad, t2 - pad, r2 - l + pad * 2, b2 - t2 + pad * 2]);
          if (masks.length === 8) break;
        }

        const lastBottom = sections[sections.length - 1].getBoundingClientRect().bottom;
        const onScreen = lastBottom > 0;
        canvas.style.opacity = dip > 0.001 ? String(1 - dip) : "";
        const look = mix3(sa.look, sb.look, e);
        const radius = mix(sa.radius, sb.radius, e);
        const stage = {
          x: mix(a.x, b.x, e),
          y: mix(a.y, b.y, e),
          w: mix(a.w, b.w, e),
          h: mix(a.h, b.h, e),
        };
        // Small labels pinned to the objects, using the renderer's projection.
        const tail = smooth(H * 0.25, H * 0.75, sections[sections.length - 1].getBoundingClientRect().bottom);
        {
          const fx = look[0] - camPos[0],
            fy = look[1] - camPos[1],
            fz = look[2] - camPos[2];
          const dist = Math.hypot(fx, fy, fz);
          const F = [fx / dist, fy / dist, fz / dist];
          const rl = Math.hypot(F[2], F[0]);
          const R = [-F[2] / rl, 0, F[0] / rl];
          const U = [R[1] * F[2] - R[2] * F[1], R[2] * F[0] - R[0] * F[2], R[0] * F[1] - R[1] * F[0]];
          const focal = (dist * Math.min(stage.w, stage.h) * 0.5) / radius;
          labels.forEach((node, k) => {
            const w = LABEL_AT[k];
            const vx = w[0] - camPos[0],
              vy = w[1] - camPos[1],
              vz = w[2] - camPos[2];
            const z = vx * F[0] + vy * F[1] + vz * F[2];
            let o = onScreen ? clamp01(1 - Math.abs(p - k) * 2.6) * (1 - dip) * tail : 0;
            if (k === 5) o *= smooth(4.6, 5, p);
            if (z <= 0.1) o = 0;
            const x = stage.x + ((vx * R[0] + vy * R[1] + vz * R[2]) / z) * focal;
            const y = stage.y - ((vx * U[0] + vy * U[1] + vz * U[2]) / z) * focal;
            // Never let a label sit on the words or a photo.
            for (const m of masks) {
              if (x > m[0] - 8 && x < m[0] + m[2] + 8 && y > m[1] - 8 && y < m[1] + m[3] + 8) o = 0;
            }
            node.style.opacity = o.toFixed(3);
            node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
          });
        }
        if (onScreen) {
          r.render({
            camPos,
            look,
            radius,
            stage,
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
            <div className="lj-copy lj-mask lj-fade">
              <p className="lj-eyebrow">{c.eyebrow}</p>
              <Heading id={`${c.id}-title`} className={`lj-title lj-title-${c.size}`}>
                {c.titleLines.length ? (
                  <>
                    <span className="sr-only">{c.title}</span>
                    <span aria-hidden="true">
                      {c.titleLines.map((line, n) => (
                        <span key={line} className={n === c.titleLines.length - 1 ? "lj-title-last" : undefined}>
                          {line}{" "}
                        </span>
                      ))}
                    </span>
                  </>
                ) : (
                  c.title
                )}
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
            <figure className="lj-photo lj-mask lj-fade">
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
      <div className="lj-labels" aria-hidden="true">
        {chapters.map((c) => (
          <span key={c.id} className="lj-label">
            {c.label}
          </span>
        ))}
      </div>
      <section className="lj-closer" aria-labelledby="lj-closer-title">
        <div className="site-width">
        <Link href={LIGHT_JOURNEY.closer.href} className="lj-closer-link">
          <span id="lj-closer-title" className="lj-closer-title">
            {LIGHT_JOURNEY.closer.title}
          </span>
          <ArrowGlyph className="lj-closer-arrow" />
        </Link>
        <p className="lj-closer-line">{LIGHT_JOURNEY.closer.line}</p>
        </div>
      </section>
      <div className="lj-tools site-width">
        {mode === "live" ? (
          <button
            type="button"
            className="lj-pause"
            onClick={() => setPaused((v) => !v)}
            aria-pressed={paused}
            aria-label={paused ? LIGHT_JOURNEY.resume : LIGHT_JOURNEY.pause}
            title={paused ? LIGHT_JOURNEY.resume : LIGHT_JOURNEY.pause}
          >
            {paused ? (
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7-4.5z" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" fill="currentColor" /></svg>
            )}
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
