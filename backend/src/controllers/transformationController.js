const db = require('../config/database');
const fs = require('fs');
const path = require('path');

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
                try {
                    t.tags = typeof t.tags === 'string' ? JSON.parse(t.tags) : t.tags;
                } catch (e) {
                    t.tags = [];
                }
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
            try {
                transformations[0].tags = typeof transformations[0].tags === 'string' 
                    ? JSON.parse(transformations[0].tags) 
                    : transformations[0].tags;
            } catch (e) {
                transformations[0].tags = [];
            }
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
        
        // Check if at least one image is provided for new transformation
        if (!before_image && !after_image) {
            return res.status(400).json({ error: 'At least one image (Before or After) is required' });
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
        res.status(500).json({ error: 'Failed to create transformation: ' + error.message });
    }
};

// Update transformation (Admin)
const updateTransformation = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, description, category, tags, display_order, is_active,
            remove_before_image, remove_after_image 
        } = req.body;
        
        console.log('Updating transformation with remove flags:', { remove_before_image, remove_after_image });
        
        let before_image = null;
        let after_image = null;
        let shouldUpdateBefore = false;
        let shouldUpdateAfter = false;
        
        // Handle Before Image
        if (remove_before_image === 'true' || remove_before_image === true) {
            // Get current before image to delete it
            const [current] = await db.execute('SELECT before_image, after_image FROM transformations WHERE id = ?', [id]);
            if (current[0]?.before_image) {
                const oldPath = path.join(__dirname, '../../', current[0].before_image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    console.log('Deleted old before image:', oldPath);
                }
            }
            before_image = null;
            shouldUpdateBefore = true;
            console.log('Before image removal requested - will set before_image to NULL');
        }
        // Check if new before image is uploaded
        else if (req.files && req.files.before_image) {
            before_image = `/uploads/transformations/${req.files.before_image[0].filename}`;
            shouldUpdateBefore = true;
            
            // Delete old before image if exists
            const [current] = await db.execute('SELECT before_image FROM transformations WHERE id = ?', [id]);
            if (current[0]?.before_image) {
                const oldPath = path.join(__dirname, '../../', current[0].before_image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    console.log('Deleted old before image:', oldPath);
                }
            }
            console.log('New before image uploaded:', before_image);
        }
        
        // Handle After Image
        if (remove_after_image === 'true' || remove_after_image === true) {
            // Get current after image to delete it
            const [current] = await db.execute('SELECT after_image FROM transformations WHERE id = ?', [id]);
            if (current[0]?.after_image) {
                const oldPath = path.join(__dirname, '../../', current[0].after_image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    console.log('Deleted old after image:', oldPath);
                }
            }
            after_image = null;
            shouldUpdateAfter = true;
            console.log('After image removal requested - will set after_image to NULL');
        }
        // Check if new after image is uploaded
        else if (req.files && req.files.after_image) {
            after_image = `/uploads/transformations/${req.files.after_image[0].filename}`;
            shouldUpdateAfter = true;
            
            // Delete old after image if exists
            const [current] = await db.execute('SELECT after_image FROM transformations WHERE id = ?', [id]);
            if (current[0]?.after_image) {
                const oldPath = path.join(__dirname, '../../', current[0].after_image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    console.log('Deleted old after image:', oldPath);
                }
            }
            console.log('New after image uploaded:', after_image);
        }
        
        // Build update query
        let query = 'UPDATE transformations SET title = ?, description = ?, category = ?, display_order = ?, is_active = ?';
        const values = [title, description, category, display_order || 0, is_active !== undefined ? parseInt(is_active) : 1];
        
        if (shouldUpdateBefore) {
            query += ', before_image = ?';
            values.push(before_image);
        }
        
        if (shouldUpdateAfter) {
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
        
        console.log('Executing query:', query);
        console.log('Values:', values);
        
        const [result] = await db.execute(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transformation not found' });
        }
        
        res.json({ 
            message: 'Transformation updated successfully',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Update transformation error:', error);
        res.status(500).json({ error: 'Failed to update transformation: ' + error.message });
    }
};

// Delete transformation (Admin)
const deleteTransformation = async (req, res) => {
    try {
        // Get images to delete them
        const [current] = await db.execute('SELECT before_image, after_image FROM transformations WHERE id = ?', [req.params.id]);
        
        // Delete before image if exists
        if (current[0]?.before_image) {
            const imagePath = path.join(__dirname, '../../', current[0].before_image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted before image:', imagePath);
            }
        }
        
        // Delete after image if exists
        if (current[0]?.after_image) {
            const imagePath = path.join(__dirname, '../../', current[0].after_image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted after image:', imagePath);
            }
        }
        
        await db.execute('UPDATE transformations SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Transformation deleted successfully' });
    } catch (error) {
        console.error('Delete transformation error:', error);
        res.status(500).json({ error: 'Failed to delete transformation: ' + error.message });
    }
};

module.exports = {
    getTransformations,
    getTransformationById,
    createTransformation,
    updateTransformation,
    deleteTransformation
};