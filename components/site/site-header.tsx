"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/content";

const NAV = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Workshops", href: "/workshops" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-black/55 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8"
      >
        <Link
          href="/"
          className="font-display shrink-0 text-xs font-light uppercase tracking-[0.3em] text-white transition-opacity hover:opacity-70"
        >
          <span className="sm:hidden">AK</span>
          <span className="hidden sm:inline">{SITE.name}</span>
        </Link>

        <ul className="flex items-center gap-4 sm:gap-8">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`font-display relative block py-1 text-[11px] font-light uppercase tracking-[0.2em] transition-colors sm:text-xs ${
                    active ? "text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-white transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
