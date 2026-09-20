import type { Metadata } from "next";
import Image from "next/image";
import { socialMeta } from "@/lib/seo";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink, Eyebrow, NextPage, Section } from "@/components/site/ui";
import { ArrowGlyph } from "@/components/site/icons";
import { PROGRAMMES, EDITORIAL, PAGE_COPY } from "@/lib/content";
export const metadata: Metadata = {
  title: "Workshops",
  description:
    "Two workshops in development: a two-hour quantum mechanics session open to anyone curious, and a science communication programme for research institutions.",
  alternates: { canonical: "/workshops" },
  ...socialMeta({
    path: "/workshops",
    title: "Workshops with Kshitij Pandey",
    description:
      "Quantum mechanics for everyone, and science communication training for research institutions. Both programmes are in development.",
  }),
};
export default function WorkshopsPage() {
  return (
    <>
      <PageHero
        eyebrow={PAGE_COPY.workshops.eyebrow}
        title={PAGE_COPY.workshops.title}
        dek={PAGE_COPY.workshops.intro}
      />
      <Section>
        <div className="programme-intro">
          <div>
            <Eyebrow>Learning, together</Eyebrow>
            <p className="mt-5">{EDITORIAL.room.note}</p>
          </div>
          <nav aria-label="Workshop programmes">
            {PROGRAMMES.map((p) => (
              <a key={p.id} href={"#" + p.id} className="text-link">
                {p.number} / {p.title}
                <ArrowGlyph className="h-4 w-4 shrink-0" />
              </a>
            ))}
          </nav>
        </div>
        <div className="workshop-visual">
          <figure>
            <div className="workshop-photo">
              <Image
                src="/images/home/stats-audience.jpg"
                alt="Kshitij discussing physics with a room of students"
                fill
                sizes="(min-width:900px) 480px, 100vw"
                className="object-cover"
                style={{ objectPosition: "center" }}
              />
            </div>
            <figcaption>{PAGE_COPY.workshops.caption}</figcaption>
          </figure>
          <div>
            <Eyebrow>{PAGE_COPY.home.roomLabel}</Eyebrow>
            <h2 className="section-title">{EDITORIAL.room.intro}</h2>
            <p className="body-copy">{EDITORIAL.room.body}</p>
            <ButtonLink
              href="/contact?type=speaking"
              variant="secondary"
              className="mt-8"
            >
              Invite me to speak <ArrowGlyph className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
        {PROGRAMMES.map((p) => (
          <article id={p.id} className="programme" key={p.id}>
            <div>
              <Eyebrow>
                {p.number} / {p.category}
              </Eyebrow>
              <h2>{p.title}</h2>
              <p className="!text-[#f2efe8]">{p.intro}</p>
              <p className="mt-5">{p.description}</p>
              <h3>What you will understand</h3>
              <ul>
                {p.outcomes.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <aside className="programme-details">
              <dl>
                <dt>Audience</dt>
                <dd>{p.audience}</dd>
                <dt>Duration</dt>
                <dd>{p.duration}</dd>
                <dt>Format</dt>
                <dd>{p.format}</dd>
              </dl>
              <p className="programme-status">{p.availability}</p>
              <ButtonLink
                href={
                  p.number === "01"
                    ? "/workshops/register"
                    : "/contact?type=institution"
                }
              >
                {p.action}
                <ArrowGlyph className="h-4 w-4 shrink-0" />
              </ButtonLink>
              <p className="form-note">{PAGE_COPY.workshops.notice}</p>
            </aside>
          </article>
        ))}
        <NextPage
          href="/contact"
          title="Bring the conversation to your institution"
        />
      </Section>
    </>
  );
}
