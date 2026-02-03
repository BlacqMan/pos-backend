const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Sale = require("../models/Sale");
const Shift = require("../models/Shift");
const AuditLog = require("../models/AuditLog");

// ===============================
// ROLE CHECK HELPERS
// ===============================
const requireAdminOrSuperAdmin = (req, res) => {
  if (!req.user || !["admin", "super_admin"].includes(req.user.role)) {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }
  return true;
};

const requireSuperAdmin = (req, res) => {
  if (!req.user || req.user.role !== "super_admin") {
    res.status(403).json({ message: "Super admin only action" });
    return false;
  }
  return true;
};

// ===============================
// CREATE ADMIN (SUPER ADMIN ONLY)
// ===============================
exports.createAdmin = async (req, res) => {
  if (!requireSuperAdmin(req, res)) return;

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "Admin with this email already exists",
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    // Safe audit log
    try {
      await AuditLog.create({
        action: "CREATE_ADMIN",
        performedBy: req.user.id,
        targetId: admin._id,
        details: { email },
      });
    } catch (e) {
      console.error("Audit log error:", e.message);
    }

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("CREATE ADMIN ERROR:", err);
    res.status(500).json({ message: "Failed to create admin" });
  }
};

// ===============================
// CREATE CASHIER (ADMIN + SUPER)
// ===============================
exports.createCashier = async (req, res) => {
  if (!requireAdminOrSuperAdmin(req, res)) return;

  try {
    const { name, pinCode } = req.body;

    if (!name || !pinCode) {
      return res.status(400).json({
        message: "Name and PIN code are required",
      });
    }

    if (pinCode.length < 4) {
      return res.status(400).json({
        message: "PIN must be at least 4 digits",
      });
    }

    const exists = await User.findOne({ name });
    if (exists) {
      return res.status(400).json({
        message: "User with this name already exists",
      });
    }

    const cashier = await User.create({
      name,
      pinCode,
      role: "cashier",
    });

    // Safe audit log
    try {
      await AuditLog.create({
        action: "CREATE_CASHIER",
        performedBy: req.user.id,
        targetId: cashier._id,
        details: { name },
      });
    } catch (e) {
      console.error("Audit log error:", e.message);
    }

    res.status(201).json({
      message: "Cashier created successfully",
      cashier: {
        _id: cashier._id,
        name: cashier.name,
        role: cashier.role,
      },
    });
  } catch (err) {
    console.error("CREATE CASHIER ERROR:", err);
    res.status(500).json({ message: "Failed to create cashier" });
  }
};

// ===============================
// GET ALL SALES (ADMIN)
// ===============================
exports.getAllSales = async (req, res) => {
  if (!requireAdminOrSuperAdmin(req, res)) return;

  try {
    const sales = await Sale.find()
      .populate("cashier", "name role")
      .populate("voidedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales" });
  }
};

// ===============================
// VOID SALE (ADMIN + PASSWORD)
// ===============================
exports.voidSale = async (req, res) => {
  if (!requireAdminOrSuperAdmin(req, res)) return;

  try {
    const { saleId, reason, adminPassword } = req.body;

    if (!saleId || !reason || !adminPassword) {
      return res.status(400).json({
        message: "Sale ID, reason, and admin password are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      return res.status(400).json({ message: "Invalid sale ID" });
    }

    const admin = await User.findById(req.user.id).select("+password");
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const valid = await bcrypt.compare(adminPassword, admin.password);
    if (!valid) {
      return res.status(401).json({ message: "Incorrect admin password" });
    }

    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.isVoided) {
      return res.status(400).json({ message: "Sale already voided" });
    }

    sale.isVoided = true;
    sale.voidReason = reason;
    sale.voidedBy = req.user.id;
    sale.voidedAt = new Date();

    await sale.save();

    try {
      await AuditLog.create({
        action: "VOID_SALE",
        performedBy: req.user.id,
        targetId: sale._id,
        details: { reason },
      });
    } catch (e) {
      console.error("Audit log error:", e.message);
    }

    res.json({
      message: "Sale voided successfully",
      sale,
    });
  } catch (err) {
    console.error("VOID SALE ERROR:", err);
    res.status(500).json({ message: "Failed to void sale" });
  }
};

// ===============================
// SHIFT REPORTS (ADMIN)
// ===============================
exports.getShiftReports = async (req, res) => {
  if (!requireAdminOrSuperAdmin(req, res)) return;

  try {
    const shifts = await Shift.find({ status: "closed" })
      .populate("cashier", "name role")
      .sort({ endTime: -1 });

    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shift reports" });
  }
};

// ===============================
// END OF DAY SUMMARY (ADMIN)
// ===============================
exports.getEndOfDaySummary = async (req, res) => {
  if (!requireAdminOrSuperAdmin(req, res)) return;

  try {
    const { date } = req.query;

    const start = date
      ? new Date(`${date}T00:00:00.000Z`)
      : new Date(new Date().setHours(0, 0, 0, 0));

    const end = date
      ? new Date(`${date}T23:59:59.999Z`)
      : new Date(new Date().setHours(23, 59, 59, 999));

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
    });

    let totalRevenue = 0;
    let totalSales = 0;
    let totalVoids = 0;

    sales.forEach((sale) => {
      if (sale.isVoided) {
        totalVoids++;
      } else {
        totalSales++;
        totalRevenue += sale.totalAmount;
      }
    });

    res.json({
      date: start.toISOString().slice(0, 10),
      totalSales,
      totalVoids,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to generate end-of-day summary",
    });
  }
};
