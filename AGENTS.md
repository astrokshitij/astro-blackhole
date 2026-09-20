# astrokshitij.com

Personal brand site for Astro Kshitij (Kshitij Pandey), science communicator.
Live at https://astrokshitij.com. Owner is **not a developer**: explain in plain
steps, never assume a terminal, and check the real result rather than trusting
that a change took effect.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4, deployed from
GitHub to Vercel on push to `main`. Warm-white and muted amber on near-black, built around a WebGL black-hole renderer.

Routes: `/`, `/about`, `/blog`, `/blog/[slug]`, `/workshops`,
`/workshops/register`, `/contact`, plus 404, sitemap, robots.

## Where things are

- `lib/content.ts` — **all editable text**: SITE, FORM_ACCESS_KEY, SOCIALS,
  STATS, PROGRAMMES, EDITORIAL and PAGE_COPY. Change copy here, not in components.
- `lib/seo.ts` — `socialMeta()`. Every route must build its `openGraph` and
  `twitter` blocks from this. See the trap below.
- `lib/posts.ts` — reads `content/blog/*.md` (gray-matter + marked).
  `draft: true` in frontmatter means no route is generated at all.
- `lib/site-url.ts` — the canonical origin, in one constant.
- `components/site/ui.tsx` — the design system: `ButtonLink`, `Section` (the one
  source of vertical rhythm), `SectionHeading`, `Eyebrow`, `NextPage`. Use these
  rather than writing new inline spacing or button styles.
- `components/site/site-header.tsx` — nav, with the mobile panel.
- `components/ui/black-hole-hero-section.tsx` — the retained ray marcher.
  `components/site/hero-visual.tsx` loads it and provides motion controls.
  It caps DPR, backing pixels and frame rate, and respects reduced motion.
- `app/editorial.css` — editorial layouts, palette and responsive rules.
- `components/site/enquiry-form.tsx` — shared Contact/workshop-interest form.
- `content/blog/*.md` — one file per post.
- `fonts/` — Jost, self-hosted, loaded via `next/font/local` in `app/layout.tsx`.

## Conventions

- Display face is Jost (`font-display`), body is Geist Sans, small labels are
  Geist Mono. Large headings use sentence case and tight tracking.
- **No text below 12px anywhere.** Light strokes on black bloom optically.
- Mono UI labels ("IN SHORT", "PREVIOUSLY") are `<p>`, never headings. Heading
  levels are for real section titles only.
- Every text colour must clear 4.5:1 on black. White at 50% or more is safe.
- Grid children that contain long strings need `min-w-0`, or they blow the
  track open and the page scrolls sideways on a 320px phone.
- Do not change `SITE.email` to a `@astrokshitij.com` address until mail
  actually exists on the domain.

## Verify before claiming a change works

1. `npm run build` and `npx tsc --noEmit` must both pass.
2. Then **look at it**, at 320px and at 1440px. Measurements alone are not
   enough: the mobile menu once passed every DOM check while rendering as an
   invisible 6px sliver.
3. `npm run dev` is fine locally. In a sandbox without websockets use
   `next build` + `next start`.

## Traps that have cost real time

- **`backdrop-filter` makes an ancestor the containing block for a
  `position: fixed` descendant.** The mobile nav panel must stay a sibling of
  `<header>`, not a child of it.
- **Next replaces a parent `openGraph` object wholesale** when a route declares
  its own, instead of merging field by field. A page that sets only a title
  silently loses `og:site_name`, `og:locale`, `og:type` and `og:image`. Always
  spread `socialMeta()`.
- **File-convention images (`app/opengraph-image.png`) get hashed URLs**, so
  they cannot be referenced literally. The OG card lives at `public/og.png`.
- **Tailwind v4 emits `oklab()` colours.** A contrast checker that regex-matches
  numbers out of `getComputedStyle().color` returns nonsense. Paint the colour
  to a 1x1 canvas and read the pixel back.
- **Never rebuild while a production server is running against `.next`.** The
  CSS chunk starts returning 500 and the page renders unstyled, which looks
  exactly like a CSS bug.
- A Windows clone checks out CRLF while the repo stores LF. `.gitattributes`
  pins `eol=lf`; if `git status` ever reports every file modified with equal
  insertions and deletions, that is this, not a real diff.

## Open items

1. **Direct form delivery is off.** Set a valid Web3Forms key in
   `FORM_ACCESS_KEY` in `lib/content.ts` and verify delivery. Until then the
   enquiry form prepares an email draft for the visitor to review and send.
2. **Contact is a gmail address.** Set up mail on the domain, then change
   `SITE.email` in one place.
3. **`public/images/home/tedx/1.jpg` is 1408px wide** for a band that displays
   at 1152 CSS px, so it is soft on retina. Needs a re-export. The other two
   sources are ~3000px and fine.
4. **Credential years need owner review.** The legacy content list says 2023,
   while an About photo caption says 2024. New summaries omit years.
5. **Individual video URLs are not in the repository.** The selected work
   section links to the existing YouTube channel rather than inventing a video.
6. **About and blog copy are AI drafts in Kshitij's voice**, not his writing.
7. **A `/work` portfolio section** was agreed but never built. Before it goes
   public, settle whether employer numbers belong on an indexed page.
8. **Run PageSpeed Insights** on the live site; real FCP/LCP were never measured.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
