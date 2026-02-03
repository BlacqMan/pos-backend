const express = require("express");
const router = express.Router();
const {
  startShift,
  endShift,
} = require("../controllers/shiftController");
const { protect } = require("../middleware/authMiddleware");

router.post("/start", protect, startShift);
router.post("/end", protect, endShift);

module.exports = router;
