# astrokshitij.com

Personal brand site for Astro Kshitij (Kshitij Pandey), science communicator.
Live at https://astrokshitij.com. Owner is **not a developer**: explain in plain
steps, never assume a terminal, and check the real result rather than trusting
that a change took effect.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4, deployed from
GitHub to Vercel on push to `main`. Silver-on-black, built around a WebGL2
black-hole renderer.

Routes: `/`, `/about`, `/blog`, `/blog/[slug]`, `/workshops`,
`/workshops/register`, `/contact`, plus 404, sitemap, robots.

## Where things are

- `lib/content.ts` — **all editable text**: SITE, FORM_ACCESS_KEY, SOCIALS,
  STATS, WORKSHOPS, CREDENTIALS. Change copy here, not in components.
- `lib/seo.ts` — `socialMeta()`. Every route must build its `openGraph` and
  `twitter` blocks from this. See the trap below.
- `lib/posts.ts` — reads `content/blog/*.md` (gray-matter + marked).
  `draft: true` in frontmatter means no route is generated at all.
- `lib/site-url.ts` — the canonical origin, in one constant.
- `components/site/ui.tsx` — the design system: `ButtonLink`, `Section` (the one
  source of vertical rhythm), `SectionHeading`, `Eyebrow`, `NextPage`. Use these
  rather than writing new inline spacing or button styles.
- `components/site/site-header.tsx` — nav, with the mobile panel.
- `components/ui/optimized-black-hole*` — the renderer. Options: `offset`,
  `zoom`, `monochrome`, `getMonochrome`, `scrollColorShift`. It already caps DPR
  and backing-store pixels and adapts quality to frame time.
- `content/blog/*.md` — one file per post.
- `fonts/` — Jost, self-hosted, loaded via `next/font/local` in `app/layout.tsx`.

## Conventions

- Display face is Jost Light (`font-display`), body is Geist Sans, small labels
  are Geist Mono. Uppercase display type carries wide tracking.
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

1. **Registration form is off.** Needs a free access key from web3forms.com in
   `FORM_ACCESS_KEY` in `lib/content.ts`. Until then the page shows an
   email-based registration card, which works but converts worse.
2. **Contact is a gmail address.** Set up mail on the domain, then change
   `SITE.email` in one place.
3. **`public/images/home/tedx/1.jpg` is 1408px wide** for a band that displays
   at 1152 CSS px, so it is soft on retina. Needs a re-export. The other two
   sources are ~3000px and fine.
4. **H1 casing is inconsistent between routes** — uppercase and tracked on home,
   blog and contact; sentence case on about and workshops. `PageHero` takes a
   `plainCase` prop. Pick one rule.
5. **The inner-page hero band renders an almost invisible smudge** on `/blog`
   and `/contact` while carrying a full WebGL context. Either make it read or
   replace it with a still.
6. **About and blog copy are AI drafts in Kshitij's voice**, not his writing.
7. **A `/work` portfolio section** was agreed but never built. Before it goes
   public, settle whether employer numbers belong on an indexed page.
8. **Run PageSpeed Insights** on the live site; real FCP/LCP were never measured.
