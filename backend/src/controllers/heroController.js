const db = require('../config/database');

// Get all active hero sliders
const getHeroSliders = async (req, res) => {
    try {
        const [sliders] = await db.execute(
            'SELECT * FROM hero_sliders WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
        );
        res.json(sliders);
    } catch (error) {
        console.error('Get hero sliders error:', error);
        res.status(500).json({ error: 'Failed to fetch hero sliders' });
    }
};

// Get all sliders for admin
const getAllSliders = async (req, res) => {
    try {
        const [sliders] = await db.execute(
            'SELECT * FROM hero_sliders ORDER BY display_order ASC, id DESC'
        );
        res.json(sliders);
    } catch (error) {
        console.error('Get all sliders error:', error);
        res.status(500).json({ error: 'Failed to fetch sliders' });
    }
};

// Create hero slider (Admin)
const createHeroSlider = async (req, res) => {
    try {
        const { title, description, button_text, button_link, button_text_2, button_link_2, display_order } = req.body;
        let image_url = null;
        
        if (req.file) {
            image_url = `/uploads/hero/${req.file.filename}`;
        }
        
        const [result] = await db.execute(
            `INSERT INTO hero_sliders (title, description, image_url, button_text, button_link, button_text_2, button_link_2, display_order) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, image_url, button_text || 'Book Now', button_link || '/booking', button_text_2 || 'View Services', button_link_2 || '/services', display_order || 0]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Hero slider created successfully' });
    } catch (error) {
        console.error('Create hero slider error:', error);
        res.status(500).json({ error: 'Failed to create hero slider' });
    }
};

// Update hero slider (Admin)
const updateHeroSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, button_text, button_link, button_text_2, button_link_2, display_order, is_active } = req.body;
        
        let image_url = null;
        if (req.file) {
            image_url = `/uploads/hero/${req.file.filename}`;
        }
        
        let query = 'UPDATE hero_sliders SET title = ?, description = ?, button_text = ?, button_link = ?, button_text_2 = ?, button_link_2 = ?, display_order = ?, is_active = ?';
        const values = [title, description, button_text, button_link, button_text_2, button_link_2, display_order || 0, is_active !== undefined ? is_active : 1];
        
        if (image_url) {
            query += ', image_url = ?';
            values.push(image_url);
        }
        
        query += ' WHERE id = ?';
        values.push(id);
        
        await db.execute(query, values);
        
        res.json({ message: 'Hero slider updated successfully' });
    } catch (error) {
        console.error('Update hero slider error:', error);
        res.status(500).json({ error: 'Failed to update hero slider' });
    }
};

// Delete hero slider (Admin)
const deleteHeroSlider = async (req, res) => {
    try {
        await db.execute('DELETE FROM hero_sliders WHERE id = ?', [req.params.id]);
        res.json({ message: 'Hero slider deleted successfully' });
    } catch (error) {
        console.error('Delete hero slider error:', error);
        res.status(500).json({ error: 'Failed to delete hero slider' });
    }
};

module.exports = { getHeroSliders, getAllSliders, createHeroSlider, updateHeroSlider, deleteHeroSlider };