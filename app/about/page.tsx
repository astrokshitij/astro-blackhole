import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/page-hero";
import { NextPage, Section } from "@/components/site/ui";
import { SocialLinks } from "@/components/site/social-links";
import { CREDENTIALS, SITE, STATS } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kshitij Pandey: MSc in physics, co-author on a paper about high-energy collisions near naked singularities, and the person behind Astro Kshitij.",
  alternates: { canonical: "/about" },
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

      <Section>
        <div className="grid gap-16 lg:grid-cols-[1.35fr_1fr] lg:gap-24">
          <div>
            <p className="font-display text-2xl font-light leading-[1.3] text-white sm:text-[2rem]">
              I am Kshitij Pandey. I make science videos for an audience that
              was taught to pass exams in physics without ever being shown why
              any of it is strange.
            </p>

            <div className="mt-10 space-y-6 border-t border-white/10 pt-10">
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

            <div className="mt-14">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                Where the work lives
              </h2>
              <div className="mt-5">
                <SocialLinks />
              </div>
            </div>
          </div>

          <aside className="space-y-12">
            {SITE.portrait ? (
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/12">
                <Image
                  src={SITE.portrait}
                  alt={SITE.portraitAlt}
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}

            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                Background
              </h2>
              <ul className="mt-5 space-y-5 border-t border-white/10 pt-6">
                {CREDENTIALS.map((item) => (
                  <li key={item.detail} className="flex gap-5">
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
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                Reach
              </h2>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-6">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-3xl font-light leading-none text-white">
                      {stat.value}
                    </dt>
                    <dd className="mt-2 text-[11px] uppercase tracking-[0.12em] text-white/55">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        <NextPage href="/workshops" title="Workshops and training" />
      </Section>
    </>
  );
}
