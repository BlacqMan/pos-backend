const Product = require("../models/Product");

/* ===============================
   HELPERS
=============================== */
const generateBarcode = () => {
  // Simple unique barcode (timestamp + random)
  return (
    Date.now().toString() +
    Math.floor(100 + Math.random() * 900).toString()
  );
};

/* ===============================
   CREATE PRODUCT
=============================== */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      quantity,
      category,
      barcode,
      isActive = true,
    } = req.body;

    // ✅ Basic validation
    if (!name || price == null || quantity == null || !category) {
      return res.status(400).json({
        message: "Name, price, quantity and category are required",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      quantity: Number(quantity),
      category,
      isActive,
      barcode: barcode || generateBarcode(), // ✅ auto-generate
    });

    const populatedProduct = await product.populate("category");

    res.status(201).json(populatedProduct);
  } catch (error) {
    // ✅ Handle duplicate barcode nicely
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate barcode detected. Please try again.",
      });
    }

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

/* ===============================
   GET PRODUCTS
=============================== */
exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load products",
    });
  }
};

/* ===============================
   GET PRODUCT BY ID
=============================== */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};

/* ===============================
   UPDATE PRODUCT
=============================== */
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Ensure numbers stay numbers
    if (updateData.price != null) {
      updateData.price = Number(updateData.price);
    }

    if (updateData.quantity != null) {
      updateData.quantity = Number(updateData.quantity);
    }

    // If barcode is empty, remove it so it won't overwrite
    if (updateData.barcode === "") {
      delete updateData.barcode;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate barcode detected",
      });
    }

    res.status(400).json({
      message: "Failed to update product",
    });
  }
};

/* ===============================
   DELETE PRODUCT
=============================== */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};
