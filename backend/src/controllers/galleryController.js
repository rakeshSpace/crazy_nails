const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const getGalleryItems = async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM gallery WHERE is_active = 1';
        const values = [];
        
        if (category && category !== 'all') {
            query += ' AND category = ?';
            values.push(category);
        }
        
        query += ' ORDER BY display_order ASC, id DESC';
        
        const [items] = await db.execute(query, values);
        res.json(items);
    } catch (error) {
        console.error('Get gallery items error:', error);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
};

const getGalleryItemById = async (req, res) => {
    try {
        const [items] = await db.execute(
            'SELECT * FROM gallery WHERE id = ? AND is_active = 1',
            [req.params.id]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ error: 'Gallery item not found' });
        }
        
        res.json(items[0]);
    } catch (error) {
        console.error('Get gallery item by id error:', error);
        res.status(500).json({ error: 'Failed to fetch gallery item' });
    }
};

const createGalleryItem = async (req, res) => {
    try {
        const { title, description, category, display_order } = req.body;
        let image_url = null;
        
        if (req.file) {
            image_url = `/uploads/gallery/${req.file.filename}`;
        } else {
            return res.status(400).json({ error: 'Image is required' });
        }
        
        const [result] = await db.execute(
            'INSERT INTO gallery (title, description, category, image_url, display_order) VALUES (?, ?, ?, ?, ?)',
            [title, description || null, category, image_url, display_order || 0]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Gallery item created successfully',
            image_url 
        });
    } catch (error) {
        console.error('Create gallery item error:', error);
        res.status(500).json({ error: 'Failed to create gallery item: ' + error.message });
    }
};

const updateGalleryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, display_order, remove_image } = req.body;
        
        console.log('Updating gallery item with remove_image:', remove_image);
        
        // Handle image logic
        let image_url = null;
        let shouldUpdateImage = false;
        
        // Check if user wants to remove image
        if (remove_image === 'true' || remove_image === true) {
            // Get current image to delete it
            const [current] = await db.execute('SELECT image_url FROM gallery WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old gallery image:', oldImagePath);
                }
            }
            image_url = null;
            shouldUpdateImage = true;
            console.log('Gallery image removal requested - will set image_url to NULL');
        }
        // Check if new image is uploaded
        else if (req.file) {
            image_url = `/uploads/gallery/${req.file.filename}`;
            shouldUpdateImage = true;
            
            // Delete old image if exists
            const [current] = await db.execute('SELECT image_url FROM gallery WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old gallery image:', oldImagePath);
                }
            }
            console.log('New gallery image uploaded:', image_url);
        }
        
        let query = 'UPDATE gallery SET title = ?, description = ?, category = ?, display_order = ?';
        const values = [title, description || null, category, display_order || 0];
        
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
            return res.status(404).json({ error: 'Gallery item not found' });
        }
        
        res.json({ 
            message: 'Gallery item updated successfully',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Update gallery item error:', error);
        res.status(500).json({ error: 'Failed to update gallery item: ' + error.message });
    }
};

const deleteGalleryItem = async (req, res) => {
    try {
        // Get image to delete it
        const [current] = await db.execute('SELECT image_url FROM gallery WHERE id = ?', [req.params.id]);
        if (current[0]?.image_url) {
            const imagePath = path.join(__dirname, '../../', current[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted gallery image:', imagePath);
            }
        }
        
        // Soft delete (set is_active = 0)
        await db.execute('UPDATE gallery SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        console.error('Delete gallery item error:', error);
        res.status(500).json({ error: 'Failed to delete gallery item: ' + error.message });
    }
};

const bulkDeleteGalleryItems = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No items selected' });
        }
        
        // Get all images to delete
        const placeholders = ids.map(() => '?').join(',');
        const [images] = await db.execute(
            `SELECT image_url FROM gallery WHERE id IN (${placeholders})`,
            ids
        );
        
        // Delete image files
        for (const img of images) {
            if (img.image_url) {
                const imagePath = path.join(__dirname, '../../', img.image_url);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log('Deleted gallery image:', imagePath);
                }
            }
        }
        
        // Soft delete all items
        await db.execute(
            `UPDATE gallery SET is_active = 0 WHERE id IN (${placeholders})`,
            ids
        );
        
        res.json({ 
            success: true,
            message: `${ids.length} gallery items deleted successfully`
        });
    } catch (error) {
        console.error('Bulk delete gallery items error:', error);
        res.status(500).json({ error: 'Failed to delete gallery items: ' + error.message });
    }
};

module.exports = { 
    getGalleryItems, 
    getGalleryItemById,
    createGalleryItem, 
    updateGalleryItem,
    deleteGalleryItem,
    bulkDeleteGalleryItems
};