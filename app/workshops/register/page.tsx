import type { Metadata } from "next";
import { socialMeta } from "@/lib/seo";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow, Section } from "@/components/site/ui";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { CONTACT, EDITORIAL, PAGE_COPY } from "@/lib/content";
export const metadata: Metadata = {
  title: "Register interest",
  description:
    "Register your interest in workshops in development with Kshitij Pandey.",
  alternates: { canonical: "/workshops/register" },
  ...socialMeta({
    path: "/workshops/register",
    title: "Register workshop interest",
    description:
      "Express interest in quantum mechanics or science communication training. Dates and registration are not yet available.",
  }),
};
export default function RegisterPage() {
  return (
    <>
      <PageHero
        eyebrow="Workshops / Register interest"
        title={PAGE_COPY.interest.title}
        dek={EDITORIAL.room.note}
      />
      <Section>
        <div className="contact-grid">
          <div>
            <Eyebrow>What happens next</Eyebrow>
            <h2 className="section-title">
              Curiosity first.
              <br />
              Details next.
            </h2>
            <p className="body-copy">{PAGE_COPY.interest.intro}</p>
            <p className="body-copy">{PAGE_COPY.interest.notice}</p>
          </div>
          <EnquiryForm preselect={CONTACT.types[1]} />
        </div>
      </Section>
    </>
  );
}
