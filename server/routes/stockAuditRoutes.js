const express = require("express");
const router = express.Router();

const {
  getProductStockAudit,
} = require("../controllers/stockAuditController");

const {
  protect,
  requireAdmin,
} = require("../middleware/authMiddleware");

// Admin & Super Admin only
router.get(
  "/:productId",
  protect,
  requireAdmin,
  getProductStockAudit
);

module.exports = router;
