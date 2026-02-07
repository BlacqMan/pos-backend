const mongoose = require("mongoose");

const stockAuditSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "super_admin", "cashier"],
      required: true,
    },
    beforeQty: {
      type: Number,
      required: true,
    },
    afterQty: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: "manual adjustment",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockAudit", stockAuditSchema);
