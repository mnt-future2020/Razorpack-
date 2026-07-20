import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { compare } from "bcryptjs"
import connectDB from "../../../../../config/models/connectDB"
import Admin from "../../../../../config/utils/admin/login/loginSchema"

export async function POST(request : Request) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    // Validate input. Reject non-string values to prevent NoSQL operator
    // injection (e.g. {"email":{"$ne":null}}) from reaching the query.
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find admin by email
    let admin = await Admin.findOne({ email })

    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Enforce account lockout after repeated failed attempts.
    if (admin.isLocked()) {
      return NextResponse.json(
        { error: "Account temporarily locked due to too many failed attempts. Try again later." },
        { status: 429 },
      )
    }

    // Google-only account with no password set.
    if (!admin.password) {
      return NextResponse.json({
        error: "Please use Google Sign-In or reset your password to set one up",
        code: "NO_PASSWORD_SET",
      }, { status: 401 });
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await compare(password, admin.password);
    } catch (error) {
      console.error('Password comparison error');
      return NextResponse.json({ error: "Error verifying credentials" }, { status: 500 })
    }

    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 })
    }

    // Successful auth — clear any accumulated failed attempts.
    if (admin.loginAttempts > 0 || admin.lockUntil) {
      await admin.resetLoginAttempts();
    }

    // Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured")
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Update last login time
    admin.lastLogin = new Date()
    await admin.save()

    // Prepare admin data (exclude sensitive information)
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
      isActive: admin.isActive
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      admin: adminData,
    })
  } catch (error: any) {
    console.error("Login error:", error)

    if (error.message === "JWT_SECRET is not configured") {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "An error occurred during login. Please try again." 
    }, { status: 500 })
  }
}
