import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: "Admin",
      enum: ["Admin", "Super Admin"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Virtual for full name
adminSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Pre-save middleware to hash password
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    throw error
  }
})

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Method to check if account is locked
adminSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
}

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    })
  }

  const updates = { $inc: { loginAttempts: 1 } }

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }

  return this.updateOne(updates)
}

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  })
}

// Static method to find by credentials
adminSchema.statics.findByCredentials = async function (email, password) {
  const admin = await this.findOne({ email, isActive: true })

  if (!admin) {
    throw new Error("Invalid login credentials")
  }

  if (admin.isLocked()) {
    throw new Error("Account is temporarily locked due to too many failed login attempts")
  }

  const isMatch = await admin.comparePassword(password)

  if (!isMatch) {
    await admin.incLoginAttempts()
    throw new Error("Invalid login credentials")
  }

  // Reset login attempts on successful login
  if (admin.loginAttempts > 0) {
    await admin.resetLoginAttempts()
  }

  // Update last login
  admin.lastLogin = new Date()
  await admin.save()

  return admin
}

// Static method to seed an initial admin. Intentionally NOT run automatically
// on DB connect — invoke it manually from a one-off script when bootstrapping a
// new environment. The password comes from INITIAL_ADMIN_PASSWORD; there is no
// hardcoded fallback, so a deleted admin is never silently recreated.
adminSchema.statics.createInitialAdmin = async function () {
  const email = process.env.INITIAL_ADMIN_EMAIL
  const password = process.env.INITIAL_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      "INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be set to seed an admin",
    )
  }

  const existingAdmin = await this.findOne({ email })
  if (existingAdmin) {
    console.log("Initial admin already exists")
    return existingAdmin
  }

  const initialAdmin = new this({
    firstName: process.env.INITIAL_ADMIN_FIRST_NAME || "Admin",
    lastName: process.env.INITIAL_ADMIN_LAST_NAME || "User",
    email,
    password,
    role: "Super Admin",
    emailVerified: true,
    isActive: true,
  })

  await initialAdmin.save()
  console.log("Initial admin created successfully")
  return initialAdmin
}

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema)

export default Admin
