"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LIGHT_JOURNEY } from "@/lib/content";
import { ArrowGlyph } from "@/components/site/icons";
import { JourneyCanvas } from "@/components/site/journey-canvas";

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
  const progressRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const chapters = LIGHT_JOURNEY.chapters;
  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const sectionTop = rect.top + window.scrollY;

      // Map scroll cleanly from top of page (0) through bottom of the last chapter (1)
      const totalScroll = Math.max(1, rect.height - windowH * 0.72);
      const currentScroll = Math.max(0, window.scrollY - Math.max(0, sectionTop - 96));

      progressRef.current = Math.max(0, Math.min(1, currentScroll / totalScroll));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

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
      {/* Main Split-Stage Section */}
      <section
        ref={sectionRef}
        id="journey-start"
        className="relative pt-24 sm:pt-28 pb-20 sm:pb-28 px-6 sm:px-8 lg:px-12 max-w-[1440px] mx-auto"
      >
        {/* On Mobile: Sticky Canvas Stage pinned at the top */}
        <div className="block lg:hidden mb-10 sticky top-20 z-20 bg-[#08090c] pt-1 pb-4">
          <div className="mb-1.5 flex justify-end text-xs font-mono tracking-wider text-[#f0b545]">
            {String(activeChapterIndex + 1).padStart(2, "0")} · {currentChapter.label}
          </div>
          <div className="relative w-full aspect-[8/7] overflow-hidden bg-[#08090c]">
            <JourneyCanvas progressRef={progressRef} className="w-full h-full" />
          </div>
        </div>

        {/* 12-Column Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column (cols 1-6): Narrative Chapters */}
          <div className="lg:col-span-6 space-y-24 lg:space-y-40">
            {chapters.map((c, i) => {
              const Heading = i === 0 ? "h1" : "h2";
              const isActive = i === activeChapterIndex;

              return (
                <article
                  key={c.id}
                  id={c.id}
                  data-index={i}
                  className={`journey-chapter transition-opacity duration-500 ease-out ${
                    isActive ? "opacity-100" : "opacity-85 lg:opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="py-4 sm:py-6 lg:py-8 transition-opacity duration-500">
                    {/* Chapter Eyebrow */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#f0b545]">
                        {c.eyebrow}
                      </p>
                      <span className="font-mono text-xs uppercase tracking-wider text-white/55">
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
          <div className="hidden lg:block lg:col-span-6 sticky top-24 h-[calc(100vh-7rem)]">
            <div className="relative w-full h-full overflow-hidden bg-transparent">
              {/* Interactive 120 FPS Smoothly-Interpolated Image Sequence Canvas */}
              <JourneyCanvas progressRef={progressRef} className="w-full h-full" />

              {/* Edge Vignette Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090c]/90 via-transparent to-[#08090c]/30 pointer-events-none" />

              {/* Top-Right HUD Badge */}
              <div className="absolute top-5 right-5 z-20 text-xs font-mono tracking-wider text-white/80 flex items-center gap-3 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-[#f0b545] animate-pulse" />
                <span className="text-[#f0b545] font-semibold">
                  {String(activeChapterIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-white/50">/</span>
                <span className="text-white/60">06</span>
                <span className="text-white/50">·</span>
                <span className="font-semibold">{currentChapter.label}</span>
              </div>

              {/* Bottom-Left Information Strip */}
              <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between text-xs font-mono text-white/70 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-[#f0b545]">ASTRO KSHITIJ</span>
                  <span className="text-white/50">|</span>
                  <span>PHYSICS & STORY</span>
                </div>
                <span className="text-white/60 text-xs uppercase tracking-wider">
                  LIGHT JOURNEY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
