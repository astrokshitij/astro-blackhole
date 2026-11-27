import Link from "next/link";
import { SITE } from "@/lib/content";
import { SocialLinks } from "./social-links";

const SITEMAP = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Writing", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="site-width">
        <div className="flex flex-col gap-10 py-14 sm:flex-row sm:justify-between sm:gap-16">
          <div className="max-w-xs">
            <p className="font-display text-sm font-light uppercase tracking-[0.28em] text-white">
              {SITE.name}
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-4 inline-flex min-h-11 items-center text-base text-[#f0b545] transition-colors hover:text-[#f8cd78]"
            >
              {SITE.email}
            </a>
            <div className="mt-4">
              <SocialLinks compact />
            </div>
          </div>

          <nav aria-label="Footer" className="shrink-0">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-white/60">
              Pages
            </p>
            <ul className="mt-3">
              {SITEMAP.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-base text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-white/10 py-8 text-sm text-white/60">
          &copy; {new Date().getFullYear()} {SITE.person}
        </div>
      </div>
    </footer>
  );
}
