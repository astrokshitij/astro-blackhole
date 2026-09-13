import { SOCIALS } from "@/lib/content";
import { GLYPHS, ArrowGlyph } from "./icons";

/**
 * The site is monochrome by design, so brand colour appears only on hover.
 * That keeps the palette intact while still making each platform recognisable
 * the moment a pointer lands on it.
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
              className="group flex items-center gap-5 bg-black px-6 py-5 transition-colors duration-200 hover:bg-white/[0.05]"
              style={{ "--accent": social.accent } as React.CSSProperties}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/18 text-white/70 transition-colors duration-200 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                <Glyph className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="font-display block text-sm font-light uppercase tracking-[0.2em] text-white">
                  {social.label}
                </span>
                <span className="font-mono mt-1 block truncate text-[11px] text-white/55">
                  {social.handle}
                  <span className="hidden sm:inline"> &middot; {social.note}</span>
                </span>
              </span>

              <ArrowGlyph className="h-4 w-4 shrink-0 text-white/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-white" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
