import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/jost";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astro Kshitij",
  description:
    "Science communication by Kshitij Pandey. Physics, scepticism and the things school got wrong, for an audience of 90,000 and counting.",
  openGraph: {
    title: "Astro Kshitij",
    description:
      "Science communication by Kshitij Pandey. Physics, scepticism and the things school got wrong.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}
