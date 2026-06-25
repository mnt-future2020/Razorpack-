import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Contact from "@/config/utils/admin/contact/ContactSchema";

// GET - Fetch contact information
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get the contact information (there should only be one record)
    let contactInfo = await Contact.findOne();

    // If no contact info exists, create default data
    if (!contactInfo) {
      const defaultContactInfo = {
        primaryPhone: "+91 90877 87879",
        secondaryPhone: "+91 90877 87875",
        whatsappNumber: "+91 90877 87879",
        email: "sales@rayzorpack.com",
        address: "No: 298 A1, M.M Nagar, Thiruppalai",
        city: "Madurai",
        state: "Tamil Nadu",
        postcode: "625014",
        country: "India",
        businessHours: "Monday - Saturday: 9:00 AM - 6:00 PM",
        facebook: "",
        twitter: "",
        linkedin: "https://www.linkedin.com/company/rayzorpack/",
        instagram: "https://www.instagram.com/rayzorpack/",
        youtube: "",
        whatsapp: "https://wa.me/919087787879",
        telegram: "",
        mapEmbedCode: "",
        latitude: "9.9252",
        longitude: "78.1198",
        serviceAreas: "Madurai, Chennai, Bangalore, Coimbatore, Tamil Nadu, South India",
      };

      contactInfo = new Contact(defaultContactInfo);
      await contactInfo.save();
    }

    return NextResponse.json({
      success: true,
      data: contactInfo,
      message: "Contact information fetched successfully",
    });
  } catch (error: unknown) {
    console.error("Error fetching contact information:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contact information",
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Create or update contact information
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['primaryPhone', 'whatsappNumber', 'email', 'address', 'city', 'state', 'postcode', 'country', 'pageTitle', 'pageDescription', 'officeTitle', 'officeDescription'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required and cannot be empty`,
          },
          { status: 400 }
        );
      }
    }

    // Check if contact info already exists
    let contactInfo = await Contact.findOne();

    if (contactInfo) {
      // Update existing contact info
      Object.assign(contactInfo, body);
      await contactInfo.save();
    } else {
      // Create new contact info
      contactInfo = new Contact(body);
      await contactInfo.save();
    }

    return NextResponse.json({
      success: true,
      data: contactInfo,
      message: "Contact information saved successfully",
    });
  } catch (error: unknown) {
    console.error("Error saving contact information:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save contact information",
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update contact information
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['primaryPhone', 'whatsappNumber', 'email', 'address', 'city', 'state', 'postcode', 'country', 'pageTitle', 'pageDescription', 'officeTitle', 'officeDescription'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required and cannot be empty`,
          },
          { status: 400 }
        );
      }
    }

    // Find and update the contact info (there should only be one record)
    const contactInfo = await Contact.findOneAndUpdate(
      {},
      body,
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: contactInfo,
      message: "Contact information updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating contact information:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update contact information",
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
