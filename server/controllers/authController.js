const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ===============================
// HELPER: SIGN JWT
// ===============================
const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// ===============================
// ADMIN / SUPER ADMIN LOGIN
// Email + Password
// ===============================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 🔴 IMPORTANT FIX: DO NOT check isActive for admins
    const admin = await User.findOne({
      email,
      role: { $in: ["admin", "super_admin"] },
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = signToken(admin);

    res.json({
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({
      message: "Admin login failed",
    });
  }
};

// ===============================
// CASHIER LOGIN
// PIN ONLY
// ===============================
exports.cashierLogin = async (req, res) => {
  try {
    const { pinCode } = req.body;

    if (!pinCode) {
      return res.status(400).json({
        message: "PIN code is required",
      });
    }

    // Only active cashiers can login
    const cashiers = await User.find({
      role: "cashier",
      isActive: true,
    }).select("+pinCode");

    let matchedCashier = null;

    for (const cashier of cashiers) {
      const match = await bcrypt.compare(
        pinCode,
        cashier.pinCode
      );
      if (match) {
        matchedCashier = cashier;
        break;
      }
    }

    if (!matchedCashier) {
      return res.status(401).json({
        message: "Invalid PIN",
      });
    }

    const token = signToken(matchedCashier);

    res.json({
      token,
      user: {
        _id: matchedCashier._id,
        name: matchedCashier.name,
        role: matchedCashier.role,
      },
    });
  } catch (err) {
    console.error("CASHIER LOGIN ERROR:", err);
    res.status(500).json({
      message: "Cashier login failed",
    });
  }
};
