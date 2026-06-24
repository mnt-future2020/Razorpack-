import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Product from "@/config/utils/admin/products/productSchema";

// Public GET — fetch active products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query = { status: "active", isDeleted: false };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
