const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: function () {
        return this.role !== "cashier";
      },
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      required: function () {
        return this.role !== "cashier";
      },
      select: false,
    },

    pinCode: {
      type: String,
      required: function () {
        return this.role === "cashier";
      },
      select: false,
    },

    role: {
      type: String,
      enum: ["super_admin", "admin", "cashier"],
      default: "cashier",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ===============================
// HASH PASSWORD & PIN (FIXED)
// ===============================
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isModified("pinCode")) {
    this.pinCode = await bcrypt.hash(this.pinCode, 10);
  }
});

module.exports = mongoose.model("User", userSchema);
