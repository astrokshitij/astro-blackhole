import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink, Section } from "@/components/site/ui";
import { SocialLinks } from "@/components/site/social-links";
import { MailGlyph, ArrowGlyph } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Kshitij Pandey about workshops, talks and collaborations, or to argue about physics.",
  alternates: { canonical: "/contact" },
};

const REASONS = [
  {
    title: "Workshops and talks",
    detail:
      "If you're organising something at your university, company or event, this is where you start. Tell me who the audience is and a rough date, and I'll come back within a couple of days.",
  },
  {
    title: "Collaborations",
    detail:
      "If you're a fellow communicator, a researcher with work worth explaining or someone building something interesting in science, I'd love to hear from you.",
  },
  {
    title: "Corrections",
    detail:
      "If I got something wrong in a video, a post or a talk, please tell me. This is the fastest way to get it fixed, and I'll credit you if you'd like.",
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

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          <Reveal>
            <div className="h-full rounded-xl border border-white/12 bg-white/[0.02] p-7 transition-[border-color,background-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.05] sm:p-9">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 text-white/75">
                <MailGlyph className="h-5 w-5" />
              </span>
              <p className="font-display mt-6 text-2xl font-light leading-snug text-white sm:text-3xl">
                Email is the best way.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Anything with a date attached goes through here. I usually
                reply within a couple of days.
              </p>
              <ButtonLink href={`mailto:${SITE.email}`} className="mt-7">
                {SITE.email}
                <ArrowGlyph className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                Elsewhere
              </h2>
              <div className="mt-5">
                <SocialLinks />
              </div>
              <p className="mt-5 text-xs leading-relaxed text-white/55">
                Instagram DMs are read but pile up quickly. For anything with a
                date attached, use email.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-20 border-t border-white/10 pt-12">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
            What people write in about
          </h2>
        </Reveal>
        <ul className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-10">
          {REASONS.map((reason, i) => (
            <li key={reason.title}>
              <Reveal delay={i * 120}>
                <h3 className="font-display text-sm font-light uppercase tracking-[0.2em] text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {reason.detail}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
