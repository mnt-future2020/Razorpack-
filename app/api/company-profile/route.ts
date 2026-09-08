import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import CompanyProfile from "@/config/utils/admin/settings/companyProfileSchema";

/**
 * Serves the company profile PDF from our own origin.
 *
 * The bytes live in MongoDB rather than Cloudinary: Cloudinary's "restricted
 * media types" setting denies PDF delivery outright — plain, fl_attachment,
 * signed and extensionless URLs all return 401 "deny or ACL failure", and the
 * denial applies to server-side fetches too, so proxying Cloudinary is not an
 * option.
 *
 * Serving same-origin also makes the HTML `download` attribute work, which it
 * never does cross-origin.
 *
 * `?inline=1` renders in the browser instead of downloading — used by the
 * admin "View current PDF" link.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // NOT .lean(): a lean read hands back the raw BSON Binary rather than a
    // Node Buffer, and wrapping that in Uint8Array silently yields zero bytes —
    // a 200 response with an empty body.
    const profile = await CompanyProfile.findOne({ id: "default" });

    if (!profile?.data) {
      return NextResponse.json(
        { success: false, message: "No company profile has been uploaded" },
        { status: 404 }
      );
    }

    const bytes = Buffer.isBuffer(profile.data)
      ? profile.data
      : Buffer.from(profile.data as unknown as ArrayBufferLike);

    const inline = request.nextUrl.searchParams.get("inline") === "1";
    const filename = profile.filename || "company-profile.pdf";

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": profile.contentType || "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
        "Content-Length": String(bytes.byteLength),
        // Replaced in place on re-upload, so don't let a stale copy live long.
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Error serving company profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to serve company profile" },
      { status: 500 }
    );
  }
}
