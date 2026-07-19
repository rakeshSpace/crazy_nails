const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const getServices = async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM services WHERE is_active = 1';
        const values = [];

        if (category) {
            query += ' AND category = ?';
            values.push(category);
        }

        query += ' ORDER BY display_order ASC';

        const [services] = await db.execute(query, values);
        res.json(services);
    } catch (error) {
        console.error('getServices error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
};

const getServiceById = async (req, res) => {
    try {
        const [services] = await db.execute('SELECT * FROM services WHERE id = ? AND is_active = 1', [req.params.id]);

        if (services.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(services[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch service' });
    }
};

const createService = async (req, res) => {
    try {
        const {
            name, category, description, price, original_price,
            discount_percent, offer_badge, offer_end_date, is_on_offer,
            duration, display_order
        } = req.body;

        let image_url = null;
        if (req.file) {
            image_url = `/uploads/services/${req.file.filename}`;
        }

        // Safe value conversion
        const safeString = (val) => (val && val !== 'undefined' && val !== 'null' ? val : null);
        const safeNumber = (val) => {
            if (!val || val === 'undefined' || val === 'null' || val === '') return null;
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
        };
        const safeInt = (val) => {
            if (!val || val === 'undefined' || val === 'null' || val === '') return 0;
            const num = parseInt(val);
            return isNaN(num) ? 0 : num;
        };
        const safeBoolean = (val) => {
            if (val === 'true' || val === true || val === 1 || val === '1') return 1;
            return 0;
        };

        const finalIsOnOffer = safeBoolean(is_on_offer);
        const finalOriginalPrice = safeNumber(original_price);
        const finalDiscountPercent = safeNumber(discount_percent) || 0;
        
        // Calculate final price
        let finalPrice = safeNumber(price) || 0;
        if (finalIsOnOffer === 1 && finalOriginalPrice && finalDiscountPercent > 0) {
            finalPrice = finalOriginalPrice * (1 - finalDiscountPercent / 100);
            finalPrice = Math.round(finalPrice);
        }

        console.log('Creating service with data:', {
            name, category, price, finalPrice, finalIsOnOffer, finalDiscountPercent, finalOriginalPrice
        });

        const [result] = await db.execute(
            `INSERT INTO services (
                name, category, description, price, original_price, 
                discount_percent, offer_badge, offer_end_date, is_on_offer, 
                duration, image_url, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                category,
                safeString(description),
                finalPrice,
                finalOriginalPrice,
                finalDiscountPercent,
                safeString(offer_badge),
                safeString(offer_end_date),
                finalIsOnOffer,
                safeInt(duration),
                image_url,
                safeInt(display_order)
            ]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Service created successfully'
        });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ error: 'Failed to create service: ' + error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, category, description, price, original_price,
            discount_percent, offer_badge, offer_end_date, is_on_offer,
            duration, display_order, is_active
        } = req.body;

        console.log('Updating service with data:', {
            id, name, category, price, original_price,
            discount_percent, offer_badge, offer_end_date, is_on_offer,
            duration, display_order, is_active
        });

        let image_url = null;
        if (req.file) {
            image_url = `/uploads/services/${req.file.filename}`;
            
            const [current] = await db.execute('SELECT image_url FROM services WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        // Safe value conversion
        const safeString = (val) => (val && val !== 'undefined' && val !== 'null' ? val : null);
        const safeNumber = (val) => {
            if (!val || val === 'undefined' || val === 'null' || val === '') return null;
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
        };
        const safeInt = (val) => {
            if (!val || val === 'undefined' || val === 'null' || val === '') return 0;
            const num = parseInt(val);
            return isNaN(num) ? 0 : num;
        };
        const safeBoolean = (val) => {
            if (val === 'true' || val === true || val === 1 || val === '1') return 1;
            if (val === 'false' || val === false || val === 0 || val === '0') return 0;
            return 0;
        };

        const finalIsOnOffer = safeBoolean(is_on_offer);
        const finalOriginalPrice = safeNumber(original_price);
        const finalDiscountPercent = safeNumber(discount_percent) || 0;
        
        // Calculate final price
        let finalPrice = safeNumber(price) || 0;
        
        console.log('Offer calculation:', {
            finalIsOnOffer,
            finalOriginalPrice,
            finalDiscountPercent,
            currentPrice: finalPrice
        });
        
        if (finalIsOnOffer === 1 && finalOriginalPrice && finalDiscountPercent > 0) {
            finalPrice = finalOriginalPrice * (1 - finalDiscountPercent / 100);
            finalPrice = Math.round(finalPrice);
            console.log('Discounted price calculated:', finalPrice);
        } else if (finalIsOnOffer === 0) {
            // If offer is disabled, use original price or keep current price
            if (finalOriginalPrice) {
                finalPrice = finalOriginalPrice;
            }
        }

        const finalIsActive = safeBoolean(is_active);
        const finalIsActiveValue = finalIsActive === 0 ? 0 : 1;

        let query = `UPDATE services SET 
            name = ?, 
            category = ?, 
            description = ?, 
            price = ?, 
            original_price = ?, 
            discount_percent = ?, 
            offer_badge = ?, 
            offer_end_date = ?, 
            is_on_offer = ?, 
            duration = ?, 
            display_order = ?, 
            is_active = ?`;

        const values = [
            name,
            category,
            safeString(description),
            finalPrice,
            finalOriginalPrice,
            finalDiscountPercent,
            safeString(offer_badge),
            safeString(offer_end_date),
            finalIsOnOffer,
            safeInt(duration),
            safeInt(display_order),
            finalIsActiveValue
        ];

        if (image_url) {
            query += ', image_url = ? WHERE id = ?';
            values.push(image_url, id);
        } else {
            query += ' WHERE id = ?';
            values.push(id);
        }

        console.log('Executing query:', query);
        console.log('Values:', values);

        const [result] = await db.execute(query, values);
        
        console.log('Update result:', result);

        res.json({ 
            message: 'Service updated successfully',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ error: 'Failed to update service: ' + error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const [current] = await db.execute('SELECT image_url FROM services WHERE id = ?', [req.params.id]);
        if (current[0]?.image_url) {
            const imagePath = path.join(__dirname, '../../', current[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await db.execute('UPDATE services SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ error: 'Failed to delete service' });
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

        const [result] = await db.execute(
            `UPDATE services SET is_on_offer = ? WHERE id IN (${placeholders})`,
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

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    bulkUpdateOffers
};