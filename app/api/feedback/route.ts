import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Feedback from "@/config/utils/admin/feedback/feedbackSchema";
import EmailSMTP from "@/config/utils/admin/smtp/emailSMTPSchema";
import { createSMTPTransporter } from "@/config/models/connectSMTP";

// POST - Submit feedback from frontend
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      isAnonymous,
      name,
      email,
      phone,
      feedbackType,
      feedback,
      resolution,
    } = body;

    // Validate required fields
    if (!feedbackType || !feedback) {
      return NextResponse.json(
        { success: false, error: "Feedback type and message are required" },
        { status: 400 },
      );
    }

    // Create new feedback
    const newFeedback = new Feedback({
      isAnonymous: isAnonymous || false,
      name: isAnonymous ? "Anonymous" : name || "",
      email: isAnonymous ? "" : email || "",
      phone: isAnonymous ? "" : phone || "",
      feedbackType,
      feedback,
      resolution: resolution || "",
      status: "new",
    });

    await newFeedback.save();

    // Send email notifications
    try {
      await sendFeedbackEmails(newFeedback);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the feedback submission if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback! We appreciate your input.",
      data: { id: newFeedback._id },
    });
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}

// Function to send feedback emails
async function sendFeedbackEmails(feedbackData: any) {
  // Get SMTP configuration
  const smtpConfig = await EmailSMTP.findOne({
    id: "default",
    isActive: true,
  });

  if (!smtpConfig) {
    console.warn(
      "SMTP configuration not found - feedback submitted without email notification",
    );
    return;
  }

  // Send admin notification
  await sendAdminFeedbackNotification(smtpConfig, feedbackData);

  // Send customer confirmation (only if not anonymous and email provided)
  if (!feedbackData.isAnonymous && feedbackData.email) {
    await sendCustomerFeedbackConfirmation(smtpConfig, feedbackData);
  }
}

// Get feedback type label and color
function getFeedbackTypeStyle(type: string) {
  const styles: Record<string, { label: string; color: string }> = {
    compliment: { label: "Compliment", color: "#22C55E" },
    suggestion: { label: "Suggestion", color: "#3B82F6" },
    concern: { label: "Concern", color: "#F59E0B" },
    complaint: { label: "Complaint", color: "#EF4444" },
    other: { label: "Other", color: "#6B7280" },
  };
  return styles[type] || styles.other;
}

// Function to send admin notification for feedback
async function sendAdminFeedbackNotification(
  smtpConfig: any,
  feedbackData: any,
) {
  const transporter = createSMTPTransporter(smtpConfig);
  const adminEmail = process.env.SMTP_FROM_EMAIL || smtpConfig.fromEmail;
  const typeStyle = getFeedbackTypeStyle(feedbackData.feedbackType);

  const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #8CC63F 0%, #6BA32D 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">New Feedback Received</h1>
        <p style="color: #E8F5E0; margin: 10px 0 0 0; font-size: 16px;">Rayzor Industrial Packaging Pvt Ltd Admin Panel</p>
      </div>
      
      <div style="padding: 30px; background-color: white; margin: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="border-left: 4px solid #8CC63F; padding-left: 20px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 10px 0;">Feedback Information</h2>
          <div style="background-color: #F0F9E8; padding: 15px; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background-color: #8CC63F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">NEW FEEDBACK</span></p>
            <p style="margin: 5px 0;"><strong>Type:</strong> <span style="background-color: ${typeStyle.color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${typeStyle.label.toUpperCase()}</span></p>
            <p style="margin: 5px 0;"><strong>Anonymous:</strong> <span style="background-color: ${feedbackData.isAnonymous ? "#6B7280" : "#8CC63F"}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${feedbackData.isAnonymous ? "YES" : "NO"}</span></p>
          </div>
        </div>

        ${
          !feedbackData.isAnonymous
            ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Contact Details</h3>
          <p style="margin: 10px 0;"><strong>Name:</strong> ${feedbackData.name || "Not provided"}</p>
          ${feedbackData.email ? `<p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${feedbackData.email}" style="color: #8CC63F;">${feedbackData.email}</a></p>` : ""}
          ${feedbackData.phone ? `<p style="margin: 10px 0;"><strong>Phone:</strong> <a href="tel:${feedbackData.phone}" style="color: #8CC63F;">${feedbackData.phone}</a></p>` : ""}
        </div>
        `
            : `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Contact Details</h3>
          <p style="margin: 10px 0; color: #6b7280; font-style: italic;">This feedback was submitted anonymously</p>
        </div>
        `
        }

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Feedback Message</h3>
          <div style="background-color: #F0F9E8; padding: 20px; border-radius: 8px; border-left: 4px solid ${typeStyle.color};">
            <p style="margin: 0; line-height: 1.6; color: #1f2937;">${feedbackData.feedback}</p>
          </div>
        </div>

        ${
          feedbackData.resolution
            ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Suggested Resolution</h3>
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; line-height: 1.6; color: #1f2937;">${feedbackData.resolution}</p>
          </div>
        </div>
        `
            : ""
        }

        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            This email was automatically generated from the Rayzor Industrial Packaging Pvt Ltd website.<br>
            Feedback ID: #${feedbackData._id}<br>
            Received at: ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}
          </p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
    to: adminEmail,
    subject: `New ${typeStyle.label}: ${feedbackData.isAnonymous ? "Anonymous Feedback" : feedbackData.name || "Customer Feedback"}`,
    html: emailHTML,
  };

  await transporter.sendMail(mailOptions);
}

// Function to send customer confirmation for feedback
async function sendCustomerFeedbackConfirmation(
  smtpConfig: any,
  feedbackData: any,
) {
  const transporter = createSMTPTransporter(smtpConfig);
  const typeStyle = getFeedbackTypeStyle(feedbackData.feedbackType);

  const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #8CC63F 0%, #6BA32D 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Feedback!</h1>
        <p style="color: #E8F5E0; margin: 10px 0 0 0; font-size: 16px;">Rayzor Industrial Packaging Pvt Ltd</p>
      </div>
      
      <div style="padding: 30px; background-color: white; margin: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 15px 0;">Hi ${feedbackData.name || "there"}!</h2>
          <p style="color: #4b5563; line-height: 1.6; margin: 0;">
            Thank you for taking the time to share your feedback with us. Your input is invaluable and helps us improve our services.
          </p>
        </div>

        <div style="background-color: #F0F9E8; padding: 20px; border-radius: 8px; border-left: 4px solid ${typeStyle.color}; margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">Your Feedback Summary:</h3>
          <p style="margin: 5px 0;"><strong>Type:</strong> <span style="background-color: ${typeStyle.color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${typeStyle.label}</span></p>
          <p style="margin: 10px 0;"><strong>Your Message:</strong></p>
          <p style="margin: 5px 0; color: #4b5563; font-style: italic;">"${feedbackData.feedback}"</p>
        </div>

        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">What Happens Next?</h3>
          <ul style="color: #4b5563; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Our team will review your feedback carefully</li>
            <li>We may reach out if we need more information</li>
            <li>Your feedback helps us improve our services</li>
          </ul>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">We Value Your Voice</h3>
          <p style="color: #4b5563; line-height: 1.6; margin: 0;">
            At Rayzor Industrial Packaging Pvt Ltd, we are committed to providing the highest quality facade solutions. Your feedback, whether it's a compliment, suggestion, or concern, helps us understand how we can better serve you and our community.
          </p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Best regards,<br>
            Rayzor Industrial Packaging Pvt Ltd Team<br>
            Quality Care, Compassionate Support
          </p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
    to: feedbackData.email,
    subject: "Thank You for Your Feedback - Rayzor Industrial Packaging Pvt Ltd",
    html: emailHTML,
  };

  await transporter.sendMail(mailOptions);
}
