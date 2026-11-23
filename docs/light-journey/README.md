# Home page: the light journey (v4)

Replaces the rejected v2/v3 attempts. One full-window WebGL2 scene sits behind
six real HTML chapters. Each chapter has one headline, one line, one photo and
up to two links. The light moves through one continuous world as you scroll:

sun → flat mirror → prism → spectrum on a card → pinhole (green) → lens →
two vertical slits → wavefronts → detector dots → probability curve.

## Files

| File | What it does |
|---|---|
| `lib/light-scene.ts` | Pure optics: prism pose, Snell refraction per wavelength, mirror and pinhole positions. Tested. |
| `components/site/light-journey-gl.ts` | The renderer: one fragment shader that ray-traces the bench. |
| `components/site/light-journey-screen.ts` | Detector texture: dots sampled from the two-slit distribution, plus the curve. |
| `components/site/light-journey.tsx` | Chapters, camera stations, scroll mapping, pause, fallback. |
| `app/light-journey.css` | Layout: alternating sides on desktop, one column on phones. |
| `lib/content.ts` → `LIGHT_JOURNEY` | All copy, photo paths and photo crops (`focus`). |
| `public/images/light-journey/station-*.webp` | Stills rendered from this same scene, used only without WebGL 2. |

## How the composition works

Each chapter has an empty `.lj-stage` box: the right side, then the left side,
alternating on desktop; a band between the words and the photo on phones. The
camera frames the current station inside that box, and between chapters it
glides along the bench while the framing slides to the other side. Nothing is
pinned and scroll is native. Camera stations are the `DESKTOP` and `MOBILE`
arrays at the top of `light-journey.tsx`.

Light never paints over words: every text block and photo is passed to the
shader as a soft mask that dims light behind it by about 90%, and the
apparatus by 60%.

## Physics, and where it is deliberately not literal

- The prism floats, turned by half its minimum deviation. In that pose green
  (530 nm) leaves level, so the rest of the bench sits at one height and the
  white light enters well away from grazing. Standing flat on the floor, a
  level green beam needs 84.6° incidence; that was rejected.
- Refraction is solved at both faces for 24 wavelengths (Cauchy index).
  Dispersion is enlarged 4× so the spectrum is visible.
- A pinhole then a lens prepare the light for the slits. Picking a colour alone
  does not make light coherent; the notes on the page say so.
- Exactly two vertical slits, separated horizontally; vertical bands on the
  detector. The pattern includes the single-slit envelope.
- Detector: 530 nm, 35 µm slits, 180 µm apart, 1 m, 36 mm field. Dots are
  detections sampled from that distribution; nothing leaves the detector.
- Schematic: wavefront spacing and sizes, the light being revealed along its
  path as you scroll (light is not slow), visible beams (dust scattering), the
  glass shading (procedural studio lights, not a calibrated renderer).
- The wavefronts on the plane fade before the screen because their spacing is
  schematic and would not match the true fringe count.

## Performance and accessibility

- One WebGL2 context, a single full-screen triangle. Backing resolution is
  capped at 1.5× (1.2× on phones) and a frame-time governor lowers it to keep
  motion smooth. Rendering stops when nothing moves, when the tab is hidden and
  after the journey scrolls away.
- Pause button for the continuous wave motion. Reduced motion: no intro
  sweep, frozen waves, and chapter changes become a short fade, not a camera
  move.
- No WebGL 2: the stills above are shown in each stage.

## Verification actually performed (23 Nov 2026)

- `npm run build`, `npx tsc --noEmit`, `eslint .`, and
  `node --test scripts/*.test.mjs` (14 passing) all pass.
- Screenshots in `qa/light-journey/` from the production build in headless
  Chromium with **software** WebGL (SwiftShader): 1440, 1024, 390 and 320 px,
  every chapter, and the halfway point between chapters. No horizontal
  overflow at any width. Phone menu sits above the scene. Fallback and reduced
  motion checked.
- **Not yet done:** a real GPU, real Safari or a real iPhone. Frame rate on
  phones is unmeasured; the governor exists for that reason. Shader compile
  time on older phones is unmeasured.

## Design review round (23 Nov 2026)

An independent critical design review of the first build raised 15 issues.
Applied:
- Light no longer shows through words: each chapter's words and photo are
  masked as one block and light behind them is dimmed by about 98%.
- Desktop chapters fade out before the next fades in, so mid-transition frames
  show only the scene. Phones no longer glide the camera at all: each
  experiment stays in its own band, scrolls with the page and swaps while out
  of sight, so it never crosses a headline.
- Shorter copy: one line of 7 to 12 words, one link per chapter (two on the
  opening), number-only labels. Opening headline breaks on three lines with
  "you think." in gold. Short headlines go a size up for rhythm.
- Photos: crisp 2px-radius frames with one shared grade instead of feathered
  vignettes; the opening portrait still fades into the dark.
- Prism lengthened (depth 1.6) so it reads as a bar prism, softer bevels,
  dimmer reflection. Card has a pale face so the rainbow visibly lands on it.
  Green light catches the metal props. Green no longer appears before its
  chapter.
- Small mono labels pinned to each object ("Sunlight", "Many colours", "One
  colour gets through", "Two slits", "One photon at a time", "Where it is
  likely to land"), hidden if they would touch words or photos.
- The ending gives the pattern most of the screen, followed by a full-width
  "Let's talk." closer. The pause control is a small icon button.

Not applied, on purpose: changing the opening headline (the owner kept it),
tiny inset photos (the brief rules out a tiny avatar as the main photo),
dropping the growth/AI line from the ending (part of the agreed story), and a
site-wide header redesign (out of scope).

## Earlier attempts

`docs/light-story-v2/` and the v3 notes describe rejected versions. The
reused physics helpers (`lib/light-physics.ts`, `lib/optical-bench.ts`) and
their tests came from `codex/home-light-story`. `components/ui/prism-hero.tsx`
and `components/site/spectrum-scroll.tsx` are no longer mounted on the home
page but are kept.
