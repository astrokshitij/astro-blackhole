"use client";

import { useEffect, useState } from "react";

type TocItem = { id: string; title: string };

type ArticleReadingToolsProps = {
  items: TocItem[];
  title: string;
};

export function ArticleReadingTools({ items, title }: ArticleReadingToolsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const [light, setLight] = useState(() =>
    typeof window !== "undefined" && window.localStorage.getItem("reading-theme") === "light",
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
      const current = headings
        .filter((heading) => heading.getBoundingClientRect().top <= 160)
        .at(-1);
      if (current) setActiveId(current.id);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  useEffect(() => {
    document.body.dataset.readingTheme = light ? "light" : "dark";
    window.localStorage.setItem("reading-theme", light ? "light" : "dark");
    return () => {
      delete document.body.dataset.readingTheme;
    };
  }, [light]);

  const shareUrl = typeof window === "undefined" ? "" : window.location.href;
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

      <aside className="article-tools" aria-label="Article tools">
        <div className="article-tools__group article-toc">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
            In this piece
          </p>
          <nav aria-label="Table of contents">
            <ol>
              {items.map((item) => (
                <li key={item.id}>
                  <a className={activeId === item.id ? "is-active" : ""} href={`#${item.id}`}>
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="article-tools__group article-share">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">Share</p>
          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label="Share on X">X</a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn">in</a>
          <button type="button" onClick={copyLink} aria-label="Copy article link">{copied ? "Done" : "Copy"}</button>
        </div>
      </aside>

      <div className="article-mobile-tools">
        <button type="button" onClick={() => setLight((value) => !value)} aria-pressed={light}>
          {light ? "Dark reading" : "Light reading"}
        </button>
        <a href="#article-contents">Contents</a>
        <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
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
        aria-label={light ? "Switch to dark reading mode" : "Switch to light reading mode"}
        title={light ? "Dark reading mode" : "Light reading mode"}
      >
        {light ? "◐" : "◑"}
      </button>
    </>
  );
}
