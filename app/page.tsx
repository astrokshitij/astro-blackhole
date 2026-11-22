import Image from "next/image";
import Link from "next/link";
import { LightStory } from "@/components/site/light-story";
import { ButtonLink, Eyebrow, Section } from "@/components/site/ui";
import { ArrowGlyph } from "@/components/site/icons";
import { SITE, SOCIALS, EDITORIAL as COPY, LIGHT_STORY } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import "./light-story.css";
import "./optical-story.css";

export default function Home() {
  const [essay] = getPosts();
  return (
    <>
      <LightStory />
      <Section className="light-personal-section">
        <div className="light-personal-grid">
          <figure className="light-personal-portrait">
            <Image
              src={SITE.portrait}
              alt={SITE.portraitAlt}
              fill
              sizes="(min-width: 900px) 480px, 90vw"
              className="object-cover"
            />
            <figcaption>Kshitij Pandey / Astro Kshitij</figcaption>
          </figure>
          <div>
            <Eyebrow>{LIGHT_STORY.personal.label}</Eyebrow>
            <h2 className="section-title">{LIGHT_STORY.personal.title}</h2>
            <p className="body-copy">{LIGHT_STORY.personal.body}</p>
            <Link className="text-link" href="/about">
              {LIGHT_STORY.personal.cta}
              <ArrowGlyph className="h-4 w-4" />
            </Link>
            <div className="light-personal-credentials">
              {COPY.credentials.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <Section id="work" className="light-selected-work">
        <div className="section-top">
          <div>
            <Eyebrow>{LIGHT_STORY.work.label}</Eyebrow>
            <h2 className="section-title">{LIGHT_STORY.work.title}</h2>
          </div>
          <p className="section-aside">{LIGHT_STORY.work.intro}</p>
        </div>
        <div className="light-work-grid">
          {COPY.explorations.map((piece, i) => (
            <article key={piece.href} className="light-work-item">
              <a
                href={piece.href}
                target={piece.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  piece.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="light-work-image"
                tabIndex={-1}
                aria-hidden="true"
              >
                <Image
                  src={piece.image}
                  alt=""
                  fill
                  sizes="(min-width:900px) 560px, 90vw"
                  className="object-cover"
                />
              </a>
              <Eyebrow>
                0{i + 1} / {piece.category}
              </Eyebrow>
              <h3>
                <a
                  href={piece.href}
                  target={piece.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    piece.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  {piece.title}
                </a>
              </h3>
              <p>{piece.description}</p>
              <a
                className="text-link"
                href={piece.href}
                target={piece.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  piece.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {piece.cta}
                <ArrowGlyph className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </Section>
      {essay && (
        <Section className="light-featured-essay">
          <div className="light-essay-grid">
            <div>
              <Eyebrow>From my writing / {essay.readTime} read</Eyebrow>
              <h2 className="section-title">
                <Link href={`/blog/${essay.slug}`}>{essay.title}</Link>
              </h2>
              <p className="body-copy">{essay.excerpt}</p>
              <Link href={`/blog/${essay.slug}`} className="text-link">
                Read the essay
                <ArrowGlyph className="h-4 w-4" />
              </Link>
            </div>
            {essay.cover && (
              <Link
                className="light-essay-cover"
                href={`/blog/${essay.slug}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                <Image
                  src={essay.cover}
                  alt=""
                  fill
                  sizes="(min-width: 900px) 480px, 90vw"
                  className="object-cover"
                />
              </Link>
            )}
          </div>
        </Section>
      )}
      <Section className="closing-section light-closing">
        <Eyebrow>{COPY.closing.eyebrow}</Eyebrow>
        <h2>{COPY.closing.title}</h2>
        <div className="closing-bottom">
          <p>{COPY.closing.body}</p>
          <div className="hero-actions">
            <ButtonLink href="/contact">
              Get in touch
              <ArrowGlyph className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href={COPY.explorations[3].href}
              variant="ghost"
              external
            >
              Hiring? See my product work
            </ButtonLink>
          </div>
        </div>
        <div className="light-socials">
          {SOCIALS.map((social) => (
            <a href={social.href} key={social.label}>
              {social.label}
              <ArrowGlyph className="h-4 w-4" />
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
