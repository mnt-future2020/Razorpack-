import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    image: {
      type: String,
      required: [true, "Featured image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    author: {
      type: String,
      default: "Rayzor Industrial Packaging Pvt Ltd Team",
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    // SEO Fields
    seoTitle: {
      type: String,
      trim: true,
      default: "",
    },
    seoDescription: {
      type: String,
      trim: true,
      default: "",
    },
    seoKeywords: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
blogSchema.index({ published: 1, createdAt: -1 });

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default Blog;
