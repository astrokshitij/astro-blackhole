import type { Metadata } from "next";
import { socialMeta } from "@/lib/seo";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink, NextPage, Section } from "@/components/site/ui";
import { ArrowGlyph } from "@/components/site/icons";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Workshops",
  description:
    "Two workshops in development: a two-hour quantum mechanics session open to anyone curious, and a science communication programme for research institutions.",
  alternates: { canonical: "/workshops" },
  ...socialMeta({
    path: "/workshops",
    title: "Workshops with Kshitij Pandey",
    description:
      "A two-hour quantum mechanics session open to anyone curious, and a science communication programme for research institutions.",
  }),
};

const QM_MAIL = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "Register interest: Quantum Mechanics for Everyone",
)}`;
const QM_QUESTION_MAIL = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "Question: Quantum Mechanics for Everyone",
)}`;
const SC_MAIL = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "Enquiry: Science Communication workshop",
)}`;
const SC_GENERAL_MAIL = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "Get in touch",
)}`;

export default function WorkshopsPage() {
  return (
    <>
      <PageHero
        eyebrow="03 / Workshops"
        title="Learn something that changes how you see the world"
        offset={{ x: 0.34, y: 0.16 }}
        plainCase
      />

      <Section>
        <div className="max-w-3xl">
          <p className="text-base leading-relaxed text-white/75 sm:text-lg">
            I design workshops that make complex ideas easier to understand,
            question and think about.
          </p>
          <p className="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">
            Whether you want to explore Quantum Mechanics from scratch or help
            your institution communicate its research more effectively,
            there&apos;s something here for you.
          </p>
          <p className="font-mono mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/75">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-white/70"
            />
            Currently under development. These workshops will go live once
            they are ready.
          </p>
        </div>

        {/* Overview tiles */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <a
            href="#quantum-mechanics-for-everyone"
            className="group flex flex-col rounded-xl border border-white/12 bg-white/[0.02] p-7 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.045] sm:p-9"
          >
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-white/55">
              01 / For everyone
            </span>
            <h2 className="font-display mt-6 text-2xl font-light leading-snug text-white sm:text-3xl">
              Quantum Mechanics for Everyone
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              Understand the physics that changed how we see reality.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              No mathematical background required.
            </p>
            <p className="font-mono mt-6 text-xs uppercase tracking-[0.2em] text-white/55">
              Currently in development
            </p>
            <span className="font-display mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/85">
              Learn more
              <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </a>

          <a
            href="#science-communication-that-reaches-people"
            className="group flex flex-col rounded-xl border border-white/12 bg-white/[0.02] p-7 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.045] sm:p-9"
          >
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-white/55">
              02 / For institutions
            </span>
            <h2 className="font-display mt-6 text-2xl font-light leading-snug text-white sm:text-3xl">
              Science Communication That Reaches People
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              Build better ways to communicate your research, attract students
              and reach audiences beyond your field.
            </p>
            <p className="font-mono mt-6 text-xs uppercase tracking-[0.2em] text-white/55">
              Currently in development
            </p>
            <span className="font-display mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/85">
              Learn more
              <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </a>
        </div>

        {/* Detail: Quantum Mechanics for Everyone */}
        <article
          id="quantum-mechanics-for-everyone"
          className="mt-24 scroll-mt-24 border-t border-white/10 pt-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-white/55">
            01 / For everyone
          </span>
          <h2 className="font-display mt-4 text-3xl font-light leading-tight text-white sm:text-4xl">
            Quantum Mechanics for Everyone
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/75 sm:text-lg">
            Two hours to understand the ideas that changed how we think about
            reality.
          </p>

          <div className="mt-12 grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
            <div className="max-w-2xl space-y-6 text-sm leading-relaxed text-white/70 sm:text-base">
              <p>
                We live in a world where AI can answer questions, write code
                and process information faster than ever.
              </p>
              <p>
                That makes understanding the{" "}
                <strong className="font-normal text-white/90">
                  fundamentals of the world around us
                </strong>{" "}
                even more important.
              </p>
              <p>And just like we exercise our bodies, our brains need some exercise too.</p>
              <p>
                This workshop is an invitation to slow down, think deeply and
                explore one of the strangest and most fascinating ideas in
                physics:{" "}
                <strong className="font-normal text-white/90">
                  Quantum Mechanics
                </strong>
                .
              </p>
              <p>
                You don&apos;t need a mathematical background. You just need
                curiosity.
              </p>

              <div className="pt-6">
                <h3 className="font-display text-xl font-light text-white sm:text-2xl">
                  What will you explore?
                </h3>
                <ul className="mt-5 space-y-3.5 border-t border-white/10 pt-6">
                  {[
                    "What Quantum Mechanics actually is",
                    "What it really tells us about the physical world",
                    "The experiments and ideas that forced us to rethink reality",
                    "Common myths and misconceptions about quantum physics",
                    "What quantum physics can and cannot tell us about consciousness and reality",
                    "What it means for our understanding of nature",
                    "Why understanding fundamentals still matters in the age of AI",
                  ].map((point) => (
                    <li key={point} className="flex gap-3.5">
                      <span
                        aria-hidden
                        className="mt-2.5 h-px w-4 shrink-0 bg-white/35"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <h3 className="font-display text-xl font-light text-white sm:text-2xl">
                  This is not a traditional lecture
                </h3>
                <p className="mt-5">
                  You won&apos;t be asked to memorise equations or rush
                  through a textbook.
                </p>
                <p className="mt-4">
                  We&apos;ll take strange ideas, question them, follow the
                  evidence and see where they lead.
                </p>
                <p className="font-display mt-6 text-lg font-light text-white sm:text-xl">
                  Two hours. One big idea. A lot to think about.
                </p>
              </div>

              <div className="pt-6">
                <h3 className="font-display text-xl font-light text-white sm:text-2xl">
                  Who is this for?
                </h3>
                <p className="mt-5">Anyone who has ever wondered:</p>
                <p className="font-display mt-4 text-lg font-light italic text-white sm:text-xl">
                  What is actually going on at the quantum level?
                </p>
                <p className="mt-5">
                  You could be a student, a working professional, a science
                  enthusiast or simply someone who wants to give their brain a
                  different kind of workout.
                </p>
                <p className="mt-4">
                  <strong className="font-normal text-white/90">
                    No mathematical background required.
                  </strong>
                </p>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-white/12 bg-white/[0.02] p-7 sm:p-8">
                <p className="font-mono inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-white/60"
                  />
                  Currently in development
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70">
                  This workshop is being built and refined right now. It will
                  be available for registration once the session is ready.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <ButtonLink href={QM_MAIL}>
                    Register your interest
                    <ArrowGlyph className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink href={QM_QUESTION_MAIL} variant="secondary">
                    Ask a question
                  </ButtonLink>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {/* Detail: Science Communication */}
        <article
          id="science-communication-that-reaches-people"
          className="mt-24 scroll-mt-24 border-t border-white/10 pt-16"
        >
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-white/55">
            02 / For institutions
          </span>
          <h2 className="font-display mt-4 text-3xl font-light leading-tight text-white sm:text-4xl">
            Science Communication That Reaches People
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/75 sm:text-lg">
            Help your research reach people beyond the people who already
            understand it.
          </p>

          <div className="mt-12 grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
            <div className="max-w-2xl space-y-6 text-sm leading-relaxed text-white/70 sm:text-base">
              <p>
                Great research doesn&apos;t always reach the people who could
                benefit from it.
              </p>
              <p>
                Universities, research institutions and laboratories are
                constantly producing important work, but communicating that
                work to students, the public and people outside the field
                requires a different set of skills.
              </p>
              <p>
                This workshop is designed to help institutions strengthen
                their science communication and outreach.
              </p>
              <p>
                Whether your goal is to{" "}
                <strong className="font-normal text-white/90">
                  attract students who are considering a career in science,
                  improve public engagement or help researchers communicate
                  their work more effectively
                </strong>
                , the focus is on making complex science clearer, more
                engaging and easier to understand.
              </p>

              <div className="pt-6">
                <h3 className="font-display text-xl font-light text-white sm:text-2xl">
                  What will you explore?
                </h3>
                <ul className="mt-5 space-y-3.5 border-t border-white/10 pt-6">
                  {[
                    "How to communicate complex research to non-specialist audiences",
                    "How to make science outreach more engaging from the beginning",
                    "How to turn research into stories people actually want to follow",
                    "How to communicate without sacrificing scientific accuracy",
                    "How better communication can help institutions attract prospective students",
                    "How researchers can communicate beyond academic conferences and specialist audiences",
                    "Practical exercises based on participants' own research and communication challenges",
                  ].map((point) => (
                    <li key={point} className="flex gap-3.5">
                      <span
                        aria-hidden
                        className="mt-2.5 h-px w-4 shrink-0 bg-white/35"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <h3 className="font-display text-xl font-light text-white sm:text-2xl">
                  The goal
                </h3>
                <p className="mt-5">
                  This isn&apos;t about turning researchers into social media
                  influencers.
                </p>
                <p className="mt-4">
                  It&apos;s about helping researchers and institutions
                  communicate their ideas clearly enough that{" "}
                  <strong className="font-normal text-white/90">
                    someone outside their field wants to keep listening.
                  </strong>
                </p>
              </div>

              <div className="pt-6">
                <h3 className="font-display text-xl font-light text-white sm:text-2xl">
                  Who is this for?
                </h3>
                <p className="mt-5">Designed for:</p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {[
                    "Universities",
                    "Science departments",
                    "Research institutions",
                    "Laboratories",
                    "Graduate cohorts",
                    "Research teams",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="h-1 w-1 shrink-0 rounded-full bg-white/50"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-8">Especially institutions looking to:</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-white/12 p-5">
                    <p className="font-display text-sm font-normal uppercase tracking-[0.14em] text-white">
                      Attract students
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                      Show prospective students why a career in science is
                      worth pursuing.
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/12 p-5">
                    <p className="font-display text-sm font-normal uppercase tracking-[0.14em] text-white">
                      Improve outreach
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                      Make research more understandable and engaging for wider
                      audiences.
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/12 p-5">
                    <p className="font-display text-sm font-normal uppercase tracking-[0.14em] text-white">
                      Build communication skills
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                      Help researchers communicate effectively beyond their
                      immediate academic field.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-white/12 bg-white/[0.02] p-7 sm:p-8">
                <p className="font-mono inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-white/60"
                  />
                  Currently in development
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70">
                  This workshop is being developed and refined and will go
                  live once the programme is ready.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  If your institution is interested in hosting a session, you
                  can still get in touch to discuss your audience and
                  objectives.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <ButtonLink href={SC_MAIL}>
                    Enquire about the workshop
                    <ArrowGlyph className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink href={SC_GENERAL_MAIL} variant="secondary">
                    Get in touch
                  </ButtonLink>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {/* Final contact */}
        <div className="mt-24 rounded-xl border border-white/12 bg-white/[0.02] p-8 sm:p-12">
          <h2 className="font-display text-2xl font-light leading-tight text-white sm:text-3xl">
            Want to learn something together?
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Whether you want to understand Quantum Mechanics from scratch or
            you&apos;re looking for ways to strengthen science communication
            at your institution, I&apos;d love to hear from you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ButtonLink href="/contact">
              Get in touch
              <ArrowGlyph className="h-4 w-4" />
            </ButtonLink>
            <a
              href={`mailto:${SITE.email}`}
              className="text-sm text-white/60 underline underline-offset-4 transition-colors hover:text-white"
            >
              {SITE.email}
            </a>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-white/55">
            Want to book a workshop, collaborate, or just argue about physics?
          </p>
        </div>

        <NextPage href="/contact" title="Get in touch" />
      </Section>
    </>
  );
}
