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
    // SALES SUMMARY
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

    // ===============================
    // EXPECTED TOTALS (System)
    // ===============================
    expectedCash: {
      type: Number,
      default: 0,
    },

    expectedMoMo: {
      type: Number,
      default: 0,
    },

    expectedCard: {
      type: Number,
      default: 0,
    },

    // ===============================
    // COUNTED TOTALS (Cashier)
    // ===============================
    countedCash: {
      type: Number,
      default: 0,
    },

    countedMoMo: {
      type: Number,
      default: 0,
    },

    countedCard: {
      type: Number,
      default: 0,
    },

    // ===============================
    // DIFFERENCE
    // ===============================
    cashDifference: {
      type: Number,
      default: 0,
    },

    momoDifference: {
      type: Number,
      default: 0,
    },

    cardDifference: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);
