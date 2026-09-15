import type { Metadata } from "next";
import { SITE } from "./content";

/**
 * Next replaces the parent `openGraph` object wholesale when a page declares
 * its own, rather than merging field by field. Every page that set a title was
 * therefore silently dropping the site name, the locale and the preview image.
 * So each page builds its block from here instead, and the shape stays in one
 * place.
 */

/** Stable path, so it can be referenced from every route and from JSON-LD. */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: `${SITE.name} — ${SITE.tagline}`,
};

export function socialMeta({
  title,
  description,
  path = "/",
  type = "website",
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type,
      url: path,
      siteName: SITE.name,
      locale: "en_IN",
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
