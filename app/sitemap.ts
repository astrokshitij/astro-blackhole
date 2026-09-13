import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { getPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/blog",
    "/workshops",
    "/workshops/register",
    "/contact",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const posts: MetadataRoute.Sitemap = getPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : lastModified,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...pages, ...posts];
}
