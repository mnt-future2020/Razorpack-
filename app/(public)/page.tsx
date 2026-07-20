import { Metadata } from "next";
import { HeroSection } from "@/components/Blufacade/HeroSection";
import { ProductsCarousel } from "@/components/Blufacade/ProductsCarousel";
import { ServicesSection } from "@/components/Blufacade/ServicesSection";
import { UniqueSection } from "@/components/Blufacade/UniqueSection";
import { MissionSection } from "@/components/Blufacade/MissionSection";
import { getSEO } from "@/lib/get-seo";
import connectDB from "@/config/models/connectDB";
import Banner from "@/config/utils/admin/banner/bannerSchema";
import Service from "@/config/utils/admin/services/serviceSchema";
import Product from "@/config/utils/admin/products/productSchema";
import Contact from "@/config/utils/admin/contact/ContactSchema";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  absoluteTitle,
  getSiteSettings,
} from "@/lib/site-config";

export const dynamic = "force-dynamic";

const HOME_FALLBACK_TITLE =
  "Rayzor Industrial Packaging Pvt Ltd | Premium Packaging Solutions & LDPE Films";
const HOME_FALLBACK_DESCRIPTION =
  "Rayzor Industrial Packaging manufactures VCI and LDPE films, pouches, bags and shrink wraps, with contract packaging and export palletisation from Madurai, India.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("home");
  // Plain string used for OG/Twitter, which have no title template to apply.
  const plainTitle = seo?.title || HOME_FALLBACK_TITLE;
  const description = seo?.description || HOME_FALLBACK_DESCRIPTION;
  const ogImage = seo?.ogImage || DEFAULT_OG_IMAGE.url;

  return {
    // DB titles are already brand-inclusive; `absolute` stops the root layout
    // template from appending the brand a second time.
    title: absoluteTitle(plainTitle),
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: "/" },
    openGraph: {
      title: plainTitle,
      description,
      url: SITE_URL,
      siteName: "Rayzor Industrial Packaging Pvt Ltd",
      type: "website",
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: plainTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: plainTitle,
      description,
      images: [ogImage],
    },
  };
}

async function getHomeData() {
  try {
    await connectDB();

    const [banner, services, products, siteSettings, contact] = await Promise.all([
      Banner.findOne({ pageKey: "home" }).lean(),
      Service.find({ status: "active", isDeleted: false })
        .sort({ order: 1, createdAt: -1 })
        .limit(4)
        .lean(),
      Product.find({ status: "active", isDeleted: false })
        .sort({ order: 1, createdAt: -1 })
        .limit(10)
        .lean(),
      // `getSiteSettings()` queries by `isActive: true`, matching what the
      // admin API writes — the old `{ id: "default" }` filter never matched.
      getSiteSettings(),
      Contact.findOne({}).lean(),
    ]);

    // Process hero slides — images[] from carousel upload takes priority over slide.imageUrl
    const raw = banner?.slides || [];
    const images = banner?.images || [];
    const heroSlides = raw.map((s: any, i: number) => ({
      imageUrl: images[i] || s.imageUrl || "",
      title: s.title || "",
      highlight: (s.highlight || "").replace(/\\n/g, "\n"),
      tagline: (s.tagline || "").replace(/\\n/g, "\n"),
      description: s.description || "",
      primaryCtaLabel: s.primaryCtaLabel || "",
      primaryCtaHref: s.primaryCtaHref || "",
    }));

    // Process services
    const servicesList = services.map((s: any) => ({
      serviceName: s.serviceName,
      category: s.category || "",
      description: s.description || "",
      image: s.image || "",
    }));

    // Process products
    const productsList = products.map((p: any) => ({
      productName: p.productName,
      image: p.image || "",
      slug: p.slug || "",
      shortDescription: p.shortDescription || "",
    }));

    // Build JSON-LD data
    const s = siteSettings;
    const c = contact as any;
    const siteName = s.siteName;
    const siteUrl = s.siteUrl || SITE_URL;
    const logoUrl = s.logo
      ? (s.logo.startsWith("http") ? s.logo : `${siteUrl}${s.logo}`)
      : "";
    const socialLinks = c
      ? [c.facebook, c.twitter, c.linkedin, c.instagram, c.youtube].filter(Boolean)
      : [];

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      ...(logoUrl && { logo: logoUrl }),
      description: s.siteTagline || "",
      ...(c && {
        address: {
          "@type": "PostalAddress",
          streetAddress: c.address || "",
          addressLocality: c.city || "",
          addressRegion: c.state || "",
          postalCode: c.postcode || "",
          addressCountry: c.country || "IN",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: c.primaryPhone || "",
          email: c.email || "",
        },
      }),
      ...(socialLinks.length > 0 && { sameAs: socialLinks }),
    };

    const websiteJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      ...(s.siteTagline && { description: s.siteTagline }),
    };

    return {
      heroSlides,
      services: servicesList,
      products: productsList,
      jsonLd,
      websiteJsonLd,
    };
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    return { heroSlides: [], services: [], products: [], jsonLd: null, websiteJsonLd: null };
  }
}

export default async function Home() {
  const { heroSlides, services, products, jsonLd, websiteJsonLd } = await getHomeData();

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {websiteJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      )}
      <main className="relative w-full overflow-x-hidden">
        <HeroSection initialSlides={heroSlides} />
        <UniqueSection />
        <ServicesSection initialServices={services} />
        <ProductsCarousel initialProducts={products} />
        <MissionSection />
      </main>
    </>
  );
}
