"use client";

import { useEffect, useRef, useState } from "react";

type TocItem = { id: string; title: string };

type ArticleReadingToolsProps = {
  items: TocItem[];
  title: string;
  url: string;
};

export function ArticleReadingTools({
  items,
  title,
  url,
}: ArticleReadingToolsProps) {
  const toolsRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const [light, setLight] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let savedLight = false;
    try {
      savedLight = window.localStorage.getItem("reading-theme") === "light";
    } catch {
      /* Storage can be disabled; keep the default theme. */
    }
    const frame = requestAnimationFrame(() => {
      setLight(savedLight);
      setThemeReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0,
      );
      const current = headings
        .filter((heading) => heading.getBoundingClientRect().top <= 160)
        .at(-1);
      if (current) setActiveId(current.id);

      if (toolsRef.current) {
        const footer = document.querySelector("footer");
        if (footer) {
          const footerTop = footer.getBoundingClientRect().top;
          const defaultTop = 115;
          const toolsHeight = toolsRef.current.offsetHeight;
          const margin = 32;
          const overlap = defaultTop + toolsHeight + margin - footerTop;

          if (overlap > 0) {
            toolsRef.current.style.transform = `translateY(-${overlap}px)`;
            const fadeStart = 40;
            const fadeRange = 80;
            if (overlap > fadeStart) {
              const opacity = Math.max(0, 1 - (overlap - fadeStart) / fadeRange);
              toolsRef.current.style.opacity = `${opacity}`;
              toolsRef.current.style.pointerEvents = opacity < 0.1 ? "none" : "";
            } else {
              toolsRef.current.style.opacity = "1";
              toolsRef.current.style.pointerEvents = "";
            }
          } else {
            toolsRef.current.style.transform = "";
            toolsRef.current.style.opacity = "1";
            toolsRef.current.style.pointerEvents = "";
          }
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  useEffect(() => {
    if (!themeReady) return;
    document.body.dataset.readingTheme = light ? "light" : "dark";
    try {
      window.localStorage.setItem("reading-theme", light ? "light" : "dark");
    } catch {
      /* The theme still works without persistent storage. */
    }
    return () => {
      delete document.body.dataset.readingTheme;
    };
  }, [light, themeReady]);

  const shareUrl = url;
  const shareText = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="reading-progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      <aside ref={toolsRef} className="article-tools" aria-label="Article tools">
        <div className="article-tools__group article-toc">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
            In this piece
          </p>
          <nav aria-label="Table of contents">
            <ol>
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    className={activeId === item.id ? "is-active" : ""}
                    href={`#${item.id}`}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="article-tools__group article-share">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
            Share
          </p>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Share on X"
          >
            X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Share on LinkedIn"
          >
            in
          </a>
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy article link"
          >
            {copied ? "Done" : "Copy"}
          </button>
        </div>
      </aside>

      <div className="article-mobile-tools">
        <button
          type="button"
          onClick={() => setLight((value) => !value)}
          aria-pressed={light}
        >
          {light ? "Dark reading" : "Light reading"}
        </button>
        <a href="#article-contents">Contents</a>
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noreferrer"
        >
          Share
        </a>
        <button type="button" onClick={copyLink}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <button
        type="button"
        className="reading-theme-toggle"
        onClick={() => setLight((value) => !value)}
        aria-pressed={light}
        aria-label={
          light ? "Switch to dark reading mode" : "Switch to light reading mode"
        }
        title={light ? "Dark reading mode" : "Light reading mode"}
      >
        {light ? "◐" : "◑"}
      </button>
    </>
  );
}
