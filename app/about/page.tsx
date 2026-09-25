import type { Metadata } from "next";
import { socialMeta } from "@/lib/seo";
import { PageHero } from "@/components/site/page-hero";
import { NextPage, Section } from "@/components/site/ui";
import { SocialLinks } from "@/components/site/social-links";
import { RevealPhoto } from "@/components/site/reveal-photo";
import {
  StoryPhotoPanel,
  type StoryPhoto,
} from "@/components/site/story-photo-panel";
import { EDITORIAL, SITE } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kshitij Pandey: MSc in astrophysics and cosmology, TEDx speaker, science communicator, and the person behind Astro Kshitij.",
  alternates: { canonical: "/about" },
  ...socialMeta({
    path: "/about",
    title: "About Kshitij Pandey",
    description:
      "MSc in astrophysics and cosmology, TEDx speaker, science communicator, and the person behind Astro Kshitij.",
  }),
};

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${siteUrl}/about#profilepage`,
  name: `About ${SITE.person} (${SITE.name})`,
  description:
    "Biographical profile and academic background of Kshitij Pandey (Astro Kshitij): MSc in Physics (Astrophysics & Cosmology), co-author of peer-reviewed research on naked singularities, TEDx speaker, and science communicator.",
  url: `${siteUrl}/about`,
  mainEntity: {
    "@id": `${siteUrl}/#person`,
  },
};

// Photos keyed by story-section id. Each carries its own aspect ratio so the
// panel morphs to the shot rather than cropping it. The first entry is the
// default before any section has intersected. Mobile falls back to inline
// RevealPhotos underneath each section.
const STORY_PHOTOS: StoryPhoto[] = [
  {
    id: "obsession",
    src: "/images/story/9th-class-exhibition.jpg",
    alt: "Kshitij at his Class 9 time-travel science exhibition",
    caption: "Class 9. The time-travel exhibition.",
    aspect: "4/3",
  },
  {
    id: "finding-my-way",
    src: "/images/story/talk-during-bsc.jpg",
    alt: "Kshitij giving a guest lecture during his BSc",
    caption: "Guest lecture, BSc years.",
    aspect: "4/3",
  },
  {
    id: "before-msc",
    src: "/images/story/iit-bhu-prize.jpg",
    alt: "Kshitij studying at ICFAI Jaipur during his BSc",
    caption: "ICFAI Jaipur.",
    aspect: "1/1",
  },
  {
    id: "research-degree",
    src: "/images/story/msc-degree.jpg",
    alt: "Kshitij with his M.Sc. Physics degree, Charusat University",
    caption: "M.Sc. Physics. Charusat, 2024.",
    aspect: "3/4",
    position: "center 20%",
  },
  {
    id: "research-labs",
    src: "/images/story/msc-poster.jpg",
    alt: "Kshitij in front of his research poster on high-energy collisions near naked singularities",
    caption: "The research poster.",
    aspect: "4/3",
  },
  {
    id: "research-teaching",
    src: "/images/story/after-msc-talk.jpg",
    alt: "Kshitij teaching at a chalkboard during his MSc years",
    caption: "Teaching.",
    aspect: "4/5",
  },
  {
    id: "detour",
    src: "/images/story/msc-research.jpg",
    alt: "Kshitij at a desk working through data",
    caption: "Heads down.",
    aspect: "4/3",
  },
  {
    id: "point",
    src: "/images/story/telescope.jpg",
    alt: "Kshitij beside a Celestron telescope at an outdoor observing session",
    caption: "Still going out to look.",
    aspect: "4/5",
  },
];

const photosById = Object.fromEntries(
  STORY_PHOTOS.map((photo) => [photo.id, photo]),
);

function MobilePhoto({
  id,
  aspect = "aspect-[4/3]",
}: {
  id: string;
  aspect?: string;
}) {
  const photo = photosById[id];
  if (!photo) return null;
  return (
    <div className="mt-10 lg:hidden">
      <RevealPhoto
        src={photo.src}
        alt={photo.alt}
        caption={photo.caption}
        aspectClassName={aspect}
        sizes="100vw"
      />
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profilePageJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PageHero
        eyebrow="01 / About"
        title="Hi, I'm Kshitij."
        offset={{ x: 0.38, y: 0.12 }}
        plainCase
      />

      <Section>
        <ul className="credential-summary" aria-label="Background at a glance">
          {EDITORIAL.aboutCredentials.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="grid gap-16 lg:grid-cols-[1.35fr_1fr] lg:gap-24">
          {/* Story column */}
          <div className="max-w-2xl">
            <div>
              <p className="font-display text-xl font-light leading-[1.35] text-white sm:text-2xl">
                Science communicator. TEDx speaker. Physics nerd. Researcher.
                Marketer. And, apparently, someone who has never been very good
                at following a conventional path.
              </p>

              <p className="mt-8 text-sm leading-relaxed text-white/70 sm:text-base">
                Those are the headlines, but they don&apos;t really tell you
                much about the person behind Astro Kshitij.
              </p>
              <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                Since you&apos;re here to know a little more about me, let me
                take you through the journey that brought me here.
              </p>
            </div>

            <div className="story-chapters mt-14 space-y-14">
              <section data-story-section="obsession">
                <h2 className="font-display text-2xl font-light leading-snug text-white sm:text-3xl">
                  It started with a weird obsession with science.
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  I&apos;ve been fascinated by science for as long as I can
                  remember. I wasn&apos;t exactly the brightest student in
                  school when it came to academics. In fact, I failed Class 6.
                  But somehow, physics was always different. My teachers noticed
                  that I was unusually curious about it, and I slowly realised
                  that I didn&apos;t just want to learn physics. I wanted to
                  understand it, question it and figure out how things actually
                  work.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  That became clearer in Class 9, when I was selected by my
                  school to represent it at a national-level science exhibition.
                  I presented an idea around time travel, combining the popular
                  science I was reading with physics demonstrations I had put
                  together myself. I was only in Class 9, but I absolutely loved
                  the process. It was probably one of the first times I realised
                  how much I enjoyed taking an idea that fascinated me and
                  trying to make someone else see why it was fascinating too.
                </p>
                <MobilePhoto id="obsession" aspect="aspect-[4/3]" />
              </section>

              <section data-story-section="finding-my-way">
                <h2 className="font-display text-2xl font-light leading-snug text-white sm:text-3xl">
                  Finding my way into physics
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  I went on to study{" "}
                  <strong className="font-normal text-white/85">
                    B.Sc. Physics (Hons.) at The ICFAI University, Jaipur
                  </strong>
                  . By my first year, I already knew that I wanted to do more
                  than just study for exams. I wanted to get involved in physics
                  outreach, competitions and research.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  During my first year, I was invited to deliver a guest lecture
                  on Special Relativity at a college in Banswara, Rajasthan. I
                  also started participating in physics and research
                  competitions, winning and presenting work at institutions
                  including IIT BHU, IIT Kharagpur, BITS Pilani and LNMIIT,
                  among others.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  One experience stands out. In my second year, I participated
                  in the{" "}
                  <strong className="font-normal text-white/85">
                    University Physics Competition
                  </strong>
                  , where undergraduate students from around the world work on a
                  challenging physics problem and turn their solution into a
                  research-style paper over 48 hours. I ended up winning a{" "}
                  <strong className="font-normal text-white/85">
                    Silver Medal
                  </strong>
                  .
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  During my final year, I was also elected{" "}
                  <strong className="font-normal text-white/85">
                    Student Council President
                  </strong>{" "}
                  while working on WIMP dark matter for my research
                  dissertation.
                </p>
                <MobilePhoto id="finding-my-way" aspect="aspect-[4/3]" />
              </section>

              <section data-story-section="before-msc">
                <h2 className="font-display text-2xl font-light leading-snug text-white sm:text-3xl">
                  Before my master&apos;s, I got a taste of the bigger research
                  world.
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  After completing my B.Sc., I had the opportunity to
                  participate in the{" "}
                  <strong className="font-normal text-white/85">
                    SLAC Summer Institute
                  </strong>
                  , organised by Stanford. It gave me further exposure to
                  research, workshops and the wider world of physics beyond my
                  undergraduate experience.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  That experience further strengthened my interest in pursuing
                  research, which naturally led me towards astrophysics and
                  cosmology.
                </p>
                <MobilePhoto id="before-msc" aspect="aspect-[1/1]" />
              </section>

              <div className="space-y-5">
                <div data-story-section="research-degree">
                  <h2 className="font-display text-2xl font-light leading-snug text-white sm:text-3xl">
                    From competitions to research
                  </h2>
                  <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                    I went on to pursue an{" "}
                    <strong className="font-normal text-white/85">
                      M.Sc. in Physics with a focus on Astrophysics and
                      Cosmology
                    </strong>
                    .
                  </p>
                  <MobilePhoto id="research-degree" aspect="aspect-[3/4]" />
                </div>

                <div data-story-section="research-labs" className="!mt-8">
                  <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                    My master&apos;s changed the scale of the questions I was
                    working on. I got the opportunity to work with{" "}
                    <strong className="font-normal text-white/85">
                      Prof. Kaushik Bhattacharya at IIT Kanpur
                    </strong>{" "}
                    on scalar-field dark matter, and with{" "}
                    <strong className="font-normal text-white/85">
                      Prof. Pankaj S. Joshi
                    </strong>{" "}
                    on high-energy particle collisions in the vicinity of naked
                    singularities.
                  </p>
                  <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                    That work eventually became a{" "}
                    <a
                      href="https://www.sciencedirect.com/science/article/abs/pii/S2212686425002948"
                      className="text-white underline underline-offset-4 decoration-white/40 transition-colors hover:decoration-white"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      paper I co-authored
                    </a>
                    .
                  </p>
                  <MobilePhoto id="research-labs" aspect="aspect-[4/3]" />
                </div>

                <div data-story-section="research-teaching" className="!mt-8">
                  <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                    Research is still the part of physics that excites me the
                    most. I enjoy sitting with difficult problems, digging into
                    the mathematics and trying to understand what nature is
                    actually telling us.
                  </p>
                  <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                    But I&apos;ve also always enjoyed communicating those ideas,
                    especially when I can take something that feels intimidating
                    and make it accessible to someone who doesn&apos;t have a
                    physics background.
                  </p>
                  <MobilePhoto id="research-teaching" aspect="aspect-[4/5]" />
                </div>
              </div>

              <section data-story-section="detour">
                <h2 className="font-display text-2xl font-light leading-snug text-white sm:text-3xl">
                  Then I took an unexpected detour.
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  After my master&apos;s, the obvious next step would have been
                  a PhD. Instead, I decided to take a break from the traditional
                  academic path.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  Not because I stopped loving physics or research. I wanted
                  some time to explore, learn outside academia and understand
                  where my interests could take me.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  Today, I work in{" "}
                  <strong className="font-normal text-white/85">
                    marketing automation and strategy
                  </strong>
                  , increasingly at the intersection of{" "}
                  <strong className="font-normal text-white/85">
                    AI, data and marketing
                  </strong>
                  , helping companies make better decisions and build stronger
                  inbound and outbound growth systems.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  On paper, Physics &rarr; astrophysics research &rarr; science
                  communication &rarr; marketing &rarr; AI probably looks like a
                  very strange trajectory.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  But I actually think the detour has been useful.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  Physics taught me to question assumptions. Research taught me
                  to sit with difficult problems. Science communication taught
                  me to make complicated ideas understandable. Marketing taught
                  me to understand people, attention and what makes an idea
                  travel. And AI is now bringing many of those worlds together.
                </p>
                <MobilePhoto id="detour" aspect="aspect-[4/3]" />
              </section>

              <section data-story-section="point">
                <h2 className="font-display text-2xl font-light leading-snug text-white sm:text-3xl">
                  Maybe the detour was the point.
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  I don&apos;t see these as completely separate parts of my life
                  anymore. They&apos;ve given me an unusual way of looking at
                  problems, and that perspective is probably one of the things I
                  value most about my journey.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  And that brings me back to{" "}
                  <strong className="font-normal text-white/85">
                    Astro Kshitij
                  </strong>
                  .
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  I started with a fascination for physics and research. Along
                  the way, I realised that I also genuinely enjoy bringing those
                  ideas outside the walls of academia and sharing them with
                  people who might otherwise never encounter them.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  So whether you found me through a reel, a workshop, a research
                  paper, a talk or simply because you were curious enough to
                  click &ldquo;About&rdquo;, welcome.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  I&apos;m still figuring things out. Still asking questions.
                  Still going down ridiculous rabbit holes.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                  And hopefully, still making you curious enough to ask a few of
                  your own.
                </p>
                <MobilePhoto id="point" aspect="aspect-[4/5]" />
              </section>
            </div>

            <div className="mt-16">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/55">
                Where the work lives
              </p>
              <div className="mt-5">
                <SocialLinks />
              </div>
            </div>
          </div>

          {/* Sticky photo panel, desktop only. Mobile shows inline photos. */}
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <StoryPhotoPanel photos={STORY_PHOTOS} initialId="obsession" />
          </aside>
        </div>

        <NextPage href="/blog" title="My abstract thoughts" />
      </Section>
    </>
  );
}
