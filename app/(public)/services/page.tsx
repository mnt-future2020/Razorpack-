import { Metadata } from "next";
import { getSEO } from "@/lib/get-seo";
import { PageHero } from "@/components/Blufacade/pages/PageHero";
import { ServicesGrid } from "@/components/Blufacade/pages/ServicesGrid";
import connectDB from "@/config/models/connectDB";
import Banner from "@/config/utils/admin/banner/bannerSchema";
import Service from "@/config/utils/admin/services/serviceSchema";
import { DEFAULT_OG_IMAGE, absoluteTitle } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const FALLBACK_DESCRIPTION =
  "From contract packaging and export palletisation to vacuum sealing and VCI protection — explore Rayzor's end-to-end industrial packaging services.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("services");
  // Plain string for OG/Twitter, which have no title template to apply.
  const plainTitle = seo?.title || "Our Services";
  const description = seo?.description || FALLBACK_DESCRIPTION;
  const ogImage = seo?.ogImage || DEFAULT_OG_IMAGE.url;

  return {
    // DB titles already include the brand; the hardcoded fallback does not, so
    // only the DB branch bypasses the root layout's title template.
    title: seo?.title ? absoluteTitle(seo.title) : "Our Services",
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: "/services" },
    openGraph: {
      title: plainTitle,
      description,
      url: "/services",
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

async function getServicesPageData() {
  try {
    await connectDB();

    const [banner, services] = await Promise.all([
      Banner.findOne({ pageKey: "services" }).lean(),
      Service.find({ status: "active", isDeleted: false })
        .sort({ order: 1, createdAt: -1 })
        .lean(),
    ]);

    const heroBanner = banner
      ? {
          label: banner.label || "Our Services",
          headingLine1: banner.headingLine1 || "SOLUTIONS",
          headingLine2: banner.headingLine2 || "SECTORS",
          description:
            banner.description ||
            "From contract packaging and export palletization to vacuum sealing and VCI protection — we deliver end-to-end industrial packaging services.",
          image: banner.image || "/images/rayzor/services/services_hero_premium.png",
        }
      : null;

    const servicesList = JSON.parse(JSON.stringify(services || []));

    return { heroBanner, services: servicesList };
  } catch (error) {
    console.error("Failed to fetch services page data:", error);
    return { heroBanner: null, services: [] };
  }
}

export default async function ServicesPage() {
  const [{ heroBanner, services }, seo] = await Promise.all([
    getServicesPageData(),
    getSEO("services"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo?.title || "Our Services",
    description: seo?.description || heroBanner?.description || "",
    url: "https://www.rayzorpack.com/services",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: services.length,
      itemListElement: services.map((s: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.rayzorpack.com/services/${s.slug}`,
        name: s.serviceName,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen">
        {heroBanner && (
          <PageHero
            label={heroBanner.label}
            headingLine1={heroBanner.headingLine1}
            headingLine2={heroBanner.headingLine2}
            description={heroBanner.description}
            image={heroBanner.image}
            imageAlt="Rayzor Industrial Packaging Pvt Ltd Services"
          />
        )}
        <ServicesGrid initialServices={services} />
      </main>
    </>
  );
}
