import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/ui";
import { RegistrationForm } from "@/components/site/registration-form";
import { WORKSHOPS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register your interest in a live quantum mechanics session or science communication training with Kshitij Pandey.",
  alternates: { canonical: "/workshops/register" },
};

const STEPS = [
  {
    step: "01",
    title: "You register",
    detail: "Thirty seconds. Name, email, phone, and which session.",
  },
  {
    step: "02",
    title: "I confirm the date",
    detail:
      "Sessions run once enough people have put their names down, so you hear the date by email rather than picking from a calendar.",
  },
  {
    step: "03",
    title: "You pay and get the link",
    detail:
      "Payment details come in that same email. Registering here commits you to nothing.",
  },
];

export default function RegisterPage() {
  return (
    <>
      <PageHero
        eyebrow="03 / Register"
        title="Save your seat"
        dek="Registering puts your name down and costs nothing. Payment happens after the date is confirmed."
        offset={{ x: 0.42, y: 0.14 }}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
              How it works
            </h2>
            <ol className="mt-6 space-y-8 border-t border-white/10 pt-8">
              {STEPS.map((item) => (
                <li key={item.step} className="flex gap-5">
                  <span className="font-mono shrink-0 text-[11px] text-white/55">
                    {item.step}
                  </span>
                  <span>
                    <span className="font-display block text-base font-light text-white">
                      {item.title}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-white/60">
                      {item.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-white/10 pt-8">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                Sessions
              </h2>
              <ul className="mt-5 space-y-4">
                {WORKSHOPS.map((workshop) => (
                  <li key={workshop.title}>
                    <p className="font-display text-sm font-light text-white">
                      {workshop.title}
                    </p>
                    <p className="font-mono mt-1 text-[10px] uppercase tracking-[0.16em] text-white/55">
                      {workshop.format} &middot; {workshop.audience}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <RegistrationForm />
            <p className="mt-5 text-xs leading-relaxed text-white/55">
              Your details are emailed to me and nowhere else. No list, no
              newsletter, no sharing with anyone.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
