import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../../../../config/models/connectDB";
import Admin from "../../../../../config/utils/admin/login/loginSchema";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    // Guard against NoSQL operator injection: token/newPassword must be plain
    // strings. Without this, {"token":{"$gt":""}} matches any live reset token
    // and lets an attacker reset an admin password without the email.
    if (typeof token !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Invalid token or password" }, { status: 400 });
    }

    // Find admin with valid reset token
    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // Validate password length and complexity
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long",
        type: "length"
      }, { status: 400 });
    }

    // Validate password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return NextResponse.json({ 
        error: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
        type: "complexity"
      }, { status: 400 });
    }

    console.log('Resetting password for admin:', admin.email);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('Password hashed successfully');

    // Update password and clear the reset token atomically. (Password is hashed
    // here rather than via the pre-save hook because we use findByIdAndUpdate.)
    await Admin.findByIdAndUpdate(admin._id, {
      $set: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
