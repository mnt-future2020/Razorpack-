import type { MetadataRoute } from "next";
import connectDB from "@/config/models/connectDB";
import Product from "@/config/utils/admin/products/productSchema";
import Service from "@/config/utils/admin/services/serviceSchema";
import { SITE_URL } from "@/lib/site-config";

// Regenerate hourly instead of baking the sitemap in at build time. A build-time
// DB hiccup used to permanently ship a 6-URL sitemap with no way to recover
// short of redeploying.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // A fixed date, not `new Date()`. Stamping "modified now" on every build
  // teaches crawlers to ignore the field entirely.
  const staticLastModified = new Date("2026-07-20");

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: staticLastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: staticLastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/products`, lastModified: staticLastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: staticLastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/gallery`, lastModified: staticLastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: staticLastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, lastModified: staticLastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-conditions`, lastModified: staticLastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    await connectDB();

    const [products, services] = await Promise.all([
      Product.find({ status: "active", isDeleted: false }).select("slug updatedAt").lean(),
      Service.find({
        status: "active",
        $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
      }).select("slug updatedAt").lean(),
    ]);

    dynamicPages = [
      ...(products || []).map((p: any) => ({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: p.updatedAt || staticLastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...(services || []).map((s: any) => ({
        url: `${baseUrl}/services/${s.slug}`,
        lastModified: s.updatedAt || staticLastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap:", error);
  }

  return [...staticPages, ...dynamicPages];
}
