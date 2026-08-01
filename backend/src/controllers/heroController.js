const db = require('../config/database');
const fs = require('fs');
const path = require('path');

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
        } else {
            return res.status(400).json({ error: 'Image is required' });
        }
        
        const [result] = await db.execute(
            `INSERT INTO hero_sliders (title, description, image_url, button_text, button_link, button_text_2, button_link_2, display_order) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description || null, image_url, button_text || 'Book Now', button_link || '/booking', button_text_2 || 'View Services', button_link_2 || '/services', display_order || 0]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Hero slider created successfully' });
    } catch (error) {
        console.error('Create hero slider error:', error);
        res.status(500).json({ error: 'Failed to create hero slider: ' + error.message });
    }
};

// Update hero slider (Admin)
const updateHeroSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, description, button_text, button_link, 
            button_text_2, button_link_2, display_order, is_active,
            remove_image 
        } = req.body;
        
        console.log('Updating hero slider with remove_image:', remove_image);
        
        // Handle image logic
        let image_url = null;
        let shouldUpdateImage = false;
        
        // Check if user wants to remove image
        if (remove_image === 'true' || remove_image === true) {
            // Get current image to delete it
            const [current] = await db.execute('SELECT image_url FROM hero_sliders WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old hero slider image:', oldImagePath);
                }
            }
            image_url = null;
            shouldUpdateImage = true;
            console.log('Hero slider image removal requested - will set image_url to NULL');
        }
        // Check if new image is uploaded
        else if (req.file) {
            image_url = `/uploads/hero/${req.file.filename}`;
            shouldUpdateImage = true;
            
            // Delete old image if exists
            const [current] = await db.execute('SELECT image_url FROM hero_sliders WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old hero slider image:', oldImagePath);
                }
            }
            console.log('New hero slider image uploaded:', image_url);
        }
        
        let query = 'UPDATE hero_sliders SET title = ?, description = ?, button_text = ?, button_link = ?, button_text_2 = ?, button_link_2 = ?, display_order = ?, is_active = ?';
        const values = [
            title, 
            description || null, 
            button_text || 'Book Now', 
            button_link || '/booking', 
            button_text_2 || 'View Services', 
            button_link_2 || '/services', 
            display_order || 0, 
            is_active !== undefined ? parseInt(is_active) : 1
        ];
        
        // Add image_url to query if we need to update it
        if (shouldUpdateImage) {
            query += ', image_url = ?';
            values.push(image_url);
        }
        
        query += ' WHERE id = ?';
        values.push(id);
        
        console.log('Executing query:', query);
        console.log('Values:', values);
        
        const [result] = await db.execute(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Hero slider not found' });
        }
        
        res.json({ 
            message: 'Hero slider updated successfully',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Update hero slider error:', error);
        res.status(500).json({ error: 'Failed to update hero slider: ' + error.message });
    }
};

// Delete hero slider (Admin)
const deleteHeroSlider = async (req, res) => {
    try {
        // Get image to delete it
        const [current] = await db.execute('SELECT image_url FROM hero_sliders WHERE id = ?', [req.params.id]);
        if (current[0]?.image_url) {
            const imagePath = path.join(__dirname, '../../', current[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted hero slider image:', imagePath);
            }
        }
        
        const [result] = await db.execute('DELETE FROM hero_sliders WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Hero slider not found' });
        }
        
        res.json({ message: 'Hero slider deleted successfully' });
    } catch (error) {
        console.error('Delete hero slider error:', error);
        res.status(500).json({ error: 'Failed to delete hero slider: ' + error.message });
    }
};

module.exports = { 
    getHeroSliders, 
    getAllSliders, 
    createHeroSlider, 
    updateHeroSlider, 
    deleteHeroSlider 
};