"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface RevealPhotoProps {
  src: string;
  alt: string;
  /** Small mono caption rendered below the image. Skip for photos that stand alone. */
  caption?: string;
  /** Aspect ratio Tailwind class, e.g. "aspect-[16/9]", "aspect-[4/5]". */
  aspectClassName?: string;
  /** Optional wrapper class on the figure. */
  className?: string;
  /** Optional class on the image itself. */
  imageClassName?: string;
  /** Slow "Ken Burns without the pan" zoom. Applied only to hero-ish photos. */
  drift?: boolean;
  /** Skip the reveal (photo is above the fold). Also sets Next.js `priority`. */
  eager?: boolean;
  sizes?: string;
}

/**
 * A photo that fades and rises into view once, then holds. Ships the
 * monochrome desaturation treatment so photos sit calmly against the
 * silver-on-black design system. `drift` adds a very slow held-image zoom
 * for the one or two frames that stay on screen long enough to notice it.
 * `prefers-reduced-motion` disables both the reveal transition and the
 * drift keyframes at the CSS layer (see globals.css).
 */
export function RevealPhoto({
  src,
  alt,
  caption,
  aspectClassName = "aspect-[3/2]",
  className = "",
  imageClassName = "",
  drift = false,
  eager = false,
  sizes = "(min-width: 1024px) 768px, 100vw",
}: RevealPhotoProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setShown(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  return (
    <figure
      ref={ref}
      className={`${className} transition-[opacity,transform] duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] ${aspectClassName}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={eager}
          className={`object-cover ${drift ? "animate-slow-drift" : ""} ${imageClassName}`}
          style={{ filter: "saturate(0.55) contrast(1.04)" }}
        />
      </div>
      {caption ? (
        <figcaption className="font-mono mt-3 text-xs uppercase tracking-[0.18em] text-white/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
