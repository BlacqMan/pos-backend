const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    // ===============================
    // SHIFT SUMMARY (CALCULATED ON END)
    // ===============================
    totalSales: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    voidedSales: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);
