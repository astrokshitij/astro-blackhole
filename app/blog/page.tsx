import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink, NextPage, Section } from "@/components/site/ui";
import { ArrowGlyph } from "@/components/site/icons";
import { POSTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Written pieces from Astro Kshitij: spinors, why solid matter is solid, and what school gets wrong about electricity.",
};

type Post = (typeof POSTS)[number] & { href?: string };

function Meta({ post }: { post: Post }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="font-mono rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/75">
        {post.category}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
        {post.readTime}
      </span>
      <span aria-hidden className="h-px w-4 bg-white/20" />
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
        {post.status}
      </span>
    </div>
  );
}

function Wrapper({
  post,
  className,
  children,
}: {
  post: Post;
  className: string;
  children: React.ReactNode;
}) {
  return post.href ? (
    <a href={post.href} className={className}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = POSTS as Post[];

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
          <Wrapper
            post={featured}
            className="group block rounded-xl border border-white/12 bg-white/[0.02] p-7 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.045] sm:p-12"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/75">
                Featured
              </span>
              <Meta post={featured} />
            </div>

            <h2 className="font-display mt-7 max-w-3xl text-3xl font-light leading-[1.12] tracking-[0.01em] text-white sm:text-5xl">
              {featured.title}
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
              {featured.blurb}
            </p>

            {featured.href ? (
              <span className="font-display mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white">
                Read the piece
                <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            ) : null}
          </Wrapper>
        ) : null}

        {rest.length ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {rest.map((post) => (
              <Wrapper
                key={post.title}
                post={post}
                className="group flex flex-col rounded-xl border border-white/12 bg-white/[0.02] p-7 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.045] sm:p-9"
              >
                <Meta post={post} />
                <h3 className="font-display mt-6 text-xl font-light leading-snug text-white sm:text-2xl">
                  {post.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60">
                  {post.blurb}
                </p>
                {post.href ? (
                  <span className="font-display mt-7 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/80">
                    Read
                    <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                ) : null}
              </Wrapper>
            ))}
          </div>
        ) : null}

        <div className="mt-16 flex flex-col gap-6 rounded-xl border border-white/12 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <p className="max-w-xl text-sm leading-relaxed text-white/65">
            These are being written. Until they land, the same arguments are on
            YouTube, usually at greater length and in Hindi.
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
