import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "../../../../../config/models/connectDB";
import Admin from "../../../../../config/utils/admin/login/loginSchema";
import EmailSMTP from "../../../../../config/utils/admin/smtp/emailSMTPSchema";
import Settings from "../../../../../config/utils/admin/settings/settingsSchema";
import { createSMTPTransporter } from "../../../../../config/models/connectSMTP";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: "Please enter a valid email address." 
      }, { status: 400 });
    }

    // Neutral response returned for all outcomes so an attacker cannot
    // distinguish registered/active accounts from unknown/inactive ones.
    const neutralResponse = NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, you will receive password reset instructions.",
    });

    // Find admin by email
    const admin = await Admin.findOne({ email });

    // Unknown email or inactive account: skip sending, return neutral response.
    if (!admin || !admin.isActive) {
      return neutralResponse;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token to admin
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = resetTokenExpiry;
    await admin.save();

    // Get SMTP settings
    const smtpSettings = await EmailSMTP.findOne({ id: "default", isActive: true });
    if (!smtpSettings) {
      throw new Error("SMTP settings not configured");
    }

    // Create transporter
    const transporter = createSMTPTransporter(smtpSettings);

    // Reset link (replace with your actual frontend URL)
    const resetLink = `${process.env.APP_URL}/login/reset-password?token=${resetToken}`;

    console.log('Attempting to send email with the following details:');
    console.log('SMTP Settings:', {
      host: smtpSettings.smtpHost,
      port: smtpSettings.smtpPort,
      secure: smtpSettings.smtpPort === "465",
      fromEmail: smtpSettings.fromEmail,
      fromName: smtpSettings.fromName,
      toEmail: email
    });
    console.log('Reset Link:', resetLink);

    const settings = await Settings.findOne({ id: "default" }).lean() as any;
    const siteName = settings?.siteName || "Admin Panel";

    try {
      const info = await transporter.sendMail({
        from: smtpSettings.fromEmail,
        to: email,
        subject: `Password Reset Request - ${siteName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #221E1F 0%, #26A8E0 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h1>
              <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">${siteName}</p>
            </div>
            <div style="padding: 30px; background-color: white; margin: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #4b5563; line-height: 1.6;">You requested a password reset. Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="padding: 12px 30px; background-color: #26A8E0; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #6b7280; font-size: 13px;">Or copy and paste this link in your browser:</p>
              <p style="color: #26A8E0; font-size: 13px; word-break: break-all;">${resetLink}</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">This link will expire in 1 hour.<br>If you didn't request this, please ignore this email.</p>
              </div>
            </div>
          </div>
        `,
      });
      
      console.log('Email sent successfully:', info.messageId);
    } catch (error: any) {
      console.error('Error sending email:', error);
      // Email failed to send: invalidate the reset token so it can't be used.
      admin.resetPasswordToken = null;
      admin.resetPasswordExpires = null;
      try {
        await admin.save();
      } catch (saveError) {
        console.error('Error clearing reset token after email failure:', saveError);
      }
      // Do not leak the send failure to the client; return the neutral response.
      return neutralResponse;
    }

    return neutralResponse;
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
