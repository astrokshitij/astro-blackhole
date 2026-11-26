"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LIGHT_JOURNEY } from "@/lib/content";
import { ArrowGlyph } from "@/components/site/icons";

function SmartLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");
  const isHash = href.startsWith("#");

  if (isExternal) {
    return (
      <a
        className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#f0b545] hover:text-[#f8cd78] hover:gap-3 transition-all duration-200"
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
      <a
        className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#f0b545] hover:text-[#f8cd78] hover:gap-3 transition-all duration-200"
        href={href}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#f0b545] hover:text-[#f8cd78] hover:gap-3 transition-all duration-200"
      href={href}
    >
      {children}
    </Link>
  );
}

export function LightJourneyStage() {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const chapters = LIGHT_JOURNEY.chapters;
  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  useEffect(() => {
    const chapterEls = document.querySelectorAll<HTMLElement>(".journey-chapter");
    if (!chapterEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) {
              setActiveChapterIndex(idx);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -35% 0px",
        threshold: 0.1,
      }
    );

    chapterEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full bg-[#08090c] text-[#f2efe8] selection:bg-[#f0b545]/20 selection:text-[#f0b545]">
      {/* Hero Opening Header */}
      <section className="relative pt-32 pb-16 px-6 sm:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#f0b545] mb-4">
            Kshitij Pandey / Astro Kshitij
          </p>
          <h1 className="font-display font-medium text-4xl sm:text-5xl lg:text-6xl text-[#f2efe8] tracking-tight leading-[1.04] mb-6 text-balance">
            The universe is stranger than <span className="text-[#f0b545]">you think</span>.
          </h1>
          <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
            I’m a physicist, TEDx speaker and science communicator exploring the ideas that reshape reality. Follow the light down.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#journey-start"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f0b545] text-[#08090c] font-medium text-sm hover:bg-[#f8cd78] transition-colors"
            >
              <span>Explore the story</span>
              <span className="text-base">↓</span>
            </a>
            <a
              href="https://www.youtube.com/@astrokshitij"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:border-white/50 hover:bg-white/[0.04] transition-all text-sm font-medium"
            >
              <span>Watch on YouTube</span>
              <ArrowGlyph className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Split-Stage Section */}
      <section className="relative px-6 sm:px-8 lg:px-12 max-w-[1440px] mx-auto pb-24">
        {/* On Mobile: Sticky Video Stage pinned at the top */}
        <div className="block lg:hidden mb-12 sticky top-20 z-20">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <video
              src="/videos/journey/hero-gemini.mp4"
              poster="/images/journey/hero-gemini-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090c]/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono tracking-wider text-[#f0b545]">
              {String(activeChapterIndex + 1).padStart(2, "0")} · {currentChapter.label}
            </div>
          </div>
        </div>

        {/* 12-Column Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column (cols 1-6): Narrative Chapters */}
          <div className="lg:col-span-6 space-y-24 lg:space-y-36">
            {chapters.map((c, i) => {
              const Heading = i === 0 ? "h2" : "h2";
              const isActive = i === activeChapterIndex;

              return (
                <article
                  key={c.id}
                  id={c.id}
                  data-index={i}
                  className={`journey-chapter transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-85 lg:opacity-65 hover:opacity-100"
                  }`}
                >
                  <div className="bg-[#08090c]/90 border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl hover:border-white/20 transition-all">
                    {/* Chapter Eyebrow */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#f0b545]">
                        {c.eyebrow}
                      </p>
                      <span className="font-mono text-xs uppercase tracking-wider text-white/40">
                        {c.label}
                      </span>
                    </div>

                    {/* Headline */}
                    <Heading className="font-display font-medium text-2xl sm:text-3xl lg:text-4xl text-[#f2efe8] tracking-tight leading-[1.08] mb-4 text-balance">
                      {c.titleLines.length ? (
                        <>
                          <span className="sr-only">{c.title}</span>
                          <span aria-hidden="true">
                            {c.titleLines.map((line, n) => (
                              <span
                                key={line}
                                className={`block ${
                                  n === c.titleLines.length - 1 ? "text-[#f0b545]" : ""
                                }`}
                              >
                                {line}
                              </span>
                            ))}
                          </span>
                        </>
                      ) : (
                        c.title
                      )}
                    </Heading>

                    {/* Body Line */}
                    <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                      {c.line}
                    </p>

                    {/* Action Links */}
                    <div className="flex flex-wrap gap-4 mb-6">
                      {c.links.map((link) => (
                        <SmartLink key={link.href} href={link.href}>
                          {link.label}
                          <ArrowGlyph className="h-4 w-4" />
                        </SmartLink>
                      ))}
                    </div>

                    {/* Photo with precise aspect ratio */}
                    <div
                      className="relative w-full overflow-hidden rounded-xl bg-[#111318] border border-white/10"
                      style={{
                        aspectRatio: c.ratio || 4 / 3,
                      }}
                    >
                      <Image
                        src={c.photo}
                        alt={c.alt}
                        fill
                        priority={i === 0}
                        sizes="(min-width: 900px) 45vw, 90vw"
                        className="object-cover filter contrast-[1.04] brightness-95"
                        style={{ objectPosition: c.focus }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Column (cols 7-12): The Anchored Cinematic Stage (Desktop) */}
          <div className="hidden lg:block lg:col-span-6 sticky top-28 h-[calc(100vh-8.5rem)]">
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              {/* Cinematic Video */}
              <video
                src="/videos/journey/hero-gemini.mp4"
                poster="/images/journey/hero-gemini-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-[1.04]"
              />

              {/* Edge Vignette & Watermark Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090c]/90 via-transparent to-[#08090c]/30 pointer-events-none" />

              {/* Top-Right HUD Badge */}
              <div className="absolute top-5 right-5 z-20 px-4 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-xs font-mono tracking-wider text-white flex items-center gap-3 shadow-lg pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-[#f0b545] animate-pulse" />
                <span className="text-[#f0b545] font-semibold">
                  {String(activeChapterIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-white/40">/</span>
                <span className="text-white/60">06</span>
                <span className="text-white/40">·</span>
                <span className="font-semibold">{currentChapter.label}</span>
              </div>

              {/* Bottom-Left Information Strip */}
              <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between text-xs font-mono text-white/70 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-[#f0b545]">ASTRO KSHITIJ</span>
                  <span className="text-white/30">|</span>
                  <span>PHYSICS & STORY</span>
                </div>
                <span className="text-white/50 text-[11px] uppercase tracking-wider">
                  LIGHT JOURNEY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closer Section */}
      <section className="relative z-20 border-t border-white/10 bg-[#08090c] py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Link
            href={LIGHT_JOURNEY.closer.href}
            className="group inline-flex items-center gap-4 text-3xl sm:text-4xl md:text-5xl font-display font-light text-[#f2efe8] hover:text-[#f0b545] transition-colors"
          >
            <span>{LIGHT_JOURNEY.closer.title}</span>
            <ArrowGlyph className="h-8 w-8 text-[#f0b545] transition-transform duration-200 group-hover:translate-x-2" />
          </Link>
          <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
            {LIGHT_JOURNEY.closer.line}
          </p>

          <details className="mt-12 text-left max-w-2xl mx-auto p-6 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-white/60 leading-relaxed cursor-pointer hover:border-white/20 transition-colors">
            <summary className="font-mono uppercase tracking-[0.16em] text-[#f0b545] font-semibold mb-3">
              {LIGHT_JOURNEY.notesLabel}
            </summary>
            <p className="mt-2 text-white/70">{LIGHT_JOURNEY.notes}</p>
          </details>
        </div>
      </section>
    </div>
  );
}
