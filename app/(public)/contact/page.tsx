import { Metadata } from "next";
import { getSEO } from "@/lib/get-seo";
import { PageHero } from "@/components/Blufacade/pages/PageHero";
import { ContactContent } from "@/components/Blufacade/pages/ContactContent";
import connectDB from "@/config/models/connectDB";
import Banner from "@/config/utils/admin/banner/bannerSchema";
import Contact from "@/config/utils/admin/contact/ContactSchema";
import { DEFAULT_OG_IMAGE, absoluteTitle } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const FALLBACK_DESCRIPTION =
  "Get in touch with Rayzor Industrial Packaging in Madurai, Tamil Nadu for packaging consultations, bulk enquiries and custom VCI or LDPE film solutions.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("contact");
  // Plain string for OG/Twitter, which have no title template to apply.
  const plainTitle = seo?.title || "Contact Us";
  const description = seo?.description || FALLBACK_DESCRIPTION;
  const ogImage = seo?.ogImage || DEFAULT_OG_IMAGE.url;

  return {
    // DB titles already include the brand; the hardcoded fallback does not, so
    // only the DB branch bypasses the root layout's title template.
    title: seo?.title ? absoluteTitle(seo.title) : "Contact Us",
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: "/contact" },
    openGraph: {
      title: plainTitle,
      description,
      url: "/contact",
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

async function getContactPageData() {
  try {
    await connectDB();
    const [banner, contact] = await Promise.all([
      Banner.findOne({ pageKey: "contact" }).lean(),
      Contact.findOne({}).lean(),
    ]);

    const heroBanner = banner
      ? {
          label: (banner as any).label || "Get In Touch",
          headingLine1: (banner as any).headingLine1 || "CONTACT",
          headingLine2: (banner as any).headingLine2 || "US",
          description:
            (banner as any).description ||
            "Reach out to our team for packaging consultations, bulk enquiries, or custom solutions.",
          image: (banner as any).image || "/images/rayzor/contact-hero.png",
        }
      : null;

    const contactInfo = contact
      ? {
          phone: (contact as any).primaryPhone || "",
          email: (contact as any).email || "",
          address: (contact as any).address || "",
          city: (contact as any).city || "",
          state: (contact as any).state || "",
          postcode: (contact as any).postcode || "",
          country: (contact as any).country || "",
        }
      : null;

    return { heroBanner, contactInfo };
  } catch (error) {
    console.error("Failed to fetch contact page data:", error);
    return { heroBanner: null, contactInfo: null };
  }
}

export default async function ContactPage() {
  const [{ heroBanner, contactInfo }, seo] = await Promise.all([
    getContactPageData(),
    getSEO("contact"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: seo?.title || "Contact Us",
    description: seo?.description || heroBanner?.description || "",
    url: "https://www.rayzorpack.com/contact",
    mainEntity: {
      "@type": "LocalBusiness",
      name: "Rayzor Industrial Packaging Pvt Ltd",
      url: "https://www.rayzorpack.com",
      ...(contactInfo && {
        telephone: contactInfo.phone,
        email: contactInfo.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: contactInfo.address,
          addressLocality: contactInfo.city,
          addressRegion: contactInfo.state,
          postalCode: contactInfo.postcode,
          addressCountry: contactInfo.country || "IN",
        },
      }),
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
            imageAlt="Rayzor Industrial Packaging Pvt Ltd Contact"
          />
        )}
        <ContactContent />
      </main>
    </>
  );
}
