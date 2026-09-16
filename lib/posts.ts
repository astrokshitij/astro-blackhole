import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Blog posts are plain markdown files in `content/blog/`.
 * One file is one post. The filename becomes the URL:
 * `content/blog/turn-around-twice.md` is served at `/blog/turn-around-twice`.
 *
 * Every file starts with a frontmatter block between two `---` lines. See any
 * existing post for the shape, or the README.
 */

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  /** Human-readable date, ready to print. */
  dateLabel: string;
  /** Optional image path, for example "/images/blog/spinors.jpg" */
  cover?: string;
  coverAlt?: string;
  draft: boolean;
  /** Rendered HTML of the body. */
  html: string;
}

function toLabel(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) return date;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function headingId(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function read(fileName: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  const rawHtml = marked.parse(content, { async: false }) as string;
  const html = DOMPurify.sanitize(rawHtml);
  const htmlWithHeadingIds = html.replace(
    /<h2>(.*?)<\/h2>/g,
    (_, text: string) => `<h2 id="${headingId(text)}">${text}</h2>`,
  );

  return {
    slug: fileName.replace(/\.md$/, ""),
    title: String(data.title ?? "Untitled"),
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? "Physics"),
    readTime: String(data.readTime ?? ""),
    date: String(data.date ?? ""),
    dateLabel: data.date ? toLabel(String(data.date)) : "",
    cover: data.cover ? String(data.cover) : undefined,
    coverAlt: data.coverAlt ? String(data.coverAlt) : undefined,
    draft: data.draft === true,
    html: htmlWithHeadingIds,
  };
}

/** Published posts, newest first. Drafts are excluded. */
export function getPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(read)
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}


export function getPost(slug: string): Post | null {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null;
  const file = `${slug}.md`;
  const resolved = path.resolve(POSTS_DIR, file);
  if (!resolved.startsWith(POSTS_DIR)) return null;
  if (!fs.existsSync(resolved)) return null;
  return read(file);
}
