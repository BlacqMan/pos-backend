const mongoose = require("mongoose");

// ===============================
// Barcode Generator
// ===============================
const generateBarcode = () => {
  return (
    Date.now().toString() +
    Math.floor(Math.random() * 1000).toString()
  );
};

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    barcode: {
      type: String,
      unique: true,
      default: generateBarcode,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ===============================
// Prevent Negative Stock (FINAL SAFE VERSION)
// ===============================
productSchema.pre("save", async function () {
  if (this.quantity < 0) {
    throw new Error("Stock cannot be negative");
  }
});

module.exports = mongoose.model("Product", productSchema);
