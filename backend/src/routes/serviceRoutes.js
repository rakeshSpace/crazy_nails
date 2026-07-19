const express = require('express');
const { 
    getServices, 
    getServiceById, 
    createService, 
    updateService, 
    deleteService,
    bulkUpdateOffers
} = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', authenticate, authorize('admin'), upload.single('image'), createService);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updateService);
router.delete('/:id', authenticate, authorize('admin'), deleteService);
router.post('/bulk-offer', authenticate, authorize('admin'), bulkUpdateOffers);

module.exports = router;