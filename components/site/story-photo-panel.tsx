"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface StoryPhoto {
  /** Story-section id this photo belongs to; must match the section's data-story-section attr. */
  id: string;
  src: string;
  alt: string;
  /** Optional caption drawn as a lower-left mono tag over the photo. */
  caption?: string;
  /** Optional CSS object-position, e.g. "center 30%". Defaults to center. */
  position?: string;
}

/**
 * Sticky right-column photo that cross-fades between story sections as the
 * reader scrolls. Every photo is rendered on mount and swapped by opacity,
 * so transitions never re-decode an image and there is no request storm
 * when scrolling quickly through the story.
 *
 * The observer tracks intersectionRatio for every section with a
 * `data-story-section` attribute matching an id in `photos`. Whichever
 * section fills the most of the viewport wins the panel. `initialId`
 * is what the panel shows before any section has intersected, and after
 * the reader has scrolled past the last section (the panel holds the
 * last active photo rather than blinking out).
 */
export function StoryPhotoPanel({
  photos,
  initialId,
  className = "",
}: {
  photos: StoryPhoto[];
  initialId?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>(
    initialId ?? photos[0]?.id ?? "",
  );

  useEffect(() => {
    const ids = new Set(photos.map((photo) => photo.id));
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-story-section]"),
    ).filter((el) => ids.has(el.dataset.storySection ?? ""));

    if (sections.length === 0) return;
    if (typeof IntersectionObserver === "undefined") return;

    const ratios = new Map<Element, number>();

    const pickActive = () => {
      let bestId: string | null = null;
      let bestRatio = 0;
      ratios.forEach((ratio, el) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = (el as HTMLElement).dataset.storySection ?? null;
        }
      });
      // Nothing intersecting means the reader is between sections or past
      // the last one. Hold the previous active photo rather than blanking.
      if (bestId && bestRatio > 0) setActiveId(bestId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target, entry.intersectionRatio);
        });
        pickActive();
      },
      {
        // A viewport-height band centred on the middle third of the screen.
        // Narrowing here makes the switch feel decisive: the panel changes as
        // the reader crosses into a new section, not when the section first
        // brushes the bottom of the viewport.
        rootMargin: "-30% 0px -30% 0px",
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [photos]);

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/12 bg-white/[0.02] ${className}`}
    >
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            activeId === photo.id ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={activeId !== photo.id}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 420px, 100vw"
            priority={i === 0}
            className="object-cover"
            style={{
              filter: "saturate(0.55) contrast(1.04)",
              objectPosition: photo.position ?? "center",
            }}
          />
          {photo.caption ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-14">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
                {photo.caption}
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
