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

// GET - Fetch all services with pagination
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

    const [services, total] = await Promise.all([
      Service.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: services,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalServices: total,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();

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
    const processSteps = JSON.parse(formData.get("processSteps") as string || "[]");
    const whyChooseUs = JSON.parse(formData.get("whyChooseUs") as string || "[]");
    const highlights = JSON.parse(formData.get("highlights") as string || "[]");
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const seoKeywords = formData.get("seoKeywords") as string;
    const ogImage = formData.get("ogImage") as string;
    const ogImageFile = formData.get("ogImageFile") as File | null;
    const imageFile = formData.get("image") as File | null;
    const galleryFiles = formData.getAll("galleryImages") as File[];

    // Validate required fields
    if (!serviceName || !description) {
      return NextResponse.json(
        { success: false, message: "Service name and description are required" },
        { status: 400 }
      );
    }

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: "Service image is required" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateSlug(serviceName);

    // Check if order already exists
    const existingOrder = await Service.findOne({ order, isDeleted: false });
    if (existingOrder) {
      return NextResponse.json(
        { success: false, message: `A service with order ${order} already exists` },
        { status: 400 }
      );
    }

    // Check if slug already exists. Not filtered by isDeleted: the unique index
    // on `slug` spans soft-deleted docs too, so an unfiltered check here is what
    // matches the constraint the DB will actually enforce on save().
    const existingService = await Service.findOne({ slug });
    if (existingService) {
      return NextResponse.json(
        { success: false, message: "A service with this name already exists" },
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
      `services/${slug}/main`
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
            `services/${slug}/gallery`
          );
          galleryUrls.push(result.secure_url);
          uploadedUrls.push(result.secure_url);
        }
      }
    }

    // Create service
    const service = new Service({
      serviceName,
      category,
      shortDescription,
      description,
      image: imageResult.secure_url,
      gallery: galleryUrls,
      features,
      technicalSpecs,
      applications,
      processSteps,
      whyChooseUs,
      highlights,
      slug,
      status,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage: ogImage || "",
    });

    // Upload OG image if provided
    if (ogImageFile && ogImageFile.size > 0) {
      const ogBytes = await ogImageFile.arrayBuffer();
      const ogBuffer = Buffer.from(ogBytes);
      const ogResult = await uploadToCloudinary(ogBuffer, `services/${slug}/og`);
      service.ogImage = (ogResult as any).secure_url;
      uploadedUrls.push(service.ogImage);
    }

    try {
      await service.save();
    } catch (saveError) {
      // Save failed — remove the now-orphaned uploads before bubbling up.
      await Promise.all(uploadedUrls.map((url) => deleteByUrl(url)));
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      data: service,
      message: "Service created successfully",
    });
  } catch (error: any) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create service" },
      { status: 500 }
    );
  }
}
