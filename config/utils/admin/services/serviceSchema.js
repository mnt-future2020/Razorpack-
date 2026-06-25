import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
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
    // Technical Specifications
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
    // Applications/Use Cases
    applications: [
      {
        type: String,
        trim: true,
      },
    ],
    // Process steps
    processSteps: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    // Why Choose Us points
    whyChooseUs: [
      {
        type: String,
        trim: true,
      },
    ],
    // Quick info highlights (pills)
    highlights: [
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
    views: {
      type: Number,
      default: 0,
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
serviceSchema.index({ status: 1, order: 1 });
serviceSchema.index({ serviceName: "text", description: "text" });

// Instance method to increment views
serviceSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Static method to get active services with pagination
serviceSchema.statics.getActive = function (page = 1, limit = 6) {
  const query = { status: "active", isDeleted: false };

  const skip = (page - 1) * limit;

  return {
    services: this.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    total: this.countDocuments(query),
  };
};

const Service =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default Service;
