"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EDITORIAL, LIGHT_JOURNEY, STATS } from "@/lib/content";
import { ArrowGlyph } from "@/components/site/icons";
import { JourneyCanvas } from "@/components/site/journey-canvas";

const ANCHOR_RATIO = 0.34;

// Exact optical milestone indices aligned 1:1 with the 6 journey stations
const STATION_MILESTONES = [
  26 / 144, // 01 · Sunlight (warm beam dispersing into crystal spectrum)
  43 / 144, // 02 · Many colours (spectrum dispersion on pinhole card)
  71 / 144, // 03 · One colour gets through (530nm cone through lens)
  96 / 144, // 04 · Two slits (open double slits + 3D wave interference)
  116 / 144, // 05 · One photon at a time (quantum dot buildup)
  143 / 144, // 06 · Where it's likely to land (wide full-bench reveal)
];

const STATION_STILLS = [
  "/frames/journey/f_026.webp",
  "/frames/journey/f_043.webp",
  "/frames/journey/f_071.webp",
  "/frames/journey/f_096.webp",
  "/frames/journey/f_116.webp",
  "/frames/journey/f_143.webp",
];

const STATION_TELEMETRY = [
  { metric: "Snell dispersion", detail: "white beam -> spectrum" },
  { metric: "400-700 nm", detail: "aperture slit selection" },
  { metric: "λ = 530 nm", detail: "collimated emerald wave" },
  { metric: "d = 180 µm", detail: "slit width 35 µm" },
  { metric: "P(y) ∝ cos²(π d y / λ L)", detail: "L = 1.0 m" },
  { metric: "Single-photon buildup", detail: "full optical bench" },
];

function useViewportMode(): "unknown" | "desktop" | "mobile" {
  const [mode, setMode] = useState<"unknown" | "desktop" | "mobile">("unknown");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setMode(mq.matches ? "desktop" : "mobile");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mode;
}

function PrismControls({
  onReplay,
  looping,
  onToggleLoop,
}: {
  onReplay: () => void;
  looping: boolean;
  onToggleLoop: () => void;
}) {
  return (
    <div className="flex items-center gap-2 font-sans text-sm font-bold">
      <button
        type="button"
        onClick={onReplay}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/15 bg-[#111319] px-4 py-1.5 text-[#f0b545] transition-colors hover:border-[#f0b545]/60 hover:bg-white/[0.06] cursor-pointer"
      >
        <span aria-hidden="true">↻</span>
        <span>Replay light</span>
      </button>
      <button
        type="button"
        onClick={onToggleLoop}
        aria-pressed={looping}
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-1.5 transition-colors cursor-pointer ${
          looping
            ? "border-[#f0b545] bg-[#f0b545]/15 text-[#f0b545]"
            : "border-white/15 bg-[#111319] text-white/75 hover:border-white/35 hover:text-white"
        }`}
      >
        <span>{looping ? "Looping" : "Loop"}</span>
      </button>
    </div>
  );
}

function ActionLink({
  href,
  variant = "text",
  children,
}: {
  href: string;
  variant?: "primary" | "text";
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");
  const isHash = href.startsWith("#");
  const classes =
    variant === "primary"
      ? "group inline-flex min-h-11 items-center gap-2 rounded-full bg-[linear-gradient(93deg,#f8cd78_0%,#f0b545_55%,#d9951e_100%)] px-6 py-3 text-base font-black tracking-[0.03em] text-[#08090c] shadow-[0_4px_16px_rgba(240,181,69,0.28)] transition-all hover:brightness-105 hover:shadow-[0_6px_22px_rgba(240,181,69,0.38)]"
      : "group inline-flex min-h-11 items-center gap-2 text-sm sm:text-base font-bold uppercase tracking-[0.04em] text-[#f0b545] transition-colors hover:text-[#f8cd78]";

  if (isExternal) {
    return (
      <a
        className={classes}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  if (isHash) {
    return (
      <a className={classes} href={href}>
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}

function MobileOpticalCard({
  index,
  label,
}: {
  index: number;
  label: string;
}) {
  return (
    <div className="lg:hidden relative w-full aspect-[16/10] overflow-hidden bg-[#08090c] my-4">
      <img
        src={STATION_STILLS[index]}
        alt={`Optical stage ${String(index + 1).padStart(2, "0")}: ${label}`}
        loading={index === 0 ? "eager" : "lazy"}
        className="w-full h-full object-contain"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 88% at 50% 50%, transparent 60%, rgba(8, 9, 12, 0.55) 84%, #08090c 100%)",
        }}
      />
    </div>
  );
}

export function LightJourneyStage() {
  const viewportMode = useViewportMode();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [replayNonce, setReplayNonce] = useState(0);
  const [loopPrism, setLoopPrism] = useState(false);
  const progressRef = useRef(STATION_MILESTONES[0]);
  const sectionRef = useRef<HTMLElement>(null);
  const chapterMidsRef = useRef<number[]>([]);
  const chapters = LIGHT_JOURNEY.chapters;
  const currentChapter = chapters[activeChapterIndex] || chapters[0];
  const currentTelemetry =
    STATION_TELEMETRY[activeChapterIndex] || STATION_TELEMETRY[0];

  const measureChapters = useCallback(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".journey-chapter")
    );
    if (!els.length) return;
    chapterMidsRef.current = els.map((el) => {
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + Math.min(180, Math.round(r.height * 0.28));
    });
  }, []);

  useEffect(() => {
    const updateFromScroll = () => {
      const mids = chapterMidsRef.current;
      if (!mids.length) return;

      const anchorY = window.scrollY + Math.round(window.innerHeight * ANCHOR_RATIO);

      if (anchorY <= mids[0]) {
        progressRef.current = STATION_MILESTONES[0];
        setActiveChapterIndex(0);
        return;
      }

      const last = mids.length - 1;
      if (anchorY >= mids[last]) {
        progressRef.current = STATION_MILESTONES[last];
        setActiveChapterIndex(last);
        return;
      }

      for (let i = 0; i < last; i++) {
        if (anchorY >= mids[i] && anchorY <= mids[i + 1]) {
          const span = Math.max(1, mids[i + 1] - mids[i]);
          const t = (anchorY - mids[i]) / span;
          progressRef.current =
            STATION_MILESTONES[i] +
            t * (STATION_MILESTONES[i + 1] - STATION_MILESTONES[i]);

          const closest = t < 0.5 ? i : i + 1;
          setActiveChapterIndex((prev) => (prev === closest ? prev : closest));
          return;
        }
      }
    };

    const handleResize = () => {
      measureChapters();
      updateFromScroll();
    };

    measureChapters();
    updateFromScroll();

    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    const ro =
      typeof ResizeObserver !== "undefined" && sectionRef.current
        ? new ResizeObserver(handleResize)
        : null;
    if (ro && sectionRef.current) ro.observe(sectionRef.current);

    return () => {
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", handleResize);
      ro?.disconnect();
    };
  }, [measureChapters]);

  const jumpToChapter = (index: number) => {
    measureChapters();
    const targetMid = chapterMidsRef.current[index];
    if (typeof targetMid !== "number") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = Math.max(
      0,
      targetMid - Math.round(window.innerHeight * ANCHOR_RATIO)
    );
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="relative w-full bg-[#08090c] text-[#f2efe8] selection:bg-[#f0b545]/20 selection:text-[#f0b545]">
      {/* Primary Split-Stage Section aligned with 1200px MakeMyTrip grid */}
      <section
        ref={sectionRef}
        className="site-width relative pt-[88px] sm:pt-[96px] pb-14 sm:pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Narrative Chapters + Mobile Inline Optics */}
          <div className="lg:col-span-6 space-y-14 sm:space-y-20 lg:space-y-28">
            {chapters.map((c, i) => {
              const Heading = i === 0 ? "h1" : "h2";
              const isActive = i === activeChapterIndex;

              return (
                <article
                  key={c.id}
                  id={c.id}
                  data-index={i}
                  className={`journey-chapter scroll-mt-20 transition-opacity duration-500 ease-out ${
                    isActive
                      ? "opacity-100"
                      : "opacity-95 lg:opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="py-1 sm:py-2">
                    {/* Chapter Eyebrow & Optical Label */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <p className="font-sans text-sm font-bold uppercase tracking-[0.08em] text-[#f0b545]">
                        {c.eyebrow}
                      </p>
                      <span className="rounded-full border border-white/12 bg-[#111319] px-3 py-0.5 font-sans text-sm font-bold uppercase tracking-[0.06em] text-white/75">
                        {c.label}
                      </span>
                    </div>

                    {/* Headline (Lato Black 900 hierarchy) */}
                    <Heading
                      className={
                        i === 0
                          ? "font-display font-black text-[2.1rem] sm:text-4xl lg:text-[2.75rem] text-[#f2efe8] tracking-[-0.02em] leading-[1.08] mb-3.5 text-balance"
                          : "font-display font-black text-2xl sm:text-3xl lg:text-[2.25rem] text-[#f2efe8] tracking-[-0.02em] leading-[1.12] mb-3.5 text-balance"
                      }
                    >
                      {c.titleLines.length
                        ? c.titleLines.map((line, n) => (
                            <span
                              key={line}
                              className={`block ${
                                n === c.titleLines.length - 1
                                  ? "text-[#f0b545]"
                                  : ""
                              }`}
                            >
                              {line}
                            </span>
                          ))
                        : c.title}
                    </Heading>

                    {/* Body Line */}
                    <p className="text-white/80 text-base sm:text-[17px] leading-[1.65] mb-5 max-w-lg">
                      {c.line}
                    </p>

                    {/* Action Links */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5">
                      {c.links.map((link, linkIdx) => (
                        <ActionLink
                          key={link.href}
                          href={link.href}
                          variant={i === 0 && linkIdx === 0 ? "primary" : "text"}
                        >
                          <span>{link.label}</span>
                          {i === 0 && linkIdx === 0 ? (
                            <span aria-hidden="true">↓</span>
                          ) : (
                            <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                          )}
                        </ActionLink>
                      ))}
                    </div>

                    {/* Mobile Fold 1 Live Prism Light Animation right above Proof Strip */}
                    {i === 0 && (
                      <div className="lg:hidden my-4">
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#08090c]">
                          {viewportMode === "mobile" ? (
                            <JourneyCanvas
                              maxFrameCount={27}
                              replayNonce={replayNonce}
                              loopIntro={loopPrism}
                              skipScrollControl
                              introSweep
                              className="w-full h-full"
                            />
                          ) : (
                            <img
                              src="/frames/journey/f_000.webp"
                              alt={`Optical stage 01: ${c.label}`}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <PrismControls
                            onReplay={() => setReplayNonce((n) => n + 1)}
                            looping={loopPrism}
                            onToggleLoop={() => setLoopPrism((v) => !v)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Structured MakeMyTrip-style Proof Strip Card inside Opening Chapter */}
                    {i === 0 && (
                      <div className="rounded-[10px] border border-white/12 bg-[#111319] p-4 shadow-[0_3px_28px_rgba(0,0,0,0.45)] mb-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {STATS.map((stat) => (
                          <div key={stat.label}>
                            <p className="font-display text-xl sm:text-2xl font-black text-[#f2efe8] tracking-tight">
                              {stat.to}
                              <span className="text-[#f0b545]">{stat.suffix}</span>
                            </p>
                            <p className="font-sans text-sm font-bold text-white/65 uppercase tracking-[0.05em]">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                        <div>
                          <p className="font-display text-xl sm:text-2xl font-black text-[#f2efe8] tracking-tight">
                            TEDx
                          </p>
                          <p className="font-sans text-sm font-bold text-white/65 uppercase tracking-[0.05em]">
                            &amp; Perimeter
                          </p>
                        </div>
                        <div>
                          <p className="font-display text-xl sm:text-2xl font-black text-[#f2efe8] tracking-tight">
                            MSc
                          </p>
                          <p className="font-sans text-sm font-bold text-white/65 uppercase tracking-[0.05em]">
                            Astrophysics
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mobile Inline Optics on Chapters 02-06 */}
                    {i > 0 && <MobileOpticalCard index={i} label={c.label} />}

                    {/* Personal Story Photograph in elevated 10px-radius frame */}
                    <div
                      className="relative w-full overflow-hidden rounded-[10px] bg-[#111319] border border-white/12 shadow-[0_3px_28px_rgba(0,0,0,0.45)]"
                      style={{
                        aspectRatio: c.ratio || 4 / 3,
                      }}
                    >
                      <Image
                        src={c.photo}
                        alt={c.alt}
                        fill
                        priority={i === 0}
                        sizes="(min-width: 1024px) 42vw, 92vw"
                        className="object-cover saturate-[0.82] contrast-[1.04] brightness-95"
                        style={{ objectPosition: c.focus }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08090c]/55 via-transparent to-transparent" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Column (Desktop only, avoids downloading 145 desktop frames on mobile) */}
          <div className="hidden lg:flex lg:col-span-6 sticky top-[76px] h-[calc(100vh-5rem)] flex-col justify-center">
            <div className="flex flex-col w-full">
              {/* Top Bar: Beam Replay Controls + MakeMyTrip-style Underline Station Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-3">
                {activeChapterIndex === 0 ? (
                  <PrismControls
                    onReplay={() => setReplayNonce((n) => n + 1)}
                    looping={loopPrism}
                    onToggleLoop={() => setLoopPrism((v) => !v)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      jumpToChapter(0);
                      setReplayNonce((n) => n + 1);
                    }}
                    className="inline-flex min-h-11 items-center gap-1.5 font-sans text-sm font-bold text-white/70 hover:text-[#f0b545] transition-colors cursor-pointer"
                  >
                    <span aria-hidden="true">↻</span>
                    <span>Replay prism</span>
                  </button>
                )}

                <nav
                  aria-label="Optical journey stations"
                  className="flex items-center justify-end gap-1"
                >
                  {chapters.map((c, idx) => {
                    const active = idx === activeChapterIndex;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => jumpToChapter(idx)}
                        aria-label={`Jump to station ${idx + 1}: ${c.label}`}
                        aria-current={active ? "step" : undefined}
                        className={`inline-flex min-h-11 min-w-10 items-center justify-center px-2 font-sans text-sm font-bold tracking-[0.04em] transition-colors cursor-pointer ${
                          active
                            ? "text-[#f0b545] border-b-[3px] border-[#f0b545]"
                            : "text-white/60 hover:text-white/95 border-b-[3px] border-transparent"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </button>
                    );
                  })}
                  <span className="ml-2 font-sans text-sm font-bold text-white/85">
                    · {currentChapter.label}
                  </span>
                </nav>
              </div>

              {/* Proportioned 8:7 Optical Bench Canvas */}
              <div className="relative w-full aspect-[8/7] max-h-[calc(100vh-13rem)] mx-auto overflow-hidden bg-[#08090c]">
                {viewportMode === "desktop" && (
                  <JourneyCanvas
                    progressRef={progressRef}
                    replayNonce={replayNonce}
                    loopIntro={loopPrism}
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Dynamic Per-Station Telemetry Readout */}
              <div className="mt-2.5 flex items-center justify-between gap-4 text-sm font-sans font-bold text-white/70">
                <span className="truncate">
                  <span className="text-[#f0b545]">{currentTelemetry.metric}</span>{" "}
                  · {currentTelemetry.detail}
                </span>
                <span className="uppercase tracking-[0.08em] shrink-0">
                  SCROLL TO SCRUB
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Work (#work) styled in MakeMyTrip Elevated Card + Horizontal Split Layout */}
      <section
        id="work"
        className="site-width scroll-mt-20 py-14 sm:py-20"
      >
        <div className="rounded-[10px] border border-white/12 bg-[#111319] p-6 sm:p-8 lg:p-10 shadow-[0_3px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6 mb-7">
            <div>
              <p className="font-sans text-sm font-bold uppercase tracking-[0.08em] text-[#f0b545] mb-2">
                Selected work &amp; writing
              </p>
              <h2 className="font-display font-black text-2xl sm:text-[32px] text-[#f2efe8] tracking-[-0.02em] leading-tight text-balance">
                Physics, investigations &amp; products built in public
              </h2>
            </div>
            <Link
              href="/contact"
              className="group inline-flex min-h-11 items-center gap-2 text-sm sm:text-base font-bold uppercase tracking-[0.04em] text-[#f0b545] hover:text-[#f8cd78] transition-colors shrink-0"
            >
              <span>Book a talk or collaborate</span>
              <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {EDITORIAL.explorations.map((item) => (
              <article
                key={item.title}
                className="group min-w-0 rounded-[10px] border border-white/12 bg-[#0a0c10] p-4 sm:p-5 shadow-[0_2px_14px_rgba(0,0,0,0.35)] transition-all hover:border-[#f0b545]/50"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 h-full">
                  <div className="relative w-full sm:w-[150px] shrink-0 aspect-[16/10] sm:aspect-square overflow-hidden rounded-[8px] bg-[#161922] border border-white/10">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 640px) 150px, 90vw"
                      className="object-cover saturate-[0.85] contrast-[1.04] brightness-95 group-hover:saturate-100 transition-all duration-300"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="font-sans text-sm font-bold uppercase tracking-[0.06em] text-[#f0b545]">
                        {item.category}
                      </span>
                      <span className="font-sans text-sm font-bold text-white/60 uppercase tracking-[0.04em]">
                        {item.type}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-[#f2efe8] leading-snug tracking-tight mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-base text-white/75 leading-relaxed mb-3 flex-1">
                      {item.description}
                    </p>
                    <div className="flex justify-start sm:justify-end">
                      <ActionLink href={item.href}>
                        <span>{item.cta}</span>
                        <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </ActionLink>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Understated Closing Invite directly before SiteFooter */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-base sm:text-lg text-white/80">
            Have a question about the physics, a speaking invitation, or an AI product collaboration?
          </p>
          <ActionLink href="/contact" variant="primary">
            <span>Start a conversation</span>
            <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </ActionLink>
        </div>
      </section>
    </div>
  );
}
