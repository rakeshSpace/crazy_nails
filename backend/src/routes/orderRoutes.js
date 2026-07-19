const express = require('express');
const {
    createOrderFromCart,
    verifyRazorpayPayment,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getDeliveryUpdates,
    getAllOrders,
    updateDeliverySettings,
    getDeliverySettingsAPI,
    requestReturn,
    cancelOrder,
    adminCancelOrder,
    processReturn,
    generateInvoice,
    updateTracking,
    addDeliveryUpdate
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// ============ USER ROUTES (Authentication Required) ============
router.use(authenticate);

// Order creation and payment
router.post('/create', createOrderFromCart);
router.post('/verify-payment', verifyRazorpayPayment);

// User order views
router.get('/my-orders', getUserOrders);
router.get('/delivery-settings', getDeliverySettingsAPI);
router.get('/:id', getOrderById);
router.get('/:id/tracking', getDeliveryUpdates);

// User actions
router.post('/request-return', requestReturn);
router.put('/:id/cancel', cancelOrder);

// ============ ADMIN ONLY ROUTES ============
// Order management
router.put('/:id/status', authorize('admin'), updateOrderStatus);
router.get('/admin/all', authorize('admin'), getAllOrders);
router.put('/admin/delivery-settings', authorize('admin'), updateDeliverySettings);

// Admin order actions
router.put('/admin/:id/cancel', authorize('admin'), adminCancelOrder);
router.put('/admin/:id/process-return', authorize('admin'), processReturn);
router.get('/admin/:id/invoice', authorize('admin'), generateInvoice);
router.put('/admin/:id/tracking', authorize('admin'), updateTracking);
router.post('/admin/:id/delivery-update', authorize('admin'), addDeliveryUpdate);

module.exports = router;