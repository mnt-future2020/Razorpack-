import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/Blufacade/pages/PageHero";
import { ProductDetailClient } from "@/components/Blufacade/pages/ProductDetailClient";
import connectDB from "@/config/models/connectDB";
import Product from "@/config/utils/admin/products/productSchema";
import { Metadata } from "next";
import { cache } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cached fetcher to deduplicate between generateMetadata and page render
const getProductBySlug = cache(async (slug: string) => {
  try {
    await connectDB();
    const product = await Product.findOne({ slug, isDeleted: false }).lean();
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

  return {
    title: productData.seoTitle || productData.productName,
    description:
      productData.seoDescription ||
      productData.shortDescription ||
      productData.description?.replace(/<[^>]+>/g, "").substring(0, 160),
    keywords:
      productData.seoKeywords ||
      `${productData.productName}, ${productData.category || "industrial packaging"}, VCI protection, LDPE packaging`,
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

  return (
    <main className="min-h-screen">
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
