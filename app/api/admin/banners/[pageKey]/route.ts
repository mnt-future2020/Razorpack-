import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Banner from "@/config/utils/admin/banner/bannerSchema";
import { uploadToCloudinary, deleteByUrl } from "@/config/utils/cloudinary";
import jwt from "jsonwebtoken";

interface DecodedToken {
  adminId: string;
  email: string;
  role: string;
}

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

// GET admin view
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    await connectDB();
    const { pageKey } = await params;
    const banner = await Banner.findOne({
      pageKey: pageKey.toLowerCase(),
      isDeleted: false,
    }).lean();

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

// PUT update (multipart supported)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;
  try {
    await connectDB();
    const { pageKey } = await params;
    const formData = await request.formData();
    const status = (formData.get("status") as string) || undefined;
    const imageFile = formData.get("image") as File | null;

    // Fetch old banner to compare images
    const oldBanner = await Banner.findOne({ pageKey: pageKey.toLowerCase() }).lean();

    const update: any = {};
    if (status) update.status = status;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadToCloudinary(
        buffer,
        `banners/${pageKey}/main`
      );
      update.image = result.secure_url;

      // Delete old image from Cloudinary if it changed
      const oldImageUrl = (oldBanner as any)?.image;
      if (oldImageUrl && oldImageUrl !== update.image) {
        await deleteByUrl(oldImageUrl);
      }
    }

    const saved = await Banner.findOneAndUpdate(
      { pageKey: pageKey.toLowerCase() },
      { $set: update },
      { new: true }
    );
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update banner" },
      { status: 500 }
    );
  }
}

// DELETE soft-delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;
  try {
    await connectDB();
    const { pageKey } = await params;

    // Fetch banner to delete its images from Cloudinary
    const banner = await Banner.findOne({ pageKey: pageKey.toLowerCase() }).lean() as any;
    if (banner) {
      if (banner.image) await deleteByUrl(banner.image);
      if (banner.mobileImage) await deleteByUrl(banner.mobileImage);
      if (Array.isArray(banner.images)) {
        for (const url of banner.images) {
          if (url) await deleteByUrl(url);
        }
      }
    }

    await Banner.findOneAndUpdate(
      { pageKey: pageKey.toLowerCase() },
      { $set: { isDeleted: true, status: "inactive" } }
    );
    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
