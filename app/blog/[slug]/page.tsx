import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowGlyph } from "@/components/site/icons";
import { getPost, getPosts } from "@/lib/posts";
import { SITE } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { socialMeta, OG_IMAGE } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

// Drafts get no route at all, so an unfinished post can never be stumbled on.
export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    ...socialMeta({
      type: "article",
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
    }),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      siteName: SITE.name,
      locale: "en_IN",
      publishedTime: post.date || undefined,
      images: post.cover ? [post.cover] : [OG_IMAGE],
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || post.draft) notFound();

  const others = getPosts().filter((p) => p.slug !== post.slug).slice(0, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date || undefined,
    author: { "@type": "Person", name: SITE.person, url: siteUrl },
    publisher: { "@type": "Person", name: SITE.person, url: siteUrl },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    image: `${siteUrl}${post.cover ?? OG_IMAGE.url}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article>
        <header className="border-b border-white/10 bg-black pt-32 sm:pt-40">
          <div className="mx-auto max-w-3xl px-5 pb-14 sm:px-8">
            <Link
              href="/blog"
              className="font-mono inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-white"
            >
              <ArrowGlyph className="h-3.5 w-3.5 rotate-180" />
              All writing
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-mono rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/75">
                {post.category}
              </span>
              {post.readTime ? (
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-white/55">
                  {post.readTime}
                </span>
              ) : null}
              {post.dateLabel ? (
                <>
                  <span aria-hidden className="h-px w-4 bg-white/20" />
                  <time
                    dateTime={post.date}
                    className="font-mono text-xs uppercase tracking-[0.16em] text-white/55"
                  >
                    {post.dateLabel}
                  </time>
                </>
              ) : null}
            </div>

            <h1 className="font-display mt-6 text-[clamp(1.9rem,5vw,3.25rem)] font-light leading-[1.1] tracking-[0.01em] text-white">
              {post.title}
            </h1>

            <p className="mt-6 text-base leading-relaxed text-white/65 sm:text-lg">
              {post.excerpt}
            </p>

            <p className="font-mono mt-8 text-xs uppercase tracking-[0.18em] text-white/55">
              {SITE.person}
            </p>
          </div>
        </header>

        {post.cover ? (
          <div className="relative aspect-[21/9] w-full border-b border-white/10">
            <Image
              src={post.cover}
              alt={post.coverAlt ?? ""}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <div className="bg-black">
          <div
            className="prose-astro mx-auto max-w-[68ch] px-5 py-16 sm:px-8 sm:py-20"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </div>
      </article>

      {others.length ? (
        <section className="border-t border-white/10 bg-black">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/55">
              Read next
            </p>
            <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/blog/${other.slug}`}
                    className="group flex items-center justify-between gap-6 py-6"
                  >
                    <span>
                      <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/55">
                        {other.category}
                      </span>
                      <span className="font-display mt-2 block text-lg font-light text-white sm:text-xl">
                        {other.title}
                      </span>
                    </span>
                    <ArrowGlyph className="h-4 w-4 shrink-0 text-white/55 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
