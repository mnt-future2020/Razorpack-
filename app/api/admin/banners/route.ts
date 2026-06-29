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

// GET - list banners with pagination and optional filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const pageKey = searchParams.get("pageKey");

    const query: any = { isDeleted: false };
    if (status) query.status = status;
    if (pageKey) query.pageKey = new RegExp(`^${pageKey}`, "i");

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Banner.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Banner.countDocuments(query),
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
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST - upsert banner for a pageKey (Admin only). Accepts multipart/form-data
export async function POST(request: NextRequest) {
  try {
    // Require Bearer token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization header required" },
        { status: 401 }
      );
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }
    const token = authHeader.substring(7);
    jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    await connectDB();

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, message: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const pageKey = ((formData.get("pageKey") as string) || "")
      .trim()
      .toLowerCase();
    const title = ((formData.get("title") as string) || "").trim();
    const status = (formData.get("status") as string) || "active";

    // Page hero text fields
    const label = ((formData.get("label") as string) || "").trim();
    const headingLine1 = ((formData.get("headingLine1") as string) || "").trim();
    const headingLine2 = ((formData.get("headingLine2") as string) || "").trim();
    const description = ((formData.get("description") as string) || "").trim();
    const heroSource = ((formData.get("heroSource") as string) || "").trim();

    if (!pageKey) {
      return NextResponse.json(
        { success: false, message: "pageKey is required" },
        { status: 400 }
      );
    }

    // Optional: allow no new image if keeping existingImage
    const existingImage = (formData.get("existingImage") as string) || "";
    const existingImages = formData.get("existingImages") as string;
    const imageFile = formData.get("image") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;

    // For home page - support multiple images
    const image1File = formData.get("image1") as File | null;
    const image2File = formData.get("image2") as File | null;
    const image3File = formData.get("image3") as File | null;

    let finalImageUrl = existingImage;
    let finalMobileImageUrl = "";
    let finalImages: string[] = existingImages ? JSON.parse(existingImages) : [];

    // Upload main image if provided
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const folderPath = `banners/${pageKey}/main`;
      const result = await uploadToCloudinary(buffer, folderPath);
      finalImageUrl = result.secure_url;
    }

    // Upload mobile image if provided
    if (mobileImageFile && mobileImageFile.size > 0) {
      const bytes = await mobileImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const folderPath = `banners/${pageKey}/mobile`;
      const result = await uploadToCloudinary(buffer, folderPath);
      finalMobileImageUrl = result.secure_url;
    }

    // Upload multiple images for home page
    if (pageKey === "home") {
      // Start with existing images (ensure we have 3 slots)
      const mergedImages: string[] = [...finalImages];
      while (mergedImages.length < 3) {
        mergedImages.push("");
      }
      
      // Upload and replace individual images
      if (image1File && image1File.size > 0) {
        const bytes = await image1File.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await uploadToCloudinary(buffer, `banners/home/carousel-1`);
        mergedImages[0] = result.secure_url;
      }
      
      if (image2File && image2File.size > 0) {
        const bytes = await image2File.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await uploadToCloudinary(buffer, `banners/home/carousel-2`);
        mergedImages[1] = result.secure_url;
      }
      
      if (image3File && image3File.size > 0) {
        const bytes = await image3File.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await uploadToCloudinary(buffer, `banners/home/carousel-3`);
        mergedImages[2] = result.secure_url;
      }

      // Filter out empty strings and update finalImages
      finalImages = mergedImages.filter(img => img !== "");
    }

    // Upload gallery images (for gallery page or any page with multiple images)
    const galleryImageFiles = formData.getAll("galleryImages") as File[];
    if (galleryImageFiles.length > 0) {
      for (let i = 0; i < galleryImageFiles.length; i++) {
        const gf = galleryImageFiles[i];
        if (gf && gf.size > 0) {
          const bytes = await gf.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const result = await uploadToCloudinary(buffer, `banners/${pageKey}`);
          finalImages.push(result.secure_url);
        }
      }
    }

    // Parse slides data if provided (for home hero carousel)
    const slidesJson = formData.get("slides") as string;
    let slides: any[] = [];
    if (slidesJson) {
      try { slides = JSON.parse(slidesJson); } catch { slides = []; }
    }

    if (!finalImageUrl && finalImages.length === 0 && slides.length === 0 && !heroSource) {
      return NextResponse.json(
        { success: false, message: "Banner image or slides data is required" },
        { status: 400 }
      );
    }

    // For gallery page with no uploaded image, use a placeholder
    if (!finalImageUrl && finalImages.length === 0 && heroSource) {
      finalImageUrl = "/images/placeholder.svg";
    }

    const payload: any = {
      pageKey,
      title: title || undefined,
      image: finalImageUrl || (finalImages.length > 0 ? finalImages[0] : ""),
      status,
    };

    // Add hero text fields if provided
    if (label !== undefined) payload.label = label || "";
    if (headingLine1 !== undefined) payload.headingLine1 = headingLine1 || "";
    if (headingLine2 !== undefined) payload.headingLine2 = headingLine2 || "";
    if (description !== undefined) payload.description = description || "";

    // Gallery hero source preference — always save (even empty) so unselections persist
    payload.heroSource = heroSource || "[]";

    // Always set images (even empty) so deletions are saved
    payload.images = finalImages;

    // Always set slides (even empty) so cleared data persists
    payload.slides = slides;

    if (finalMobileImageUrl) payload.mobileImage = finalMobileImageUrl;

    // Delete removed images from Cloudinary before saving
    const oldBanner = await Banner.findOne({ pageKey }).lean();
    if (oldBanner) {
      const oldImages = (oldBanner as any).images || [];
      const newImages = payload.images || [];
      const removedImages = oldImages.filter((img: string) => img && !newImages.includes(img));
      for (const url of removedImages) {
        await deleteByUrl(url);
      }
      // Also delete old main image if replaced
      const oldMainImage = (oldBanner as any).image || "";
      if (oldMainImage && payload.image && oldMainImage !== payload.image && oldMainImage !== "/images/placeholder.svg") {
        await deleteByUrl(oldMainImage);
      }
      // Also delete old mobile image if replaced
      const oldMobileImage = (oldBanner as any).mobileImage || "";
      if (oldMobileImage && payload.mobileImage && oldMobileImage !== payload.mobileImage) {
        await deleteByUrl(oldMobileImage);
      }
    }

    // Upsert by pageKey (one banner per page)
    const saved = await Banner.findOneAndUpdate(
      { pageKey },
      { $set: payload, $setOnInsert: { isDeleted: false } },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: saved,
      message: "Banner upserted successfully",
    });
  } catch (error: any) {
    console.error("Error creating/updating banner:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save banner" },
      { status: 500 }
    );
  }
}
