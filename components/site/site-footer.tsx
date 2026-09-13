import Link from "next/link";
import { SITE, SOCIALS } from "@/lib/content";

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
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-xs font-light uppercase tracking-[0.3em] text-white">
              {SITE.name}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
              {SITE.tagline}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">Pages</p>
            <ul className="mt-4 space-y-2">
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

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">Elsewhere</p>
            <ul className="mt-4 space-y-2">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {SITE.person}
          </span>
          <span>
            The shadow is rendered by integrating light paths in a Schwarzschild
            metric. It is not a stock image.
          </span>
        </div>
      </div>
    </footer>
  );
}
