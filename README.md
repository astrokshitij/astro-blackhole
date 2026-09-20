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

For the universe-death post, create or open the `public/images/blog/` folder in
the VS Code Explorer, then drag your image from your computer into that folder.
Rename it to `universe-death.png` (or use its real filename in the `cover:`
path), uncomment the `cover` and `coverAlt` lines in
`content/blog/how-the-universe-might-actually-die.md`, and save. The image will
then appear on the latest-post tile and at the top of the article page.

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

## 3. Enquiries and workshop interest

The Contact page and workshop-interest page share the enquiry form. They collect
name, email, enquiry type, organisation, audience, approximate date and message.

With no delivery key configured, visitors prepare a draft, review it and open
their own email app or copy the message. Nothing is submitted from the site.
Both workshops are in development, so this is interest, not a confirmed booking.

To enable direct delivery:

1. Get a free access key from web3forms.com for your existing email address.
2. Set `FORM_ACCESS_KEY` in `lib/content.ts`.
3. Test a real enquiry after deployment to confirm it reaches your inbox.

The form then displays success and failure states. No payment is collected.
If email delivery is not configured, the email-draft flow continues to work.

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
components/site/                                    header, footer, banner, enquiry form
components/ui/black-hole-hero-section.tsx            the renderer component
app/page.tsx                                        home
app/about|blog|workshops|contact/page.tsx           pages
app/blog/[slug]/page.tsx                            a single post
app/workshops/register/page.tsx                     registration
app/globals.css                                     design tokens, article styles
```

---

## How the renderer works

The homepage retains the ray-marched black-hole simulation in
`components/ui/black-hole-hero-section.tsx`. Light paths are integrated through
Schwarzschild space; the bent disc and photon ring emerge from that calculation.

`components/site/hero-visual.tsx` loads it separately from the page text. A small
still in `public/images/black-hole-still.webp` is visible before loading and when
WebGL is unavailable. Drawing is capped at 30 fps and 2.1 million backing pixels,
pauses off screen and when hidden, and has an explicit pause button.
Reduced-motion preferences produce a still frame. Reading pages use static heroes.

See `REDESIGN.md` for the redesign audit, scope, validation and content limitations.
