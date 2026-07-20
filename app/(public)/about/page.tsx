import { Metadata } from "next";
import { getSEO } from "@/lib/get-seo";
import { PageHero } from "@/components/Blufacade/pages/PageHero";
import { AboutBusinessAreas } from "@/components/Blufacade/pages/AboutBusinessAreas";
import { AboutMissionVision } from "@/components/Blufacade/pages/AboutMissionVision";
import { AboutProcess } from "@/components/Blufacade/pages/AboutProcess";
import connectDB from "@/config/models/connectDB";
import Banner from "@/config/utils/admin/banner/bannerSchema";
import { DEFAULT_OG_IMAGE, absoluteTitle } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const FALLBACK_DESCRIPTION =
  "Two decades of tailor-made industrial packaging from our Madurai production hub — learn about Rayzor's mission, business areas and end-to-end manufacturing process.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("about");
  // Plain string for OG/Twitter, which have no title template to apply.
  const plainTitle = seo?.title || "About Us";
  const description = seo?.description || FALLBACK_DESCRIPTION;
  const ogImage = seo?.ogImage || DEFAULT_OG_IMAGE.url;

  return {
    // DB titles already include the brand; the hardcoded fallback does not, so
    // only the DB branch bypasses the root layout's title template.
    title: seo?.title ? absoluteTitle(seo.title) : "About Us",
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: "/about" },
    openGraph: {
      title: plainTitle,
      description,
      url: "/about",
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

async function getAboutPageData() {
  try {
    await connectDB();
    const banner = await Banner.findOne({ pageKey: "about" }).lean();

    if (banner) {
      return {
        label: banner.label || "About Us",
        headingLine1: banner.headingLine1 || "ELEVATING",
        headingLine2: banner.headingLine2 || "PACKAGING",
        description:
          banner.description ||
          "For over two decades, we've been the driving force behind tailor-made packaging solutions from our production hub in Madurai, Tamil Nadu.",
        image: banner.image || "/images/about_hero_packaging.png",
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch about page data:", error);
    return null;
  }
}

export default async function AboutPage() {
  const [heroBanner, seo] = await Promise.all([
    getAboutPageData(),
    getSEO("about"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: seo?.title || "About Us",
    description: seo?.description || heroBanner?.description || "",
    url: "https://www.rayzorpack.com/about",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-white">
        {heroBanner && (
          <PageHero
            label={heroBanner.label}
            headingLine1={heroBanner.headingLine1}
            headingLine2={heroBanner.headingLine2}
            description={heroBanner.description}
            image={heroBanner.image}
            imageAlt="Rayzor Industrial Packaging Pvt Ltd — About Us"
          />
        )}
        <AboutMissionVision />
        <AboutBusinessAreas />
        <AboutProcess />
      </main>
    </>
  );
}
