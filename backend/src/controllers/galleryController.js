const db = require('../config/database');

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
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch gallery' });
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
            [title, description, category, image_url, display_order || 0]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Gallery item created', image_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create gallery item' });
    }
};

const deleteGalleryItem = async (req, res) => {
    try {
        await db.execute('UPDATE gallery SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Gallery item deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete gallery item' });
    }
};

module.exports = { getGalleryItems, createGalleryItem, deleteGalleryItem };