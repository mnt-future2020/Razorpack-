import mongoose from "mongoose";

// The company profile PDF is stored here as bytes rather than on Cloudinary,
// because Cloudinary's "restricted media types" setting denies delivery of PDFs
// (401 "deny or ACL failure") for plain, fl_attachment, signed AND extensionless
// URLs alike — server-side fetches included, so a proxy cannot work around it.
//
// Kept in its own collection, NOT on the settings document: the settings GET is
// public and runs on every page load via SWR, and a multi-MB blob riding along
// with it would be paid for on every request.
const companyProfileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      default: "default",
      index: { unique: true },
    },
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      default: "application/pdf",
    },
    filename: {
      type: String,
      trim: true,
      default: "company-profile.pdf",
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const CompanyProfile =
  mongoose.models.CompanyProfile ||
  mongoose.model("CompanyProfile", companyProfileSchema, "companyprofiles");

export default CompanyProfile;
