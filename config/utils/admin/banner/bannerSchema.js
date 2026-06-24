import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    pageKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    // For home page - support multiple images (carousel)
    images: {
      type: [String],
      default: [],
    },
    // Hero carousel slide data
    slides: {
      type: [
        {
          imageUrl: { type: String, trim: true },
          title: { type: String, trim: true },
          highlight: { type: String, trim: true },
          tagline: { type: String, trim: true },
          description: { type: String, trim: true },
          primaryCtaLabel: { type: String, trim: true },
          primaryCtaHref: { type: String, trim: true },
          secondaryCtaLabel: { type: String, trim: true },
          secondaryCtaHref: { type: String, trim: true },
        },
      ],
      default: [],
    },
    // Page hero text fields (for services, products, about, etc.)
    label: {
      type: String,
      trim: true,
    },
    headingLine1: {
      type: String,
      trim: true,
    },
    headingLine2: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    mobileImage: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ pageKey: 1, status: 1 });
bannerSchema.index({ title: "text", pageKey: "text" });

const Banner =
  mongoose.models.Banner || mongoose.model("Banner", bannerSchema);

export default Banner;
