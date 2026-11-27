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
  { metric: "400–700 nm", detail: "aperture slit selection" },
  { metric: "λ = 530 nm", detail: "collimated emerald wave" },
  { metric: "d = 180 µm", detail: "slit width 35 µm" },
  { metric: "P(y) ∝ cos²(π d y / λ L)", detail: "L = 1.0 m" },
  { metric: "Single-photon buildup", detail: "full optical bench" },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
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
      ? "group inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f0b545] px-5 py-2.5 text-sm font-medium text-[#08090c] transition-colors hover:bg-[#f8cd78]"
      : "group inline-flex min-h-11 items-center gap-2 text-sm sm:text-base font-medium text-[#f0b545] transition-colors hover:text-[#f8cd78]";

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
  const isDesktop = useIsDesktop();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
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
      {/* Primary Split-Stage Section */}
      <section
        ref={sectionRef}
        className="relative pt-20 sm:pt-24 pb-14 sm:pb-20 px-6 sm:px-8 lg:px-12 max-w-[1440px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
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
                  className={`journey-chapter scroll-mt-24 transition-opacity duration-500 ease-out ${
                    isActive
                      ? "opacity-100"
                      : "opacity-95 lg:opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="py-1 sm:py-2">
                    {/* Chapter Eyebrow & Optical Label */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#f0b545]">
                        {c.eyebrow}
                      </p>
                      <span className="font-mono text-xs uppercase tracking-wider text-white/55">
                        {c.label}
                      </span>
                    </div>

                    {/* Headline */}
                    <Heading className="font-display font-medium text-3xl sm:text-4xl lg:text-[2.65rem] text-[#f2efe8] tracking-tight leading-[1.06] mb-3.5 text-balance">
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
                    <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-4 max-w-lg">
                      {c.line}
                    </p>

                    {/* Action Links */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
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

                    {/* Mobile Fold 1 Prism Visual right above Proof Strip */}
                    {i === 0 && <MobileOpticalCard index={i} label={c.label} />}

                    {/* Minimalist Proof Strip cleanly inside Opening Chapter */}
                    {i === 0 && (
                      <div className="border-y border-white/10 py-3.5 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {STATS.map((stat) => (
                          <div key={stat.label}>
                            <p className="font-display text-lg sm:text-xl font-medium text-[#f2efe8]">
                              {stat.to}
                              <span className="text-[#f0b545]">{stat.suffix}</span>
                            </p>
                            <p className="font-mono text-xs text-white/60 uppercase tracking-wider">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                        <div>
                          <p className="font-display text-lg sm:text-xl font-medium text-[#f2efe8]">
                            TEDx
                          </p>
                          <p className="font-mono text-xs text-white/60 uppercase tracking-wider">
                            &amp; Perimeter
                          </p>
                        </div>
                        <div>
                          <p className="font-display text-lg sm:text-xl font-medium text-[#f2efe8]">
                            MSc
                          </p>
                          <p className="font-mono text-xs text-white/60 uppercase tracking-wider">
                            Astrophysics
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mobile Inline Optics on Chapters 02-06 */}
                    {i > 0 && <MobileOpticalCard index={i} label={c.label} />}

                    {/* Personal Story Photograph with Observatory Darkroom Grading */}
                    <div
                      className="relative w-full overflow-hidden rounded-sm bg-[#111318] border border-white/10"
                      style={{
                        aspectRatio: c.ratio || 4 / 3,
                      }}
                    >
                      <Image
                        src={c.photo}
                        alt={c.alt}
                        fill
                        priority={i === 0}
                        sizes="(min-width: 1024px) 44vw, 92vw"
                        className="object-cover saturate-[0.75] contrast-[1.06] brightness-90"
                        style={{ objectPosition: c.focus }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08090c]/60 via-transparent to-transparent" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Column (Desktop only — avoids downloading 145 desktop frames on mobile) */}
          <div className="hidden lg:flex lg:col-span-6 sticky top-20 h-[calc(100vh-5.5rem)] flex-col justify-center">
            <div className="flex flex-col w-full">
              {/* Clickable Optical Chapter Selector directly above Stage */}
              <nav
                aria-label="Optical journey stations"
                className="flex items-center justify-end gap-1 mb-2"
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
                      className={`inline-flex min-h-11 min-w-10 items-center justify-center px-2 font-mono text-xs tracking-wider transition-colors cursor-pointer ${
                        active
                          ? "text-[#f0b545] font-semibold border-b-2 border-[#f0b545]"
                          : "text-white/55 hover:text-white/90"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </button>
                  );
                })}
                <span className="ml-2 font-mono text-xs text-white/80">
                  · {currentChapter.label}
                </span>
              </nav>

              {/* Proportioned 8:7 Optical Bench Canvas */}
              <div className="relative w-full aspect-[8/7] max-h-[calc(100vh-13rem)] mx-auto overflow-hidden bg-[#08090c]">
                {isDesktop && (
                  <JourneyCanvas
                    progressRef={progressRef}
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Dynamic Per-Station Telemetry Readout */}
              <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-white/60">
                <span>
                  <span className="text-[#f0b545]">{currentTelemetry.metric}</span>{" "}
                  · {currentTelemetry.detail}
                </span>
                <span className="uppercase tracking-wider">
                  OPTICAL BENCH · SCROLL TO SCRUB
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Native Selected Work Grid (#work) */}
      <section
        id="work"
        className="scroll-mt-24 border-t border-white/10 px-6 sm:px-8 lg:px-12 py-16 sm:py-24 max-w-[1440px] mx-auto"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#f0b545] mb-3">
              Selected work &amp; writing
            </p>
            <h2 className="font-display font-medium text-2xl sm:text-3xl lg:text-4xl text-[#f2efe8] tracking-tight text-balance">
              Physics, investigations &amp; products built in public
            </h2>
          </div>
          <Link
            href="/contact"
            className="group inline-flex min-h-11 items-center gap-2 text-sm sm:text-base font-medium text-[#f0b545] hover:text-[#f8cd78] transition-colors shrink-0"
          >
            <span>Book a talk or collaborate</span>
            <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
          {EDITORIAL.explorations.map((item) => (
            <article key={item.title} className="group min-w-0">
              <div className="relative w-full aspect-[16/10] overflow-hidden rounded-sm bg-[#111318] border border-white/10 mb-4">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 44vw, 92vw"
                  className="object-cover saturate-[0.75] contrast-[1.05] brightness-90 group-hover:saturate-90 transition-all duration-300"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08090c]/60 via-transparent to-transparent" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#f0b545]">
                  {item.category}
                </span>
                <span className="font-mono text-xs text-white/55">
                  {item.type}
                </span>
              </div>
              <h3 className="font-display font-medium text-xl sm:text-2xl text-[#f2efe8] tracking-tight mb-2">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-2">
                {item.description}
              </p>
              <ActionLink href={item.href}>
                <span>{item.cta}</span>
                <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </ActionLink>
            </article>
          ))}
        </div>

        {/* Understated Closing Invite directly before SiteFooter */}
        <div className="mt-16 pt-10 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-white/70">
            Have a question about the physics, a speaking invitation, or an AI product collaboration?
          </p>
          <Link
            href="/contact"
            className="group inline-flex min-h-11 items-center gap-2 text-base font-medium text-[#f0b545] hover:text-[#f8cd78] transition-colors shrink-0"
          >
            <span>Start a conversation</span>
            <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
