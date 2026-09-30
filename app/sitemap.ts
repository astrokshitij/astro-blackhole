import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { getPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  // Only claim a change date we actually know: the newest post date for the
  // writing index, and nothing for pages that have no dated content.
  const latestPost = posts[0]?.date ? new Date(posts[0].date) : undefined;

  const pages: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/blog",
    "/workshops",
    "/workshops/register",
    "/contact",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: route === "/blog" || route === "" ? latestPost : undefined,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...pages, ...postEntries];
}
