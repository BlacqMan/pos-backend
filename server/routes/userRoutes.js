const express = require("express");
const router = express.Router();

const {
  getUsers,
  deleteUser,
} = require("../controllers/userController");

const {
  protect,
  requireAdmin,
} = require("../middleware/authMiddleware");

// ===============================
// GET ALL USERS (ADMIN / SUPER ADMIN)
// ===============================
router.get(
  "/",
  protect,
  requireAdmin,
  getUsers
);

// ===============================
// DELETE USER (ADMIN / SUPER ADMIN)
// ===============================
router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteUser
);

module.exports = router;
