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
  /**
   * Panel aspect ratio while this photo is active. Use the photo's natural
   * aspect so nothing important is cropped. E.g. "4/3" for a landscape,
   * "4/5" for a portrait, "1/1" for a near-square. Defaults to "4/5".
   * The panel animates between aspects smoothly on scroll.
   */
  aspect?: string;
  /** Optional CSS object-position, e.g. "center 30%". Defaults to center. */
  position?: string;
}

/**
 * Sticky right-column photo that cross-fades between story sections as the
 * reader scrolls. Every photo is rendered on mount and swapped by opacity,
 * so transitions never re-decode an image and there is no request storm
 * when scrolling quickly through the story. The panel also morphs its
 * aspect ratio to match each photo, so landscape shots don't get their
 * sides chopped in a portrait frame.
 *
 * The observer tracks intersectionRatio for every section with a
 * `data-story-section` attribute matching an id in `photos`. Whichever
 * section fills the most of the viewport wins the panel.
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
        rootMargin: "-30% 0px -30% 0px",
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [photos]);

  const activePhoto =
    photos.find((photo) => photo.id === activeId) ?? photos[0];
  const activeAspect = activePhoto?.aspect ?? "4/5";

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl border border-white/12 bg-black ${className}`}
      style={{
        aspectRatio: activeAspect,
        transition: "aspect-ratio 700ms ease-in-out",
      }}
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
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/80">
                {photo.caption}
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
