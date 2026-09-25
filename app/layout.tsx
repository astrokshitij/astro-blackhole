import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import "./globals.css";
import "./editorial.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ScrollMotion } from "@/components/site/scroll-motion";
import { SITE, SOCIALS } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { socialMeta } from "@/lib/seo";

/**
 * The display face carries the wordmark and every heading, so it is almost
 * always the largest thing painted. Loaded through the CSS graph it was
 * discovered late and the brand name visibly reflowed on first paint; declared
 * here it is self-hosted, subsetted to latin and preloaded.
 */
const jost = localFont({
  src: "../fonts/jost-latin-variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-jost",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const TITLE = `${SITE.name} — science communication by ${SITE.person}`;

const DESCRIPTION =
  "Kshitij Pandey (Astro Kshitij) — physicist, TEDx speaker, and science communicator reaching 137k+ people and 100+ rooms through deep physics explainers, research, and workshops.";

const SOCIAL_DESCRIPTION =
  "Physicist, TEDx speaker, and science communicator reaching 137k+ people and 100+ rooms through deep physics explainers, research, and workshops.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: TITLE,
    template: `%s — ${SITE.name}`,
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  ...socialMeta({
    title: TITLE,
    description: SOCIAL_DESCRIPTION,
    path: "/",
  }),
};

export const viewport: Viewport = {
  // Without this the scrollbar and every native control render light grey
  // against a pure black page.
  colorScheme: "dark",
  themeColor: "#08090C",
};

/** Identity and Site Name structured data for Google Search & Knowledge Graph. */
const SCIENCE_DIRECT_PAPER_URL =
  "https://www.sciencedirect.com/science/article/abs/pii/S2212686425002948";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: SITE.name,
      alternateName: [SITE.person, "astrokshitij.com"],
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: SITE.person,
      alternateName: SITE.name,
      url: siteUrl,
      mainEntityOfPage: `${siteUrl}/about`,
      image: `${siteUrl}${SITE.portrait}`,
      email: `mailto:${SITE.email}`,
      jobTitle: "Physicist & Science Communicator",
      description: SOCIAL_DESCRIPTION,
      alumniOf: [
        {
          "@type": "CollegeOrUniversity",
          name: "Charotar University of Science and Technology (CHARUSAT)",
        },
        {
          "@type": "CollegeOrUniversity",
          name: "The ICFAI University, Jaipur",
        },
      ],
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        name: "M.Sc. in Physics (Astrophysics and Cosmology)",
      },
      award: [
        "Science Communicator Award",
        "Silver Medal — University Physics Competition",
      ],
      knowsAbout: [
        "Physics",
        "Astrophysics",
        "Cosmology",
        "Naked Singularities",
        "Dark Matter",
        "Quantum Mechanics",
        "Science communication",
      ],
      sameAs: [
        ...SOCIALS.map((social) => social.href),
        SCIENCE_DIRECT_PAPER_URL,
      ],
    },
    {
      "@type": "ScholarlyArticle",
      "@id": `${siteUrl}/#paper-naked-singularities`,
      headline:
        "High-energy particle collisions in the vicinity of naked singularities",
      url: SCIENCE_DIRECT_PAPER_URL,
      author: [
        { "@id": `${siteUrl}/#person` },
        { "@type": "Person", name: "Pankaj S. Joshi" },
      ],
      about: [
        "Astrophysics",
        "Naked Singularities",
        "General Relativity",
        "High-Energy Particle Collisions",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} ${jost.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2 focus:text-sm focus:text-black"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ScrollMotion />
      </body>
    </html>
  );
}
