const db = require('../config/database');

// Get all bulk offers
const getBulkOffers = async (req, res) => {
    try {
        const [offers] = await db.execute(
            'SELECT * FROM bulk_offers ORDER BY created_at DESC'
        );
        res.json(offers);
    } catch (error) {
        console.error('Get bulk offers error:', error);
        res.status(500).json({ error: 'Failed to fetch bulk offers' });
    }
};

// Create bulk offer
const createBulkOffer = async (req, res) => {
    try {
        const { 
            name, discount_type, discount_value, applicable_on, 
            category, min_quantity, max_discount_amount, 
            offer_badge, start_date, end_date, product_ids, service_ids 
        } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO bulk_offers (name, discount_type, discount_value, applicable_on, 
             category, min_quantity, max_discount_amount, offer_badge, start_date, end_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, discount_type, discount_value, applicable_on, 
             category || null, min_quantity || 1, max_discount_amount || null, 
             offer_badge || null, start_date, end_date]
        );
        
        const offerId = result.insertId;
        
        // Add specific products if selected
        if (product_ids && product_ids.length > 0) {
            for (const productId of product_ids) {
                await db.execute(
                    'INSERT INTO bulk_offer_products (bulk_offer_id, product_id) VALUES (?, ?)',
                    [offerId, productId]
                );
            }
        }
        
        // Add specific services if selected
        if (service_ids && service_ids.length > 0) {
            for (const serviceId of service_ids) {
                await db.execute(
                    'INSERT INTO bulk_offer_products (bulk_offer_id, service_id) VALUES (?, ?)',
                    [offerId, serviceId]
                );
            }
        }
        
        res.status(201).json({ id: offerId, message: 'Bulk offer created successfully' });
    } catch (error) {
        console.error('Create bulk offer error:', error);
        res.status(500).json({ error: 'Failed to create bulk offer' });
    }
};

// Apply bulk offer to all products
const applyOfferToAllProducts = async (req, res) => {
    try {
        const { discount_percent, offer_badge, end_date } = req.body;
        
        await db.execute(
            `UPDATE products SET 
                is_on_offer = 1,
                discount_percent = ?,
                offer_badge = ?,
                offer_end_date = ?,
                original_price = price
             WHERE is_active = 1`,
            [discount_percent, offer_badge, end_date]
        );
        
        res.json({ message: 'Offer applied to all products successfully' });
    } catch (error) {
        console.error('Apply offer to all products error:', error);
        res.status(500).json({ error: 'Failed to apply offer' });
    }
};

// Apply bulk offer by category
const applyOfferByCategory = async (req, res) => {
    try {
        const { category, discount_percent, offer_badge, end_date } = req.body;
        
        await db.execute(
            `UPDATE products SET 
                is_on_offer = 1,
                discount_percent = ?,
                offer_badge = ?,
                offer_end_date = ?,
                original_price = price
             WHERE category = ? AND is_active = 1`,
            [discount_percent, offer_badge, end_date, category]
        );
        
        res.json({ message: `Offer applied to ${category} category successfully` });
    } catch (error) {
        console.error('Apply offer by category error:', error);
        res.status(500).json({ error: 'Failed to apply offer' });
    }
};

// Remove offer from all products
const removeAllOffers = async (req, res) => {
    try {
        await db.execute(
            `UPDATE products SET 
                is_on_offer = 0,
                discount_percent = NULL,
                offer_badge = NULL,
                offer_end_date = NULL,
                original_price = NULL
             WHERE is_active = 1`
        );
        
        res.json({ message: 'All offers removed successfully' });
    } catch (error) {
        console.error('Remove all offers error:', error);
        res.status(500).json({ error: 'Failed to remove offers' });
    }
};

// Get products by category for bulk selection
const getProductsByCategory = async (req, res) => {
    try {
        const [categories] = await db.execute(
            'SELECT DISTINCT category, COUNT(*) as count FROM products WHERE is_active = 1 GROUP BY category'
        );
        res.json(categories);
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

module.exports = {
    getBulkOffers,
    createBulkOffer,
    applyOfferToAllProducts,
    applyOfferByCategory,
    removeAllOffers,
    getProductsByCategory
};