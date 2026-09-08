import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Settings from "@/config/utils/admin/settings/settingsSchema";
import CompanyProfile from "@/config/utils/admin/settings/companyProfileSchema";
import { uploadToCloudinary, deleteByUrl } from "@/config/utils/cloudinary";
import { verifyAdmin } from "@/lib/admin-auth";

// Cloudinary (and some drivers) reject with a plain object rather than an
// Error, so `instanceof Error` alone reports "Unknown error" and hides the real
// cause — e.g. "cloud_name is disabled" when credentials are missing.
function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
    try {
      return JSON.stringify(error);
    } catch {
      return "Unserialisable error";
    }
  }
  return "Unknown error";
}

// GET - Fetch site settings
export async function GET() {
  try {
    await connectDB();

    // Must match the PUT filter below — reading by isActive while writing by id
    // meant the two could resolve to different documents.
    const settings = await Settings.findOne({ id: "default" }).lean();

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "No active settings found",
        },
        { status: 404 }
      );
    }

    // Never expose sensitive credentials to the client
    const { ga4ServiceAccountKey, ...safeSettings } = settings as Record<string, unknown>;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...safeSettings,
          // Only indicate whether a key is configured, never return the actual key
          ga4ServiceAccountKeyConfigured: !!ga4ServiceAccountKey,
        },
        message: "Site settings fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching site settings:", error);
    // This GET is intentionally public — the storefront reads siteName, logo,
    // favicon and the GA id from it. Internal error text must not ride along.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch site settings",
      },
      { status: 500 }
    );
  }
}

// Helper function to upload base64 image to Cloudinary
async function uploadBase64Image(
  base64Data: string,
  type: "logo" | "favicon"
): Promise<string> {
  try {
    const base64Image = base64Data.split(";base64,").pop();
    if (!base64Image) {
      throw new Error("Invalid base64 data");
    }

    const imageBuffer = Buffer.from(base64Image, "base64");
    const result = await uploadToCloudinary(imageBuffer, `settings/${type}`);

    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${type} to Cloudinary:`, error);
    throw new Error(`Failed to upload ${type} file`);
  }
}

// PUT - Update site settings
export async function PUT(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  try {
    await connectDB();

    const body = await request.json();
    const { siteName, siteNameAccent, siteTagline, siteUrl, logo, favicon, companyProfile, googleAnalyticsId, ga4PropertyId, ga4ServiceAccountKey } = body;

    // Get current settings to access old file paths
    const currentSettings = await Settings.findOne({ id: "default" });

    let logoPath = logo;
    let faviconPath = favicon;

    // Handle logo upload if it's base64 data
    if (logo && logo.startsWith("data:image/")) {
      // Delete old logo from Cloudinary if it exists
      if (currentSettings?.logo) {
        await deleteByUrl(currentSettings.logo);
      }
      logoPath = await uploadBase64Image(logo, "logo");
    }

    // Handle favicon upload if it's base64 data
    if (favicon && favicon.startsWith("data:image/")) {
      // Delete old favicon from Cloudinary if it exists
      if (currentSettings?.favicon) {
        await deleteByUrl(currentSettings.favicon);
      }
      faviconPath = await uploadBase64Image(favicon, "favicon");
    }

    // Handle company profile PDF upload if it's base64 data.
    //
    // Stored in Mongo, not Cloudinary: Cloudinary's "restricted media types"
    // setting denies PDF delivery (401 "deny or ACL failure") for every URL
    // form including signed and extensionless ones, and denies server-side
    // fetches too, so no proxy can work around it.
    let companyProfilePath = companyProfile;
    if (companyProfile && companyProfile.startsWith("data:")) {
      const base64Data = companyProfile.split(";base64,").pop();
      if (base64Data) {
        const buffer = Buffer.from(base64Data, "base64");

        // A BSON document is capped at 16MB; leave headroom for the rest.
        if (buffer.byteLength > 15 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, message: "PDF is too large — maximum 15MB" },
            { status: 413 }
          );
        }

        // Clean up any copy left on Cloudinary by the previous implementation.
        if (currentSettings?.companyProfile?.startsWith("http")) {
          await deleteByUrl(currentSettings.companyProfile);
        }

        await CompanyProfile.findOneAndUpdate(
          { id: "default" },
          {
            data: buffer,
            contentType: "application/pdf",
            filename: "company-profile.pdf",
            size: buffer.byteLength,
          },
          { upsert: true }
        );

        // Settings holds the route that serves it, not a remote URL.
        companyProfilePath = "/api/company-profile";
      }
    } else if (companyProfile === null && currentSettings?.companyProfile) {
      // "Remove" in the admin UI — drop the bytes too rather than orphan them.
      if (currentSettings.companyProfile.startsWith("http")) {
        await deleteByUrl(currentSettings.companyProfile);
      }
      await CompanyProfile.deleteOne({ id: "default" });
    }

    // Find and update the settings
    const updatedSettings = await Settings.findOneAndUpdate(
      { id: "default" },
      {
        ...(siteName && { siteName }),
        ...(siteNameAccent !== undefined && { siteNameAccent }),
        ...(siteTagline !== undefined && { siteTagline }),
        ...(siteUrl !== undefined && { siteUrl }),
        ...(logoPath !== undefined && { logo: logoPath }),
        ...(faviconPath !== undefined && { favicon: faviconPath }),
        ...(companyProfilePath !== undefined && { companyProfile: companyProfilePath }),
        ...(googleAnalyticsId !== undefined && { googleAnalyticsId }),
        ...(ga4PropertyId !== undefined && { ga4PropertyId }),
        ...(ga4ServiceAccountKey !== undefined && { ga4ServiceAccountKey }),
        lastUpdated: new Date(),
      },
      { new: true, runValidators: true, upsert: true }
    );

    // Strip sensitive credentials from response
    const responseData = updatedSettings.toObject();
    delete responseData.ga4ServiceAccountKey;
    responseData.ga4ServiceAccountKeyConfigured = !!updatedSettings.ga4ServiceAccountKey;

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Site settings updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating site settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update site settings",
        error: describeError(error),
      },
      { status: 500 }
    );
  }
}

// POST - Reset settings to default
export async function POST(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  try {
    await connectDB();

    // Get current settings to clean up old files
    const currentSettings = await Settings.findOne({ id: "default" });

    // Delete old logo and favicon from Cloudinary if they exist
    if (currentSettings?.logo) {
      await deleteByUrl(currentSettings.logo);
    }
    if (currentSettings?.favicon) {
      await deleteByUrl(currentSettings.favicon);
    }

    const defaultSettings = {
      id: "default",
      siteName: "Rayzor Industrial Packaging Pvt Ltd",
      siteTagline: "Premium Packaging Solutions & LDPE Films",
      siteUrl: "https://www.rayzorpack.com",
      logo: null,
      favicon: null,
      googleAnalyticsId: null,
      ga4PropertyId: null,
      ga4ServiceAccountKey: null,
      isActive: true,
      lastUpdated: new Date(),
    };

    const resetSettings = await Settings.findOneAndUpdate(
      { id: "default" },
      defaultSettings,
      { new: true, runValidators: true, upsert: true }
    );

    const resetData = resetSettings.toObject();
    delete resetData.ga4ServiceAccountKey;
    resetData.ga4ServiceAccountKeyConfigured = false;

    return NextResponse.json(
      {
        success: true,
        data: resetData,
        message: "Site settings reset to default successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting site settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset site settings",
        error: describeError(error),
      },
      { status: 500 }
    );
  }
}
