const mongoose = require("mongoose");

const generateBarcode = () => {
  return Date.now().toString(); // simple & unique
};

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },

    barcode: {
      type: String,
      unique: true,
      default: generateBarcode, // 👈 AUTO-GENERATE
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
