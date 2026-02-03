const Shift = require("../models/Shift");
const Sale = require("../models/Sale");

// ===============================
// START SHIFT
// ===============================
exports.startShift = async (req, res) => {
  try {
    const cashierId = req.user.id;

    const existingShift = await Shift.findOne({
      cashier: cashierId,
      status: "open",
    });

    if (existingShift) {
      return res.status(400).json({
        message: "Shift already started",
      });
    }

    const shift = await Shift.create({
      cashier: cashierId,
      startTime: new Date(),
    });

    res.status(201).json(shift);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// END SHIFT + CALCULATE REPORT
// ===============================
exports.endShift = async (req, res) => {
  try {
    const cashierId = req.user.id;

    const shift = await Shift.findOne({
      cashier: cashierId,
      status: "open",
    });

    if (!shift) {
      return res.status(400).json({
        message: "No active shift found",
      });
    }

    const endTime = new Date();

    const sales = await Sale.find({
      cashier: cashierId,
      createdAt: {
        $gte: shift.startTime,
        $lte: endTime,
      },
    });

    let totalSales = 0;
    let totalAmount = 0;
    let voidedSales = 0;

    sales.forEach((sale) => {
      if (sale.isVoided) {
        voidedSales++;
      } else {
        totalSales++;
        totalAmount += sale.totalAmount;
      }
    });

    shift.endTime = endTime;
    shift.status = "closed";
    shift.totalSales = totalSales;
    shift.totalAmount = totalAmount;
    shift.voidedSales = voidedSales;

    await shift.save();

    res.json({
      message: "Shift closed successfully",
      shift,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
