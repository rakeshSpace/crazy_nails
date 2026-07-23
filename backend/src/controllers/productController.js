const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Helper function to generate SKU
const generateSKU = (category, id) => {
    const categoryCode = {
        'nail-care': 'NCL',
        'lash-care': 'LSH',
        'skincare': 'SKN',
        'hair-removal': 'HRL',
        'tools': 'TLS'
    };
    const prefix = categoryCode[category] || 'PRD';
    return `${prefix}${String(id).padStart(6, '0')}`;
};

const getProducts = async (req, res) => {
    try {
        const { category, featured, limit } = req.query;
        let query = 'SELECT *, COALESCE(sku, CONCAT("CNP", LPAD(id, 6, "0"))) as sku FROM products WHERE is_active = 1';
        const values = [];

        if (category && category !== 'all') {
            query += ' AND category = ?';
            values.push(category);
        }

        if (featured === 'true') {
            query += ' AND is_featured = 1';
        }

        query += ' ORDER BY id DESC';

        if (limit) {
            query += ' LIMIT ?';
            values.push(parseInt(limit));
        }

        const [products] = await db.execute(query, values);

        // Ensure image_url is properly formatted
        const formattedProducts = products.map(product => ({
            ...product,
            image_url: product.image_url || null
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const getProductById = async (req, res) => {
    try {
        const [products] = await db.execute(
            'SELECT *, COALESCE(sku, CONCAT("CNP", LPAD(id, 6, "0"))) as sku FROM products WHERE id = ? AND is_active = 1',
            [req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(products[0]);
    } catch (error) {
        console.error('Get product by id error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

const createProduct = async (req, res) => {
    try {
        const {
            name, category, description, price, original_price,
            stock_quantity, badge, is_featured, rating,
            is_on_offer, discount_percent, offer_badge, offer_end_date
        } = req.body;

        let image_url = null;
        if (req.file) {
            image_url = `/uploads/products/${req.file.filename}`;
        }

        // Safe value conversion - FIXED
        const safeBoolean = (val) => {
            if (val === 'true' || val === true || val === 1 || val === '1') return 1;
            if (val === 'false' || val === false || val === 0 || val === '0') return 0;
            return 0;
        };

        const safeNumber = (val) => {
            if (!val || val === 'undefined' || val === 'null' || val === '') return null;
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
        };

        const safeString = (val) => {
            if (!val || val === 'undefined' || val === 'null' || val === '') return null;
            return val;
        };

        const finalIsFeatured = safeBoolean(is_featured);
        const finalIsOnOffer = safeBoolean(is_on_offer);
        const finalOriginalPrice = safeNumber(original_price);
        const finalDiscountPercent = safeNumber(discount_percent) || 0;
        const finalOfferBadge = safeString(offer_badge);
        const finalOfferEndDate = safeString(offer_end_date);

        // Calculate final price if offer is active
        let finalPrice = safeNumber(price) || 0;
        if (finalIsOnOffer === 1 && finalOriginalPrice && finalDiscountPercent > 0) {
            finalPrice = finalOriginalPrice * (1 - finalDiscountPercent / 100);
            finalPrice = Math.round(finalPrice);
        }

        const finalRating = safeNumber(rating) || 0;
        const finalStockQuantity = safeNumber(stock_quantity) || 0;
        const finalBadge = safeString(badge);

        const [result] = await db.execute(
            `INSERT INTO products (
                name, category, description, price, original_price, 
                stock_quantity, image_url, badge, is_featured, rating,
                is_on_offer, discount_percent, offer_badge, offer_end_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                category,
                description || null,
                finalPrice,
                finalOriginalPrice,
                finalStockQuantity,
                image_url,
                finalBadge,
                finalIsFeatured,
                finalRating,
                finalIsOnOffer,
                finalDiscountPercent,
                finalOfferBadge,
                finalOfferEndDate
            ]
        );

        const productId = result.insertId;

        // Generate and update SKU
        const sku = generateSKU(category, productId);
        await db.execute('UPDATE products SET sku = ? WHERE id = ?', [sku, productId]);

        res.status(201).json({ id: productId, sku, message: 'Product created successfully' });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product: ' + error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, category, description, price, original_price, stock_quantity,
            badge, is_featured, rating, is_on_offer, discount_percent, offer_badge, offer_end_date,
            remove_image
        } = req.body;

        console.log('Updating product with remove_image:', remove_image);

        // Safe value conversion - FIXED
        const safeBoolean = (val) => {
            if (val === 'true' || val === true || val === 1 || val === '1') return 1;
            if (val === 'false' || val === false || val === 0 || val === '0') return 0;
            return 0;
        };

        const safeNumber = (val) => {
            if (!val || val === 'undefined' || val === 'null' || val === '') return null;
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
        };

        const safeString = (val) => {
            if (!val || val === 'undefined' || val === 'null' || val === '') return null;
            return val;
        };

        const finalIsFeatured = safeBoolean(is_featured);
        const finalIsOnOffer = safeBoolean(is_on_offer);
        const finalOriginalPrice = safeNumber(original_price);
        const finalDiscountPercent = safeNumber(discount_percent) || 0;
        const finalOfferBadge = safeString(offer_badge);
        const finalOfferEndDate = safeString(offer_end_date);

        // Calculate final price if offer is active
        let finalPrice = safeNumber(price) || 0;

        if (finalIsOnOffer === 1 && finalOriginalPrice && finalDiscountPercent > 0) {
            finalPrice = finalOriginalPrice * (1 - finalDiscountPercent / 100);
            finalPrice = Math.round(finalPrice);
        } else if (finalIsOnOffer === 0 && finalOriginalPrice) {
            finalPrice = finalOriginalPrice;
        }

        const finalRating = safeNumber(rating) || 0;
        const finalStockQuantity = safeNumber(stock_quantity) || 0;
        const finalBadge = safeString(badge);

        // Handle main image logic
        let image_url = null;
        let shouldUpdateImage = false;

        // Check if user wants to remove main image
        if (remove_image === 'true' || remove_image === true) {
            // Get current image to delete it
            const [current] = await db.execute('SELECT image_url FROM products WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old main image:', oldImagePath);
                }
            }
            image_url = null;
            shouldUpdateImage = true;
            console.log('Main image removal requested - will set image_url to NULL');
        }
        // Check if new main image is uploaded
        else if (req.file) {
            image_url = `/uploads/products/${req.file.filename}`;
            shouldUpdateImage = true;

            // Delete old image if exists
            const [current] = await db.execute('SELECT image_url FROM products WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old main image:', oldImagePath);
                }
            }
            console.log('New main image uploaded:', image_url);
        }

        let query = `UPDATE products SET 
            name = ?, 
            category = ?, 
            description = ?, 
            price = ?, 
            original_price = ?, 
            stock_quantity = ?, 
            badge = ?, 
            is_featured = ?, 
            rating = ?,
            is_on_offer = ?,
            discount_percent = ?,
            offer_badge = ?,
            offer_end_date = ?`;

        const values = [
            name,
            category,
            description || null,
            finalPrice,
            finalOriginalPrice,
            finalStockQuantity,
            finalBadge,
            finalIsFeatured,
            finalRating,
            finalIsOnOffer,
            finalDiscountPercent,
            finalOfferBadge,
            finalOfferEndDate
        ];

        // Add image_url to query if we need to update it
        if (shouldUpdateImage) {
            query += ', image_url = ? WHERE id = ?';
            values.push(image_url, id);
        } else {
            query += ' WHERE id = ?';
            values.push(id);
        }

        console.log('Executing query:', query);
        console.log('Values:', values);

        const [result] = await db.execute(query, values);

        res.json({
            message: 'Product updated successfully',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product: ' + error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        // Get main product image
        const [current] = await db.execute('SELECT image_url FROM products WHERE id = ?', [req.params.id]);
        if (current[0]?.image_url) {
            const imagePath = path.join(__dirname, '../../', current[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Get and delete additional images
        const [additionalImages] = await db.execute('SELECT image_url FROM product_images WHERE product_id = ?', [req.params.id]);
        for (const img of additionalImages) {
            if (img.image_url) {
                const imagePath = path.join(__dirname, '../../', img.image_url);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        // Soft delete product
        await db.execute('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
        
        // Delete additional images records
        await db.execute('DELETE FROM product_images WHERE product_id = ?', [req.params.id]);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

const bulkUpdateOffers = async (req, res) => {
    try {
        const { ids, action } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No items selected' });
        }

        const is_on_offer = action === 'activate' ? 1 : 0;
        const placeholders = ids.map(() => '?').join(',');

        await db.execute(
            `UPDATE products SET is_on_offer = ? WHERE id IN (${placeholders})`,
            [is_on_offer, ...ids]
        );

        res.json({
            success: true,
            message: `Bulk ${action} completed for ${ids.length} items`
        });
    } catch (error) {
        console.error('Bulk update offers error:', error);
        res.status(500).json({ error: 'Failed to bulk update offers: ' + error.message });
    }
};

const getProductsWithOffers = async (req, res) => {
    try {
        const [products] = await db.execute(
            'SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC'
        );
        res.json(products);
    } catch (error) {
        console.error('Get products with offers error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// ============ REVIEW FUNCTIONS ============
const getProductReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const [reviews] = await db.execute(
            `SELECT r.*, u.name as reviewer_name 
             FROM product_reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ? AND r.is_approved = 1
             ORDER BY r.created_at DESC`,
            [id]
        );

        // Log to check if image_url is coming
        console.log('Reviews with images:', reviews.map(r => ({ id: r.id, image_url: r.image_url })));

        const [avgRating] = await db.execute(
            'SELECT AVG(rating) as average, COUNT(*) as total FROM product_reviews WHERE product_id = ? AND is_approved = 1',
            [id]
        );

        const [ratingDistribution] = await db.execute(
            `SELECT rating, COUNT(*) as count 
             FROM product_reviews 
             WHERE product_id = ? AND is_approved = 1 
             GROUP BY rating`,
            [id]
        );

        res.json({
            reviews,
            averageRating: avgRating[0]?.average || 0,
            totalReviews: avgRating[0]?.total || 0,
            ratingDistribution
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

const addProductReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment, user_name, user_email } = req.body;
        const userId = req.user?.id || null;

        let image_url = null;
        if (req.file) {
            image_url = `/uploads/reviews/${req.file.filename}`;
        }

        let isVerifiedPurchase = false;
        if (userId) {
            const [orders] = await db.execute(
                `SELECT COUNT(*) as count FROM order_items oi 
                 JOIN orders o ON oi.order_id = o.id 
                 WHERE oi.product_id = ? AND o.user_id = ? AND o.order_status = 'delivered'`,
                [id, userId]
            );
            isVerifiedPurchase = orders[0].count > 0;
        }

        const [result] = await db.execute(
            `INSERT INTO product_reviews 
             (product_id, user_id, user_name, user_email, rating, title, comment, image_url, is_verified_purchase, is_approved) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [id, userId, user_name, user_email, rating, title, comment, image_url, isVerifiedPurchase]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Review submitted successfully! It will appear after approval.'
        });
    } catch (error) {
        console.error('Add product review error:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
};

const markReviewHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;
        await db.execute(
            'UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
            [reviewId]
        );
        res.json({ message: 'Marked as helpful' });
    } catch (error) {
        console.error('Mark review helpful error:', error);
        res.status(500).json({ error: 'Failed to mark review' });
    }
};

// ============ PRODUCT IMAGES FUNCTIONS ============
const getProductImages = async (req, res) => {
    try {
        const { id } = req.params;
        const [images] = await db.execute(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC',
            [id]
        );
        res.json(images);
    } catch (error) {
        console.error('Get product images error:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
};

const uploadProductImages = async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const uploadedImages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const image_url = `/uploads/products/${file.filename}`;
            const is_primary = i === 0 ? 1 : 0;
            const display_order = i;

            const [result] = await db.execute(
                'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
                [id, image_url, is_primary, display_order]
            );

            uploadedImages.push({
                id: result.insertId,
                image_url,
                is_primary,
                display_order
            });
        }

        res.json({
            success: true,
            images: uploadedImages,
            message: `${uploadedImages.length} images uploaded successfully`
        });
    } catch (error) {
        console.error('Upload product images error:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
};

const deleteProductImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        const [images] = await db.execute('SELECT image_url FROM product_images WHERE id = ?', [imageId]);

        if (images.length > 0 && images[0].image_url) {
            const imagePath = path.join(__dirname, '../../', images[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await db.execute('DELETE FROM product_images WHERE id = ?', [imageId]);

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete product image error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
};

const setPrimaryImage = async (req, res) => {
    try {
        const { productId, imageId } = req.params;

        await db.execute('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [productId]);
        await db.execute('UPDATE product_images SET is_primary = 1 WHERE id = ?', [imageId]);

        res.json({ message: 'Primary image updated successfully' });
    } catch (error) {
        console.error('Set primary image error:', error);
        res.status(500).json({ error: 'Failed to set primary image' });
    }
};

// Get all pending reviews (for admin)
const getPendingReviews = async (req, res) => {
    try {
        const [reviews] = await db.execute(
            `SELECT r.*, p.name as product_name, u.name as reviewer_name 
             FROM product_reviews r
             LEFT JOIN products p ON r.product_id = p.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.is_approved = 0
             ORDER BY r.created_at DESC`,
            []
        );
        res.json(reviews);
    } catch (error) {
        console.error('Get pending reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch pending reviews' });
    }
};

// Get all approved reviews (for admin)
const getApprovedReviews = async (req, res) => {
    try {
        const [reviews] = await db.execute(
            `SELECT r.*, p.name as product_name, u.name as reviewer_name 
             FROM product_reviews r
             LEFT JOIN products p ON r.product_id = p.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.is_approved = 1
             ORDER BY r.created_at DESC`,
            []
        );
        res.json(reviews);
    } catch (error) {
        console.error('Get approved reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch approved reviews' });
    }
};

// Get product reviews for admin (with unapproved)
const getProductReviewsAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const [reviews] = await db.execute(
            `SELECT r.*, u.name as reviewer_name 
             FROM product_reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [id]
        );
        res.json(reviews);
    } catch (error) {
        console.error('Get product reviews admin error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Approve a review
const approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Get review details to update product rating
        const [review] = await db.execute(
            'SELECT product_id, rating FROM product_reviews WHERE id = ?',
            [reviewId]
        );

        if (review.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Approve the review
        await db.execute(
            'UPDATE product_reviews SET is_approved = 1 WHERE id = ?',
            [reviewId]
        );

        // Update product's average rating
        const [avgRating] = await db.execute(
            'SELECT AVG(rating) as average FROM product_reviews WHERE product_id = ? AND is_approved = 1',
            [review[0].product_id]
        );

        const newRating = avgRating[0]?.average || 0;
        await db.execute(
            'UPDATE products SET rating = ? WHERE id = ?',
            [newRating, review[0].product_id]
        );

        res.json({ message: 'Review approved successfully' });
    } catch (error) {
        console.error('Approve review error:', error);
        res.status(500).json({ error: 'Failed to approve review' });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Get review details
        const [review] = await db.execute(
            'SELECT product_id, rating FROM product_reviews WHERE id = ?',
            [reviewId]
        );

        if (review.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Delete the review
        await db.execute('DELETE FROM product_reviews WHERE id = ?', [reviewId]);

        // Update product's average rating
        const [avgRating] = await db.execute(
            'SELECT AVG(rating) as average FROM product_reviews WHERE product_id = ? AND is_approved = 1',
            [review[0].product_id]
        );

        const newRating = avgRating[0]?.average || 0;
        await db.execute(
            'UPDATE products SET rating = ? WHERE id = ?',
            [newRating, review[0].product_id]
        );

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
};

// ============ EXPORT ALL FUNCTIONS ============
module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateOffers,
    getProductsWithOffers,
    getProductReviews,
    addProductReview,
    markReviewHelpful,
    getProductImages,
    uploadProductImages,
    deleteProductImage,
    setPrimaryImage,
    getPendingReviews,
    getApprovedReviews,
    getProductReviewsAdmin,
    approveReview,
    deleteReview
};