import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    gallery: [
      {
        type: String,
        trim: true,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    // Technical Specifications (e.g., Material, Thickness)
    technicalSpecs: [
      {
        label: {
          type: String,
          trim: true,
        },
        value: {
          type: String,
          trim: true,
        },
      },
    ],
    // Applications/Sectors (e.g., Automotive, Electronics)
    applications: [
      {
        type: String,
        trim: true,
      },
    ],
    // Quick tags/badges (e.g., Made in India, Custom Sizes)
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Delivery & Packaging info points
    deliveryInfo: [
      {
        type: String,
        trim: true,
      },
    ],
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    seoKeywords: {
      type: String,
      trim: true,
    },
    ogImage: {
      type: String,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
productSchema.index({ status: 1, order: 1 });
// The admin list queries { isDeleted: false } sorted by { order, createdAt }.
productSchema.index({ isDeleted: 1, order: 1, createdAt: -1 });
productSchema.index({ productName: "text", description: "text" });

// Instance method to increment views. Uses an atomic $inc rather than a
// read-modify-write save() so concurrent views don't overwrite each other.
productSchema.methods.incrementViews = async function () {
  await this.constructor.updateOne({ _id: this._id }, { $inc: { views: 1 } });
  this.views = (this.views || 0) + 1;
  return this;
};

// Static method to get active products with pagination
productSchema.statics.getActive = function (page = 1, limit = 6) {
  const query = { status: "active", isDeleted: false };

  const skip = (page - 1) * limit;

  return {
    products: this.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    total: this.countDocuments(query),
  };
};

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
