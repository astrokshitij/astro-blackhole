import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink, NextPage, Section } from "@/components/site/ui";
import { ArrowGlyph } from "@/components/site/icons";
import { getPosts, type Post } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Written pieces from Astro Kshitij: spinors, why solid matter is solid, and what school gets wrong about electricity.",
  alternates: { canonical: "/blog" },
};

function Meta({ post }: { post: Post }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="font-mono rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/75">
        {post.category}
      </span>
      {post.readTime ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
          {post.readTime}
        </span>
      ) : null}
      {post.dateLabel ? (
        <>
          <span aria-hidden className="h-px w-4 bg-white/20" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
            {post.dateLabel}
          </span>
        </>
      ) : null}
    </div>
  );
}

export default function BlogPage() {
  const posts = getPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="02 / Blog"
        title="Written pieces"
        dek="The arguments that need more room than a reel gives them."
        offset={{ x: 0.46, y: 0.08 }}
      />

      <Section>
        {featured ? (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block overflow-hidden rounded-xl border border-white/12 bg-white/[0.02] transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.045]"
          >
            {featured.cover ? (
              <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-white/10">
                <Image
                  src={featured.cover}
                  alt={featured.coverAlt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 1152px, 100vw"
                  className="object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
                  priority
                />
              </div>
            ) : null}

            <div className="p-7 sm:p-12">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/75">
                  Latest
                </span>
                <Meta post={featured} />
              </div>

              <h2 className="font-display mt-7 max-w-3xl text-3xl font-light leading-[1.12] tracking-[0.01em] text-white sm:text-5xl">
                {featured.title}
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
                {featured.excerpt}
              </p>

              <span className="font-display mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white">
                Read the piece
                <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl border border-white/12 p-10 text-center sm:p-16">
            <p className="font-display text-xl font-light text-white sm:text-2xl">
              Nothing published yet.
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">
              Posts appear here the moment a markdown file lands in
              content/blog with draft set to false.
            </p>
          </div>
        )}

        {rest.length ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-white/12 bg-white/[0.02] transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.045]"
              >
                {post.cover ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-white/10">
                    <Image
                      src={post.cover}
                      alt={post.coverAlt ?? ""}
                      fill
                      sizes="(min-width: 768px) 560px, 100vw"
                      className="object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col p-7 sm:p-9">
                  <Meta post={post} />
                  <h3 className="font-display mt-6 text-xl font-light leading-snug text-white sm:text-2xl">
                    {post.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60">
                    {post.excerpt}
                  </p>
                  <span className="font-display mt-7 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/80">
                    Read
                    <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-16 flex flex-col gap-6 rounded-xl border border-white/12 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <p className="max-w-xl text-sm leading-relaxed text-white/65">
            More are in progress. The same arguments are on YouTube in the
            meantime, usually at greater length and in Hindi.
          </p>
          <ButtonLink href="https://www.youtube.com/@astrokshitij" variant="secondary">
            Watch instead
            <ArrowGlyph className="h-4 w-4" />
          </ButtonLink>
        </div>

        <NextPage href="/workshops" title="Workshops and training" />
      </Section>
    </>
  );
}
