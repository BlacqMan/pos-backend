const express = require("express");
const router = express.Router();

const {
  createCashier,
  createAdmin,
  getAllSales,
  voidSale,
  getShiftReports,
  getEndOfDaySummary,
} = require("../controllers/adminController");

const {
  protect,
  requireAdmin,
  requireSuperAdmin,
} = require("../middleware/authMiddleware");

// ===============================
// CREATE CASHIERS (ADMIN + SUPER ADMIN)
// ===============================
router.post(
  "/cashiers",
  protect,
  requireAdmin,
  createCashier
);

// ===============================
// CREATE ADMIN (SUPER ADMIN ONLY)
// ===============================
router.post(
  "/admins",
  protect,
  requireSuperAdmin,
  createAdmin
);

// ===============================
// SALES & REPORTS (ADMIN + SUPER ADMIN)
// ===============================
router.get(
  "/sales",
  protect,
  requireAdmin,
  getAllSales
);

router.post(
  "/sales/void",
  protect,
  requireAdmin,
  voidSale
);

router.get(
  "/shift-reports",
  protect,
  requireAdmin,
  getShiftReports
);

router.get(
  "/end-of-day",
  protect,
  requireAdmin,
  getEndOfDaySummary
);

module.exports = router;
