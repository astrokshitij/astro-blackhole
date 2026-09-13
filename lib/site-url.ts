/**
 * Canonical origin for absolute URLs in metadata, the sitemap and robots.txt.
 *
 * When you point a real domain at this site, change the first string below to
 * it, for example "https://astrokshitij.com". Everything else follows.
 */
const CANONICAL = "https://astrokshitij.com";

export const siteUrl =
  CANONICAL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
