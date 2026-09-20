import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { socialMeta } from "@/lib/seo";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow, Section, NextPage } from "@/components/site/ui";
import { ArrowGlyph } from "@/components/site/icons";
import { getPosts } from "@/lib/posts";
import { SOCIALS, PAGE_COPY } from "@/lib/content";
export const metadata: Metadata = {
  title: "Writing",
  description:
    "My Abstract Thoughts: physics, the universe, strange questions and rabbit holes that need more room than a short video.",
  alternates: { canonical: "/blog" },
  ...socialMeta({
    path: "/blog",
    title: "My Abstract Thoughts",
    description:
      "Physics, the universe, strange questions and rabbit holes that need more room than a short video.",
  }),
};
export default function BlogPage() {
  const [featured, ...posts] = getPosts();
  return (
    <>
      <PageHero
        eyebrow={PAGE_COPY.writing.eyebrow}
        title={PAGE_COPY.writing.title}
        dek={PAGE_COPY.writing.intro}
      />
      <Section>
        {featured && (
          <article className="essay-feature">
            {featured.cover && (
              <Link
                href={`/blog/${featured.slug}`}
                className="essay-feature-image"
                tabIndex={-1}
                aria-hidden="true"
              >
                <Image
                  src={featured.cover}
                  alt={featured.coverAlt ?? ""}
                  fill
                  sizes="(min-width:900px) 580px, 100vw"
                  className="object-cover"
                  preload
                />
              </Link>
            )}
            <div>
              <Eyebrow>Featured essay / {featured.category}</Eyebrow>
              <h2>
                <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <div className="writing-meta">
                <time dateTime={featured.date}>{featured.dateLabel}</time>
                <span>/</span>
                {featured.readTime} read
              </div>
              <p className="mt-6">{featured.excerpt}</p>
              <Link href={`/blog/${featured.slug}`} className="text-link">
                Read the essay
                <ArrowGlyph className="h-4 w-4" />
              </Link>
            </div>
          </article>
        )}
        {posts.length > 0 && (
          <div className="essay-grid">
            {posts.map((post) => (
              <article key={post.slug}>
                <Eyebrow>
                  {post.category} / {post.readTime} read
                </Eyebrow>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="body-copy">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="text-link">
                  Read the essay
                  <ArrowGlyph className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
        <div className="mt-20 border-t border-white/15 pt-10">
          <Eyebrow>Prefer to watch?</Eyebrow>
          <p className="body-copy">{PAGE_COPY.writing.videoIntro}</p>
          <a href={SOCIALS[0].href} className="text-link">
            Visit Astro Kshitij on YouTube
            <ArrowGlyph className="h-4 w-4" />
          </a>
        </div>
        <NextPage href="/workshops" title="Explore ideas together" />
      </Section>
    </>
  );
}
