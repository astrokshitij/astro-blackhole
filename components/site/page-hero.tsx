import { Eyebrow } from "./ui";
interface PageHeroProps {
  eyebrow: string;
  title: string;
  dek?: string;
  offset?: { x: number; y: number };
  plainCase?: boolean;
  visual?: "black-hole" | "anomalous-matter" | "raymarch";
}
/** Reading pages use typography; the live simulation belongs to the homepage. */
export function PageHero({ eyebrow, title, dek }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="site-width">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        {dek && <p>{dek}</p>}
      </div>
    </section>
  );
}
