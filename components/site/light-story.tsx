"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  JOURNEY_STORY as COPY,
  LIVE_LIGHT_STORY as LABELS,
  SOCIALS,
  SITE,
  PAGE_COPY,
} from "@/lib/content";
import type { LightWorld, LightWorldState } from "./light-world";
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
export function LightStory() {
  const root = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    world = useRef<LightWorld | null>(null);
  const state = useRef<LightWorldState>({
    progress: 0,
    focusX: 0.75,
    focusY: 0.52,
    rotation: 0,
    paused: false,
    reduced: false,
    exposure: 0,
  });
  const [paused, setPaused] = useState(false),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    const element = root.current,
      target = canvas.current;
    if (!element || !target) return;
    let cancelled = false,
      raf = 0;
    const sections = Array.from(
      element.querySelectorAll<HTMLElement>("[data-light-chapter]"),
    );
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      raf = 0;
      const compact = innerWidth < 900,
        y = scrollY;
      const positions = sections.map((s) => s.getBoundingClientRect().top + y);
      let index = 0;
      while (index < 5 && y + innerHeight * 0.18 >= positions[index + 1])
        index++;
      const length =
        (positions[index + 1] ??
          positions[index] + sections[index].offsetHeight) - positions[index];
      const t = clamp((y - positions[index] + innerHeight * 0.18) / length),
        mix = ease((t - 0.15) / 0.85);
      const progress = media.matches ? index : Math.min(5, index + mix),
        next = Math.min(5, index + 1);
      const side = (i: number) =>
        compact ? (i === 0 ? 0.72 : i % 2 ? 0.22 : 0.78) : i % 2 ? 0.22 : 0.78;
      state.current.progress = progress;
      state.current.focusX = side(index) + (side(next) - side(index)) * (media.matches ? 0 : mix);
      state.current.focusY = compact ? 0.58 : 0.52;
      element.dataset.chapter = String(index);
      element.style.setProperty(
        "--light-x",
        String(state.current.focusX * 100) + "%",
      );
      world.current?.invalidate();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const preference = () => {
      state.current.reduced = media.matches;
      world.current?.invalidate();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      world.current?.dispose();
      world.current = null;
      setFailed(true);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    media.addEventListener("change", preference);
    target.addEventListener("webglcontextlost", lost);
    preference();
    update();
    import("./light-world")
      .then(({ createLightWorld }) => {
        if (cancelled) return;
        try {
          world.current = createLightWorld(target, state.current);
          setReady(true);
          update();
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      media.removeEventListener("change", preference);
      target.removeEventListener("webglcontextlost", lost);
      world.current?.dispose();
      world.current = null;
    };
  }, []);
  useEffect(() => {
    state.current.paused = paused;
    world.current?.invalidate();
  }, [paused]);
  return (
    <div
      className={
        "light-experience" +
        (ready ? " is-ready" : "") +
        (failed ? " is-fallback" : "")
      }
      ref={root}
    >
      <div className="experience-world" aria-hidden="true">
        <canvas ref={canvas} className="experience-canvas" />
      </div>
      <div className="experience-pages">
        {COPY.scenes.map((scene, i) => (
          <section
            className={
              "experience-chapter chapter-" + i + (i % 2 ? " is-reversed" : "")
            }
            id={scene.id}
            key={scene.id}
            data-light-chapter={i}
            aria-labelledby={"light-heading-" + i}
          >
            {i === 5 && <span id="work" className="experience-work-anchor" />}
            <div className="experience-composition">
              <div className="experience-copy">
                <p className="experience-eyebrow">{scene.label}</p>
                {i === 0 ? (
                  <h1 id={"light-heading-" + i}>
                    {PAGE_COPY.home.headline[0]}
                    <br />
                    {PAGE_COPY.home.headline[1]}
                    <br />
                    <em>{PAGE_COPY.home.headline[2]}</em>
                  </h1>
                ) : (
                  <h2 id={"light-heading-" + i}>{scene.title}</h2>
                )}
                <p className="experience-body">{scene.body}</p>
                <figure className={"experience-photo photo-" + i}>
                  <Image
                    src={scene.photo}
                    alt={scene.alt}
                    width={800}
                    height={600}
                    sizes="(min-width:900px) 38vw, 62vw"
                    priority={i === 0}
                    loading={i === 0 ? "eager" : undefined}
                  />
                  {i > 0 && <figcaption>{scene.caption}</figcaption>}
                </figure>
                <div className="experience-links">
                  {scene.link && (
                    <a
                      href={scene.link}
                      target={
                        scene.link.startsWith("https:") ? "_blank" : undefined
                      }
                      rel={
                        scene.link.startsWith("https:")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {scene.cta}
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {i === 0 && (
                    <a
                      href={SOCIALS[0].href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      YouTube<span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
                {i === 0 && (
                  <button
                    type="button"
                    className="experience-pause"
                    aria-pressed={paused}
                    onClick={() => setPaused(!paused)}
                  >
                    {paused ? LABELS.resume : LABELS.pause}
                  </button>
                )}
                {i === 5 && (
                  <button
                    type="button"
                    className="experience-replay"
                    onClick={() => {
                      state.current.exposure++;
                      world.current?.invalidate();
                    }}
                  >
                    {LABELS.reset}
                    <span aria-hidden="true">↻</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        ))}
        <section className="experience-close" id="continue">
          <div>
            <p className="experience-eyebrow">{COPY.closing.eyebrow}</p>
            <h2>{COPY.closing.title}</h2>
            <p className="experience-body">{COPY.closing.body}</p>
            <a className="experience-contact" href={COPY.closing.link}>
              {COPY.closing.cta}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <details className="experience-physics">
            <summary>{COPY.physicsLabel}</summary>
            <p>{COPY.physics}</p>
          </details>
          <div className="experience-footer">
            <p>{SITE.name}</p>
            <nav aria-label="Find Kshitij">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ))}
              <a href="/about">About</a>
            </nav>
          </div>
        </section>
      </div>
    </div>
  );
}
