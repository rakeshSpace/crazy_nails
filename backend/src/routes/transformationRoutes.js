const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    getTransformations,
    getTransformationById,
    createTransformation,
    updateTransformation,
    deleteTransformation
} = require('../controllers/transformationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/transformations');
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

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Public routes
router.get('/', getTransformations);
router.get('/:id', getTransformationById);

// Admin routes
router.post('/', authenticate, authorize('admin'), upload.fields([
    { name: 'before_image', maxCount: 1 },
    { name: 'after_image', maxCount: 1 }
]), createTransformation);

router.put('/:id', authenticate, authorize('admin'), upload.fields([
    { name: 'before_image', maxCount: 1 },
    { name: 'after_image', maxCount: 1 }
]), updateTransformation);

router.delete('/:id', authenticate, authorize('admin'), deleteTransformation);

module.exports = router;