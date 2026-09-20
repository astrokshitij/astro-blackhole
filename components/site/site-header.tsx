"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/content";
const NAV = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/about" },
  { label: "Writing", href: "/blog" },
  { label: "Workshops", href: "/workshops" },
  { label: "Contact", href: "/contact" },
];
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    panelRef.current?.close();
  }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 640px)");
    const closeOnDesktop = () => {
      if (desktop.matches) panelRef.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    const dialog = panelRef.current;
    const trigger = buttonRef.current;
    if (!dialog || !open) return;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
      trigger?.focus();
    };
  }, [open]);
  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  return (
    <>
      <header className="site-header">
        <nav className="site-width main-nav" aria-label="Main">
          <Link className="wordmark" href="/" aria-label={SITE.name + " home"}>
            <span className="brand-orbit" aria-hidden="true" />
            {SITE.name}
          </Link>
          <ul className="desktop-nav">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link className="nav-invite" href="/contact?type=speaking">
            Invite me to speak <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="menu-toggle"
            type="button"
            ref={buttonRef}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
          >
            <span /> <span />
          </button>
        </nav>
      </header>
      <dialog
        id="mobile-nav"
        className="mobile-menu"
        ref={panelRef}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        aria-label="Navigation menu"
      >
        <div className="mobile-menu-top">
          <Link href="/" className="wordmark" onClick={() => setOpen(false)}>
            {SITE.name}
          </Link>
          <button
            className="menu-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul>
            {NAV.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active(item.href) ? "page" : undefined}
                >
                  <span>0{i + 1}</span>
                  {item.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          className="mobile-invite"
          href="/contact?type=speaking"
          onClick={() => setOpen(false)}
        >
          Invite me to speak ↗
        </Link>
      </dialog>
      <noscript>
        <nav className="nojs-nav" aria-label="Mobile navigation">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </noscript>
    </>
  );
}
