import { cache } from "react";
import connectDB from "@/config/models/connectDB";
import Settings from "@/config/utils/admin/settings/settingsSchema";

/**
 * Canonical site origin. Env-driven so staging/preview deploys stop emitting
 * production canonicals and sitemap URLs.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.APP_URL ||
  "https://www.rayzorpack.com"
).replace(/\/$/, "");

export const DEFAULT_OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Rayzor Industrial Packaging Pvt Ltd",
};

export type SiteSettings = {
  siteName: string;
  siteTagline: string;
  siteUrl: string;
  logo: string | null;
  favicon: string | null;
  googleAnalyticsId: string | null;
};

const FALLBACK: SiteSettings = {
  siteName: "Rayzor Industrial Packaging Pvt Ltd",
  siteTagline: "Premium Packaging Solutions & LDPE Films",
  siteUrl: SITE_URL,
  logo: null,
  favicon: null,
  googleAnalyticsId: null,
};

/**
 * Server-side reader for the admin Settings record. `cache()` dedupes the query
 * across generateMetadata + render within a single request.
 *
 * Queries by `isActive` to match what the admin API and admin UI write, rather
 * than by `id: "default"` — those two lookups had drifted apart.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    await connectDB();
    const s = (await Settings.findOne({ isActive: true }).lean()) as any;
    if (!s) return FALLBACK;
    return {
      siteName: s.siteName || FALLBACK.siteName,
      siteTagline: s.siteTagline || FALLBACK.siteTagline,
      siteUrl: (s.siteUrl || SITE_URL).replace(/\/$/, ""),
      logo: s.logo || null,
      favicon: s.favicon || null,
      googleAnalyticsId: s.googleAnalyticsId || null,
    };
  } catch (error) {
    console.error("Failed to load site settings:", error);
    return FALLBACK;
  }
});

/**
 * Titles coming out of the SEO Manager are already full, brand-inclusive
 * strings. Returning them as a plain string lets the root layout's
 * "%s | Rayzor Industrial Packaging Pvt Ltd" template append the brand a
 * second time. Wrapping in `absolute` uses the admin's title verbatim.
 */
export function absoluteTitle(title: string) {
  return { absolute: title };
}
