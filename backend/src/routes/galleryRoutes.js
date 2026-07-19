const express = require('express');
const { getGalleryItems, createGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', getGalleryItems);
router.post('/', authenticate, authorize('admin'), upload.single('image'), createGalleryItem);
router.delete('/:id', authenticate, authorize('admin'), deleteGalleryItem);

module.exports = router;