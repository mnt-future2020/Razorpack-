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
        primaryPhone: "+91 9994162996",
        secondaryPhone: "",
        whatsappNumber: "+91 9994162996",
        email: "blufacadein@gmail.com",
        address: "#35/39, S5, Avyaya Apartments, East Tambaram",
        city: "Chennai",
        state: "Tamil Nadu",
        postcode: "600059",
        country: "India",
        businessHours: "Monday - Saturday: 9:00 AM - 6:00 PM",
        facebook: "https://facebook.com/blufacade",
        twitter: "",
        linkedin: "https://linkedin.com/company/blufacade",
        instagram: "https://instagram.com/blufacade_",
        youtube: "",
        whatsapp: "https://wa.me/919994162996",
        telegram: "",
        mapEmbedCode: "",
        latitude: "12.9716",
        longitude: "80.2466",
        pageTitle: "Get in Touch with Rayzor Industrial Packaging Pvt Ltd",
        pageDescription: "Ready to transform your building's exterior? Contact our expert team today and let us bring your architectural vision to life with premium facade solutions.",
        officeTitle: "Visit Our Office",
        officeDescription: "Conveniently located in Chennai, our office is your gateway to premium facade construction services tailored to your architectural needs.",
        serviceAreas: "Chennai, Madurai, Dindigul, Tamil Nadu, South India",
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
