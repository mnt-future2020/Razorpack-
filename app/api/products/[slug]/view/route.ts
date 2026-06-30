import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Product from "@/config/utils/admin/products/productSchema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const product = await Product.findOne({ slug, isDeleted: false });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    await product.incrementViews();

    return NextResponse.json({ success: true, views: product.views });
  } catch (error) {
    console.error("Error incrementing product views:", error);
    return NextResponse.json(
      { success: false, message: "Failed to track view" },
      { status: 500 }
    );
  }
}
