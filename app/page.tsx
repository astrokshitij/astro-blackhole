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
    title: "Who is behind this",
    blurb:
      "An MSc in physics, a paper on naked singularities, and a decision to explain all of it in the language the audience actually thinks in.",
  },
  {
    index: "02",
    label: "Blog",
    href: "/blog",
    title: "Written pieces",
    blurb:
      "The arguments that need more room than a reel gives them. Spinors, solidity, and the things textbooks quietly get wrong.",
  },
  {
    index: "03",
    label: "Workshops",
    href: "/workshops",
    title: "Sessions and training",
    blurb:
      "Two hours on quantum mechanics for anyone curious, and science communication training for research institutions.",
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
                {SITE.tagline} Light that passes too close to the shadow behind
                this text never comes back. Everything here is about the parts
                that do.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="https://www.youtube.com/@astrokshitij">
                  <PlayGlyph className="h-4 w-4" />
                  Watch on YouTube
                </ButtonLink>
                <ButtonLink href="/about" variant="secondary">
                  About me
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

      {/* Reach */}
      <section className="border-y border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-3xl font-light leading-none text-white">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/55">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <div className="hidden shrink-0 lg:block">
            <SocialLinks compact />
          </div>
        </div>
      </section>

      {/* Gateways */}
      <Section>
        <SectionHeading
          index="Where to go"
          title="Three ways in"
          dek="The background, the writing, and the sessions you can book."
        />

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
                Read
                <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/12 p-7 sm:p-9">
            <h3 className="font-display text-xl font-light text-white sm:text-2xl">
              Follow the work
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Four reels a week, long explainers monthly.
            </p>
            <div className="mt-7">
              <SocialLinks />
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-white/12 bg-white/[0.02] p-7 sm:p-9">
            <div>
              <h3 className="font-display text-xl font-light text-white sm:text-2xl">
                Book a session
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                Two hours on quantum mechanics for the curious, or science
                communication training for a department that needs to be
                understood outside its own field.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/workshops">
                See the workshops
                <ArrowGlyph className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
