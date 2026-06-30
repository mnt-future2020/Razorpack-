import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import EmailSMTP from "@/config/utils/admin/smtp/emailSMTPSchema";
import { testSMTPConnection, sendTestEmail } from "@/config/models/connectSMTP";
import { verifyAdmin } from "@/lib/admin-auth";

// GET - Fetch SMTP settings
export async function GET(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  try {
    await connectDB();

    const smtpSettings = await EmailSMTP.findOne({ isActive: true }).lean();

    if (!smtpSettings) {
      return NextResponse.json(
        {
          success: false,
          message: "No active SMTP configuration found",
        },
        { status: 404 }
      );
    }

    // Don't send password in response for security
    const { smtpPassword, ...safeSettings } = smtpSettings as any;

    return NextResponse.json(
      {
        success: true,
        data: safeSettings,
        message: "SMTP settings fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching SMTP settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch SMTP settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update SMTP settings
export async function PUT(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  try {
    await connectDB();

    const body = await request.json();
    const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, fromName } =
      body;

    // Validate required fields
    if (
      !smtpHost ||
      !smtpPort ||
      !smtpUser ||
      !smtpPassword ||
      !fromEmail ||
      !fromName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All SMTP fields are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format for From Email",
        },
        { status: 400 }
      );
    }

    // Validate port number
    const portNumber = parseInt(smtpPort);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid port number. Must be between 1 and 65535",
        },
        { status: 400 }
      );
    }

    // Update SMTP settings
    const updatedSMTP = await EmailSMTP.findOneAndUpdate(
      { id: "default" },
      {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromEmail,
        fromName,
        lastUpdated: new Date(),
      },
      { new: true, runValidators: true, upsert: true }
    );

    // Don't send password in response
    const updatedSMTPObject = updatedSMTP?.toObject();
    const { smtpPassword: _, ...safeSettings } = updatedSMTPObject || {};

    return NextResponse.json(
      {
        success: true,
        data: safeSettings,
        message: "SMTP settings updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating SMTP settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update SMTP settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Test SMTP connection or send test email
export async function POST(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  try {
    await connectDB();

    const body = await request.json();
    const { action, testEmail, message } = body;

    // Get current SMTP settings
    const smtpSettings = await EmailSMTP.findOne({ id: "default" });

    if (!smtpSettings) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No SMTP configuration found. Please configure SMTP settings first.",
        },
        { status: 404 }
      );
    }

    if (action === "test-connection") {
      // Test SMTP connection
      const testResult = await testSMTPConnection(smtpSettings);

      // Update test status in database
      await EmailSMTP.findOneAndUpdate(
        { id: "default" },
        {
          lastTested: new Date(),
          testStatus: testResult.success ? "success" : "failed",
        }
      );

      return NextResponse.json(
        {
          success: testResult.success,
          message: testResult.message,
        },
        { status: testResult.success ? 200 : 400 }
      );
    } else if (action === "send-test-email") {
      // Validate test email data
      if (!testEmail || !message) {
        return NextResponse.json(
          {
            success: false,
            message: "Test email and message are required",
          },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(testEmail)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid email format",
          },
          { status: 400 }
        );
      }

      // Send test email
      const emailResult = await sendTestEmail(smtpSettings, {
        email: testEmail,
        message: message,
      });

      // Update test status in database
      await EmailSMTP.findOneAndUpdate(
        { id: "default" },
        {
          lastTested: new Date(),
          testStatus: emailResult.success ? "success" : "failed",
        }
      );

      return NextResponse.json(
        {
          success: emailResult.success,
          message: emailResult.message,
          messageId: emailResult.messageId,
        },
        { status: emailResult.success ? 200 : 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action. Use 'test-connection' or 'send-test-email'",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in SMTP test:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform SMTP test",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
