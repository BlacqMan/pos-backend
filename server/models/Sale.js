const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile"],
      default: "cash",
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // ===============================
    // VOIDING (ADMIN ONLY)
    // ===============================
    isVoided: {
      type: Boolean,
      default: false,
    },

    voidReason: {
      type: String,
      default: null,
    },

    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    voidedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
