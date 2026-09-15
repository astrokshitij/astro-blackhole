"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/content";

const NAV = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Workshops", href: "/workshops" },
  { label: "Contact", href: "/contact" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Below the `sm` breakpoint the four links no longer fit: at a 320px viewport
 * the row overflowed by 24px and the page scrolled sideways. So on phones the
 * links move into a full-screen panel behind a single button, and the wordmark
 * stays spelled out rather than shrinking to initials.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Any navigation closes the panel, including a browser back.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes, and the page behind must not scroll while it is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-black/55 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8"
      >
        <Link
          href="/"
          className="font-display shrink-0 py-1.5 text-xs font-light uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-70 sm:tracking-[0.3em]"
        >
          {SITE.name}
        </Link>

        {/* Phones: one button. Everything above sm: the links inline. */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-my-2.5 -mr-2.5 flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 sm:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 block h-px w-full bg-current transition-transform duration-300 ${
                open ? "top-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 block h-px w-full bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-full bg-current transition-transform duration-300 ${
                open ? "top-1/2 -rotate-45" : "top-full"
              }`}
            />
          </span>
        </button>

        <ul className="hidden items-center gap-8 sm:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`font-display relative block py-1.5 text-xs font-light uppercase tracking-[0.2em] transition-colors ${
                    active ? "text-white" : "text-white/60 hover:text-white"
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

      {/* Deliberately a sibling of <header>, not a child: the header's
          backdrop-filter would otherwise become this panel's containing block
          and collapse it to the height of the header. Rendered always so both
          transitions animate, but out of the tab order while hidden. */}
      <div
        id="mobile-nav"
        ref={panelRef}
        tabIndex={-1}
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-black/95 backdrop-blur-xl transition-opacity duration-300 sm:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-5 pt-6">
          {NAV.map((item, index) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${60 + index * 45}ms` : "0ms" }}
                  className={`font-display flex min-h-[56px] items-center border-b border-white/10 text-base font-light uppercase tracking-[0.22em] transition-[opacity,transform,color] duration-300 ${
                    open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  } ${active ? "text-white" : "text-white/70"}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-5 pt-8 text-sm leading-relaxed text-white/50">
          {SITE.tagline}
        </p>
      </div>
    </>
  );
}
