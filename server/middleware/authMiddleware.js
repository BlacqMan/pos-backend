const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===============================
// AUTHENTICATE TOKEN
// ===============================
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -pinCode"
    );

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // 🔒 NEVER trust frontend role
    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token invalid or expired",
    });
  }
};

// ===============================
// ADMIN ACCESS (ADMIN + SUPER ADMIN)
// ===============================
exports.requireAdmin = (req, res, next) => {
  if (!["admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Admin access required",
    });
  }
  next();
};

// ===============================
// SUPER ADMIN ONLY
// ===============================
exports.requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      message: "Super admin only action",
    });
  }
  next();
};
