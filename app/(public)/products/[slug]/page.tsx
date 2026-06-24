import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/Blufacade/pages/PageHero";
import { ProductDetailClient } from "@/components/Blufacade/pages/ProductDetailClient";
import connectDB from "@/config/models/connectDB";
import Product from "@/config/utils/admin/products/productSchema";
import { FALLBACK_PRODUCTS } from "@/lib/fallback-products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Fetch single product by slug — DB first, then fallback
async function getProductBySlug(slug: string) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug, isDeleted: false }).lean();
    if (product) return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Failed to fetch product from DB:", error);
  }

  const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  if (fallback) {
    const fb = fallback as any;
    return {
      productName: fallback.name,
      category: fallback.category,
      description: fallback.description,
      shortDescription: fb.shortDescription || fallback.description,
      image: fallback.image,
      slug: fallback.slug,
      features: fb.features || [],
      technicalSpecs: fb.technicalSpecs || [],
      applications: fb.applications || [],
      gallery: fb.gallery || [],
    };
  }

  return null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
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
