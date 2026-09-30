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
  /** Optional 1200x630 image used for social cards instead of the cover. */
  ogImage?: string;
  /** Pixel size of the cover, so it can be shown uncropped. */
  coverSize?: { width: number; height: number };
  coverAlt?: string;
  /** Optional pull quote shown under the title, in place of the excerpt. */
  quote?: string;
  /** Optional short takeaways, as bullets above the body; joined to form the article abstract. */
  summary?: string[];
  /** Optional subjects the post is about, published as structured data. */
  topics?: string[];
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

const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Pixel size of a PNG, WebP or JPEG under `public/`, read from the file
 * header. Used so images reserve their space before they load.
 */
function imageSize(src: string): { width: number; height: number } | null {
  if (!src.startsWith("/images/")) return null;
  const file = path.resolve(PUBLIC_DIR, `.${src}`);
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file)) return null;
  try {
    const fd = fs.openSync(file, "r");
    const b = Buffer.alloc(64);
    const n = fs.readSync(fd, b, 0, 64, 0);
    if (n < 30) {
      fs.closeSync(fd);
      return null;
    }
    if (b.readUInt32BE(0) === 0x89504e47) {
      fs.closeSync(fd);
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      fs.closeSync(fd);
      const kind = b.toString("ascii", 12, 16);
      if (kind === "VP8 ") {
        return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      }
      if (kind === "VP8L") {
        return {
          width: 1 + (((b[22] & 0x3f) << 8) | b[21]),
          height: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)),
        };
      }
      if (kind === "VP8X") {
        return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
      }
      return null;
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      const all = fs.readFileSync(file);
      fs.closeSync(fd);
      let i = 2;
      while (i + 9 < all.length) {
        if (all[i] !== 0xff) {
          i += 1;
          continue;
        }
        const marker = all[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { width: all.readUInt16BE(i + 7), height: all.readUInt16BE(i + 5) };
        }
        i += 2 + all.readUInt16BE(i + 2);
      }
      return null;
    }
    fs.closeSync(fd);
  } catch {
    /* Fall through: the page still renders, just without reserved space. */
  }
  return null;
}

/** Give every local image its real size and lazy loading. */
function withImageSizes(html: string) {
  return html.replace(/<img src="([^"]+)"/g, (tag, src: string) => {
    const size = imageSize(src);
    if (!size) return tag;
    return `<img loading="lazy" decoding="async" width="${size.width}" height="${size.height}" src="${src}"`;
  });
}

/**
 * Wrap every table in a keyboard-focusable scroll box, and turn a bold
 * "Table N: ..." line right above it into its caption.
 */
function withTableWrappers(html: string) {
  return html.replace(
    /(<p><strong>(Table \d+[^<]*)<\/strong><\/p>\s*)?<table>([\s\S]*?)<\/table>/g,
    (_, _para: string | undefined, caption: string | undefined, rest: string) => {
      const label = caption ?? "Table";
      const table = `<div class="table-wrap" role="region" aria-label="${label}" tabindex="0"><table>${rest}</table></div>`;
      return caption
        ? `<figure class="table-figure"><figcaption>${caption}</figcaption>${table}</figure>`
        : table;
    },
  );
}

function read(fileName: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  const rawHtml = marked.parse(content, { async: false }) as string;
  const html = DOMPurify.sanitize(rawHtml);
  const htmlWithHeadingIds = withTableWrappers(
    withImageSizes(
      html.replace(
        /<h2>(.*?)<\/h2>/g,
        (_, text: string) => `<h2 id="${headingId(text)}">${text}</h2>`,
      ),
    ),
  );
  const cover = data.cover ? String(data.cover) : undefined;

  const isoDate =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date ?? "");

  return {
    slug: fileName.replace(/\.md$/, ""),
    title: String(data.title ?? "Untitled"),
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? "Physics"),
    readTime: String(data.readTime ?? ""),
    date: isoDate,
    dateLabel: isoDate ? toLabel(isoDate) : "",
    cover,
    ogImage: data.ogImage ? String(data.ogImage) : undefined,
    coverSize: cover ? (imageSize(cover) ?? undefined) : undefined,
    coverAlt: data.coverAlt ? String(data.coverAlt) : undefined,
    quote: data.quote ? String(data.quote) : undefined,
    summary: Array.isArray(data.summary)
      ? data.summary.map(String)
      : data.summary
        ? [String(data.summary)]
        : undefined,
    topics: Array.isArray(data.topics) ? data.topics.map(String) : undefined,
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
