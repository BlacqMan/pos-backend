const Shift = require("../models/Shift");
const Sale = require("../models/Sale");

/* ===============================
   START SHIFT
=============================== */
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

/* ===============================
   END SHIFT + RECONCILIATION
=============================== */
exports.endShift = async (req, res) => {
  try {
    const cashierId = req.user.id;

    const { countedCash = 0, countedMoMo = 0, countedCard = 0 } = req.body;

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

    let expectedCash = 0;
    let expectedMoMo = 0;
    let expectedCard = 0;

    sales.forEach((sale) => {
      if (sale.isVoided) {
        voidedSales++;
      } else {
        totalSales++;
        totalAmount += sale.totalAmount;

        if (sale.paymentMethod === "cash") {
          expectedCash += sale.totalAmount;
        }

        if (sale.paymentMethod === "momo") {
          expectedMoMo += sale.totalAmount;
        }

        if (sale.paymentMethod === "card") {
          expectedCard += sale.totalAmount;
        }
      }
    });

    // ===============================
    // CALCULATE DIFFERENCES
    // ===============================
    const cashDifference = countedCash - expectedCash;
    const momoDifference = countedMoMo - expectedMoMo;
    const cardDifference = countedCard - expectedCard;

    // ===============================
    // UPDATE SHIFT
    // ===============================
    shift.endTime = endTime;
    shift.status = "closed";

    shift.totalSales = totalSales;
    shift.totalAmount = totalAmount;
    shift.voidedSales = voidedSales;

    shift.expectedCash = expectedCash;
    shift.expectedMoMo = expectedMoMo;
    shift.expectedCard = expectedCard;

    shift.countedCash = countedCash;
    shift.countedMoMo = countedMoMo;
    shift.countedCard = countedCard;

    shift.cashDifference = cashDifference;
    shift.momoDifference = momoDifference;
    shift.cardDifference = cardDifference;

    await shift.save();

    res.json({
      message: "Shift closed with reconciliation",
      shift,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET ACTIVE SHIFT
=============================== */
exports.getActiveShift = async (req, res) => {
  try {
    const cashierId = req.user.id;

    const shift = await Shift.findOne({
      cashier: cashierId,
      status: "open",
    });

    if (!shift) {
      return res.json({
        active: false,
      });
    }

    res.json({
      active: true,
      shift,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
