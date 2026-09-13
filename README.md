# Astro Kshitij

The site at [astro-blackhole.vercel.app](https://astro-blackhole.vercel.app).
Next.js, TypeScript and Tailwind v4, with a WebGL2 black-hole renderer.

## Editing content

Almost everything you would want to change is in **`lib/content.ts`**: the site
name, email, social links, the stat numbers, blog entries, workshops and
credentials. Change the text between the quote marks and it updates everywhere
that text appears.

To add a blog entry or workshop, copy one `{ ... }` block, paste it below the
last one and edit it. Keep the commas. Adding `href: "https://..."` to a blog
entry turns its row into a link automatically.

When you point a real domain at the site, change the one constant at the top of
**`lib/site-url.ts`**. Metadata, the sitemap and robots.txt all follow from it.

## Publishing a change

The repository is connected to Vercel. Commit and push to `main` and the site
rebuilds itself in about a minute. There is no separate publish step.

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Layout

```
lib/content.ts                                      all editable copy
lib/site-url.ts                                     canonical origin
components/site/                                    header, footer, page banner
components/ui/optimized-black-hole.tsx              the renderer component
components/ui/optimized-black-hole-utils/
  renderer.ts                                       createRenderer({ canvas })
  shaders.ts                                        GLSL sources
app/page.tsx                                        home
app/about|blog|workshops|contact/page.tsx           the four inner pages
app/globals.css                                     Tailwind v4 and design tokens
```

## How the renderer works

Null geodesics are integrated per pixel in a Schwarzschild metric
(`d2x/dl2 = -1.5 h^2 x / r^5`, units r_s = 1), so the secondary disk image over
the shadow and the photon ring come out of the physics rather than a faked
distortion. Horizon at r = 1, photon sphere at 1.5, disk from the ISCO at 3 out
to 11, with a Keplerian shear and relativistic beaming on the approaching limb.

`<BlackHole />` accepts `offset={{ x, y }}`, `zoom` and `monochrome`. Both
offset and zoom are eased by aspect ratio inside the shader, so a framing tuned
for a wide hero does not swallow a phone screen.

Cost control: attribute-less full-screen triangle, one program, no per-frame
allocation, devicePixelRatio capped at 2 and backing store capped at 2.6M
pixels, adaptive render scale and step count driven by a moving average of frame
cost, paused off screen and on tab hide, a single static frame under
`prefers-reduced-motion`, context loss handled, and a 2D gradient fallback where
WebGL2 is missing.
