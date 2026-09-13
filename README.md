# Astro Kshitij

[astrokshitij.com](https://astrokshitij.com). Next.js, TypeScript and Tailwind
v4, with a WebGL2 black-hole renderer.

Everything below is written for editing by hand. You never need a terminal.

---

## Publishing anything

The repository is connected to Vercel. **Commit and push to `main` and the site
rebuilds itself in about a minute.** There is no separate publish step. That is
true for every change described below.

---

## 1. Writing a blog post

Each post is one markdown file in **`content/blog/`**. The filename becomes the
web address: `content/blog/turn-around-twice.md` is served at
`/blog/turn-around-twice`. Use lowercase words separated by hyphens, no spaces.

Every file starts with a block between two `---` lines, then the article:

```markdown
---
title: What school gets wrong about electricity
excerpt: One or two sentences. This shows on the blog list and in Google results.
category: Myth break
readTime: 6 min
date: 2026-09-13
draft: false
cover: /images/blog/electricity.jpg
coverAlt: Description of the image for screen readers
---

Your first paragraph. Just type. A blank line starts a new paragraph.

## A heading

More writing. **Bold** and *italic* work with asterisks.

- a list item
- another one

> An indented quote.

[A link](https://example.com)
```

Notes:

- **`draft: true` hides the post completely.** No page is built for it and it
  does not appear anywhere. Set it to `false` when you are ready.
- `cover` is optional. Delete the line if there is no image.
- Posts are ordered by `date`, newest first. The newest one is shown large at
  the top of the blog page.
- Two half-written posts are already in `content/blog/` as drafts. Open one to
  see the format, replace the outline with your writing, flip `draft` to
  `false`.

---

## 2. Adding photos

Put image files in **`public/images/`**. A file at
`public/images/kshitij.jpg` is referenced everywhere as `/images/kshitij.jpg`,
with the `public` part dropped.

Three places use photos, all optional:

**Portrait on the About page.** In `lib/content.ts`, set `portrait` inside
`SITE`:

```ts
portrait: "/images/kshitij.jpg",
portraitAlt: "Kshitij Pandey",
```

**Blog post covers.** Add `cover:` to a post's frontmatter, as shown above.

**Workshop photos.** In `lib/content.ts`, each workshop has a `photo` field:

```ts
photo: "/images/workshop-qm.jpg",
photoAlt: "A room of people at the quantum mechanics session",
```

Leave any of these as `""` and that image simply does not appear. Nothing
breaks.

Sizes that work well: portrait around 800 by 1000, blog covers around 1600 by
700, workshop photos around 1200 by 675. Use JPG for photographs. Keep files
under about 500 KB so pages stay fast.

Always fill in the `Alt` field. It is what a blind visitor hears, and what
Google reads.

---

## 3. Turning on the registration form

`/workshops/register` has a real registration form. It is switched off until you
add a key, and shows your email address instead.

To switch it on:

1. Go to **web3forms.com**
2. Enter the email address where you want registrations delivered
3. They email you an access key, a long string of characters
4. Paste it into `FORM_ACCESS_KEY` in `lib/content.ts`
5. Commit and push

Every registration then arrives in your inbox. Free for 250 a month, no account
to manage. The form collects name, email, phone, city, which session, and what
the person wants out of it.

It does **not** take payment. You confirm the date and send payment details by
email. If you later want payment on the page, Razorpay is the route.

---

## 4. Changing any other text

**`lib/content.ts`** holds the rest: site name, email, social links, the stat
numbers, workshops and credentials. Change the text between the quote marks.

To add a workshop, copy one `{ ... }` block, paste it below the last one, edit
it, and keep the commas.

When the domain ever changes, edit the one constant at the top of
**`lib/site-url.ts`**. Metadata, the sitemap and robots.txt all follow from it.

---

## Running it locally

Optional, for previewing before you push.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

---

## Layout

```
content/blog/*.md                                   blog posts, one file each
public/images/                                      photos
lib/content.ts                                      site text, socials, workshops
lib/site-url.ts                                     canonical domain
lib/posts.ts                                        reads the markdown files
components/site/ui.tsx                              buttons, sections, headings
components/site/                                    header, footer, banner, form
components/ui/optimized-black-hole.tsx              the renderer component
app/page.tsx                                        home
app/about|blog|workshops|contact/page.tsx           pages
app/blog/[slug]/page.tsx                            a single post
app/workshops/register/page.tsx                     registration
app/globals.css                                     design tokens, article styles
```

---

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
