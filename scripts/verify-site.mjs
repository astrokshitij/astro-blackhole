import assert from "node:assert/strict";

const origin = process.env.PREVIEW_URL || "http://127.0.0.1:3001";
const routes = ["/", "/about", "/blog", "/workshops", "/workshops/register", "/contact", "/blog/how-the-universe-might-actually-die"];
const internal = new Set();
const pages = new Map();
for (const route of routes) {
  const response = await fetch(origin + route);
  assert.equal(response.status, 200, route + " responds successfully");
  const html = await response.text();
  pages.set(route, html);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, route + " has one H1");
  assert.ok(html.includes('rel="canonical"'), route + " canonical");
  for (const field of ["og:site_name", "og:locale", "og:image", "twitter:card"]) {
    assert.ok(html.includes(field), route + " metadata: " + field);
  }
  assert.ok(html.includes("<noscript>"), route + " has non-JavaScript navigation");
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (match[1].startsWith("/") && !match[1].startsWith("//")) {
      internal.add(match[1].split("#")[0].replaceAll("&amp;", "&"));
    }
  }
}
for (const route of internal) {
  const response = await fetch(origin + route);
  assert.equal(response.status, 200, "Internal link " + route);
}
const text = pages.get("/").replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
assert.match(text, /100\s*\+\s*Talks/);
assert.match(text, /137\s*k\+\s*People Reached/);
assert.match(text, /The universe is\s*stranger than\s*you think/);
assert.ok(pages.get("/workshops").includes("In development"));
assert.ok(pages.get("/workshops/register").includes("not a confirmed booking"));
assert.ok(pages.get("/contact").includes("nothing is submitted here"));
assert.ok(pages.get("/contact").includes('action="mailto:astrokshitij5@gmail.com"'));
assert.ok(pages.get("/").includes('"@type":"Person"'));
assert.ok(pages.get("/blog/how-the-universe-might-actually-die").includes('"@type":"Article"'));
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
assert.ok(sitemap.includes("/blog/how-the-universe-might-actually-die"));
for (const slug of ["turn-around-twice", "what-school-gets-wrong-about-electricity", "why-you-do-not-fall-through-your-chair"]) {
  assert.ok(!sitemap.includes(slug));
  assert.equal((await fetch(origin + "/blog/" + slug)).status, 404, "Draft remains private: " + slug);
}
assert.equal((await fetch(origin + "/page-that-does-not-exist")).status, 404);
assert.equal((await fetch(origin + "/images/black-hole-still.webp")).status, 200);
assert.ok((await (await fetch(origin + "/robots.txt")).text()).includes("Sitemap:"));
console.log("PASS: 7 routes, all internal links, metadata, Person/Article structured data, static metrics, enquiry fallback, sitemap, robots, draft exclusions and 404.");
