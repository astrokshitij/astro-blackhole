import Image from "next/image";
import Link from "next/link";
import { HeroVisual } from "@/components/site/hero-visual";
import { ButtonLink, Eyebrow, Section } from "@/components/site/ui";
import { ArrowGlyph, YoutubeGlyph } from "@/components/site/icons";
import {
  SITE,
  STATS,
  SOCIALS,
  EDITORIAL as COPY,
  PAGE_COPY,
} from "@/lib/content";
import { getPosts } from "@/lib/posts";

export default function Home() {
  const essay = getPosts().find(
    (post) => post.slug === "how-the-universe-might-actually-die",
  );
  return (
    <>
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-art">
          <HeroVisual />
        </div>
        <div className="site-width hero-composition">
          <div className="hero-copy">
            <Eyebrow>{COPY.hero.eyebrow}</Eyebrow>
            <h1 id="hero-title">
              {PAGE_COPY.home.headline[0]}
              <br />
              {PAGE_COPY.home.headline[1]}
              <br />
              <span>{PAGE_COPY.home.headline[2]}</span>
            </h1>
            <p className="hero-intro">{COPY.hero.intro}</p>
            <div className="hero-actions">
              <ButtonLink href="#work">
                Explore my work <ArrowGlyph className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href={SOCIALS[0].href} variant="ghost">
                <YoutubeGlyph className="h-4 w-4" /> Watch on YouTube
              </ButtonLink>
            </div>
          </div>
          <div className="hero-footnote">
            <span>{PAGE_COPY.home.footnote}</span>
            <span className="hero-science">{PAGE_COPY.home.simulation}</span>
            <a href="#work" aria-label="Scroll to selected explorations">
              {PAGE_COPY.home.scroll}
            </a>
          </div>
        </div>
      </section>
      <section className="credibility" aria-label="Background and reach">
        <div className="site-width credibility-inner">
          {COPY.credentials.map((item) => (
            <p key={item}>{item}</p>
          ))}
          {STATS.map((stat) => (
            <p key={stat.label}>
              <strong>
                {stat.to}
                {stat.suffix}
              </strong>{" "}
              {stat.label}
            </p>
          ))}
        </div>
      </section>
      <Section id="work">
        <div className="section-top">
          <div>
            <Eyebrow>{PAGE_COPY.home.workLabel}</Eyebrow>
            <h2 className="section-title">
              {PAGE_COPY.home.workTitle[0]}
              <br />
              {PAGE_COPY.home.workTitle[1]}
            </h2>
          </div>
          <p className="section-aside">{PAGE_COPY.home.workIntro}</p>
        </div>
        <div className="exploration-grid">
          {COPY.explorations.map((piece, i) => (
            <article
              className={`exploration exploration-${i}`}
              key={piece.href}
            >
              <a
                href={piece.href}
                className="image-link"
                tabIndex={-1}
                aria-hidden="true"
              >
                <div className="editorial-image">
                  <Image
                    src={piece.image}
                    alt={piece.alt}
                    fill
                    sizes={
                      i === 0
                        ? "(min-width: 900px) 720px, 100vw"
                        : "(min-width: 900px) 370px, 100vw"
                    }
                    className="object-cover"
                  />
                </div>
                <span className="image-badge">{piece.type}</span>
              </a>
              <div className="exploration-copy">
                <Eyebrow>{piece.category}</Eyebrow>
                <h3>
                  <a href={piece.href}>{piece.title}</a>
                </h3>
                <p>{piece.description}</p>
                <a className="text-link" href={piece.href}>
                  {piece.cta}
                  <ArrowGlyph className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section className="room-section">
        <div className="section-top">
          <div>
            <Eyebrow>{PAGE_COPY.home.roomLabel}</Eyebrow>
            <h2 className="section-title">{COPY.room.title}</h2>
          </div>
          <Link className="text-link" href="/contact?type=speaking">
            Invite Kshitij to speak <ArrowGlyph className="h-4 w-4" />
          </Link>
        </div>
        <figure className="stage-photo">
          <Image
            src="/images/home/tedx/2.jpg"
            alt="Kshitij Pandey speaking on the TEDx stage"
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
          />
          <figcaption>{COPY.room.caption}</figcaption>
        </figure>
        <div className="room-details">
          <div>
            <h3>{COPY.room.intro}</h3>
            <p>{COPY.room.body}</p>
          </div>
          <div>
            <ul>
              {COPY.room.offerings.map((item, i) => (
                <li key={item}>
                  <span>0{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="availability-note">{COPY.room.note}</p>
            <Link className="text-link" href="/workshops">
              Explore workshops <ArrowGlyph className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>
      <Section>
        <div className="about-preview">
          <figure>
            <div className="portrait-image">
              <Image
                src={SITE.portrait}
                alt={SITE.portraitAlt}
                fill
                sizes="(min-width: 900px) 460px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption>{PAGE_COPY.home.portraitCaption}</figcaption>
          </figure>
          <div>
            <Eyebrow>03 / {COPY.about.eyebrow}</Eyebrow>
            <h2 className="section-title">{COPY.about.title}</h2>
            <p className="body-copy">{COPY.about.body}</p>
            <Link className="text-link" href="/about">
              {COPY.about.cta}
              <ArrowGlyph className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>
      {essay && (
        <Section className="writing-band">
          <Eyebrow>04 / {COPY.writing.eyebrow}</Eyebrow>
          <div className="writing-feature">
            <div>
              <p className="writing-meta">
                {essay.category} <span> / </span> {essay.readTime} read{" "}
                <span> / </span>{" "}
                <time dateTime={essay.date}>{essay.dateLabel}</time>
              </p>
              <h2>
                <Link href={`/blog/${essay.slug}`}>{essay.title}</Link>
              </h2>
              <p className="body-copy">{COPY.writing.summary}</p>
              <Link className="text-link" href={`/blog/${essay.slug}`}>
                Read the essay <ArrowGlyph className="h-4 w-4" />
              </Link>
            </div>
            <Link
              href={`/blog/${essay.slug}`}
              className="essay-image"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image
                src={essay.cover!}
                alt=""
                fill
                sizes="(min-width: 900px) 400px, 100vw"
                className="object-cover"
              />
            </Link>
          </div>
        </Section>
      )}
      <Section className="channels-section">
        <div className="section-top">
          <div>
            <Eyebrow>{PAGE_COPY.home.channelsLabel}</Eyebrow>
            <h2 className="section-title">{PAGE_COPY.home.channelsTitle}</h2>
          </div>
        </div>
        <div className="channel-list">
          {SOCIALS.map((social, i) => (
            <a href={social.href} key={social.label}>
              <span className="channel-number">0{i + 1}</span>
              <h3>{social.label}</h3>
              <p>{social.note}</p>
              <span className="channel-handle">{social.handle}</span>
              <ArrowGlyph className="h-5 w-5" />
            </a>
          ))}
        </div>
      </Section>
      <Section className="closing-section">
        <Eyebrow>{COPY.closing.eyebrow}</Eyebrow>
        <h2>{COPY.closing.title}</h2>
        <div className="closing-bottom">
          <p>{COPY.closing.body}</p>
          <div className="hero-actions">
            <ButtonLink href="/contact?type=speaking">
              Invite me to speak <ArrowGlyph className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Get in touch
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
