import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      default: "default",
      index: { unique: true },
    },
    siteName: {
      type: String,
      required: true,
      trim: true,
      default: "Rayzor Industrial Packaging Pvt Ltd",
    },
    siteNameAccent: {
      type: String,
      trim: true,
      default: "PACK",
    },
    siteTagline: {
      type: String,
      trim: true,
      default: "Premium Packaging Solutions & LDPE Films",
    },
    siteUrl: {
      type: String,
      trim: true,
      default: "https://www.rayzorpack.com",
    },
    logo: {
      type: String,
      trim: true,
      default: null,
    },
    favicon: {
      type: String,
      trim: true,
      default: null,
    },
    companyProfile: {
      type: String,
      trim: true,
      default: null,
    },
    googleAnalyticsId: {
      type: String,
      trim: true,
      default: null,
    },
    ga4PropertyId: {
      type: String,
      trim: true,
      default: null,
    },
    ga4ServiceAccountKey: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.index({ isActive: 1 });

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

// Default settings data
const defaultSettingsData = {
  id: "default",
  siteName: "Rayzor Industrial Packaging Pvt Ltd",
  siteTagline: "Premium Packaging Solutions & LDPE Films",
  logo: null,
  favicon: null,
  isActive: true,
  lastUpdated: new Date(),
};

// Auto-seed function
const autoSeedSettings = async () => {
  try {
    const count = await Settings.countDocuments();
    if (count === 0) {
      await Settings.create(defaultSettingsData);
      console.log("✅ Settings database auto-seeded with default data");
    }
  } catch (error) {
    console.error("❌ Error auto-seeding settings data:", error);
  }
};

// Auto-seed when model is first loaded
if (mongoose.connection.readyState === 1) {
  autoSeedSettings();
} else {
  mongoose.connection.once("open", autoSeedSettings);
}

export default Settings;
