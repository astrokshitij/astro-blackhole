import Link from "next/link";
import { SITE } from "@/lib/content";
import { SocialLinks } from "./social-links";

const SITEMAP = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Workshops", href: "/workshops" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-10 py-14 sm:flex-row sm:justify-between sm:gap-16">
          <div className="max-w-xs">
            <p className="font-display text-xs font-light uppercase tracking-[0.3em] text-white">
              {SITE.name}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              {SITE.tagline}
            </p>
            <div className="mt-7">
              <SocialLinks compact />
            </div>
          </div>

          <nav aria-label="Footer" className="shrink-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
              Pages
            </p>
            <ul className="mt-5 space-y-2.5">
              {SITEMAP.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-white/10 py-8 text-xs text-white/55">
          &copy; {new Date().getFullYear()} {SITE.person}
        </div>
      </div>
    </footer>
  );
}
