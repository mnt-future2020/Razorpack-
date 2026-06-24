import mongoose from "mongoose";

const emailSMTPSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      default: "default",
      index: { unique: true }
    },
    smtpHost: {
      type: String,
      required: true,
      trim: true,
      default: "smtp.gmail.com"
    },
    smtpPort: {
      type: String,
      required: true,
      trim: true,
      default: "587"
    },
    smtpUser: {
      type: String,
      required: true,
      trim: true
    },
    smtpPassword: {
      type: String,
      required: true,
      trim: true
    },
    fromEmail: {
      type: String,
      required: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    fromName: {
      type: String,
      required: true,
      trim: true,
      default: "Rayzor Industrial Packaging Pvt Ltd"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastTested: {
      type: Date,
      default: null
    },
    testStatus: {
      type: String,
      enum: ["success", "failed", "never"],
      default: "never"
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Create index for better performance
emailSMTPSchema.index({ isActive: 1 });

const EmailSMTP = mongoose.models.EmailSMTP || mongoose.model("EmailSMTP", emailSMTPSchema);

// Default SMTP data from environment variables
const defaultSMTPData = {
  id: "default",
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: process.env.SMTP_PORT || "587",
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASS || "",
  fromEmail: process.env.SMTP_FROM_EMAIL || "",
  fromName: "Rayzor Industrial Packaging Pvt Ltd",
  isActive: true,
  testStatus: "never",
  lastUpdated: new Date()
};

// Auto-seed function
const autoSeedSMTP = async () => {
  try {
    const count = await EmailSMTP.countDocuments();
    if (count === 0 && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM_EMAIL) {
      await EmailSMTP.create(defaultSMTPData);
      console.log("✅ SMTP database auto-seeded with default data");
    }
  } catch (error) {
    console.error("❌ Error auto-seeding SMTP data:", error);
  }
};

// Auto-seed when model is first loaded
if (mongoose.connection.readyState === 1) {
  autoSeedSMTP();
} else {
  mongoose.connection.once("open", autoSeedSMTP);
}

export default EmailSMTP;
