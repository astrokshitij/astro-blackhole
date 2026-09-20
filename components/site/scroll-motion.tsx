"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: server content remains visible without JavaScript. */
export function ScrollMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || !window.IntersectionObserver) return;
    const animations = new Set<Animation>();
    const frames = new Set<number>();
    const counters = new Map<HTMLElement, string>();
    const selector = [
      ".hero-copy > *", ".page-hero .site-width > *",
      ".credibility-inner > p", ".section-top", ".exploration",
      ".room-details > div", ".about-preview > div", ".writing-feature > *",
      ".featured-post", ".post-card", "footer .site-width > div",
      ".section-inner > .eyebrow", ".section-inner > h2",
      ".section-inner > .closing-bottom", ".channel-list > a",
      "main figure", ".workshop-visual > div", ".programme-intro > *",
      ".programme > div", ".programme-details", ".contact-grid > div",
      ".enquiry-form", "[data-story-section] > h2",
      "[data-story-section] > p", ".article-body h2", ".article-body p",
      ".article-hero h1", ".article-hero p", ".next-page",
    ].join(",");
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter(el => !el.parentElement?.closest(".exploration, .enquiry-form, .programme-details, .contact-grid > div"));
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        if (media.matches) return;
        // Small, bounded staggering never makes readers wait for whole sections.
        const animation = el.animate([
          { opacity: 0, transform: "translateY(24px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 720, delay: Math.min(index * 65, 195), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
        const number = el.querySelector<HTMLElement>("[data-count-to]");
        if (number) {
          const target = Number(number.dataset.countTo);
          const finalText = number.textContent ?? String(target);
          counters.set(number, finalText);
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / 1500, 1);
            number.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1 && !media.matches) {
              const id = requestAnimationFrame(time => { frames.delete(id); tick(time); });
              frames.add(id);
            } else { number.textContent = finalText; counters.delete(number); }
          };
          tick(start);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach(el => observer.observe(el));
    const stop = () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      frames.forEach(cancelAnimationFrame);
      counters.forEach((text, el) => { el.textContent = text; });
    };
    const onPreference = () => { if (media.matches) stop(); };
    media.addEventListener("change", onPreference);
    return () => { stop(); media.removeEventListener("change", onPreference); };
  }, [pathname]);
  return null;
}
