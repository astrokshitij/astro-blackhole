import { getPosts } from "@/lib/posts";
import { SITE } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { metaDescription } from "@/lib/seo";

export const dynamic = "force-static";

const esc = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** RSS feed of published posts, so readers and crawlers can follow new writing. */
export function GET() {
  const posts = getPosts();
  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = post.date ? new Date(post.date).toUTCString() : "";
      return `    <item>
      <title>${esc(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ""}
      <category>${esc(post.category)}</category>
      <description>${esc(metaDescription(post.excerpt, 300))}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}: My Abstract Thoughts</title>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Physics, the universe, strange questions and rabbit holes that need more room than a short video.</description>
    <language>en-IN</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
