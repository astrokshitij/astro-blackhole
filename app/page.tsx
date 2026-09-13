import Link from "next/link";
import BlackHole from "@/components/ui/optimized-black-hole";
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
          <BlackHole monochrome offset={{ x: 0.54, y: 0.18 }} zoom={0.98} />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/75 to-black/10 sm:via-black/60 sm:to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent sm:h-2/5 sm:via-black/25"
        />

        <div className="flex h-full items-end pb-28 sm:items-center sm:pb-0">
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
                <a
                  href="https://www.youtube.com/@astrokshitij"
                  className="font-display rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-black transition-colors hover:bg-white/85"
                >
                  Watch on YouTube
                </a>
                <Link
                  href="/about"
                  className="font-display rounded-full border border-white/30 px-6 py-3 text-xs font-light uppercase tracking-[0.18em] text-white/85 transition-colors hover:border-white hover:text-white"
                >
                  About me
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center sm:flex"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
            Scroll
          </span>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/10 bg-black">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-12 sm:grid-cols-4 sm:px-8">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="font-display text-2xl font-light text-white sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/55">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Gateways */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
          <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-3">
            {GATEWAYS.map((gateway) => (
              <Link
                key={gateway.href}
                href={gateway.href}
                className="group flex flex-col bg-black p-7 transition-colors hover:bg-white/[0.04] sm:p-9"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
                  {gateway.index} / {gateway.label}
                </span>
                <h2 className="font-display mt-5 text-xl font-light leading-snug text-white sm:text-2xl">
                  {gateway.title}
                </h2>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60">
                  {gateway.blurb}
                </p>
                <span className="font-display mt-7 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/70">
                  Read
                  <span className="transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
