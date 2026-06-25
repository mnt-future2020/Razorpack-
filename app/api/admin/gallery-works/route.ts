import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import GalleryWork from "@/config/utils/admin/gallery/galleryWorkSchema";
import { uploadToCloudinary } from "@/config/utils/cloudinary";
import jwt from "jsonwebtoken";

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ") || !process.env.JWT_SECRET) return false;
  try {
    jwt.verify(authHeader.substring(7), process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// GET — list all gallery works
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const query = { isDeleted: false, status: "active" };
    const [items, total] = await Promise.all([
      GalleryWork.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      GalleryWork.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch gallery works" }, { status: 500 });
  }
}

// POST — create new gallery work
export async function POST(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const title = (formData.get("title") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const order = parseInt(formData.get("order") as string || "0");
    const imageFile = formData.get("image") as File | null;
    const existingImage = formData.get("existingImage") as string || "";

    if (!title || !description) {
      return NextResponse.json({ success: false, message: "Title and description are required" }, { status: 400 });
    }

    let imageUrl = existingImage;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadToCloudinary(buffer, `gallery-works`);
      imageUrl = result.secure_url;
    }

    if (!imageUrl) {
      return NextResponse.json({ success: false, message: "Image is required" }, { status: 400 });
    }

    const work = await GalleryWork.create({ title, description, image: imageUrl, order });

    return NextResponse.json({ success: true, data: work, message: "Gallery work created" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to create gallery work" }, { status: 500 });
  }
}
