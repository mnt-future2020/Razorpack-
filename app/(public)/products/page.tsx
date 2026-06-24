import { Metadata } from "next"
import { ProductsHero } from "@/components/Blufacade/pages/ProductsHero"
import { ProductsGrid } from "@/components/Blufacade/pages/ProductsGrid"
import connectDB from "@/config/models/connectDB"
import Product from "@/config/utils/admin/products/productSchema"
import { FALLBACK_PRODUCTS } from "@/lib/fallback-products"

export const metadata: Metadata = {
  title: "Products | Rayzor Industrial Packaging Pvt Ltd - Industrial Strength",
  description: "Explore our range of industrial packaging solutions.",
}

async function getProducts() {
  try {
    await connectDB();
    const products = await Product.find({ status: "active", isDeleted: false })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    // Map the MongoDB products to the expected format
    return products.map((p: any, index: number) => ({
      num: String(index + 1).padStart(2, "0"),
      name: p.productName,
      category: p.category || "Packaging",
      slug: p.slug,
      image: p.image,
    }));
  } catch (error) {
    console.error("Failed to fetch products from DB:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const dbProducts = await getProducts();
  const products = dbProducts.length > 0 ? dbProducts : FALLBACK_PRODUCTS;

  return (
    <main className="min-h-screen bg-white selection:bg-[#38bdf8] selection:text-white"><ProductsHero />
      <ProductsGrid initialProducts={products} /></main>
  )
}
