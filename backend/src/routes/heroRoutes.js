const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getHeroSliders, getAllSliders, createHeroSlider, updateHeroSlider, deleteHeroSlider } = require('../controllers/heroController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/hero');
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
router.get('/', getHeroSliders);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), getAllSliders);
router.post('/', authenticate, authorize('admin'), upload.single('image'), createHeroSlider);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updateHeroSlider);
router.delete('/:id', authenticate, authorize('admin'), deleteHeroSlider);

module.exports = router;