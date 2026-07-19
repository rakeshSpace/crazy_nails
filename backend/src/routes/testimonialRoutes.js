const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    getTestimonials,
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    approveTestimonial,
    hideTestimonial
} = require('../controllers/testimonialController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/testimonials');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes
router.get('/', getTestimonials);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), getAllTestimonials);
router.post('/', authenticate, authorize('admin'), upload.single('image'), createTestimonial);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updateTestimonial);
router.delete('/:id', authenticate, authorize('admin'), deleteTestimonial);
router.put('/:id/approve', authenticate, authorize('admin'), approveTestimonial);
router.put('/:id/hide', authenticate, authorize('admin'), hideTestimonial);

module.exports = router;