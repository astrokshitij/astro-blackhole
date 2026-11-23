"use client";
/**
 * The home page as six rows. Each row has two cells: the words and a photo in
 * one, a pre-rendered 3D clip in the other, alternating sides.
 *
 * On desktop (>= 900px):
 * The visual floats with the user as one continuous shot of light travelling
 * down the page. In each chapter, it stays pinned in view beside the words
 * and photo, scrubbing the moment's optics. Between chapters, it hands over
 * at the shared cut frame with no jump or flash, and glides across to the
 * next column slot.
 *
 * On mobile (< 900px):
 * Cells stack cleanly: words, photo, visual. Nothing overlaps.
 *
 * Reduced motion:
 * Shows finished stills (posters), no scrubbing or floating.
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
  const journeyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLElement>(null);
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionLabelRef = useRef<HTMLSpanElement>(null);

  const desktopVideosRef = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideosRef = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const chapters = LIGHT_JOURNEY.chapters;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: show the finished still of each moment, no playback or floating.
    if (isReduced) {
      const allVideos = Array.from(el.querySelectorAll<HTMLVideoElement>("video[data-clip]"));
      allVideos.forEach((v) => (v.poster = poster(Number(v.dataset.clip), "last")));
      return;
    }

    // WebM (VP9) where supported, MP4 (H.264) for Safari.
    const probe = document.createElement("video");
    const ext = probe.canPlayType('video/webm; codecs="vp9"') ? "webm" : "mp4";

    const loadVideoSrc = (v: HTMLVideoElement) => {
      if (!v.getAttribute("src") && v.dataset.src) {
        v.src = `${v.dataset.src}.${ext}`;
        v.load();
      }
    };

    // Load opening clip and second clip immediately
    desktopVideosRef.current.slice(0, 2).forEach((v) => { if (v) loadVideoSrc(v); });
    mobileVideosRef.current.slice(0, 2).forEach((v) => { if (v) loadVideoSrc(v); });

    // Play clip 0 on arrival
    const desk0 = desktopVideosRef.current[0];
    const mob0 = mobileVideosRef.current[0];
    if (desk0) desk0.play().catch(() => {});
    if (mob0) mob0.play().catch(() => {});

    // Lazy load later clips as the user approaches them
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".jr-row"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const rowIdx = Number((e.target as HTMLElement).dataset.index);
          // Load this clip and the next
          for (let k = rowIdx; k <= Math.min(rowIdx + 1, chapters.length - 1); k++) {
            const dv = desktopVideosRef.current[k];
            const mv = mobileVideosRef.current[k];
            if (dv) loadVideoSrc(dv);
            if (mv) loadVideoSrc(mv);
          }
        }
      },
      { rootMargin: "80% 0px" }
    );
    rows.forEach((r) => io.observe(r));

    // Cached layout geometry for zero-thrash scroll updates
    let isDesktop = window.innerWidth >= 900;
    let leftX = 0;
    let rightX = 0;
    let rowTops: number[] = [];
    let rowHeights: number[] = [];
    let stickyOffset = 84 + window.innerHeight * 0.03;

    const measure = () => {
      isDesktop = window.innerWidth >= 900;
      stickyOffset = 84 + window.innerHeight * 0.03;
      rowTops = rows.map((r) => r.offsetTop);
      rowHeights = rows.map((r) => r.offsetHeight);

      if (!isDesktop || !stageRef.current) return;
      const stageRect = stageRef.current.getBoundingClientRect();
      const slotRight = el.querySelector<HTMLElement>(".visual-right .jr-visual-slot");
      const slotLeft = el.querySelector<HTMLElement>(".visual-left .jr-visual-slot");

      if (slotRight && slotLeft) {
        const sr = slotRight.getBoundingClientRect();
        const sl = slotLeft.getBoundingClientRect();

        rightX = Math.round(sr.left - stageRect.left);
        leftX = Math.round(sl.left - stageRect.left);
        const w = Math.round(sr.width);
        if (floatingRef.current && w > 0) {
          floatingRef.current.style.width = `${w}px`;
        }
      }
    };

    let raf = 0;
    let lastActiveIdx = -1;
    let lastCaptionIdx = -1;

    const update = () => {
      raf = 0;
      const y = window.scrollY;

      if (!isDesktop) {
        // Mobile scrubber: clips scrub as each row crosses the middle of the screen
        const H = window.innerHeight;
        mobileVideosRef.current.forEach((v) => {
          if (!v || !v.duration || v.readyState < 1 || v.dataset.clip === "0") return;
          const r = v.getBoundingClientRect();
          const start = H * 0.92;
          const end = H * 0.4 - r.height / 2;
          const p = clamp01((start - r.top) / (start - end));
          const t = p * Math.max(0, v.duration - 0.05);
          if (Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t;
        });
        return;
      }

      // Desktop floating visual: smooth scrubbing within chapter, seamless handover between chapters
      const numRows = rows.length;
      if (numRows === 0 || rowTops.length === 0) return;

      // Find current row based on scroll position relative to sticky docking point
      let activeRow = 0;
      for (let i = 0; i < numRows; i++) {
        const top = rowTops[i] - stickyOffset;
        if (y >= top) {
          activeRow = i;
        } else {
          break;
        }
      }

      const topCurrent = rowTops[activeRow] - stickyOffset;
      const topNext = activeRow < numRows - 1 ? rowTops[activeRow + 1] - stickyOffset : topCurrent + rowHeights[activeRow];
      const rowSpan = Math.max(1, topNext - topCurrent);
      const u = clamp01((y - topCurrent) / rowSpan);

      const isEven = activeRow % 2 === 0;
      const fromSlotX = isEven ? rightX : leftX;
      const toSlotX = isEven ? leftX : rightX;

      // Division of row scroll:
      // 0.00 - 0.52: stationary reading & scrubbing phase
      // 0.52 - 0.82: handover at cut frame and smooth glide across to next column
      // 0.82 - 1.00: docked in next column as next chapter arrives
      let posX = fromSlotX;
      let activeClipIdx = activeRow;
      let captionIdx = activeRow;

      if (activeRow < numRows - 1 && u > 0.52) {
        // Handover & glide phase
        const glideProgress = clamp01((u - 0.52) / (0.82 - 0.52));
        // Smoothstep easing for physical gliding motion
        const ease = glideProgress * glideProgress * (3 - 2 * glideProgress);
        posX = fromSlotX + (toSlotX - fromSlotX) * ease;

        // Video handover at the shared cut frame:
        // Video activeRow is at its end frame; video activeRow+1 starts at its identical first frame.
        activeClipIdx = glideProgress >= 0.05 ? activeRow + 1 : activeRow;
        captionIdx = glideProgress >= 0.5 ? activeRow + 1 : activeRow;

        // Ensure current video rests at end frame and next video is prepared at frame 0
        const curVid = desktopVideosRef.current[activeRow];
        if (curVid && curVid.duration && curVid.readyState >= 1) {
          curVid.currentTime = Math.max(0, curVid.duration - 0.05);
        }
        const nextVid = desktopVideosRef.current[activeRow + 1];
        if (nextVid && nextVid.duration && nextVid.readyState >= 1) {
          if (nextVid.currentTime > 0.05) nextVid.currentTime = 0;
        }
      } else {
        // Stationary scrub phase
        posX = fromSlotX;
        activeClipIdx = activeRow;
        captionIdx = activeRow;

        const curVid = desktopVideosRef.current[activeRow];
        if (curVid && curVid.duration && curVid.readyState >= 1) {
          if (activeRow === 0) {
            // Opening clip: played on arrival. If user scrolls down past opening, scrub toward end frame
            if (u > 0.10) {
              if (!curVid.paused) curVid.pause();
              const p = clamp01((u - 0.10) / (0.52 - 0.10));
              const t = p * Math.max(0, curVid.duration - 0.05);
              if (Math.abs(curVid.currentTime - t) > 1 / 60) curVid.currentTime = t;
            }
          } else {
            // Scrub smoothly with scroll through the chapter
            const p = clamp01(u / 0.52);
            const t = p * Math.max(0, curVid.duration - 0.05);
            if (Math.abs(curVid.currentTime - t) > 1 / 60) curVid.currentTime = t;
          }
        }
      }

      // Update transform position
      if (floatingRef.current) {
        floatingRef.current.style.setProperty("--jr-visual-x", `${posX.toFixed(1)}px`);
      }

      // Update active video visibility
      if (activeClipIdx !== lastActiveIdx) {
        lastActiveIdx = activeClipIdx;
        desktopVideosRef.current.forEach((v, idx) => {
          if (!v) return;
          if (idx === activeClipIdx) {
            v.classList.add("active");
          } else {
            v.classList.remove("active");
          }
        });
      }

      // Update caption
      if (captionIdx !== lastCaptionIdx) {
        lastCaptionIdx = captionIdx;
        if (captionNumRef.current) {
          captionNumRef.current.textContent = String(captionIdx + 1).padStart(2, "0");
        }
        if (captionLabelRef.current) {
          captionLabelRef.current.textContent = chapters[captionIdx]?.label ?? "";
        }
      }
    };

    const requestUpdate = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      requestUpdate();
    };

    measure();
    update();

    desktopVideosRef.current.forEach((v) => {
      if (v) v.addEventListener("loadedmetadata", requestUpdate);
    });

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);
      desktopVideosRef.current.forEach((v) => {
        if (v) v.removeEventListener("loadedmetadata", requestUpdate);
      });
    };
  }, []);

  const chapters = LIGHT_JOURNEY.chapters;

  return (
    <div className="jr" ref={root}>
      <div className="jr-journey" ref={journeyRef}>
        {/* Desktop floating visual stage: pins in view and floats between rows */}
        <div className="jr-stage" aria-hidden="true" ref={stageRef}>
          <figure className="jr-floating-visual" ref={floatingRef}>
            <div className="jr-frame">
              {chapters.map((_, i) => (
                <video
                  key={i}
                  ref={(el) => { desktopVideosRef.current[i] = el; }}
                  data-clip={i}
                  data-src={clip(i)}
                  poster={poster(i, i === 0 ? "last" : "first")}
                  muted
                  playsInline
                  preload={i <= 1 ? "auto" : "none"}
                  tabIndex={-1}
                  className={i === 0 ? "active" : undefined}
                />
              ))}
            </div>
            <figcaption className="jr-caption">
              <span ref={captionNumRef}>01</span>{" "}
              <span ref={captionLabelRef}>{chapters[0].label}</span>
            </figcaption>
          </figure>
        </div>

        {chapters.map((c, i) => {
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <section
              key={c.id}
              id={c.id}
              data-index={i}
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

              {/* Desktop grid placeholder keeping 7/12 slot reserved */}
              <div className="jr-visual-slot" aria-hidden="true" />

              {/* Mobile / reduced-motion in-flow visual */}
              <figure className="jr-visual jr-visual-mobile">
                <div className="jr-frame">
                  <video
                    ref={(el) => { mobileVideosRef.current[i] = el; }}
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
      </div>

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
