import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Service from "@/config/utils/admin/services/serviceSchema";
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
function generateSlug(serviceName: string): string {
  return serviceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// PUT - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();
    const { id } = await params;

    const service = await Service.findOne({ _id: id, isDeleted: false });
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const serviceName = formData.get("serviceName") as string;
    const category = formData.get("category") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const order = Number.parseInt(formData.get("order") as string) || 0;
    const features = JSON.parse(formData.get("features") as string || "[]");
    const technicalSpecs = JSON.parse(formData.get("technicalSpecs") as string || "[]");
    const applications = JSON.parse(formData.get("applications") as string || "[]");
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const seoKeywords = formData.get("seoKeywords") as string;
    const imageFile = formData.get("image") as File | null;
    const existingImage = formData.get("existingImage") as string;
    const galleryFiles = formData.getAll("galleryImages") as File[];
    
    // Get existing gallery URLs from form data
    const existingGallery: string[] = [];
    let index = 0;
    while (formData.has(`existingGallery[${index}]`)) {
      const url = formData.get(`existingGallery[${index}]`) as string;
      if (url) existingGallery.push(url);
      index++;
    }

    // Validate required fields
    if (!serviceName || !description) {
      return NextResponse.json(
        { success: false, message: "Service name and description are required" },
        { status: 400 }
      );
    }

    // Check if order already exists (excluding current service)
    const existingOrder = await Service.findOne({
      order,
      _id: { $ne: id },
      isDeleted: false
    });
    if (existingOrder) {
      return NextResponse.json(
        { success: false, message: `A service with order ${order} already exists` },
        { status: 400 }
      );
    }

    // Generate new slug if name changed
    const newSlug = generateSlug(serviceName);
    if (newSlug !== service.slug) {
      const existingService = await Service.findOne({
        slug: newSlug,
        _id: { $ne: id },
        isDeleted: false,
      });
      if (existingService) {
        return NextResponse.json(
          { success: false, message: "A service with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Handle image upload
    const oldImageUrl = service.image;
    let imageUrl = existingImage || service.image;
    if (imageFile && imageFile.size > 0) {
      const imageBytes = await imageFile.arrayBuffer();
      const imageBuffer = Buffer.from(imageBytes);
      const imageResult = await uploadToCloudinary(
        imageBuffer,
        `services/${newSlug}/main`
      );
      imageUrl = imageResult.secure_url;
      // Delete old image from Cloudinary if it was replaced
      if (oldImageUrl && oldImageUrl !== imageUrl) {
        await deleteByUrl(oldImageUrl);
      }
    }

    // Delete removed gallery images from Cloudinary
    const oldGalleryUrls: string[] = service.gallery || [];
    const removedGalleryUrls = oldGalleryUrls.filter(
      (url: string) => url && !existingGallery.includes(url)
    );
    for (const url of removedGalleryUrls) {
      await deleteByUrl(url);
    }

    // Handle gallery images
    const galleryUrls: string[] = [...existingGallery];
    if (galleryFiles && galleryFiles.length > 0) {
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const result = await uploadToCloudinary(
            buffer,
            `services/${newSlug}/gallery`
          );
          galleryUrls.push(result.secure_url);
        }
      }
    }

    // Update service
    service.serviceName = serviceName;
    service.category = category;
    service.shortDescription = shortDescription;
    service.description = description;
    service.image = imageUrl;
    service.gallery = galleryUrls;
    service.features = features;
    service.technicalSpecs = technicalSpecs;
    service.applications = applications;
    service.slug = newSlug;
    service.status = status;
    service.order = order;
    service.seoTitle = seoTitle;
    service.seoDescription = seoDescription;
    service.seoKeywords = seoKeywords;

    await service.save();

    return NextResponse.json({
      success: true,
      data: service,
      message: "Service updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update service",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hard delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();
    const { id } = await params;

    const service = await Service.findOne({ _id: id, isDeleted: false });
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary before removing the record
    if (service.image) {
      await deleteByUrl(service.image);
    }
    if (service.gallery && service.gallery.length > 0) {
      for (const url of service.gallery) {
        if (url) await deleteByUrl(url);
      }
    }

    // Hard delete - permanently remove from database
    await Service.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete service" },
      { status: 500 }
    );
  }
}
