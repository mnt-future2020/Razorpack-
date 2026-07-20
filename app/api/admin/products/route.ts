import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Product from "@/config/utils/admin/products/productSchema";
import { uploadToCloudinary, deleteByUrl } from "@/config/utils/cloudinary";
import jwt from "jsonwebtoken";

interface DecodedToken {
  adminId: string;
  email: string;
  role: string;
}

// Helper function to verify admin token
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false as const,
      error: NextResponse.json(
        { success: false, message: "Authorization header required" },
        { status: 401 }
      ),
    };
  }
  if (!process.env.JWT_SECRET) {
    return {
      ok: false as const,
      error: NextResponse.json(
        { success: false, message: "JWT_SECRET not configured" },
        { status: 500 }
      ),
    };
  }
  try {
    const token = authHeader.substring(7);
    jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      error: NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}

// Helper function to generate slug
function generateSlug(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET - Fetch all products with pagination
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const query: any = { isDeleted: false };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [products, total, lastOrdered] = await Promise.all([
      Product.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      // Highest order across ALL products, not just this page — the Add form
      // prefills from this so the new product lands at the end.
      Product.findOne({ isDeleted: false }).sort({ order: -1 }).select("order").lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      nextOrder: ((lastOrdered as { order?: number } | null)?.order ?? 0) + 1,
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

// POST - Create new product
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();

    const formData = await request.formData();
    const productName = formData.get("productName") as string;
    const category = formData.get("category") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    // 0 / blank means "auto": put the product at the end of the list. Computed
    // server-side because the admin list is paginated, so the client only ever
    // sees one page worth of orders.
    let order = Number.parseInt(formData.get("order") as string) || 0;
    if (order === 0) {
      const last = await Product.findOne({ isDeleted: false })
        .sort({ order: -1 })
        .select("order")
        .lean();
      order = ((last as { order?: number } | null)?.order ?? 0) + 1;
    }
    // FormData stringifies a missing value to the literal "undefined", which
    // slips past a plain `|| "[]"` fallback and then blows up in JSON.parse.
    const parseArray = (key: string) => {
      const raw = formData.get(key) as string | null;
      if (!raw || raw === "undefined" || raw === "null") return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const features = parseArray("features");
    const technicalSpecs = parseArray("technicalSpecs");
    const applications = parseArray("applications");
    const tags = parseArray("tags");
    const deliveryInfo = parseArray("deliveryInfo");
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const seoKeywords = formData.get("seoKeywords") as string;
    const ogImage = formData.get("ogImage") as string;
    const ogImageFile = formData.get("ogImageFile") as File | null;
    const imageFile = formData.get("image") as File | null;
    const galleryFiles = formData.getAll("galleryImages") as File[];

    // Validate required fields
    if (!productName || !description) {
      return NextResponse.json(
        { success: false, message: "Product name and description are required" },
        { status: 400 }
      );
    }

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: "Product image is required" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateSlug(productName);

    // Check if order already exists
    const existingOrder = await Product.findOne({ order, isDeleted: false });
    if (existingOrder) {
      return NextResponse.json(
        { success: false, message: `A product with order ${order} already exists` },
        { status: 400 }
      );
    }

    // Check if slug already exists. Not filtered by isDeleted: the unique index
    // on `slug` spans soft-deleted docs too, so an unfiltered check here is what
    // matches the constraint the DB will actually enforce on save().
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: "A product with this name already exists" },
        { status: 400 }
      );
    }

    // Track everything uploaded so we can clean up if the save fails.
    const uploadedUrls: string[] = [];

    // Upload image
    const imageBytes = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(imageBytes);
    const imageResult = await uploadToCloudinary(
      imageBuffer,
      `products/${slug}/main`
    );
    uploadedUrls.push(imageResult.secure_url);

    // Upload gallery images
    const galleryUrls: string[] = [];
    if (galleryFiles && galleryFiles.length > 0) {
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const result = await uploadToCloudinary(
            buffer,
            `products/${slug}/gallery`
          );
          galleryUrls.push(result.secure_url);
          uploadedUrls.push(result.secure_url);
        }
      }
    }

    // Upload OG image if provided
    let ogImageUrl = ogImage || "";
    if (ogImageFile && ogImageFile.size > 0) {
      const ogBytes = await ogImageFile.arrayBuffer();
      const ogBuffer = Buffer.from(ogBytes);
      const ogResult = await uploadToCloudinary(ogBuffer, `products/${slug}/og`);
      ogImageUrl = (ogResult as any).secure_url;
      uploadedUrls.push(ogImageUrl);
    }

    // Create product
    const product = new Product({
      productName,
      category,
      shortDescription,
      description,
      image: imageResult.secure_url,
      gallery: galleryUrls,
      features,
      technicalSpecs,
      applications,
      tags,
      deliveryInfo,
      slug,
      status,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage: ogImageUrl,
    });

    try {
      await product.save();
    } catch (saveError) {
      // Save failed — remove the now-orphaned uploads before bubbling up.
      await Promise.all(uploadedUrls.map((url) => deleteByUrl(url)));
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}
