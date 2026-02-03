const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};
