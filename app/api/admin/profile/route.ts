import { NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Admin from "@/config/utils/admin/login/loginSchema";
import jwt from "jsonwebtoken";
import { uploadToCloudinary, deleteByUrl } from "@/config/utils/cloudinary";

interface DecodedToken {
  adminId: string;
  email: string;
  role: string;
}

// Get admin profile
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    await connectDB();

    // Find admin and exclude sensitive fields
    const admin = await Admin.findById(decoded.adminId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        location: admin.location,
        avatar: admin.avatar,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update admin profile
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    // Parse form data
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const location = formData.get("location") as string;
    const avatarFile = formData.get("avatar") as File | null;

    await connectDB();
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Handle avatar upload if provided
    const oldAvatarUrl = admin.avatar;
    let avatarUrl = admin.avatar; // Keep existing avatar URL by default
    if (avatarFile) {
      try {
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const folderPath = `admin/${admin._id}/avatar`;
        const result = await uploadToCloudinary(buffer, folderPath);
        avatarUrl = result.secure_url;
        // Delete old avatar from Cloudinary if it was replaced
        if (oldAvatarUrl && oldAvatarUrl !== avatarUrl) {
          await deleteByUrl(oldAvatarUrl);
        }
      } catch (uploadError) {
        console.error("Avatar upload failed:", uploadError);
        return NextResponse.json(
          { success: false, error: "Failed to upload avatar" },
          { status: 500 }
        );
      }
    }

    // Update admin data
    admin.firstName = firstName || admin.firstName;
    admin.lastName = lastName || admin.lastName;
    admin.phone = phone || admin.phone;
    admin.location = location || admin.location;
    admin.avatar = avatarUrl;

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        location: admin.location,
        avatar: admin.avatar,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
