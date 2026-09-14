"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (photos.length <= 1) return;
    const reducedMotion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    if (reducedMotion?.matches) return;

    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [photos.length, intervalMs]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-white/12 bg-black ${className}`}
      role="img"
      aria-label={ariaLabel ?? photos[0]?.alt}
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
    </div>
  );
}
