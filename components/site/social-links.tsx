import { SOCIALS } from "@/lib/content";
import { GLYPHS, ArrowGlyph } from "./icons";

/**
 * The site is monochrome by design, so brand colour appears only on hover.
 * That keeps the palette intact while still making each platform recognisable
 * the moment a pointer lands on it.
 *
 * The note under each handle used to be clipped with `truncate`, which cut it
 * mid-word at every viewport including a 1440px desktop. It wraps now, and the
 * handle is on its own line so the two never compete for the same row.
 */
export function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <ul
      className={
        compact
          ? "flex flex-wrap gap-3"
          : "grid gap-px overflow-hidden rounded-xl border border-white/12 bg-white/12 sm:grid-cols-1"
      }
    >
      {SOCIALS.map((social) => {
        const Glyph = GLYPHS[social.glyph];

        if (compact) {
          return (
            <li key={social.label}>
              <a
                href={social.href}
                aria-label={`${social.label}, ${social.handle}`}
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ "--accent": social.accent } as React.CSSProperties}
              >
                <Glyph className="h-[18px] w-[18px]" />
              </a>
            </li>
          );
        }

        return (
          <li key={social.label}>
            <a
              href={social.href}
              className="group flex items-start gap-5 bg-black px-6 py-5 transition-colors duration-200 hover:bg-white/[0.05]"
              style={{ "--accent": social.accent } as React.CSSProperties}
            >
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/18 text-white/70 transition-colors duration-200 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                <Glyph className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="font-display flex flex-wrap items-baseline gap-x-3 text-sm font-light uppercase tracking-[0.2em] text-white">
                  {social.label}
                  <span className="font-mono break-all text-xs normal-case tracking-normal text-white/55">
                    {social.handle}
                  </span>
                </span>
                <span className="mt-1.5 block text-xs leading-relaxed text-white/55">
                  {social.note}
                </span>
              </span>

              <ArrowGlyph className="mt-3.5 h-4 w-4 shrink-0 text-white/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-white" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
