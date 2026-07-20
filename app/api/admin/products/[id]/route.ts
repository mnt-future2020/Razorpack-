import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();
    const { id } = await params;

    // Reject malformed ids up front — otherwise Mongoose throws a CastError
    // that surfaces as a 500 with the internal error text instead of a 404.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const product = await Product.findOne({ _id: id, isDeleted: false });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const productName = formData.get("productName") as string;
    const category = formData.get("category") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const order = Number.parseInt(formData.get("order") as string) || 0;
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
    if (!productName || !description) {
      return NextResponse.json(
        { success: false, message: "Product name and description are required" },
        { status: 400 }
      );
    }

    // Check if order already exists (excluding current product)
    const existingOrder = await Product.findOne({
      order,
      _id: { $ne: id },
      isDeleted: false
    });
    if (existingOrder) {
      return NextResponse.json(
        { success: false, message: `A product with order ${order} already exists` },
        { status: 400 }
      );
    }

    // Generate new slug if name changed
    const newSlug = generateSlug(productName);
    if (newSlug !== product.slug) {
      const existingProduct = await Product.findOne({
        slug: newSlug,
        _id: { $ne: id },
        isDeleted: false,
      });
      if (existingProduct) {
        return NextResponse.json(
          { success: false, message: "A product with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Collect old asset URLs to delete only AFTER the DB save succeeds. If we
    // delete first and the save then fails (duplicate slug, validation, …) the
    // images are gone from Cloudinary but the record still points at them.
    const urlsToDeleteAfterSave: string[] = [];

    // Handle image upload
    const oldImageUrl = product.image;
    let imageUrl = existingImage || product.image;
    if (imageFile && imageFile.size > 0) {
      const imageBytes = await imageFile.arrayBuffer();
      const imageBuffer = Buffer.from(imageBytes);
      const imageResult = await uploadToCloudinary(
        imageBuffer,
        `products/${newSlug}/main`
      );
      imageUrl = imageResult.secure_url;
      if (oldImageUrl && oldImageUrl !== imageUrl) {
        urlsToDeleteAfterSave.push(oldImageUrl);
      }
    }

    // Queue removed gallery images for deletion after save
    const oldGalleryUrls: string[] = product.gallery || [];
    const removedGalleryUrls = oldGalleryUrls.filter(
      (url: string) => url && !existingGallery.includes(url)
    );
    urlsToDeleteAfterSave.push(...removedGalleryUrls);

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
            `products/${newSlug}/gallery`
          );
          galleryUrls.push(result.secure_url);
        }
      }
    }

    // Update product
    product.productName = productName;
    product.category = category;
    product.shortDescription = shortDescription;
    product.description = description;
    product.image = imageUrl;
    product.gallery = galleryUrls;
    product.features = features;
    product.technicalSpecs = technicalSpecs;
    product.applications = applications;
    product.tags = tags;
    product.deliveryInfo = deliveryInfo;
    product.slug = newSlug;
    product.status = status;
    product.order = order;
    product.seoTitle = seoTitle;
    product.seoDescription = seoDescription;
    product.seoKeywords = seoKeywords;
    // Handle OG image upload
    const oldOgImageUrl = product.ogImage;
    if (ogImageFile && ogImageFile.size > 0) {
      const ogBytes = await ogImageFile.arrayBuffer();
      const ogBuffer = Buffer.from(ogBytes);
      const ogResult = await uploadToCloudinary(ogBuffer, `products/${newSlug}/og`);
      product.ogImage = (ogResult as any).secure_url;
    } else {
      product.ogImage = ogImage || "";
    }
    // If the OG image changed or was cleared, delete the old asset after save.
    if (oldOgImageUrl && oldOgImageUrl !== product.ogImage) {
      urlsToDeleteAfterSave.push(oldOgImageUrl);
    }

    await product.save();

    // Save succeeded — now it is safe to remove the superseded assets.
    await Promise.all(urlsToDeleteAfterSave.map((url) => deleteByUrl(url)));

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Hard delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const product = await Product.findOne({ _id: id, isDeleted: false });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Remove the record first, then clean up assets. (A failed asset delete
    // must not leave an undeletable product behind.)
    await Product.findByIdAndDelete(id);

    const assetUrls = [
      product.image,
      product.ogImage,
      ...(product.gallery || []),
    ].filter(Boolean);
    await Promise.all(assetUrls.map((url: string) => deleteByUrl(url)));

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
