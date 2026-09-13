import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { CREDENTIALS, STATS } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kshitij Pandey: MSc in physics, co-author on a paper about high-energy collisions near naked singularities, and the person behind Astro Kshitij.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="01 / About"
        title="Who is behind this"
        dek="A physics degree, a peer-reviewed paper, and a decision to explain all of it in the language the audience actually thinks in."
        offset={{ x: 0.38, y: 0.12 }}
      />

      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
            <div className="space-y-6">
              <p className="font-display text-xl font-light leading-snug text-white sm:text-2xl">
                I am Kshitij Pandey. I make science videos for an audience that
                was taught to pass exams in physics without ever being shown why
                any of it is strange.
              </p>
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                I hold an MSc in Physics with a focus on astrophysics and
                cosmology, and co-authored a peer-reviewed paper on high-energy
                collisions near naked singularities. That is the background. The
                work itself is Astro Kshitij: short films, long explainers and a
                great deal of myth-breaking, mostly in Hindi, because the people
                who most need this are not reading it in English.
              </p>
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                I have spoken at TEDx and received a Science Communicator Award.
                Neither of those is the point. The point is that a reel
                correcting what a textbook says about electricity reached 1.7
                million people, which is more than any classroom I will ever
                stand in.
              </p>
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                The through line is that most science education answers
                questions nobody asked, and skips the ones that would have made
                someone curious. I try to do the opposite, which usually means
                starting with the thing that sounds wrong.
              </p>
            </div>

            <div className="space-y-10">
              <div>
                <h2 className="font-display text-[11px] uppercase tracking-[0.3em] text-white/50">
                  Background
                </h2>
                <ul className="mt-5 space-y-4 border-t border-white/10 pt-5">
                  {CREDENTIALS.map((item) => (
                    <li key={item.detail} className="flex gap-4">
                      <span className="font-mono w-10 shrink-0 pt-0.5 text-xs text-white/55">
                        {item.year}
                      </span>
                      <span className="text-sm leading-relaxed text-white/70">
                        {item.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="font-display text-[11px] uppercase tracking-[0.3em] text-white/50">
                  Reach
                </h2>
                <dl className="mt-5 grid grid-cols-2 gap-y-6 border-t border-white/10 pt-5">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <dt className="font-display text-2xl font-light text-white">
                        {stat.value}
                      </dt>
                      <dd className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/55">
                        {stat.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          <NextLink
            href="/workshops"
            label="Next"
            title="Workshops and training"
          />
        </div>
      </section>
    </>
  );
}

function NextLink({
  href,
  label,
  title,
}: {
  href: string;
  label: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group mt-20 flex items-center justify-between gap-6 border-t border-white/10 pt-8 transition-colors hover:border-white/30"
    >
      <span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
          {label}
        </span>
        <span className="font-display mt-2 block text-lg font-light text-white sm:text-xl">
          {title}
        </span>
      </span>
      <span className="text-white/55 transition-transform group-hover:translate-x-1">
        &rarr;
      </span>
    </Link>
  );
}
