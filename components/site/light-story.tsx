"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LIVE_LIGHT_STORY as COPY, PAGE_COPY, SOCIALS } from "@/lib/content";
import { ArrowGlyph, YoutubeGlyph } from "./icons";
import { Eyebrow } from "./ui";
import type { OpticalState, OpticalWorld } from "./optical-world";

export function LightStory() {
  const rootRef = useRef<HTMLDivElement>(null),
    stageRef = useRef<HTMLDivElement>(null),
    canvasRef = useRef<HTMLCanvasElement>(null),
    worldRef = useRef<OpticalWorld | null>(null);
  const stateRef = useRef<OpticalState>({
    progress: 0,
    rotation: 0,
    paused: false,
    reduced: false,
    exposure: 0,
  });
  const [chapter, setChapter] = useState(0),
    [ready, setReady] = useState(false),
    [fallback, setFallback] = useState(false),
    [paused, setPaused] = useState(false),
    [rotation, setRotation] = useState(0),
    [exposing, setExposing] = useState(0);
  const dragging = useRef<{ x: number; rotation: number } | null>(null);
  useEffect(() => {
    const root = rootRef.current,
      stage = stageRef.current,
      canvas = canvasRef.current;
    if (!root || !stage || !canvas) return;
    let cancelled = false,
      scrollFrame = 0,
      readyFrame = 0,
      anchors: number[] = [];
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      panels = Array.from(
        root.querySelectorAll<HTMLElement>("[data-optical-chapter]"),
      );
    const update = () => {
      scrollFrame = 0;
      const y = window.scrollY;
      let index = 0;
      while (index < anchors.length - 1 && y + 2 >= anchors[index + 1]) index++;
      const interval =
        index < anchors.length - 1
          ? anchors[index + 1] - anchors[index]
          : panels[index].offsetHeight;
      const local = Math.max(
        0,
        Math.min(1, (y - anchors[index]) / Math.max(interval, 1)),
      );
      stateRef.current.progress = Math.min(
        5,
        index + Math.max(0, Math.min(1, (local - 0.12) / 0.88)),
      );
      setChapter(index);
      root.dataset.scene = String(index);
      worldRef.current?.invalidate();
    };
    const measure = () => {
      const offset = innerWidth < 900 ? stage.offsetHeight + 70 : 84;
      anchors = panels.map(
        (p) => p.getBoundingClientRect().top + scrollY - offset,
      );
      update();
    };
    const scroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(update);
    };
    const preference = () => {
      stateRef.current.reduced = media.matches;
      worldRef.current?.invalidate();
    };
    preference();
    const visibility = () => worldRef.current?.invalidate();
    const lost = (event: Event) => {
      event.preventDefault();
      worldRef.current?.dispose();
      worldRef.current = null;
      setFallback(true);
      setReady(false);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", measure);
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    canvas.addEventListener("webglcontextlost", lost);
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(stage);
    measure();
    import("./optical-world")
      .then(({ createOpticalWorld }) => {
        if (cancelled) return;
        try {
          worldRef.current = createOpticalWorld(canvas, stateRef.current);
          const check = () => {
            if (cancelled) return;
            if (canvas.dataset.progress) setReady(true);
            else readyFrame = requestAnimationFrame(check);
          };
          readyFrame = requestAnimationFrame(check);
          update();
        } catch {
          if (!cancelled) setFallback(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFallback(true);
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(readyFrame);
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", measure);
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", lost);
      worldRef.current?.dispose();
      worldRef.current = null;
    };
  }, []);
  useEffect(() => {
    stateRef.current.paused = paused;
    stateRef.current.rotation = (rotation * Math.PI) / 180;
    stateRef.current.exposure = exposing;
    worldRef.current?.invalidate();
  }, [paused, rotation, exposing]);
  function go(index: number) {
    const stage = stageRef.current,
      target = document.getElementById(COPY.scenes[index].id);
    if (!stage || !target) return;
    const offset = innerWidth < 900 ? stage.offsetHeight + 70 : 84;
    window.history.replaceState(null, "", `#${COPY.scenes[index].id}`);
    window.scrollTo({
      top: target.getBoundingClientRect().top + scrollY - offset,
      behavior: stateRef.current.reduced ? "instant" : "smooth",
    });
  }
  return (
    <div
      className={`optical-story ${ready ? "optical-ready" : ""} ${fallback ? "optical-fallback" : ""}`}
      ref={rootRef}
      data-live-3d={ready}
    >
      <div className="optical-stage" ref={stageRef}>
        <canvas
          ref={canvasRef}
          className="optical-canvas"
          aria-hidden="true"
          onPointerDown={(event) => {
            if (chapter > 1) return;
            dragging.current = { x: event.clientX, rotation };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!dragging.current || chapter > 1) return;
            setRotation(
              Math.max(
                -4,
                Math.min(
                  4,
                  dragging.current.rotation +
                    (event.clientX - dragging.current.x) * 0.035,
                ),
              ),
            );
          }}
          onPointerUp={() => {
            dragging.current = null;
          }}
          onPointerCancel={() => {
            dragging.current = null;
          }}
        />
        {!ready && !fallback && (
          <p className="optical-loading" role="status">
            {COPY.loading}
          </p>
        )}
        {fallback && (
          <div className="optical-fallback-image">
            <Image
              src={COPY.scenes[0].photo}
              alt=""
              fill
              sizes="60vw"
              className="object-cover"
            />
            <p>{COPY.fallback}</p>
          </div>
        )}
        <div className="optical-stage-caption">
          <p>{COPY.opticalLabels[chapter]}</p>
          <div className="optical-stage-input">
            {chapter < 2 ? (
              <label>
                {COPY.rotate}
                <input
                  aria-label={COPY.rotate}
                  type="range"
                  min="-4"
                  max="4"
                  step=".25"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                />
              </label>
            ) : chapter >= 4 ? (
              <button type="button" onClick={() => setExposing((v) => v + 1)}>
                {exposing ? COPY.reset : COPY.reveal}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="optical-track">
        {COPY.scenes.map((scene, i) => (
          <section
            className={`optical-panel optical-panel-${i}`}
            key={scene.id}
            id={scene.id}
            data-optical-chapter={i}
            aria-labelledby={`optical-heading-${i}`}
          >
            <div className="site-width optical-panel-width">
              <div className="optical-card">
                <Eyebrow>{scene.label}</Eyebrow>
                {i === 0 ? (
                  <h1 id={`optical-heading-${i}`}>
                    {PAGE_COPY.home.headline[0]}
                    <br />
                    {PAGE_COPY.home.headline[1]}
                    <br />
                    <span>{PAGE_COPY.home.headline[2]}</span>
                  </h1>
                ) : (
                  <h2 id={`optical-heading-${i}`}>{scene.title}</h2>
                )}
                {i === 0 && <p className="optical-name">{COPY.intro}</p>}
                <p className="optical-body">{scene.body}</p>
                <figure className={`optical-photo optical-photo-${i}`}>
                  <Image
                    src={scene.photo}
                    alt={scene.alt}
                    width={600}
                    height={400}
                    sizes="(min-width:900px) 32vw, 90vw"
                    priority={i === 0}
                    loading={i === 0 ? "eager" : undefined}
                  />
                  <figcaption>{scene.caption}</figcaption>
                </figure>
                <div className="optical-links">
                  <a
                    className="text-link"
                    href={scene.link}
                    target={
                      scene.link.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      scene.link.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {scene.cta}
                    <ArrowGlyph className="h-4 w-4" />
                  </a>
                  {i === 0 && (
                    <a href={SOCIALS[0].href} className="optical-youtube">
                      <YoutubeGlyph className="h-4 w-4" />
                      YouTube
                    </a>
                  )}
                </div>
                {i === 0 && (
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="optical-follow"
                  >
                    {COPY.scroll}
                    <ArrowGlyph className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="optical-controls">
        <nav aria-label="Light story chapters">
          {COPY.chapters.map((name, i) => (
            <button
              type="button"
              key={name}
              aria-label={name}
              aria-current={i === chapter ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span className="optical-nav-name">{name}</span>
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="optical-pause"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? COPY.resume : COPY.pause}
        </button>
        <a href="#work" className="optical-skip">
          {COPY.skip}
        </a>
      </div>
      <details className="optical-physics site-width">
        <summary>{COPY.physicsLabel}</summary>
        <p>{COPY.physics}</p>
      </details>
      <noscript>
        <p className="site-width">{COPY.fallback}</p>
      </noscript>
    </div>
  );
}
