import { NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import GalleryWork from "@/config/utils/admin/gallery/galleryWorkSchema";

export async function GET() {
  try {
    await connectDB();
    const works = await GalleryWork.find({ isDeleted: false, status: "active" })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: works });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch gallery works" }, { status: 500 });
  }
}
