"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowGlyph } from "./icons";

interface CarouselPhoto {
  src: string;
  alt: string;
  /** Optional CSS object-position to keep the subject inside the crop. */
  position?: string;
}

/**
 * Cross-fading photo carousel. Both photos render on mount; only opacity
 * transitions between them, so a slow scroll or a viewer with a weaker
 * connection never sees a half-loaded photo. Rotation pauses under
 * prefers-reduced-motion and holds the first frame instead.
 */
export function TedxCarousel({
  photos,
  intervalMs = 6500,
  fadeMs = 1200,
  className = "",
  ariaLabel,
}: {
  photos: CarouselPhoto[];
  intervalMs?: number;
  fadeMs?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    const reducedMotion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    if (reducedMotion?.matches) return;

    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [photos.length, intervalMs, paused]);

  function move(direction: 1 | -1) {
    setIndex((current) => (current + direction + photos.length) % photos.length);
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-white/12 bg-black ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel ?? photos[0]?.alt}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {photos.map((photo, i) => (
        <div
          key={photo.src}
          className="absolute inset-0"
          style={{
            opacity: i === index ? 1 : 0,
            transition: `opacity ${fadeMs}ms ease-in-out`,
          }}
          aria-hidden={i !== index}
        >
          <Image
            src={photo.src}
            alt={i === index ? photo.alt : ""}
            fill
            sizes="(min-width: 1024px) 1152px, 100vw"
            priority={i === 0}
            className="object-cover"
            style={{
              filter: "saturate(0.55) contrast(1.04)",
              objectPosition: photo.position ?? "center",
            }}
          />
        </div>
      ))}

      {photos.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-black/70"
            aria-label="Previous photo"
          >
            <ArrowGlyph className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-black/70"
            aria-label="Next photo"
          >
            <ArrowGlyph className="h-4 w-4" />
          </button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2" aria-label="Choose photo">
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                  i === index ? "border-white bg-white" : "border-white/60 bg-black/40 hover:bg-white/70"
                }`}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
