import { Metadata } from "next";
import { getSEO } from "@/lib/get-seo";
import { GalleryHero } from "@/components/Blufacade/pages/GalleryHero";
import { OurWorksSection } from "@/components/Blufacade/pages/OurWorksSection";
import connectDB from "@/config/models/connectDB";
import Banner from "@/config/utils/admin/banner/bannerSchema";
import GalleryWork from "@/config/utils/admin/gallery/galleryWorkSchema";
import { DEFAULT_OG_IMAGE, absoluteTitle } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const FALLBACK_DESCRIPTION =
  "A visual look at Rayzor Industrial Packaging's completed work — VCI and LDPE film production, custom packaging projects and export-ready palletised consignments.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("gallery");
  // Plain string for OG/Twitter, which have no title template to apply.
  const plainTitle = seo?.title || "Gallery";
  const description = seo?.description || FALLBACK_DESCRIPTION;
  const ogImage = seo?.ogImage || DEFAULT_OG_IMAGE.url;

  return {
    // DB titles already include the brand; the hardcoded fallback does not, so
    // only the DB branch bypasses the root layout's title template.
    title: seo?.title ? absoluteTitle(seo.title) : "Gallery",
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: "/gallery" },
    openGraph: {
      title: plainTitle,
      description,
      url: "/gallery",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: plainTitle,
      description,
      images: [ogImage],
    },
  };
}

async function getGalleryPageData() {
  try {
    await connectDB();

    const [banner, works] = await Promise.all([
      Banner.findOne({ pageKey: "gallery" }).lean(),
      GalleryWork.find({ status: "active", isDeleted: false })
        .sort({ order: 1, createdAt: -1 })
        .lean(),
    ]);

    const bannerData = banner ? JSON.parse(JSON.stringify(banner)) : null;
    const worksList = JSON.parse(JSON.stringify(works || []));

    return { banner: bannerData, works: worksList };
  } catch (error) {
    console.error("Failed to fetch gallery page data:", error);
    return { banner: null, works: [] };
  }
}

export default async function GalleryPage() {
  const [{ banner, works }, seo] = await Promise.all([
    getGalleryPageData(),
    getSEO("gallery"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo?.title || "Gallery",
    description: seo?.description || "",
    url: "https://www.rayzorpack.com/gallery",
    mainEntity: {
      "@type": "ImageGallery",
      numberOfItems: works.length,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen">
        <GalleryHero initialBanner={banner} />
        <OurWorksSection initialWorks={works} />
      </main>
    </>
  );
}
