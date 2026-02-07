const StockAudit = require("../models/StockAudit");

exports.getProductStockAudit = async (req, res) => {
  try {
    const audits = await StockAudit.find({
      product: req.params.productId,
    })
      .populate("changedBy", "name role email")
      .sort({ createdAt: -1 });

    res.json(audits);
  } catch {
    res.status(500).json({
      message: "Failed to load stock audit history",
    });
  }
};
