const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  protect,
  requireAdmin,
} = require("../middleware/authMiddleware");

// ===============================
// PRODUCTS
// ===============================

// Anyone logged in can view products (POS, Admin, Cashier)
router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);

// Only Admin & Super Admin can modify products
router.post("/", protect, requireAdmin, createProduct);
router.put("/:id", protect, requireAdmin, updateProduct);
router.delete("/:id", protect, requireAdmin, deleteProduct);

module.exports = router;
