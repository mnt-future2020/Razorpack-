import { SITE_URL } from "@/lib/site-config";

/**
 * Resolve a possibly-relative path (image src, page path) into an absolute URL
 * rooted at SITE_URL. Already-absolute URLs and protocol-relative URLs are
 * returned untouched. Returns null for empty input so callers can omit the key
 * entirely rather than emitting an empty string into JSON-LD.
 */
export function absoluteUrl(path?: string | null): string | null {
  if (!path) return null;
  const trimmed = String(path).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `${SITE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

export type Crumb = { name: string; path: string };

/**
 * BreadcrumbList JSON-LD with 1-indexed positions and absolute item URLs.
 */
export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Strip HTML tags and collapse whitespace for use in JSON-LD text fields. */
export function plainText(html?: string | null, maxLength = 5000): string {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, maxLength);
}
