import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink, NextPage, Section } from "@/components/site/ui";
import { ArrowGlyph } from "@/components/site/icons";
import { SITE, WORKSHOPS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Workshops",
  description:
    "A two-hour live quantum mechanics workshop for anyone curious, and science communication training for research institutions.",
};

export default function WorkshopsPage() {
  return (
    <>
      <PageHero
        eyebrow="03 / Workshops"
        title="Sessions and training"
        dek="Two formats. One for anyone curious enough to sit with a hard idea, one for researchers who need to be understood outside their field."
        offset={{ x: 0.34, y: 0.16 }}
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {WORKSHOPS.map((workshop, i) => (
            <article
              key={workshop.title}
              className="flex flex-col rounded-xl border border-white/12 bg-white/[0.02] p-7 transition-colors duration-200 hover:border-white/25 sm:p-10"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-mono rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/75">
                  {workshop.format}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                  {workshop.audience}
                </span>
              </div>

              <h2 className="font-display mt-6 text-2xl font-light leading-snug text-white sm:text-3xl">
                {workshop.title}
              </h2>

              <p className="mt-5 text-sm leading-relaxed text-white/65 sm:text-base">
                {workshop.blurb}
              </p>

              <ul className="mt-8 space-y-3.5 border-t border-white/10 pt-8">
                {workshop.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3.5 text-sm leading-relaxed text-white/65"
                  >
                    <span
                      aria-hidden
                      className="mt-2.5 h-px w-4 shrink-0 bg-white/35"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-9">
                <ButtonLink
                  href={`mailto:${SITE.email}?subject=${encodeURIComponent(
                    `Enquiry: ${workshop.title}`,
                  )}`}
                  variant={i === 0 ? "primary" : "secondary"}
                >
                  Enquire
                  <ArrowGlyph className="h-4 w-4" />
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-white/60">
          Dates and pricing are set per booking. Say what you have in mind and
          roughly who the audience is, and you will get a straight answer on
          whether it is a good fit.
        </p>

        <NextPage href="/contact" title="Get in touch" />
      </Section>
    </>
  );
}
