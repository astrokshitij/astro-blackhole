import BlackHole from "@/components/ui/optimized-black-hole";
import { ButtonLink, Section, SectionHeading } from "@/components/site/ui";
import { SocialLinks } from "@/components/site/social-links";
import { ArrowGlyph, PlayGlyph } from "@/components/site/icons";
import Link from "next/link";
import { SITE, STATS } from "@/lib/content";

const GATEWAYS = [
  {
    index: "01",
    label: "About",
    href: "/about",
    title: "Who is behind Astro Kshitij?",
    blurb:
      "I hold a Master's in Astrophysics and Cosmology, but what really drives me is understanding how the universe works and sharing that curiosity with you.",
    cta: "Read more",
  },
  {
    index: "02",
    label: "Blog",
    href: "/blog",
    title: "My Abstract Thoughts",
    blurb:
      "Some ideas simply refuse to fit into a short video. So, if you're curious to go a little deeper, this is where I put the thoughts, questions and rabbit holes that keep me thinking.",
    cta: "Read the blog",
  },
  {
    index: "03",
    label: "Workshops",
    href: "/workshops",
    title: "Learn With Me",
    blurb:
      "Always wanted to understand Quantum Mechanics but didn't know where to start? Come explore it with me from the ground up through my \"Quantum Mechanics for Everyone\" workshop.",
    cta: "Explore workshops",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative isolate h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlackHole scrollColorShift offset={{ x: 0.54, y: 0.18 }} zoom={0.98} />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/75 to-black/10 sm:via-black/60 sm:to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent sm:h-2/5 sm:via-black/25"
        />

        <div className="flex h-full items-end pb-24 sm:items-center sm:pb-0">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="max-w-lg">
              <h1 className="font-display font-light text-white">
                <span className="block text-[11px] uppercase tracking-[0.5em] text-white/60">
                  Welcome to
                </span>
                <span className="mt-4 block text-[clamp(1.75rem,6.6vw,4.25rem)] uppercase leading-[1.05] tracking-[0.16em]">
                  {SITE.name}
                </span>
              </h1>

              <p className="mt-7 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                I am an absolute physics head, and nothing excites me more than
                sharing the ideas that boggle my mind with the people around
                me. Through Astro Kshitij, I want to spark that same curiosity
                in you.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/about">
                  More About Me
                  <ArrowGlyph className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href="https://www.youtube.com/@astrokshitij"
                  variant="secondary"
                >
                  <PlayGlyph className="h-4 w-4" />
                  Watch on YouTube
                </ButtonLink>
              </div>

              <div className="mt-10 sm:hidden">
                <SocialLinks compact />
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-7 hidden justify-center sm:flex"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
            Scroll
          </span>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <dl className="mx-auto grid max-w-2xl grid-cols-2 gap-x-16 gap-y-10 text-center sm:gap-x-28">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-4xl font-light leading-none text-white sm:text-5xl">
                  {stat.value}
                </dt>
                <dd className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/55">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Explore */}
      <Section>
        <SectionHeading title="Explore Astro Kshitij" />

        <div className="grid gap-6 md:grid-cols-3">
          {GATEWAYS.map((gateway) => (
            <Link
              key={gateway.href}
              href={gateway.href}
              className="group flex flex-col rounded-xl border border-white/12 bg-white/[0.02] p-7 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.045] sm:p-9"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
                {gateway.index} / {gateway.label}
              </span>
              <h3 className="font-display mt-6 text-xl font-light leading-snug text-white sm:text-2xl">
                {gateway.title}
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60">
                {gateway.blurb}
              </p>
              <span className="font-display mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/80">
                {gateway.cta}
                <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/12 p-7 sm:p-9">
            <h3 className="font-display text-xl font-light text-white sm:text-2xl">
              Follow Along
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              I share physics, astronomy, scientific ideas and the occasional
              rabbit hole across Instagram, YouTube and LinkedIn. If something
              makes you stop and think, you&apos;ll probably find it here.
            </p>
            <div className="mt-7">
              <SocialLinks />
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-white/12 bg-white/[0.02] p-7 sm:p-9">
            <div>
              <h3 className="font-display text-xl font-light text-white sm:text-2xl">
                Want to learn something together?
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                Whether you want to finally understand Quantum Mechanics or
                you&apos;re looking for someone to make complex science easier
                to communicate, I&apos;d love to hear from you.
              </p>
            </div>
            <div className="mt-8">
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/workshops">
                  Explore Workshops
                  <ArrowGlyph className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="secondary">
                  Get in Touch
                </ButtonLink>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-white/55">
                Want to book a workshop, collaborate, or just argue about
                physics?
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
