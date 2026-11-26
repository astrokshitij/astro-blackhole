"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LIGHT_JOURNEY } from "@/lib/content";
import { ArrowGlyph } from "@/components/site/icons";
import {
  OpticalBenchScene,
  type OpticalSceneController,
} from "@/components/3d/optical-bench-scene";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
        className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-[#f0b545] hover:text-[#f8cd78] hover:gap-3 transition-all duration-200"
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
        className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-[#f0b545] hover:text-[#f8cd78] hover:gap-3 transition-all duration-200"
        href={href}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-[#f0b545] hover:text-[#f8cd78] hover:gap-3 transition-all duration-200"
      href={href}
    >
      {children}
    </Link>
  );
}

export function LightJourney3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const journeyTrackRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<OpticalSceneController | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [webglSupported, setWebglSupported] = useState(true);

  // Check WebGL availability on mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // GSAP ScrollTrigger orchestration
  useEffect(() => {
    const track = journeyTrackRef.current;
    if (!track) return;

    // Register ScrollTrigger safely
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Main timeline binding total scroll progress to Three.js camera & light propagation
      ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          if (controllerRef.current) {
            controllerRef.current.setProgress(self.progress);
          }
          // Compute active chapter (0 to 5)
          const idx = Math.min(
            5,
            Math.max(0, Math.floor(self.progress * 6))
          );
          setActiveChapterIndex(idx);
        },
      });

      // Subtle entrance and exit animations for each editorial chapter card
      const chapterCards = gsap.utils.toArray<HTMLElement>(".chapter-card");
      chapterCards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0.25, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              end: "bottom 22%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const chapters = LIGHT_JOURNEY.chapters;
  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#08090c] text-[#f2efe8] selection:bg-[#f0b545]/20 selection:text-[#f0b545]"
    >
      {/* Pinned 3D WebGL Canvas Layer */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0"
        aria-hidden="true"
      >
        {webglSupported ? (
          <OpticalBenchScene
            onControllerReady={(ctrl) => {
              controllerRef.current = ctrl;
            }}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#08090c] text-white/50 text-sm">
            {LIGHT_JOURNEY.fallback}
          </div>
        )}
      </div>

      {/* Floating HUD: Active Chapter Indicator */}
      <div className="fixed top-24 right-4 sm:right-6 md:right-10 z-30 pointer-events-none">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 py-2 rounded-full bg-[#08090c]/85 backdrop-blur-md border border-white/10 shadow-lg text-xs font-mono uppercase tracking-[0.16em] sm:tracking-[0.2em] text-white/80">
          <span className="w-2 h-2 rounded-full bg-[#f0b545] animate-pulse" />
          <span className="text-[#f0b545]">
            {String(activeChapterIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-white/40">/</span>
          <span className="text-white/60">06</span>
          <span className="text-white/40">·</span>
          <span>{currentChapter.label}</span>
        </div>
      </div>

      {/* Scrollytelling Chapters Track */}
      <div
        ref={journeyTrackRef}
        className="relative z-10 -mt-[100vh] space-y-[24vh] md:space-y-[32vh] pb-32"
      >
        {chapters.map((c, i) => {
          const isEven = i % 2 === 0;
          const Heading = i === 0 ? "h1" : "h2";

          return (
            <section
              key={c.id}
              id={c.id}
              data-index={i}
              className="min-h-screen flex items-center px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto"
              aria-labelledby={`${c.id}-title`}
            >
              <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* 
                  Alternating Layout:
                  - Even chapters (0, 2, 4): Editorial card in cols 1-5 (Left). Cols 6-12 (Right) is empty for 3D visual!
                  - Odd chapters (1, 3, 5): Cols 1-7 (Left) is empty for 3D visual. Editorial card in cols 8-12 (Right)!
                */}
                <div
                  className={`chapter-card min-w-0 transition-all duration-300 md:col-span-6 lg:col-span-5 ${
                    isEven
                      ? "md:col-start-1"
                      : "md:col-start-7 lg:col-start-8"
                  }`}
                >
                  <div className="bg-[#08090c]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl hover:border-white/20 transition-colors">
                    {/* Eyebrow */}
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#f0b545] mb-3">
                      {c.eyebrow}
                    </p>

                    {/* Headline */}
                    <Heading
                      id={`${c.id}-title`}
                      className="font-display font-medium text-2xl sm:text-3xl md:text-4xl text-[#f2efe8] tracking-tight leading-[1.08] mb-4 text-balance"
                    >
                      {c.titleLines.length ? (
                        <>
                          <span className="sr-only">{c.title}</span>
                          <span aria-hidden="true">
                            {c.titleLines.map((line, n) => (
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

                    {/* Chapter Photo */}
                    <div
                      className="relative w-full overflow-hidden rounded-lg bg-[#111318] border border-white/10"
                      style={{
                        aspectRatio: c.ratio || 4 / 3,
                      }}
                    >
                      <Image
                        src={c.photo}
                        alt={c.alt}
                        fill
                        priority={i === 0}
                        sizes="(min-width: 900px) 40vw, 90vw"
                        className="object-cover filter contrast-[1.04] brightness-95"
                        style={{ objectPosition: c.focus }}
                      />
                    </div>
                  </div>
                </div>

                {/* Empty spacer for the 3D visual column on desktop */}
                <div
                  className={`hidden md:block md:col-span-6 lg:col-span-7 ${
                    isEven ? "md:col-start-7 lg:col-start-6" : "md:col-start-1"
                  }`}
                  aria-hidden="true"
                />
              </div>
            </section>
          );
        })}
      </div>

      {/* Closer Section */}
      <section className="relative z-20 border-t border-white/10 bg-[#08090c] py-24 px-6 md:px-12">
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
