const express = require('express');
const router = express.Router();
const { createSale, getSales, getSaleById } = require('../controllers/saleController');

router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);

module.exports = router;
