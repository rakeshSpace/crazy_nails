const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const servicesDir = path.join(uploadDir, 'services');
const productsDir = path.join(uploadDir, 'products');
const galleryDir = path.join(uploadDir, 'gallery');
const testimonialsDir = path.join(uploadDir, 'testimonials');
const transformationsDir = path.join(uploadDir, 'transformations');
const heroDir = path.join(uploadDir, 'hero');
const reviewsDir = path.join(uploadDir, 'reviews');
const coursesDir = path.join(uploadDir, 'courses');

// Create all directories if they don't exist
const directories = [uploadDir, servicesDir, productsDir, galleryDir, testimonialsDir, transformationsDir, heroDir, reviewsDir, coursesDir];
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = uploadDir;

        // Check baseUrl for route detection
        if (req.baseUrl.includes('services')) {
            dest = servicesDir;
        } else if (req.baseUrl.includes('products')) {
            dest = productsDir;
        } else if (req.baseUrl.includes('gallery')) {
            dest = galleryDir;
        } else if (req.baseUrl.includes('testimonials')) {
            dest = testimonialsDir;
        } else if (req.baseUrl.includes('transformations')) {
            dest = transformationsDir;
        } else if (req.baseUrl.includes('hero')) {
            dest = heroDir;
        } else if (req.baseUrl.includes('courses')) {
            dest = coursesDir;
        }

        // Also check fieldname for specific image types
        if (file.fieldname === 'before_image' || file.fieldname === 'after_image') {
            dest = transformationsDir;
        } else if (file.fieldname === 'testimonial_image') {
            dest = testimonialsDir;
        } else if (file.fieldname === 'hero_image') {
            dest = heroDir;
        } else if (file.fieldname === 'review_image') {
            dest = reviewsDir;
        } else if (file.fieldname === 'thumbnail') {
            dest = coursesDir;
        }

        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);

        // Clean the original filename (remove spaces and special characters)
        const cleanName = path.basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .substring(0, 50);

        // Final filename: timestamp-cleanName-uniqueSuffix.ext
        const finalFilename = `${Date.now()}-${cleanName}-${uniqueSuffix}${ext}`;
        cb(null, finalFilename);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, bmp, svg)'));
    }
};

// Configure multer for different scenarios
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 10 // Maximum 10 files per upload
    }
});

// Export different configurations for different use cases
module.exports = {
    // Single file upload (for services, single product image, etc.)
    single: (fieldName) => upload.single(fieldName),

    // Multiple files upload (for product gallery)
    array: (fieldName, maxCount) => upload.array(fieldName, maxCount),

    // Fields upload (for different fields like before/after images)
    fields: (fields) => upload.fields(fields),

    // Default upload instance
    upload,

    // Specific configurations for backward compatibility
    singleImage: upload.single('image'),
    multipleImages: upload.array('images', 10),
    serviceImage: upload.single('image'),
    productImage: upload.single('image'),
    productImages: upload.array('images', 10),
    galleryImage: upload.single('image'),
    testimonialImage: upload.single('image'),
    transformationImages: upload.fields([
        { name: 'before_image', maxCount: 1 },
        { name: 'after_image', maxCount: 1 }
    ]),
    heroImage: upload.single('image'),
    reviewImage: upload.single('review_image'),
    courseThumbnail: upload.single('thumbnail')
};