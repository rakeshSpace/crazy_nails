const express = require('express');
const {
    submitApplication,
    getAllApplications,
    updateApplicationStatus,
    getAllFranchises,
    getFranchiseRevenue,
    updateFranchiseStatus
    // getApplicationById and getFranchiseById ko hata diya (abhi implement nahi hai)
} = require('../controllers/franchiseController');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Public routes (no authentication required)
router.post('/apply', submitApplication);

// Admin only routes
router.get('/applications', authenticate, authorize('admin'), getAllApplications);
router.put('/applications/:id/status', authenticate, authorize('admin'), updateApplicationStatus);
router.get('/partners', authenticate, authorize('admin'), getAllFranchises);
router.get('/revenue/:id', authenticate, authorize('admin'), getFranchiseRevenue);
router.put('/partners/:id/status', authenticate, authorize('admin'), updateFranchiseStatus);

module.exports = router;