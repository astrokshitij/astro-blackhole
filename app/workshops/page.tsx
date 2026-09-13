import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
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

      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="space-y-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
            {WORKSHOPS.map((workshop) => (
              <article
                key={workshop.title}
                className="grid gap-8 bg-black p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-mono rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/70">
                      {workshop.format}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                      {workshop.audience}
                    </span>
                  </div>

                  <h2 className="font-display mt-5 text-2xl font-light leading-snug text-white sm:text-3xl">
                    {workshop.title}
                  </h2>

                  <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
                    {workshop.blurb}
                  </p>

                  <a
                    href={`mailto:${SITE.email}?subject=${encodeURIComponent(
                      `Enquiry: ${workshop.title}`,
                    )}`}
                    className="font-display mt-8 inline-block rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-black transition-colors hover:bg-white/85"
                  >
                    Enquire
                  </a>
                </div>

                <ul className="space-y-4 lg:border-l lg:border-white/10 lg:pl-10">
                  {workshop.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed text-white/65">
                      <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-white/30" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-white/55">
            Dates and pricing are set per booking. Say what you have in mind and
            roughly who the audience is, and you will get a straight answer on
            whether it is a good fit.
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
