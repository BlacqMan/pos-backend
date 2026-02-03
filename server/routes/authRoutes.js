const express = require("express");
const router = express.Router();
const {
  adminLogin,
  cashierLogin,
} = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");


//router.post("/admin/login", adminLogin);
//router.post("/cashier/login", cashierLogin);

router.post("/admin-login", authLimiter, adminLogin);
router.post("/cashier-login", authLimiter, cashierLogin);

module.exports = router;
