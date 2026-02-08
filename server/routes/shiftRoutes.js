const express = require("express");
const router = express.Router();

const {
  startShift,
  endShift,
  getActiveShift   // NEW
} = require("../controllers/shiftController");

const { protect } = require("../middleware/authMiddleware");

/* ===============================
   SHIFT ROUTES
=============================== */

// Start shift
router.post("/start", protect, startShift);

// End shift
router.post("/end", protect, endShift);

// Get active shift (NEW)
router.get("/active", protect, getActiveShift);

module.exports = router;
