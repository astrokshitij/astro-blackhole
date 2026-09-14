import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink, NextPage, Section } from "@/components/site/ui";
import { ArrowGlyph, PlayGlyph, CameraGlyph } from "@/components/site/icons";
import { getPosts, type Post } from "@/lib/posts";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "My Abstract Thoughts: physics, the universe, strange questions and rabbit holes that need more room than a short video.",
  alternates: { canonical: "/blog" },
};

function FeaturedCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-xl border border-white/12 bg-white/[0.02] transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.045]"
    >
      {post.cover ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-white/10">
          <Image
            src={post.cover}
            alt={post.coverAlt ?? ""}
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
            Featured
          </span>
          <span className="font-mono rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/75">
            {post.category}
          </span>
          {post.readTime ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              {post.readTime}
            </span>
          ) : null}
        </div>

        <h2 className="font-display mt-7 max-w-3xl text-3xl font-light leading-[1.12] tracking-[0.01em] text-white sm:text-5xl">
          {post.title}
        </h2>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
          {post.excerpt}
        </p>

        <span className="font-display mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white">
          Read the full piece
          <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const posts = getPosts();
  const featured = posts[0];

  return (
    <>
      <PageHero
        eyebrow="02 / Blog"
        title="My Abstract Thoughts"
        offset={{ x: 0.46, y: 0.08 }}
      />

      <Section>
        <div className="max-w-3xl">
          <p className="text-base leading-relaxed text-white/75 sm:text-lg">
            Some ideas simply refuse to fit into a short video.
          </p>
          <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-base">
            This is where I go a little deeper. Physics, the universe, strange
            questions, things I can&apos;t stop thinking about and the
            occasional rabbit hole that deserves more than a few seconds of
            your attention.
          </p>
        </div>

        <div className="mt-16">
          {featured ? (
            <FeaturedCard post={featured} />
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
        </div>

        <div className="mt-16 rounded-xl border border-white/12 p-8 sm:p-12">
          <h2 className="font-display text-2xl font-light leading-tight text-white sm:text-3xl">
            More coming soon
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            I&apos;m working on more pieces.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Until then, you can find the shorter versions of many of these
            ideas on YouTube and Instagram.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="https://www.youtube.com/@astrokshitij"
              variant="secondary"
            >
              <PlayGlyph className="h-4 w-4" />
              Watch on YouTube
              <ArrowGlyph className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="https://www.instagram.com/astro.kshitij"
              variant="secondary"
            >
              <CameraGlyph className="h-4 w-4" />
              Follow on Instagram
              <ArrowGlyph className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>

        <div className="mt-16 rounded-xl border border-white/12 bg-white/[0.02] p-8 sm:p-12">
          <h2 className="font-display text-2xl font-light leading-tight text-white sm:text-3xl">
            Have a question?
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Found something here you want to argue about, question or explore
            further?
          </p>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-6 inline-block text-sm text-white underline underline-offset-4 decoration-white/40 transition-colors hover:decoration-white"
          >
            {SITE.email}
          </a>
          <div className="mt-8">
            <ButtonLink href="/contact">
              Get in touch
              <ArrowGlyph className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>

        <NextPage href="/workshops" title="Workshops and training" />
      </Section>
    </>
  );
}
