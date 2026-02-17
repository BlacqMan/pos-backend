const express = require("express");
const router = express.Router();

const {
  createSale,
  getSales,
  getSaleById,
} = require("../controllers/saleController");

const { protect, requireAdmin } = require("../middleware/authMiddleware");

/* =====================================
   SALES ROUTES (PROTECTED)
===================================== */

// Create sale (cashier or admin)
router.post("/", protect, createSale);

// Get all sales (admin only)
router.get("/", protect, requireAdmin, getSales);

// Get single sale
router.get("/:id", protect, getSaleById);

module.exports = router;
