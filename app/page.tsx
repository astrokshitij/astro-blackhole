import BlackHole from "@/components/ui/optimized-black-hole";

/* ------------------------------------------------------------------ *
 *  EDIT YOUR CONTENT HERE                                            *
 *  Everything below this line is plain text. Change the words inside *
 *  the quote marks. To add a post or a workshop, copy one { } block, *
 *  paste it below, and edit it. Keep the commas.                     *
 * ------------------------------------------------------------------ */

const SOCIALS = [
  { label: "YouTube", href: "https://www.youtube.com/@astrokshitij" },
  { label: "Instagram", href: "https://www.instagram.com/astro.kshitij" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/kshitij-pandey-30215314b/" },
];

const EMAIL = "astrokshitij5@gmail.com";

const STATS = [
  { value: "90K+", label: "Instagram followers" },
  { value: "35K", label: "YouTube subscribers" },
  { value: "12M+", label: "Views on reels" },
  { value: "580+", label: "Videos published" },
];

// Starter posts. Replace the titles and blurbs with real ones, and add
// href: "https://..." to any entry to turn its card into a link.
const POSTS = [
  {
    title: "Turn around twice",
    blurb:
      "An electron has to rotate a full 720 degrees before it looks like itself again. Not a metaphor, not a simplification. Here is what that actually means.",
    tag: "In progress",
  },
  {
    title: "Why you do not fall through your chair",
    blurb:
      "Atoms are almost entirely empty space, so the honest answer is not electrical repulsion. It is a rule about identity that most explanations skip.",
    tag: "In progress",
  },
  {
    title: "What school gets wrong about electricity",
    blurb:
      "Charges drift through a wire slower than you walk. The energy is not in the wire at all. The reel on this reached 1.7 million people who were never told.",
    tag: "In progress",
  },
];

const WORKSHOPS = [
  {
    title: "Quantum mechanics, in two hours",
    audience: "Live online. Open to anyone.",
    blurb:
      "Not a lecture course compressed into a session. Two hours of thinking hard about one genuinely strange thing, in an era that has made sustained attention rare. No mathematical background assumed.",
  },
  {
    title: "Science communication for research institutions",
    audience: "On site. Departments, labs and graduate cohorts.",
    blurb:
      "For researchers who can defend a thesis to a committee but lose a room of non-specialists in ninety seconds. Built around what actually travels, tested on an audience of ninety thousand.",
  },
];

/* ------------------------------------------------------------------ *
 *  END OF CONTENT. Below here is layout.                             *
 * ------------------------------------------------------------------ */

const NAV = [
  { label: "About", href: "#about" },
  { label: "Blog", href: "#blog" },
  { label: "Workshops", href: "#workshops" },
  { label: "Contact", href: "#contact" },
];

function SectionHeading({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 flex items-baseline gap-4 border-b border-white/10 pb-5">
      <span className="font-mono text-xs text-white/35">{index}</span>
      <h2 className="font-display text-sm font-light uppercase tracking-[0.35em] text-white/90 sm:text-base">
        {children}
      </h2>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="#top"
            className="font-display shrink-0 text-xs font-light uppercase tracking-[0.3em] text-white/90"
          >
            <span className="sm:hidden">AK</span>
            <span className="hidden sm:inline">Astro Kshitij</span>
          </a>
          <ul className="flex items-center gap-4 sm:gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="font-display text-[11px] font-light uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white sm:text-xs"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="top">
        {/* ---------------- Hero ---------------- */}
        <section className="relative h-[100svh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <BlackHole monochrome offset={{ x: 0.56, y: 0.17 }} zoom={1.05} />
          </div>

          {/* Keeps the wordmark legible without hiding the starfield */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent sm:h-1/3 sm:via-transparent" />

          <div className="relative z-10 flex h-full items-end pb-24 sm:items-center sm:pb-0">
            <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
              <div className="max-w-xl">
                <h1 className="font-display font-light text-white">
                  <span className="block text-[11px] uppercase tracking-[0.5em] text-white/50">
                    Welcome to
                  </span>
                  <span className="mt-4 block text-[clamp(1.75rem,7vw,4.25rem)] uppercase leading-[1.05] tracking-[0.16em]">
                    Astro Kshitij
                  </span>
                </h1>

                <p className="mt-7 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
                  Physics in Hindi, for people who were taught to memorise it.
                  Light that passes too close to the shadow above never comes
                  back. Everything else here is about the parts that do.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="https://www.youtube.com/@astrokshitij"
                    className="font-display rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-black transition-colors hover:bg-white/85"
                  >
                    Watch on YouTube
                  </a>
                  <a
                    href="#about"
                    className="font-display rounded-full border border-white/25 px-6 py-3 text-xs font-light uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-white/60 hover:text-white"
                  >
                    About me
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- About ---------------- */}
        <section id="about" className="scroll-mt-16 border-t border-white/10 bg-black">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
            <SectionHeading index="01">About</SectionHeading>

            <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
              <div className="space-y-6 text-white/65">
                <p className="font-display text-xl font-light leading-snug text-white sm:text-2xl">
                  I am Kshitij Pandey. I make science videos for an audience
                  that was taught to pass exams in physics without ever being
                  shown why any of it is strange.
                </p>
                <p className="text-sm leading-relaxed sm:text-base">
                  I hold an MSc in Physics with a focus on astrophysics and
                  cosmology, and co-authored a peer-reviewed paper on
                  high-energy collisions near naked singularities. That is the
                  background. The work itself is Astro Kshitij: short films,
                  long explainers and a great deal of myth-breaking, mostly in
                  Hindi, because the people who most need this are not reading
                  it in English.
                </p>
                <p className="text-sm leading-relaxed sm:text-base">
                  I have spoken at TEDx and received a Science Communicator
                  Award. Neither of those is the point. The point is that a
                  reel correcting what a textbook says about electricity
                  reached 1.7 million people, which is more than any classroom
                  I will ever stand in.
                </p>
              </div>

              <dl className="grid auto-rows-min grid-cols-2 gap-px self-start overflow-hidden rounded-lg border border-white/10 bg-white/10">
                {STATS.map((stat) => (
                  <div key={stat.label} className="bg-black p-5 sm:p-6">
                    <dt className="font-display text-2xl font-light text-white sm:text-3xl">
                      {stat.value}
                    </dt>
                    <dd className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/40">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---------------- Blog ---------------- */}
        <section id="blog" className="scroll-mt-16 border-t border-white/10 bg-black">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
            <SectionHeading index="02">Blog</SectionHeading>

            <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3">
              {POSTS.map((post) => (
                <article key={post.title} className="flex flex-col bg-black p-6 sm:p-7">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                    {post.tag}
                  </span>
                  <h3 className="font-display mt-4 text-lg font-light leading-snug text-white">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {post.blurb}
                  </p>
                </article>
              ))}
            </div>

            <p className="mt-8 text-sm text-white/45">
              Written pieces are on the way.{" "}
              <a
                href="https://www.youtube.com/@astrokshitij"
                className="text-white/80 underline underline-offset-4 transition-colors hover:text-white"
              >
                The videos are already here
              </a>
              .
            </p>
          </div>
        </section>

        {/* ---------------- Workshops ---------------- */}
        <section id="workshops" className="scroll-mt-16 border-t border-white/10 bg-black">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
            <SectionHeading index="03">Workshops</SectionHeading>

            <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2">
              {WORKSHOPS.map((workshop) => (
                <article key={workshop.title} className="flex flex-col bg-black p-7 sm:p-9">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                    {workshop.audience}
                  </span>
                  <h3 className="font-display mt-4 text-xl font-light leading-snug text-white sm:text-2xl">
                    {workshop.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-white/55">
                    {workshop.blurb}
                  </p>
                  <a
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent(workshop.title)}`}
                    className="font-display mt-7 self-start rounded-full border border-white/25 px-5 py-2.5 text-[11px] font-light uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-white/60 hover:text-white"
                  >
                    Enquire
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Contact ---------------- */}
        <section id="contact" className="scroll-mt-16 border-t border-white/10 bg-black">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
            <SectionHeading index="04">Contact</SectionHeading>

            <div className="grid gap-12 md:grid-cols-2 md:gap-20">
              <div>
                <p className="font-display text-xl font-light leading-snug text-white sm:text-2xl">
                  For workshops, talks, collaborations, or to tell me I got
                  something wrong.
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="font-display mt-6 inline-block text-base font-light tracking-[0.04em] text-white/70 underline underline-offset-[6px] transition-colors hover:text-white sm:text-lg"
                >
                  {EMAIL}
                </a>
              </div>

              <ul className="space-y-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      className="group flex items-center justify-between bg-black px-6 py-5 transition-colors hover:bg-white/5"
                    >
                      <span className="font-display text-sm font-light uppercase tracking-[0.22em] text-white/80">
                        {social.label}
                      </span>
                      <span className="text-white/30 transition-transform group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-[11px] uppercase tracking-[0.16em] text-white/30 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>Astro Kshitij</span>
            <span className="normal-case tracking-normal text-white/25">
              Shadow rendered by integrating light paths in a Schwarzschild
              metric. Nothing above is a stock image.
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}
