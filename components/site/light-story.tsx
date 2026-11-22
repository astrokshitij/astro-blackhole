"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  LIGHT_STORY as COPY,
  SOCIALS,
  STATS,
  SITE,
  EDITORIAL,
} from "@/lib/content";
import { photoelectric, WORK_FUNCTION_EV } from "@/lib/light-physics";
import { ButtonLink, Eyebrow } from "./ui";
import { ArrowGlyph, YoutubeGlyph } from "./icons";
import type { LightEngine, LightState } from "./light-story-engine";
import PrismHero from "@/components/ui/prism-hero";

const ids = ["curiosity", "communication", "investigation", "building"];

function PhysicsNote({ text, detail }: { text: string; detail: string }) {
  return (
    <details className="light-physics-note">
      <summary>{COPY.controls.why}</summary>
      <p>{text}</p>
      <p>{detail}</p>
    </details>
  );
}

function MotionToggle({
  paused,
  onToggle,
}: {
  paused: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="light-inline-motion"
      aria-pressed={paused}
      onClick={onToggle}
    >
      {paused ? COPY.controls.resume : COPY.controls.pause}
    </button>
  );
}

export function LightStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LightEngine | null>(null);
  const stateRef = useRef<LightState>({
    progress: 0,
    localProgress: 0,
    separation: 180,
    recorded: false,
    wavelength: 450,
    paused: false,
    reduced: false,
  });
  const [chapter, setChapter] = useState(0);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [separation, setSeparation] = useState(180);
  const [recorded, setRecorded] = useState(false);
  const [wavelength, setWavelength] = useState(450);
  const [run, setRun] = useState(1);
  const [count, setCount] = useState(80);
  const quantumStart = useRef(0);
  const emission = photoelectric(wavelength);

  useEffect(() => {
    const root = rootRef.current,
      canvas = canvasRef.current;
    if (!root || !canvas) return;
    let cancelled = false,
      scrollFrame = 0;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => {
      stateRef.current.reduced = media.matches;
      setReduced(media.matches);
      engineRef.current?.invalidate();
    };
    preference();
    media.addEventListener("change", preference);
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-light-chapter]"),
    );
    let anchors: number[] = [];
    const update = () => {
      scrollFrame = 0;
      const y = window.scrollY;
      root.dataset.finished = String(
        y > anchors[3] + panels[3].offsetHeight - window.innerHeight * 0.15,
      );
      let index = 0;
      while (index < anchors.length - 1 && y >= anchors[index + 1]) index++;
      const interval =
        index < anchors.length - 1
          ? anchors[index + 1] - anchors[index]
          : panels[index].offsetHeight;
      const local = Math.max(
        0,
        Math.min(1, (y - anchors[index]) / Math.max(1, interval)),
      );
      // Keep each composition stable while reading; travel only near the chapter boundary.
      const travel =
        index < 3 ? Math.max(0, Math.min(1, (local - 0.25) / 0.75)) : 0;
      stateRef.current.progress = index + travel;
      stateRef.current.localProgress = local;
      root.style.setProperty(
        "--prism-opacity",
        String(1 - Math.min(1, stateRef.current.progress * 1.45)),
      );
      const active = local > 0.88 && index < 3 ? index + 1 : index;
      root.dataset.chapter = String(active);
      setChapter(active);
      if (index === 2) {
        const detections = Math.round(
          80 + Math.max(0, local - quantumStart.current) * 7000,
        );
        setCount(stateRef.current.reduced ? 6000 : Math.min(6000, detections));
      }
      engineRef.current?.invalidate();
    };
    const measure = () => {
      anchors = panels.map(
        (p) => p.getBoundingClientRect().top + window.scrollY,
      );
      update();
    };
    const scroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(update);
    };
    measure();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    const visibility = () => engineRef.current?.invalidate();
    document.addEventListener("visibilitychange", visibility);
    const lost = (event: Event) => {
      event.preventDefault();
      setFallback(true);
      setReady(false);
    };
    canvas.addEventListener("webglcontextlost", lost);
    import("./light-story-engine")
      .then(async ({ createLightEngine }) => {
        if (cancelled) return;
        try {
          const engine = await createLightEngine(canvas, stateRef.current);
          if (cancelled) {
            engine.dispose();
            return;
          }
          engineRef.current = engine;
          setReady(true);
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
      media.removeEventListener("change", preference);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", lost);
      observer.disconnect();
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    Object.assign(stateRef.current, {
      separation,
      recorded,
      wavelength,
      paused,
      detections: count,
    });
    engineRef.current?.invalidate();
  }, [separation, recorded, wavelength, paused, count]);

  function changePath() {
    setRecorded(!recorded);
    setRun((v) => v + 1);
    quantumStart.current = stateRef.current.localProgress;
    setCount(80);
  }

  function goToChapter(event: MouseEvent<HTMLAnchorElement>, index: number) {
    const target = document.getElementById(ids[index]);
    if (!target) return;
    event.preventDefault();
    window.history.replaceState(null, "", `#${ids[index]}`);
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: reduced || paused ? "instant" : "smooth",
    });
  }

  return (
    <div
      className={`light-story ${ready ? "is-ready" : ""} ${fallback ? "has-fallback" : ""}`}
      ref={rootRef}
      data-chapter="0"
    >
      <div className="light-stage" aria-hidden="true">
        <canvas ref={canvasRef} className="light-canvas" />
        <div className="light-original-prism">
          <PrismHero
            key={String(reduced)}
            paused={paused || reduced || chapter > 0}
            compactFocus={[0.62, 0.88]}
          />
        </div>
        {fallback && (
          <div className="light-still">
            <Image
              src={SITE.portrait}
              alt=""
              fill
              sizes="70vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
      <div className="light-story-content">
        <section
          id={ids[0]}
          className="light-panel light-panel-hero"
          data-light-chapter="0"
          aria-labelledby="light-title"
        >
          <div className="light-panel-inner site-width">
            <div className="light-copy">
              <Eyebrow>Astro Kshitij / Physics & the universe</Eyebrow>
              <h1 id="light-title">
                The universe is
                <br />
                stranger than
                <br />
                <span>you think.</span>
              </h1>
              <div className="light-introduction">
                <Image
                  src={SITE.portrait}
                  alt="Kshitij Pandey"
                  width={64}
                  height={64}
                  priority
                />
                <p>
                  <strong>I’m Kshitij Pandey.</strong>
                  <br />
                  Physicist & science communicator.
                </p>
              </div>
              <p className="light-body">{COPY.hero.intro}</p>
              <div className="hero-actions">
                <ButtonLink href="#work">
                  Explore my work <ArrowGlyph className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href={SOCIALS[0].href} variant="ghost">
                  <YoutubeGlyph className="h-4 w-4" /> Watch on YouTube
                </ButtonLink>
              </div>
              <p className="light-credentials">
                MSc Physics <span>/</span> TEDx speaker <span>/</span> Product &
                AI
              </p>
              <PhysicsNote
                text={COPY.physics.prism}
                detail={COPY.physics.prismDetail}
              />
              <MotionToggle
                paused={paused}
                onToggle={() => setPaused(!paused)}
              />
            </div>
            <a
              className="light-scroll-invite"
              href="#communication"
              onClick={(e) => goToChapter(e, 1)}
            >
              <span aria-hidden="true">↓</span>
              {COPY.hero.scroll}
            </a>
          </div>
        </section>
        <section
          id={ids[1]}
          className="light-panel"
          data-light-chapter="1"
          aria-labelledby="communication-title"
        >
          <div className="light-panel-inner site-width">
            <div className="light-copy">
              <Eyebrow>{COPY.communication.label}</Eyebrow>
              <h2 id="communication-title">{COPY.communication.title}</h2>
              <p className="light-body">{COPY.communication.body}</p>
              <div className="light-reach">
                {STATS.map((stat) => (
                  <p key={stat.label}>
                    <strong>
                      {stat.to}
                      {stat.suffix}
                    </strong>
                    <span>{stat.label}</span>
                  </p>
                ))}
              </div>
              <a href={SOCIALS[0].href} className="text-link">
                Watch on YouTube <ArrowGlyph className="h-4 w-4" />
              </a>
              <figure className="light-photo light-photo-speaking">
                <Image
                  src="/images/home/stats-audience.jpg"
                  alt="Kshitij speaking to an audience about physics"
                  width={380}
                  height={224}
                  sizes="(min-width: 900px) 330px, 88vw"
                />
                <figcaption>{COPY.communication.caption}</figcaption>
              </figure>
            </div>
            <div className="light-experiment-control">
              <p>Two coherent paths. One interference pattern.</p>
              <label htmlFor="slit-spacing">
                {COPY.controls.slit}
                <output>{separation} μm</output>
              </label>
              <input
                id="slit-spacing"
                type="range"
                min="120"
                max="300"
                step="5"
                value={separation}
                onChange={(e) => setSeparation(Number(e.target.value))}
                aria-describedby="slit-explanation"
              />
              <details>
                <summary>{COPY.controls.why}</summary>
                <p id="slit-explanation">{COPY.physics.slitDetail}</p>
              </details>
              <MotionToggle
                paused={paused}
                onToggle={() => setPaused(!paused)}
              />
            </div>
          </div>
        </section>
        <section
          id={ids[2]}
          className="light-panel light-panel-right"
          data-light-chapter="2"
          aria-labelledby="investigation-title"
        >
          <div className="light-panel-inner site-width">
            <div className="light-copy">
              <Eyebrow>{COPY.investigation.label}</Eyebrow>
              <h2 id="investigation-title">{COPY.investigation.title}</h2>
              <p className="light-body">{COPY.investigation.body}</p>
              <div className="light-text-actions">
                <Link href="/blog" className="text-link">
                  Read my writing <ArrowGlyph className="h-4 w-4" />
                </Link>
                <a
                  href={EDITORIAL.explorations[1].href}
                  className="text-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore my research <ArrowGlyph className="h-4 w-4" />
                </a>
              </div>
              <figure className="light-photo light-photo-research">
                <Image
                  src="/images/story/msc-poster.jpg"
                  alt="Kshitij presenting his research poster on particle collisions near naked singularities"
                  width={340}
                  height={210}
                  sizes="(min-width: 900px) 330px, 88vw"
                />
                <figcaption>{COPY.investigation.caption}</figcaption>
              </figure>
            </div>
            <div className="light-experiment-control">
              <p>One detection at a time.</p>
              <div className="light-path-control">
                <button
                  type="button"
                  role="switch"
                  aria-checked={recorded}
                  onClick={changePath}
                >
                  <span className="light-switch" aria-hidden="true" />
                  {COPY.controls.path}
                </button>
                <span className="light-count">
                  {count.toLocaleString("en-IN")} {COPY.controls.photonCount}
                </span>
              </div>
              <p className="light-run" aria-live="polite">
                Run {run} ·{" "}
                {recorded
                  ? "Paths recorded. Interference removed."
                  : "Paths unmarked. Interference builds."}
              </p>
              <details>
                <summary>{COPY.controls.why}</summary>
                <p>{COPY.physics.quantumDetail}</p>
              </details>
              <MotionToggle
                paused={paused}
                onToggle={() => setPaused(!paused)}
              />
            </div>
          </div>
        </section>
        <section
          id={ids[3]}
          className="light-panel"
          data-light-chapter="3"
          aria-labelledby="building-title"
        >
          <div className="light-panel-inner site-width">
            <div className="light-copy">
              <Eyebrow>{COPY.building.label}</Eyebrow>
              <h2 id="building-title">{COPY.building.title}</h2>
              <p className="light-body">{COPY.building.body}</p>
              <a
                href={EDITORIAL.explorations[3].href}
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                See my product work <ArrowGlyph className="h-4 w-4" />
              </a>
              <figure className="light-photo light-photo-working">
                <Image
                  src="/images/story/msc-research.jpg"
                  alt="Kshitij working at his desk"
                  width={340}
                  height={210}
                  sizes="(min-width: 900px) 330px, 88vw"
                />
                <figcaption>{COPY.building.caption}</figcaption>
              </figure>
            </div>
            <div className="light-experiment-control">
              <p>A separate experiment. Energy, in quanta.</p>
              <label htmlFor="light-wavelength">
                {COPY.controls.wavelength}
                <output>{wavelength} nm</output>
              </label>
              <input
                id="light-wavelength"
                type="range"
                min="380"
                max="700"
                step="5"
                value={wavelength}
                onChange={(e) => setWavelength(Number(e.target.value))}
              />
              <p className="light-run" aria-live="polite">
                {emission.photonEnergy.toFixed(2)} eV ·{" "}
                {emission.emits ? COPY.controls.above : COPY.controls.below}
              </p>
              <details>
                <summary>{COPY.controls.why}</summary>
                <p>{COPY.physics.energyDetail}</p>
                <p>
                  Threshold: {(1239.841984 / WORK_FUNCTION_EV).toFixed(0)} nm.
                  Maximum electron energy:{" "}
                  {emission.maximumKineticEnergy.toFixed(2)} eV.
                </p>
              </details>
              <MotionToggle
                paused={paused}
                onToggle={() => setPaused(!paused)}
              />
            </div>
          </div>
        </section>
      </div>
      <nav className="light-chapter-nav" aria-label="Homepage chapters">
        {COPY.chapters.map((label, i) => (
          <a
            key={label}
            href={`#${ids[i]}`}
            aria-label={label}
            aria-current={chapter === i ? "step" : undefined}
            onClick={(e) => goToChapter(e, i)}
          >
            <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <span className="light-chapter-label">{label}</span>
          </a>
        ))}
      </nav>
      <div className="light-utility">
        <a href="#work">{COPY.controls.skip}</a>
        {!fallback && (
          <button
            onClick={() => setPaused(!paused)}
            type="button"
            aria-pressed={paused}
            aria-label={paused ? COPY.controls.resume : COPY.controls.pause}
          >
            <span className="light-motion-full">
              {paused ? COPY.controls.resume : COPY.controls.pause}
            </span>
            <span className="light-motion-short">
              {paused ? "Resume" : "Pause"}
            </span>
          </button>
        )}
        {reduced && <span>Reduced motion</span>}
      </div>
      <noscript>
        <p className="light-nojs">
          Explore my work, writing and story below. The optional light
          experiments need JavaScript.
        </p>
      </noscript>
    </div>
  );
}
