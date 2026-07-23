const express = require('express');
const { 
    getGalleryItems, 
    getGalleryItemById,
    createGalleryItem, 
    updateGalleryItem,
    deleteGalleryItem,
    bulkDeleteGalleryItems
} = require('../controllers/galleryController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Public routes
router.get('/', getGalleryItems);
router.get('/:id', getGalleryItemById);

// Admin routes
router.post('/', authenticate, authorize('admin'), upload.single('image'), createGalleryItem);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updateGalleryItem);
router.delete('/:id', authenticate, authorize('admin'), deleteGalleryItem);
router.delete('/bulk', authenticate, authorize('admin'), bulkDeleteGalleryItems);

module.exports = router;