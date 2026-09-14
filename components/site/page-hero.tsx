import BlackHole from "@/components/ui/optimized-black-hole";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  dek?: string;
  /** Shifts the render so each page is not an identical crop. */
  offset?: { x: number; y: number };
  /** Skip the uppercase + wide-tracking treatment on the title, so a
   * sentence-case heading like "Hi, I'm Kshitij." reads naturally. */
  plainCase?: boolean;
}

/**
 * Compact banner used at the top of every page except the home page. The
 * canvas pauses itself once it scrolls out of view, so the cost is a short
 * burst on load rather than a permanent drain.
 */
export function PageHero({
  eyebrow,
  title,
  dek,
  offset = { x: 0.42, y: 0.1 },
  plainCase = false,
}: PageHeroProps) {
  return (
    <section className="relative isolate flex min-h-[340px] items-end overflow-hidden border-b border-white/10 pt-16 sm:min-h-[400px]">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <BlackHole monochrome offset={offset} zoom={0.92} />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-black/55"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/40 to-black/20"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
        <p className="font-display text-[11px] uppercase tracking-[0.45em] text-white/55">
          {eyebrow}
        </p>
        <h1
          className={`font-display mt-4 text-[clamp(1.9rem,5.5vw,3.5rem)] font-light leading-[1.08] text-white ${
            plainCase ? "tracking-tight" : "uppercase tracking-[0.1em]"
          }`}
        >
          {title}
        </h1>
        {dek ? (
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
            {dek}
          </p>
        ) : null}
      </div>
    </section>
  );
}
