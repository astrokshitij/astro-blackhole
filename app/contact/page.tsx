import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink, Section } from "@/components/site/ui";
import { SocialLinks } from "@/components/site/social-links";
import { MailGlyph, ArrowGlyph } from "@/components/site/icons";
import { SITE } from "@/lib/content";

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

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          <div>
            <div className="h-full rounded-xl border border-white/12 bg-white/[0.02] p-7 sm:p-9">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 text-white/75">
                <MailGlyph className="h-5 w-5" />
              </span>
              <p className="font-display mt-6 text-2xl font-light leading-snug text-white sm:text-3xl">
                Email is the reliable one.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Everything with a date attached should come this way. Replies
                usually take a day or two.
              </p>
              <ButtonLink href={`mailto:${SITE.email}`} className="mt-7">
                {SITE.email}
                <ArrowGlyph className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>

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
        </div>

        <div className="mt-20 border-t border-white/10 pt-12">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
            What people write in about
          </h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-10">
            {REASONS.map((reason) => (
              <li key={reason.title}>
                <h3 className="font-display text-sm font-light uppercase tracking-[0.2em] text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {reason.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
