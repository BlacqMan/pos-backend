const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Counter = require("../models/Counter");

/* ========================================
   🔢 GENERATE NEXT INVOICE NUMBER
======================================== */
const getNextInvoiceNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "invoice" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.value).padStart(6, "0");
  return `INV-${padded}`;
};

/* ========================================
   CREATE SALE (Supermarket Safe + Invoice)
======================================== */
exports.createSale = async (req, res) => {
  try {
    const { products, cashier, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }

    let totalAmount = 0;

    // ========================================
    // 1️⃣ VALIDATE ALL PRODUCTS FIRST
    // ========================================
    for (const item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.quantity <= 0) {
        return res.status(400).json({
          message: `${product.name} is out of stock`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }
    }

    // ========================================
    // 2️⃣ DEDUCT STOCK AFTER VALIDATION
    // ========================================
    for (const item of products) {
      const product = await Product.findById(item.product);

      product.quantity -= item.quantity;
      await product.save();

      totalAmount += item.quantity * item.price;
    }

    // ========================================
    // 3️⃣ GENERATE INVOICE NUMBER
    // ========================================
    const invoiceNumber = await getNextInvoiceNumber();

    // ========================================
    // 4️⃣ CREATE SALE
    // ========================================
    const sale = await Sale.create({
      invoiceNumber,
      products,
      totalAmount,
      cashier,
      paymentMethod,
    });

    res.status(201).json(sale);

  } catch (error) {
  console.error("CREATE SALE ERROR:", error);
  res.status(500).json({ message: error.message });
}
};

/* ========================================
   GET ALL SALES
======================================== */
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("products.product")
      .populate("cashier", "name role")
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================
   GET SINGLE SALE
======================================== */
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("products.product")
      .populate("cashier", "name role");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
