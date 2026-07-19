const db = require('../config/database');

// Get all transformations
const getTransformations = async (req, res) => {
    try {
        const { category, limit } = req.query;
        let query = 'SELECT * FROM transformations WHERE is_active = 1';
        const values = [];
        
        if (category && category !== 'all') {
            query += ' AND category = ?';
            values.push(category);
        }
        
        query += ' ORDER BY display_order ASC, id DESC';
        
        if (limit) {
            query += ' LIMIT ?';
            values.push(parseInt(limit));
        }
        
        const [transformations] = await db.execute(query, values);
        
        // Parse tags from JSON to array
        transformations.forEach(t => {
            if (t.tags) {
                t.tags = typeof t.tags === 'string' ? JSON.parse(t.tags) : t.tags;
            }
        });
        
        res.json(transformations);
    } catch (error) {
        console.error('Get transformations error:', error);
        res.status(500).json({ error: 'Failed to fetch transformations' });
    }
};

// Get single transformation
const getTransformationById = async (req, res) => {
    try {
        const [transformations] = await db.execute(
            'SELECT * FROM transformations WHERE id = ? AND is_active = 1',
            [req.params.id]
        );
        
        if (transformations.length === 0) {
            return res.status(404).json({ error: 'Transformation not found' });
        }
        
        if (transformations[0].tags) {
            transformations[0].tags = typeof transformations[0].tags === 'string' 
                ? JSON.parse(transformations[0].tags) 
                : transformations[0].tags;
        }
        
        res.json(transformations[0]);
    } catch (error) {
        console.error('Get transformation error:', error);
        res.status(500).json({ error: 'Failed to fetch transformation' });
    }
};

// Create transformation (Admin)
const createTransformation = async (req, res) => {
    try {
        const { title, description, category, tags, display_order } = req.body;
        let before_image = null;
        let after_image = null;
        
        // Handle file uploads
        if (req.files) {
            if (req.files.before_image) {
                before_image = `/uploads/transformations/${req.files.before_image[0].filename}`;
            }
            if (req.files.after_image) {
                after_image = `/uploads/transformations/${req.files.after_image[0].filename}`;
            }
        }
        
        // Parse tags
        let tagsJson = null;
        if (tags) {
            tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags);
        }
        
        const [result] = await db.execute(
            `INSERT INTO transformations (title, description, before_image, after_image, category, tags, display_order) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, description, before_image, after_image, category, tagsJson, display_order || 0]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Transformation created successfully' 
        });
    } catch (error) {
        console.error('Create transformation error:', error);
        res.status(500).json({ error: 'Failed to create transformation' });
    }
};

// Update transformation (Admin)
const updateTransformation = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, tags, display_order, is_active } = req.body;
        
        let before_image = null;
        let after_image = null;
        
        // Handle file uploads
        if (req.files) {
            if (req.files.before_image) {
                before_image = `/uploads/transformations/${req.files.before_image[0].filename}`;
            }
            if (req.files.after_image) {
                after_image = `/uploads/transformations/${req.files.after_image[0].filename}`;
            }
        }
        
        // Build update query
        let query = 'UPDATE transformations SET title = ?, description = ?, category = ?, display_order = ?, is_active = ?';
        const values = [title, description, category, display_order || 0, is_active !== undefined ? is_active : 1];
        
        if (before_image) {
            query += ', before_image = ?';
            values.push(before_image);
        }
        
        if (after_image) {
            query += ', after_image = ?';
            values.push(after_image);
        }
        
        if (tags) {
            query += ', tags = ?';
            const tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags);
            values.push(tagsJson);
        }
        
        query += ' WHERE id = ?';
        values.push(id);
        
        await db.execute(query, values);
        
        res.json({ message: 'Transformation updated successfully' });
    } catch (error) {
        console.error('Update transformation error:', error);
        res.status(500).json({ error: 'Failed to update transformation' });
    }
};

// Delete transformation (Admin)
const deleteTransformation = async (req, res) => {
    try {
        await db.execute('UPDATE transformations SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Transformation deleted successfully' });
    } catch (error) {
        console.error('Delete transformation error:', error);
        res.status(500).json({ error: 'Failed to delete transformation' });
    }
};

module.exports = {
    getTransformations,
    getTransformationById,
    createTransformation,
    updateTransformation,
    deleteTransformation
};