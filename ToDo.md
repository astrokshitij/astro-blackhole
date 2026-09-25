# Astro Kshitij — Action & To-Do Checklist

## 1. Vercel Domain Redirect (`307` → `308`)
- [ ] Open [Vercel Dashboard](https://vercel.com/dashboard) → select **`astro-blackhole`**
- [ ] Go to **Settings** → **Domains**
- [ ] Click **Edit** next to `www.astrokshitij.com`
- [ ] Change the redirect dropdown from **`307 Temporary Redirect`** to **`308 Permanent Redirect`** and click **Save**
  - *Why*: Tells Google Search to permanently replace the old `http://www.astrokshitij.com` listing with `https://astrokshitij.com` and display your new favicon and description.

## 2. Google Search Console Re-Crawl
- [ ] Open [Google Search Console](https://search.google.com/search-console)
- [ ] Paste `https://astrokshitij.com` into the top **URL Inspection** bar
- [ ] Click **Request Indexing**

## 3. Upcoming Blog Posts (`content/blog/`)
- [ ] Finish and switch `draft: true` → `draft: false` in:
  - `content/blog/turn-around-twice.md`
  - `content/blog/what-school-gets-wrong-about-electricity.md`
  - `content/blog/why-you-do-not-fall-through-your-chair.md`
  - *Why*: Publishing a 2nd post automatically activates the **"Read next"** internal-linking section at the bottom of every blog article.
