import { NextRequest, NextResponse } from "next/server";
import SEO from "@/config/utils/admin/seo/seoSchema";
import connectDB from "@/config/models/connectDB";

// GET - Fetch all SEO data
export async function GET() {
  try {
    await connectDB();
    
    // Check if SEO data exists, if not create default data
    let seoData = await SEO.find({}).lean().then((data: any[]) => {
        const order = ["home", "about", "products", "services", "gallery", "contact"];
        return data.sort((a, b) => {
          const ai = order.indexOf(a.id);
          const bi = order.indexOf(b.id);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
      });
    
    if (seoData.length === 0) {
      // Create default SEO data for Rayzor Industrial Packaging Pvt Ltd
      const defaultSEOData = [
        {
          id: "home",
          pageName: "Home Page",
          title: "Rayzor Industrial Packaging Pvt Ltd | Premium Packaging Solutions & LDPE Films",
          description: "Rayzor Industrial Packaging Pvt Ltd is the leading manufacturer of VCI film rolls, LDPE bags, pallet covers, and industrial packaging solutions in Madurai, Tamil Nadu.",
          keywords: "VCI film rolls, LDPE bags, industrial packaging, pallet covers, container liners, shrink films, corrosion protection, Madurai packaging",
          lastUpdated: new Date(),
          isActive: true,
        },
        {
          id: "about",
          pageName: "About Us",
          title: "About Us | Rayzor Industrial Packaging Pvt Ltd",
          description: "For over two decades, Rayzor Industrial Packaging Pvt Ltd has been the driving force behind tailor-made packaging solutions from our production hub in Madurai, Tamil Nadu.",
          keywords: "about rayzorpack, packaging company Madurai, industrial packaging manufacturer, VCI protection, LDPE packaging, Made in India packaging",
          lastUpdated: new Date(),
          isActive: true,
        },
        {
          id: "services",
          pageName: "Services Page",
          title: "Our Services | Rayzor Industrial Packaging Pvt Ltd",
          description: "Explore our industrial packaging services — contract packaging, export palletization, vacuum & barrier packing, and VCI corrosion protection solutions.",
          keywords: "contract packaging, export palletization, vacuum packing, barrier packing, VCI corrosion protection, industrial packaging services",
          lastUpdated: new Date(),
          isActive: true,
        },
        {
          id: "products",
          pageName: "Products Page",
          title: "Products | Rayzor Industrial Packaging Pvt Ltd",
          description: "Precision-engineered VCI & LDPE films, pouches, bags, shrink wraps, pallet covers, and container liners — 16+ specialized packaging solutions.",
          keywords: "VCI film rolls, VCI bags, LDPE film rolls, LDPE bags, pallet covers, container liners, shrink films, antistatic films, PP film, HM pouches",
          lastUpdated: new Date(),
          isActive: true,
        },
        {
          id: "gallery",
          pageName: "Gallery",
          title: "Gallery | Rayzor Industrial Packaging Pvt Ltd",
          description: "View our portfolio of industrial packaging projects showcasing VCI protection, export palletization, and custom packaging solutions.",
          keywords: "packaging gallery, industrial packaging portfolio, VCI packaging projects, export packaging, manufacturing facility",
          lastUpdated: new Date(),
          isActive: true,
        },
        {
          id: "contact",
          pageName: "Contact Us",
          title: "Contact Us | Rayzor Industrial Packaging Pvt Ltd",
          description: "Get in touch with our packaging experts in Madurai, Tamil Nadu. Call +91 90877 87879 or email sales@rayzorpack.com for custom packaging solutions.",
          keywords: "contact rayzorpack, packaging enquiry, Madurai packaging, industrial packaging quote, VCI packaging consultation",
          lastUpdated: new Date(),
          isActive: true,
        },
      ];

      // Use bulkWrite with upsert to prevent duplicates
      const bulkOps = defaultSEOData.map(item => ({
        updateOne: {
          filter: { id: item.id },
          update: { $setOnInsert: item },
          upsert: true
        }
      }));

      await SEO.bulkWrite(bulkOps);
      seoData = await SEO.find({}).lean().then((data: any[]) => {
        const order = ["home", "about", "products", "services", "gallery", "contact"];
        return data.sort((a, b) => {
          const ai = order.indexOf(a.id);
          const bi = order.indexOf(b.id);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
      });
      console.log("✅ SEO data initialized for Rayzor Industrial Packaging Pvt Ltd");
    }

    return NextResponse.json({
      success: true,
      data: seoData,
    });
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SEO data" },
      { status: 500 }
    );
  }
}

// PUT - Update SEO data
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, title, description, keywords } = body;

    if (!id || !title || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedSEO = await SEO.findOneAndUpdate(
      { id },
      {
        title,
        description,
        keywords: keywords || "",
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!updatedSEO) {
      return NextResponse.json(
        { success: false, error: "SEO page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSEO,
      message: "SEO data updated successfully",
    });
  } catch (error) {
    console.error("Error updating SEO data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update SEO data" },
      { status: 500 }
    );
  }
}
