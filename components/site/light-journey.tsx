"use client";
/**
 * The home page as six rows. Each row has two cells: the words and a photo in
 * one, a pre-rendered 3D clip in the other, alternating sides. A clip never
 * draws outside its own cell. The opening clip plays once on arrival; the
 * others follow your scroll, and each clip ends where the next one starts.
 * The clips are Blender renders of the bench in lib/light-scene.ts
 * (see scripts/render/).
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { LIGHT_JOURNEY } from "@/lib/content";
import { ArrowGlyph } from "@/components/site/icons";

const clip = (i: number) => `/videos/journey/clip-${i}`;
const poster = (i: number, end: "first" | "last") => `/images/light-journey/clip-${i}-${end}.jpg`;

function SmartLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith("http"))
    return (
      <a className="jr-link" href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  if (href.startsWith("#"))
    return (
      <a className="jr-link" href={href}>
        {children}
      </a>
    );
  return (
    <Link className="jr-link" href={href}>
      {children}
    </Link>
  );
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function LightJourney() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const videos = Array.from(el.querySelectorAll<HTMLVideoElement>("video[data-clip]"));
    // Reduced motion: show the finished still of each moment, no playback.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videos.forEach((v) => (v.poster = poster(Number(v.dataset.clip), "last")));
      return;
    }

    // WebM (VP9) where supported, MP4 (H.264) for Safari.
    const probe = document.createElement("video");
    const ext = probe.canPlayType('video/webm; codecs="vp9"') ? "webm" : "mp4";
    // Load clips shortly before they come into view.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const v = e.target as HTMLVideoElement;
          if (!v.getAttribute("src") && v.dataset.src) {
            v.src = `${v.dataset.src}.${ext}`;
            v.load();
            if (v.dataset.clip === "0") v.play().catch(() => {});
          }
          io.unobserve(v);
        }
      },
      { rootMargin: "120% 0px" },
    );
    videos.forEach((v) => io.observe(v));

    // Scroll-led clips: progress runs while the cell crosses the screen.
    let raf = 0;
    const scrubbed = videos.filter((v) => v.dataset.clip !== "0");
    const update = () => {
      raf = 0;
      const H = window.innerHeight;
      for (const v of scrubbed) {
        if (!v.duration || v.readyState < 1) continue;
        const r = v.getBoundingClientRect();
        // Starts as the cell rises into view, ends when its centre passes 40%.
        const start = H * 0.92;
        const end = H * 0.4 - r.height / 2;
        const p = clamp01((start - r.top) / (start - end));
        const t = p * Math.max(0, v.duration - 0.05);
        if (Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t;
      }
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    scrubbed.forEach((v) => v.addEventListener("loadedmetadata", request));
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      scrubbed.forEach((v) => v.removeEventListener("loadedmetadata", request));
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  const chapters = LIGHT_JOURNEY.chapters;
  return (
    <div className="jr" ref={root}>
      {chapters.map((c, i) => {
        const Heading = i === 0 ? "h1" : "h2";
        return (
          <section
            key={c.id}
            id={c.id}
            className={`jr-row jr-row-${i} ${i % 2 === 0 ? "visual-right" : "visual-left"}`}
            aria-labelledby={`${c.id}-title`}
          >
            <div className="jr-copy">
              <p className="jr-eyebrow">{c.eyebrow}</p>
              <Heading id={`${c.id}-title`} className={`jr-title jr-title-${c.size}`}>
                {c.titleLines.length ? (
                  <>
                    <span className="sr-only">{c.title}</span>
                    <span aria-hidden="true">
                      {c.titleLines.map((line, n) => (
                        <span key={line} className={n === c.titleLines.length - 1 ? "jr-title-last" : undefined}>
                          {line}
                        </span>
                      ))}
                    </span>
                  </>
                ) : (
                  c.title
                )}
              </Heading>
              <p className="jr-line">{c.line}</p>
              <div className="jr-links">
                {c.links.map((l) => (
                  <SmartLink key={l.href} href={l.href}>
                    {l.label}
                    <ArrowGlyph className="h-4 w-4" />
                  </SmartLink>
                ))}
              </div>
              <figure className="jr-photo" style={{ "--ar": c.ratio } as React.CSSProperties}>
                <Image
                  src={c.photo}
                  alt={c.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 900px) 36vw, 92vw"
                  style={{ objectPosition: c.focus }}
                />
              </figure>
            </div>
            <figure className="jr-visual">
              <div className="jr-frame">
                <video
                  data-clip={i}
                  data-src={clip(i)}
                  poster={poster(i, i === 0 ? "last" : "first")}
                  muted
                  playsInline
                  preload="none"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
              <figcaption className="jr-caption">
                <span>{String(i + 1).padStart(2, "0")}</span> {c.label}
              </figcaption>
            </figure>
          </section>
        );
      })}
      <section className="jr-closer" aria-labelledby="jr-closer-title">
        <div className="site-width">
          <Link href={LIGHT_JOURNEY.closer.href} className="jr-closer-link">
            <span id="jr-closer-title" className="jr-closer-title">
              {LIGHT_JOURNEY.closer.title}
            </span>
            <ArrowGlyph className="jr-closer-arrow" />
          </Link>
          <p className="jr-closer-line">{LIGHT_JOURNEY.closer.line}</p>
          <details className="jr-notes">
            <summary>{LIGHT_JOURNEY.notesLabel}</summary>
            <p>{LIGHT_JOURNEY.notes}</p>
          </details>
        </div>
      </section>
    </div>
  );
}
