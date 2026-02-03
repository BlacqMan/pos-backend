const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: mongoose.Schema.Types.ObjectId,
    details: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
