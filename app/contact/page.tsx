import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { SITE, SOCIALS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Kshitij Pandey about workshops, talks and collaborations, or to point out something he got wrong.",
};

const REASONS = [
  {
    title: "Workshops and talks",
    detail:
      "Institutions, colleges, conferences and companies. Say the audience, rough size and the date you have in mind.",
  },
  {
    title: "Collaborations",
    detail:
      "Other communicators, researchers with work worth explaining, and anyone building something in this space.",
  },
  {
    title: "Corrections",
    detail:
      "If something in a video or a piece here is wrong, this is the fastest way to have it fixed. Bring the source.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="04 / Contact"
        title="Get in touch"
        dek="For workshops, talks, collaborations, or to tell me I got something wrong."
        offset={{ x: 0.5, y: 0.14 }}
      />

      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <p className="font-display text-2xl font-light leading-snug text-white sm:text-3xl">
                Email is the reliable one.
              </p>
              <a
                href={`mailto:${SITE.email}`}
                className="font-display mt-5 inline-block text-lg font-light tracking-[0.03em] text-white/80 underline underline-offset-[6px] transition-colors hover:text-white sm:text-xl"
              >
                {SITE.email}
              </a>

              <ul className="mt-12 space-y-8 border-t border-white/10 pt-8">
                {REASONS.map((reason) => (
                  <li key={reason.title}>
                    <h2 className="font-display text-sm font-light uppercase tracking-[0.2em] text-white">
                      {reason.title}
                    </h2>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/60">
                      {reason.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-[11px] uppercase tracking-[0.3em] text-white/50">
                Elsewhere
              </h2>
              <ul className="mt-5 space-y-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      className="group flex items-center justify-between gap-4 bg-black px-6 py-5 transition-colors hover:bg-white/[0.05]"
                    >
                      <span>
                        <span className="font-display block text-sm font-light uppercase tracking-[0.2em] text-white">
                          {social.label}
                        </span>
                        <span className="font-mono mt-1 block text-[11px] text-white/55">
                          {social.handle}
                        </span>
                      </span>
                      <span className="text-white/55 transition-transform group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-xs leading-relaxed text-white/55">
                Instagram DMs are read but pile up quickly. For anything with a
                date attached, use email.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
