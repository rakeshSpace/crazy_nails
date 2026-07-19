// backend/src/routes/paymentRoutes.js

const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const router = express.Router();

// Make sure createOrder and verifyPayment are properly imported
console.log('createOrder function:', typeof createOrder);
console.log('verifyPayment function:', typeof verifyPayment);

// Routes
router.post('/create-order', authenticate, createOrder);
router.post('/verify-payment', authenticate, verifyPayment);

module.exports = router;