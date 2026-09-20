# Astro Kshitij — editorial redesign

## Scope and source

Implemented in the GitHub checkout of `astrokshitij/astro-blackhole`, starting at
`743088b`. The older `E:/Website/blackhole-site` folder contained only an earlier
simulation demo and had no Git metadata. It has not been changed.

## Audit and implementation plan

The existing site uses Next.js 16 App Router, React 19, TypeScript, Tailwind v4,
self-hosted Jost, and Geist. Markdown supplies the published essay and hidden
drafts. The GitHub main branch deploys to Vercel. Canonicals, social metadata,
Person/Article structured data, sitemap, robots, and security headers existed.

Desktop and mobile inspection found repeated directory/spotlight cards, content
hidden until animation, counters initially displaying zero, a mobile Contact
overflow, decorative WebGL on reading pages, and registration language that
conflicted with workshops being in development.

Plan: rebuild the shared editorial design and homepage; refine all inner routes;
retain published content, URLs, factual credentials and photographs; make content
and navigation resilient; validate the production build and responsive layouts.

## Implementation

- Near-black, warm-white and muted-amber palette. Jost display type has sentence
  case and tighter tracking; body copy stays in Geist.
- Homepage follows the requested eight-section order. Selected work uses the
  existing published cosmology investigation, linked peer-reviewed paper, and
  YouTube channel. No individual video title, duration, or thumbnail was invented.
- Existing black-hole ray marcher retained; removed the older unused renderer
  and decorative Three.js scene. Rendering is capped at 30 fps and 2.1 million
  backing pixels, and stops drawing while paused, hidden, or off screen.
- A small WebP captured from the actual renderer provides a static loading and
  failure fallback. Motion can be paused; the operating-system reduced-motion
  preference renders a still.
- Shared static inner-page heroes, full-screen native dialog menu, final HTML
  metrics, always-visible content, and reserved image proportions.
- About preserves the conversational story, adds numbered chapters and one
  credential summary, and retains the original photo sequence and captions.
- Writing features the existing essay and supports future published posts. Draft
  articles remain excluded from public routes.
- Workshops distinguish audience, duration, format, outcomes and availability.
  Both are explicitly in development. Registration now means interest, not a seat.
- Contact and workshop-interest forms collect enquiry type, name, email,
  organisation, audience, approximate date and message. With the existing blank
  Web3Forms key, they prepare an email for review and offer copying. They do not
  claim to have delivered anything. Configuring the existing key enables sending
  with success/error handling and a honeypot.

## Main files

- `app/page.tsx` — homepage.
- `app/editorial.css`, `app/globals.css`, `components/site/ui.tsx` — design system.
- `lib/content.ts` — facts, selected work, programme descriptions and copy.
- `components/site/site-header.tsx` — desktop and mobile navigation.
- `components/site/hero-visual.tsx`, `components/ui/black-hole-hero-section.tsx` —
  live simulation and motion controls.
- `components/site/enquiry-form.tsx` — enquiries and email draft fallback.
- `app/about`, `app/blog`, `app/workshops`, `app/contact` — inner-page redesign.
- `public/images/black-hole-still.webp` — static simulation frame.

## Content and delivery limits

- The repository contains one published essay and no verified individual video
  URLs. The third selected exploration therefore links to the real channel.
- Audience values (100+ talks, 137k+ people reached) are reused from the repository,
  not independently reverified. No invented testimonials, partners or achievements.
- Existing credential dates are inconsistent (the legacy list says 2023 while an
  About caption says 2024). New summaries deliberately omit years.
- About and article prose remain the existing owner's-review drafts as identified
  in AGENTS.md. Their substantive claims have not been rewritten.
- Institutional duration is not supplied; it is explicitly to be agreed.
- Web3Forms delivery cannot be verified until a real access key is configured.
- No deployment or push to main is included in this change.

## Validation

- Production build, ESLint and TypeScript checks pass.
- `node scripts/verify-site.mjs` passes against the production preview: seven
  public pages, internal links, one H1 per page, canonical/social metadata,
  Person/Article structured data, static metrics, enquiry fallback, sitemap,
  robots, draft exclusions and 404 responses.
- All seven pages checked at 375, 768 and 1440 pixels with no horizontal overflow.
  Mobile navigation also checked at 320 pixels. Screenshots are saved locally in
  `artifacts/redesign` (ignored by Git).
- Mobile menu navigation, Escape dismissal, restored focus and scroll locking
  verified. Simulation pause/play verified. Light/dark article reading mode
  verified; share links use the canonical public article URL.
- A dummy enquiry generated the expected email draft, including all entered
  fields. No email or external form submission was sent.
- Reduced-motion support is implemented but OS preference emulation was not
  available. No-JavaScript content was checked in server HTML, not a disabled-JS
  browser. No Lighthouse score or real form-delivery result is claimed.
- Preview is local only; no GitHub push, commit or public deployment performed.
