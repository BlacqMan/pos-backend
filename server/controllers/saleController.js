const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc   Create a sale and reduce stock
// @route  POST /api/sales
// @access Cashier/Admin
exports.createSale = async (req, res) => {
  try {
    const { products, cashier, paymentMethod } = req.body;

    let totalAmount = 0;

    // Loop through products to calculate total & update stock
    for (const item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      // Reduce stock
      product.quantity -= item.quantity;
      await product.save();

      // Calculate total
      totalAmount += item.quantity * item.price;
    }

    // Save the sale
    const sale = await Sale.create({
      products,
      totalAmount,
      cashier,
      paymentMethod
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all sales
// @route  GET /api/sales
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('products.product');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single sale
// @route  GET /api/sales/:id
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('products.product');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
