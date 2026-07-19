const express = require('express');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateOffers,
    getProductsWithOffers,
    getProductReviews,
    addProductReview,
    getProductImages,
    markReviewHelpful,
    uploadProductImages,
    deleteProductImage,
    setPrimaryImage,
    getPendingReviews,
    getApprovedReviews,
    getProductReviewsAdmin,
    approveReview,
    deleteReview
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// ============ PUBLIC ROUTES (No authentication required) ============
// Get all products with filters
router.get('/', getProducts);

// Get products with active offers
router.get('/with-offers', getProductsWithOffers);

// Get product reviews (public - only approved)
router.get('/:id/reviews', getProductReviews);

// Get product images (for gallery)
router.get('/:id/images', getProductImages);

// Get single product by ID
router.get('/:id', getProductById);

// ============ ADMIN ROUTES (Authentication + Admin role required) ============
// Create new product with single image
router.post('/', authenticate, authorize('admin'), upload.single('image'), createProduct);

// Update existing product
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updateProduct);

// Delete product (soft delete)
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

// Bulk update offers for multiple products
router.post('/bulk-offer', authenticate, authorize('admin'), bulkUpdateOffers);

// ============ MULTIPLE IMAGES ROUTES (Admin only) ============
// Upload multiple images for a product (up to 10 images)
router.post('/:id/images', authenticate, authorize('admin'), upload.array('images', 10), uploadProductImages);

// Delete a specific product image
router.delete('/images/:imageId', authenticate, authorize('admin'), deleteProductImage);

// Set a specific image as primary (main display image)
router.put('/:productId/images/:imageId/primary', authenticate, authorize('admin'), setPrimaryImage);

// ============ REVIEW ROUTES (Authentication required) ============
// Update the review route to handle file upload
const uploadReviewImage = require('../middleware/upload').single('review_image');
// Add a review for a product (user must be logged in)
router.post('/:id/reviews', authenticate, uploadReviewImage, addProductReview);

// Mark a review as helpful
router.post('/reviews/:reviewId/helpful', authenticate, markReviewHelpful);

// ============ REVIEW MANAGEMENT ROUTES (Admin only) ============
// Get all pending reviews
router.get('/reviews/pending', authenticate, authorize('admin'), getPendingReviews);

// Get all approved reviews
router.get('/reviews/approved', authenticate, authorize('admin'), getApprovedReviews);

// Get reviews for a specific product (admin - includes unapproved)
router.get('/:id/reviews/admin', authenticate, authorize('admin'), getProductReviewsAdmin);

// Approve a review
router.put('/reviews/:reviewId/approve', authenticate, authorize('admin'), approveReview);

// Delete a review
router.delete('/reviews/:reviewId', authenticate, authorize('admin'), deleteReview);

module.exports = router;