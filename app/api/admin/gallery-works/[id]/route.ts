import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import GalleryWork from "@/config/utils/admin/gallery/galleryWorkSchema";
import { uploadToCloudinary, deleteByUrl } from "@/config/utils/cloudinary";
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

// PUT — update gallery work
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    // Fetch old record to compare images later
    const work = await GalleryWork.findById(id);
    const oldImageUrl = work?.image || "";

    const formData = await request.formData();
    const title = (formData.get("title") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const order = parseInt(formData.get("order") as string || "0");
    const imageFile = formData.get("image") as File | null;
    const existingImage = formData.get("existingImage") as string || "";

    const updateData: any = { title, description, order };

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadToCloudinary(buffer, `gallery-works`);
      updateData.image = result.secure_url;

      // Delete old image from Cloudinary if it changed
      if (oldImageUrl && oldImageUrl !== updateData.image) {
        await deleteByUrl(oldImageUrl);
      }
    } else if (existingImage) {
      updateData.image = existingImage;
    }

    const updated = await GalleryWork.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Gallery work not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: "Gallery work updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to update" }, { status: 500 });
  }
}

// DELETE — soft delete
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    // Get the work first to delete its image from Cloudinary
    const work = await GalleryWork.findById(id);
    if (work?.image) {
      await deleteByUrl(work.image);
    }

    const deleted = await GalleryWork.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Gallery work not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Gallery work deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
