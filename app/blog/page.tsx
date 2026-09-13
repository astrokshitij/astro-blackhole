import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { POSTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Written pieces from Astro Kshitij: spinors, why solid matter is solid, and what school gets wrong about electricity.",
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="02 / Blog"
        title="Written pieces"
        dek="The arguments that need more room than a reel gives them."
        offset={{ x: 0.46, y: 0.08 }}
      />

      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {POSTS.map((post) => {
              const body = (
                <>
                  <span className="font-mono shrink-0 text-[10px] uppercase tracking-[0.2em] text-white/55 sm:w-32 sm:pt-2">
                    {post.tag}
                  </span>
                  <span className="block">
                    <span className="font-display block text-xl font-light leading-snug text-white sm:text-2xl">
                      {post.title}
                    </span>
                    <span className="mt-3 block max-w-2xl text-sm leading-relaxed text-white/60">
                      {post.blurb}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={post.title}>
                  {"href" in post && typeof post.href === "string" ? (
                    <a
                      href={post.href}
                      className="flex flex-col gap-3 py-8 transition-colors hover:bg-white/[0.03] sm:flex-row sm:gap-10 sm:px-2"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex flex-col gap-3 py-8 sm:flex-row sm:gap-10 sm:px-2">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-10 text-sm leading-relaxed text-white/55">
            These are being written. Until they land,{" "}
            <a
              href="https://www.youtube.com/@astrokshitij"
              className="text-white underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              the same arguments are on YouTube
            </a>
            , usually at greater length and in Hindi.
          </p>

          <Link
            href="/contact"
            className="group mt-20 flex items-center justify-between gap-6 border-t border-white/10 pt-8 transition-colors hover:border-white/30"
          >
            <span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
                Next
              </span>
              <span className="font-display mt-2 block text-lg font-light text-white sm:text-xl">
                Get in touch
              </span>
            </span>
            <span className="text-white/55 transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
