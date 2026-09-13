/**
 * Platform glyphs.
 *
 * These are deliberately generic marks (a play symbol, a camera, a network)
 * rather than the official YouTube, Instagram and LinkedIn logos, which are
 * trademarks. Recognition comes from the platform name beside each one and the
 * brand colour that appears on hover.
 *
 * If you want the exact official marks, each platform publishes an SVG on its
 * own brand resources page along with the terms for using it. Drop the path
 * data into the matching component below and nothing else needs to change.
 */

type IconProps = { className?: string };

export function PlayGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.2 8.9v6.2l5.1-3.1-5.1-3.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CameraGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect
        x="2.9"
        y="6.4"
        width="18.2"
        height="13.2"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="13" r="3.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8.6 6.4l1.3-2.1h4.2l1.3 2.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NetworkGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="6" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="18" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8.4 8.2l6.6 8M8.2 6.2l7.6-0.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M6 9.5v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function MailGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect
        x="2.9"
        y="5.4"
        width="18.2"
        height="13.2"
        rx="2.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3.6 7.2l7.5 5.2a1.6 1.6 0 001.8 0l7.5-5.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M5 12h13m0 0l-5.2-5.2M18 12l-5.2 5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const GLYPHS = {
  play: PlayGlyph,
  camera: CameraGlyph,
  network: NetworkGlyph,
  mail: MailGlyph,
} as const;

export type GlyphName = keyof typeof GLYPHS;
