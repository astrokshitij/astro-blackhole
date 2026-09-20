import type { Metadata } from "next";
import { socialMeta } from "@/lib/seo";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow, Section } from "@/components/site/ui";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { SocialLinks } from "@/components/site/social-links";
import { SITE, CONTACT, PAGE_COPY } from "@/lib/content";
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Kshitij Pandey about workshops, talks and collaborations, or to argue about physics.",
  alternates: { canonical: "/contact" },
  ...socialMeta({
    path: "/contact",
    title: "Get in touch with Kshitij Pandey",
    description:
      "Workshops, talks, collaborations, or telling me I got something wrong.",
  }),
};
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const selected =
    type === "speaking"
      ? CONTACT.types[0]
      : type === "institution"
        ? CONTACT.types[2]
        : undefined;
  return (
    <>
      <PageHero
        eyebrow="Contact / Let's talk"
        title={CONTACT.title}
        dek={CONTACT.intro}
      />
      <Section>
        <div className="contact-grid">
          <div>
            <Eyebrow>A direct line</Eyebrow>
            <a className="contact-email" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            <p className="body-copy">{CONTACT.emailNote}</p>
            <div className="contact-reason">
              <h2>Bring a question. Or a correction.</h2>
              <p>{PAGE_COPY.contact.corrections}</p>
            </div>
            <div className="contact-reason">
              <h2>Find me elsewhere</h2>
              <SocialLinks compact />
              <p className="mt-5">{PAGE_COPY.contact.socialNote}</p>
            </div>
          </div>
          <EnquiryForm key={selected ?? "general"} preselect={selected} />
        </div>
      </Section>
    </>
  );
}
