import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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

    // Reject malformed ids up front — otherwise Mongoose throws a CastError
    // that surfaces as a 500 with the internal error text instead of a 404.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Gallery work not found" }, { status: 404 });
    }

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

    // Collect the superseded asset to delete only AFTER the DB update succeeds.
    const urlsToDeleteAfterSave: string[] = [];

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadToCloudinary(buffer, `gallery-works`);
      updateData.image = result.secure_url;

      // Queue old image for deletion after the update succeeds
      if (oldImageUrl && oldImageUrl !== updateData.image) {
        urlsToDeleteAfterSave.push(oldImageUrl);
      }
    } else if (existingImage) {
      updateData.image = existingImage;
    }

    const updated = await GalleryWork.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Gallery work not found" }, { status: 404 });
    }

    // Update succeeded — now it is safe to remove the superseded asset.
    await Promise.all(urlsToDeleteAfterSave.map((url) => deleteByUrl(url)));

    return NextResponse.json({ success: true, data: updated, message: "Gallery work updated" });
  } catch (error: any) {
    console.error("Error updating gallery work:", error);
    return NextResponse.json({ success: false, message: "Failed to update" }, { status: 500 });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Gallery work not found" }, { status: 404 });
    }

    // Soft-delete the record first, then clean up its asset. (A failed asset
    // delete must not leave an undeletable gallery work behind.)
    const deleted = await GalleryWork.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Gallery work not found" }, { status: 404 });
    }

    if (deleted.image) {
      await deleteByUrl(deleted.image);
    }

    return NextResponse.json({ success: true, message: "Gallery work deleted" });
  } catch (error) {
    console.error("Error deleting gallery work:", error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
