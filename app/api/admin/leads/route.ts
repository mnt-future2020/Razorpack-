import { NextRequest, NextResponse } from "next/server";
import Lead from "@/config/utils/admin/lead/leadSchema";
import connectDB from "@/config/models/connectDB";

// GET - Fetch leads with pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const query: any = {};
    if (status && status !== "all") query.status = status;
    if (priority && priority !== "all") query.priority = priority;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [leads, total, newCount, consultingCount, highPriorityCount] =
      await Promise.all([
        Lead.find(query)
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Lead.countDocuments(query),
        Lead.countDocuments({ ...query, status: "new" }),
        Lead.countDocuments({ ...query, status: "consulting" }),
        Lead.countDocuments({ ...query, priority: "high" }),
      ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      stats: {
        total,
        newLeads: newCount,
        consulting: consultingCount,
        highPriority: highPriorityCount,
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 },
    );
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "subject",
      "message",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const newLead = new Lead({
      ...body,
      status: body.status || "new",
      priority: body.priority || "medium",
      source: body.source || "website",
      submittedAt: new Date(),
    });
    const savedLead = await newLead.save();

    // Send email notifications
    try {
      await sendLeadEmails(savedLead);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the lead creation if email fails
    }

    return NextResponse.json({
      success: true,
      data: savedLead,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500 },
    );
  }
}

async function sendLeadEmails(lead: any) {
  // Import internally to avoid circular dependencies if any
  const EmailSMTP = (await import("@/config/utils/admin/smtp/emailSMTPSchema"))
    .default;
  const { createSMTPTransporter } = await import("@/config/models/connectSMTP");

  const smtpConfig = await EmailSMTP.findOne({ id: "default", isActive: true });
  if (!smtpConfig) {
    console.warn("SMTP configuration not found - skipping email notifications");
    return;
  }

  const transporter = createSMTPTransporter(smtpConfig);
  const adminEmail = process.env.SMTP_FROM_EMAIL || smtpConfig.fromEmail;

  // Admin Notification
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #014a74 0%, #012d47 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">New Lead Submission</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Rayzor Industrial Packaging Pvt Ltd Admin Panel</p>
      </div>
      <div style="padding: 30px; background-color: white; margin: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
         <h2 style="color: #014a74; border-bottom: 2px solid #f58420; padding-bottom: 10px;">Enquiry Details</h2>
         <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
         <p><strong>Email:</strong> ${lead.email}</p>
         <p><strong>Phone:</strong> ${lead.phone || "N/A"}</p>
         <p><strong>Subject:</strong> ${lead.subject}</p>
         <p><strong>Source:</strong> ${lead.source || "Website"}</p>
         <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
           <p style="margin: 0; line-height: 1.6;">${lead.message}</p>
         </div>
      </div>
    </div>
  `;

  // Customer Confirmation
  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #014a74 0%, #012d47 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Contacting Us!</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Rayzor Industrial Packaging Pvt Ltd - Inspiring Skylines</p>
      </div>
      <div style="padding: 30px; background-color: white; margin: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p>Hi ${lead.firstName},</p>
        <p>Thank you for reaching out to Rayzor Industrial Packaging Pvt Ltd. We have received your enquiry regarding "<strong>${lead.subject}</strong>" and our team will get back to you shortly.</p>
        <div style="background-color: #fefaf6; padding: 15px; border-radius: 8px; border-left: 4px solid #f58420; margin: 20px 0;">
          <p style="margin: 0; font-style: italic;">"${lead.message}"</p>
        </div>
        <p>Best regards,<br>The Rayzor Industrial Packaging Pvt Ltd Team</p>
      </div>
    </div>
  `;

  await Promise.all([
    transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: adminEmail,
      subject: `New Lead: ${lead.subject} from ${lead.firstName}`,
      html: adminHtml,
    }),
    transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: lead.email,
      subject: "Thank you for contacting Rayzor Industrial Packaging Pvt Ltd",
      html: customerHtml,
    }),
  ]);
}

// PUT - Update lead
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required" },
        { status: 400 },
      );
    }

    // Get the current lead to check status change
    const currentLead = await Lead.findById(_id);
    if (!currentLead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 },
      );
    }

    // Generate review link if status is changing to completed
    if (
      updateData.status === "completed" &&
      currentLead.status !== "completed"
    ) {
      // Generate a unique review token
      const reviewToken = `review_${_id}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const appUrl = process.env.APP_URL || "https://blufacade.com";
      const reviewLink = `${appUrl}/review?token=${reviewToken}`;

      updateData.reviewToken = reviewToken;
      updateData.reviewLink = reviewLink;
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      _id,
      { ...updateData, lastUpdated: new Date() },
      { new: true },
    );

    if (!updatedLead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: "Lead updated successfully",
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
      { status: 500 },
    );
  }
}

// DELETE - Delete lead
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("id");

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required" },
        { status: 400 },
      );
    }

    const deletedLead = await Lead.findByIdAndDelete(leadId);

    if (!deletedLead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lead" },
      { status: 500 },
    );
  }
}
