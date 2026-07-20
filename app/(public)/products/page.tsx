import { Metadata } from "next";
import { getSEO } from "@/lib/get-seo";
import { PageHero } from "@/components/Blufacade/pages/PageHero";
import { ProductsGrid } from "@/components/Blufacade/pages/ProductsGrid";
import connectDB from "@/config/models/connectDB";
import Banner from "@/config/utils/admin/banner/bannerSchema";
import Product from "@/config/utils/admin/products/productSchema";
import { DEFAULT_OG_IMAGE, absoluteTitle } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const FALLBACK_DESCRIPTION =
  "Browse precision-engineered VCI and LDPE films, pouches, bags and shrink wraps built for industrial-grade corrosion prevention and product protection.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("products");
  // Plain string for OG/Twitter, which have no title template to apply.
  const plainTitle = seo?.title || "Products";
  const description = seo?.description || FALLBACK_DESCRIPTION;
  const ogImage = seo?.ogImage || DEFAULT_OG_IMAGE.url;

  return {
    // DB titles already include the brand; the hardcoded fallback does not, so
    // only the DB branch bypasses the root layout's title template.
    title: seo?.title ? absoluteTitle(seo.title) : "Products",
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: "/products" },
    openGraph: {
      title: plainTitle,
      description,
      url: "/products",
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

async function getProductsPageData() {
  try {
    await connectDB();

    const [banner, products] = await Promise.all([
      Banner.findOne({ pageKey: "products" }).lean(),
      Product.find({ status: "active", isDeleted: false })
        .sort({ order: 1, createdAt: -1 })
        .lean(),
    ]);

    const heroBanner = banner
      ? {
          label: banner.label || "Our Products",
          headingLine1: banner.headingLine1 || "PACKAGING",
          headingLine2: banner.headingLine2 || "PROTECTION",
          description:
            banner.description ||
            "Precision-engineered VCI & LDPE films, pouches, bags, and shrink wraps — delivering industrial-grade corrosion prevention and product protection.",
          image: banner.image || "/images/products_hero_packaging_premium.png",
        }
      : null;

    const productsList = (products || []).map((p: any, index: number) => ({
      num: String(index + 1).padStart(2, "0"),
      name: p.productName,
      category: p.category || "Packaging",
      slug: p.slug,
      image: p.image,
    }));

    return { heroBanner, products: productsList };
  } catch (error) {
    console.error("Failed to fetch products page data:", error);
    return { heroBanner: null, products: [] };
  }
}

export default async function ProductsPage() {
  const [{ heroBanner, products }, seo] = await Promise.all([
    getProductsPageData(),
    getSEO("products"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo?.title || "Products",
    description: seo?.description || heroBanner?.description || "",
    url: "https://www.rayzorpack.com/products",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.rayzorpack.com/products/${p.slug}`,
        name: p.name,
      })),
    },
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
            imageAlt="Rayzor Industrial Packaging Pvt Ltd Products"
          />
        )}
        <ProductsGrid initialProducts={products} />
      </main>
    </>
  );
}
