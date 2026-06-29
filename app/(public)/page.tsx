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
import Settings from "@/config/utils/admin/settings/settingsSchema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("home");
  const title = seo?.title || { absolute: "Rayzor Industrial Packaging Pvt Ltd | Premium Packaging Solutions & LDPE Films" };
  const description = seo?.description || "";

  return {
    title,
    description,
    keywords: seo?.keywords || "",
    alternates: { canonical: "/" },
    openGraph: {
      title: typeof title === "string" ? title : undefined,
      description,
      url: "https://www.rayzorpack.com",
      siteName: "Rayzor Industrial Packaging Pvt Ltd",
      type: "website",
      locale: "en_IN",
      ...(seo?.ogImage && { images: [{ url: seo.ogImage, width: 1200, height: 630, alt: typeof title === "string" ? title : "Rayzor Industrial Packaging" }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: typeof title === "string" ? title : undefined,
      description,
      ...(seo?.ogImage && { images: [seo.ogImage] }),
    },
  };
}

async function getHomeData() {
  try {
    await connectDB();

    const [banner, services, products, settings, contact] = await Promise.all([
      Banner.findOne({ pageKey: "home" }).lean(),
      Service.find({ status: "active", isDeleted: false })
        .sort({ order: 1, createdAt: -1 })
        .limit(4)
        .lean(),
      Product.find({ status: "active", isDeleted: false })
        .sort({ order: 1, createdAt: -1 })
        .limit(10)
        .lean(),
      Settings.findOne({ id: "default" }).lean(),
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
    const s = settings as any;
    const c = contact as any;
    const siteName = s?.siteName || "";
    const siteUrl = s?.siteUrl || "https://www.rayzorpack.com";
    const logoUrl = s?.logo
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
      description: s?.siteTagline || "",
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

    return { heroSlides, services: servicesList, products: productsList, jsonLd };
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    return { heroSlides: [], services: [], products: [], jsonLd: null };
  }
}

export default async function Home() {
  const { heroSlides, services, products, jsonLd } = await getHomeData();

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
