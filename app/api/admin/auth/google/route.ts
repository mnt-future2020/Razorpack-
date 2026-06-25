import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../../config/models/connectDB";
import Admin from "../../../../../config/utils/admin/login/loginSchema";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: "Google credential is required" },
        { status: 400 },
      );
    }

    // Get user info from Google using the access token
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${credential}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to get user info from Google");
    }

    const userInfo = await userInfoResponse.json();
    const {
      sub: googleId,
      email,
      given_name,
      family_name,
      picture,
      email_verified,
    } = userInfo;

    // Check if admin exists with this email
    let admin = await Admin.findOne({ email });

    if (admin) {
      // Update Google ID if not set
      if (!admin.googleId) {
        admin.googleId = googleId;
        admin.emailVerified = email_verified;
        admin.lastLogin = new Date();
        await admin.save();
      } else if (admin.googleId !== googleId) {
        return NextResponse.json(
          { error: "Email is associated with a different Google account" },
          { status: 400 },
        );
      } else {
        // Update last login
        admin.lastLogin = new Date();
        await admin.save();
      }
    } else {
      // Create new admin with Google account (only if it's the authorized email)
      if (email !== "admin@rayzorpack.com") {
        return NextResponse.json(
          { error: "Unauthorized email address" },
          { status: 403 },
        );
      }

      admin = new Admin({
        firstName: given_name || "Admin",
        lastName: family_name || "User",
        email,
        avatar: picture,
        googleId,
        emailVerified: email_verified,
        role: "Super Admin",
        isActive: true,
        lastLogin: new Date(),
      });

      await admin.save();
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 },
      );
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Prepare admin data
    const adminData = {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      location: admin.location,
      avatar: admin.avatar,
      role: admin.role,
      lastLogin: admin.lastLogin,
      emailVerified: admin.emailVerified,
    };

    return NextResponse.json({
      success: true,
      message: "Google login successful",
      token,
      admin: adminData,
    });
  } catch (error: any) {
    console.error("Google login error:", error);

    if (error.message.includes("Invalid token")) {
      return NextResponse.json(
        { error: "Invalid Google token" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
