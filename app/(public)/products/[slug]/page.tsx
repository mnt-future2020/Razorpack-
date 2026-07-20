import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/Blufacade/pages/PageHero";
import { ProductDetailClient } from "@/components/Blufacade/pages/ProductDetailClient";
import connectDB from "@/config/models/connectDB";
import Product from "@/config/utils/admin/products/productSchema";
import { Metadata } from "next";
import { cache } from "react";
import { SITE_URL, absoluteTitle, getSiteSettings } from "@/lib/site-config";
import { absoluteUrl, breadcrumbList, plainText } from "@/lib/jsonld";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cached fetcher to deduplicate between generateMetadata and page render
const getProductBySlug = cache(async (slug: string) => {
  try {
    await connectDB();
    // `status: "active"` mirrors sitemap.ts / the products listing query, so an
    // inactive (draft) item is not publicly reachable or crawlable.
    const product = await Product.findOne({
      slug,
      status: "active",
      isDeleted: false,
    }).lean();
    if (product) return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Failed to fetch product from DB:", error);
  }

  return null;
});

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const productData = await getProductBySlug(resolvedParams.slug);

  if (!productData) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  // An admin-authored seoTitle is already a complete, brand-inclusive title, so
  // it is marked absolute to stop the root template appending the brand twice.
  // A bare product name still flows through the template.
  const title = productData.seoTitle
    ? absoluteTitle(productData.seoTitle)
    : productData.productName;
  const ogTitle = productData.seoTitle || productData.productName;
  const description = productData.seoDescription || productData.shortDescription || productData.description?.replace(/<[^>]+>/g, "").substring(0, 160);
  const ogImg = productData.ogImage || productData.image || "";
  const canonicalPath = `/products/${resolvedParams.slug}`;

  return {
    title,
    description,
    keywords: productData.seoKeywords || `${productData.productName}, ${productData.category || "industrial packaging"}`,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: ogTitle,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      type: "article",
      ...(ogImg && { images: [{ url: ogImg, width: 1200, height: 630, alt: productData.productName }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(ogImg && { images: [ogImg] }),
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const productData = await getProductBySlug(resolvedParams.slug);

  if (!productData) {
    notFound();
  }

  const words = productData.productName.replace(/&/g, "").split(" ").filter(Boolean);
  const half = Math.ceil(words.length / 2);
  const headingLine1 = words.slice(0, half).join(" ") || "INDUSTRIAL";
  const headingLine2 = words.slice(half).join(" ") || "PRODUCT";

  const settings = await getSiteSettings();
  const productUrl = `${SITE_URL}/products/${resolvedParams.slug}`;
  const productImage = absoluteUrl(productData.image || productData.ogImage);
  const productDescription =
    productData.seoDescription ||
    productData.shortDescription ||
    plainText(productData.description, 500);

  // No price/offer/rating data exists on the product schema, so those keys are
  // deliberately omitted rather than fabricated.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productData.productName,
    ...(productDescription && { description: productDescription }),
    ...(productImage && { image: productImage }),
    ...(productData.category && { category: productData.category }),
    brand: {
      "@type": "Organization",
      name: settings.siteName,
      url: SITE_URL,
    },
    url: productUrl,
  };

  const breadcrumbJsonLd = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: productData.productName, path: `/products/${resolvedParams.slug}` },
  ]);

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageHero
        label={productData.category || "Product Details"}
        headingLine1={headingLine1}
        headingLine2={headingLine2}
        description={productData.shortDescription || productData.description || "Industrial-grade packaging solutions."}
        image={productData.image || "/images/placeholder.svg"}
        imageAlt={productData.productName}
        theme="light"
        imageFit="cover"
      />

      {/* ─── PRODUCT DETAIL SECTION ─── */}
      <ProductDetailClient product={productData} />
    </main>
  );
}
