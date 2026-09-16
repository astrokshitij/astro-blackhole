import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
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
  "Physics in Hindi for an audience of ninety thousand. Myth-breaking, explainers and short films by Kshitij Pandey, plus workshops for institutions and the curious.";

const SOCIAL_DESCRIPTION =
  "Physics in Hindi for an audience of ninety thousand. Myth-breaking, explainers and short films by Kshitij Pandey.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: TITLE,
    template: `%s — ${SITE.name}`,
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
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
  themeColor: "#000000",
};

/** Identity for search engines. Only facts the site already states. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.person,
  alternateName: SITE.name,
  url: siteUrl,
  email: `mailto:${SITE.email}`,
  jobTitle: "Science communicator",
  description: SOCIAL_DESCRIPTION,
  knowsAbout: ["Physics", "Astrophysics", "Cosmology", "Science communication"],
  sameAs: SOCIALS.map((social) => social.href),
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
      <body className="min-h-full bg-black text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
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
      </body>
    </html>
  );
}
