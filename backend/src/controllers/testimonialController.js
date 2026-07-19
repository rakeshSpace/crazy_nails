const db = require('../config/database');

// Get approved testimonials for frontend
const getTestimonials = async (req, res) => {
    try {
        const { approved, limit } = req.query;
        let query = 'SELECT * FROM testimonials WHERE 1=1';
        const values = [];
        
        if (approved === 'true') {
            query += ' AND is_approved = 1';
        }
        
        query += ' ORDER BY display_order ASC, id DESC';
        
        if (limit) {
            query += ' LIMIT ?';
            values.push(parseInt(limit));
        }
        
        const [testimonials] = await db.execute(query, values);
        res.json(testimonials);
    } catch (error) {
        console.error('Get testimonials error:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
};

// Get all testimonials for admin
const getAllTestimonials = async (req, res) => {
    try {
        const [testimonials] = await db.execute(
            'SELECT * FROM testimonials ORDER BY display_order ASC, id DESC'
        );
        res.json(testimonials);
    } catch (error) {
        console.error('Get all testimonials error:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
};

// Create testimonial
const createTestimonial = async (req, res) => {
    try {
        const { name, role, comment, rating, display_order, is_approved } = req.body;
        let image_url = null;
        
        if (req.file) {
            image_url = `/uploads/testimonials/${req.file.filename}`;
        }
        
        const [result] = await db.execute(
            `INSERT INTO testimonials (name, role, comment, rating, image_url, display_order, is_approved) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, role || null, comment, rating || 5, image_url, display_order || 0, is_approved !== undefined ? is_approved : 1]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Testimonial created successfully' });
    } catch (error) {
        console.error('Create testimonial error:', error);
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
};

// Update testimonial
const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, comment, rating, display_order, is_approved } = req.body;
        
        let image_url = null;
        if (req.file) {
            image_url = `/uploads/testimonials/${req.file.filename}`;
        }
        
        let query = 'UPDATE testimonials SET name = ?, role = ?, comment = ?, rating = ?, display_order = ?, is_approved = ?';
        const values = [name, role || null, comment, rating || 5, display_order || 0, is_approved !== undefined ? is_approved : 1];
        
        if (image_url) {
            query += ', image_url = ?';
            values.push(image_url);
        }
        
        query += ' WHERE id = ?';
        values.push(id);
        
        await db.execute(query, values);
        
        res.json({ message: 'Testimonial updated successfully' });
    } catch (error) {
        console.error('Update testimonial error:', error);
        res.status(500).json({ error: 'Failed to update testimonial' });
    }
};

// Delete testimonial
const deleteTestimonial = async (req, res) => {
    try {
        await db.execute('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        console.error('Delete testimonial error:', error);
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
};

// Approve testimonial (set is_approved = 1)
const approveTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('UPDATE testimonials SET is_approved = 1 WHERE id = ?', [id]);
        res.json({ message: 'Testimonial approved successfully' });
    } catch (error) {
        console.error('Approve testimonial error:', error);
        res.status(500).json({ error: 'Failed to approve testimonial' });
    }
};

// Hide testimonial (set is_approved = 0)
const hideTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('UPDATE testimonials SET is_approved = 0 WHERE id = ?', [id]);
        res.json({ message: 'Testimonial hidden from website successfully' });
    } catch (error) {
        console.error('Hide testimonial error:', error);
        res.status(500).json({ error: 'Failed to hide testimonial' });
    }
};

module.exports = {
    getTestimonials,
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    approveTestimonial,
    hideTestimonial
};