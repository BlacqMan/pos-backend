const Product = require('../models/Product');

// @desc   Create new product
// @route  POST /api/products
// @access Admin
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc   Get all products (optionally filtered by category)
// @route  GET /api/products
// @access Public
exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query; // Get category ID from query
    let filter = {};

    if (category) {
      filter.category = category; // filter products by category
    }

    const products = await Product.find(filter).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single product by ID
// @route  GET /api/products/:id
// @access Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update product
// @route  PUT /api/products/:id
// @access Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return the updated document
    ).populate('category');

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc   Delete product
// @route  DELETE /api/products/:id
// @access Admin
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
