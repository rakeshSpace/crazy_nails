const db = require('../config/database');
const fs = require('fs');
const path = require('path');

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
        const { name, role, comment, rating, display_order, is_approved, remove_image } = req.body;
        
        console.log('Updating testimonial with remove_image:', remove_image);
        
        // Handle image logic
        let image_url = null;
        let shouldUpdateImage = false;
        
        // Check if user wants to remove image
        if (remove_image === 'true' || remove_image === true) {
            // Get current image to delete it
            const [current] = await db.execute('SELECT image_url FROM testimonials WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old testimonial image:', oldImagePath);
                }
            }
            image_url = null;
            shouldUpdateImage = true;
            console.log('Testimonial image removal requested - will set image_url to NULL');
        }
        // Check if new image is uploaded
        else if (req.file) {
            image_url = `/uploads/testimonials/${req.file.filename}`;
            shouldUpdateImage = true;
            
            // Delete old image if exists
            const [current] = await db.execute('SELECT image_url FROM testimonials WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old testimonial image:', oldImagePath);
                }
            }
            console.log('New testimonial image uploaded:', image_url);
        }
        
        let query = 'UPDATE testimonials SET name = ?, role = ?, comment = ?, rating = ?, display_order = ?, is_approved = ?';
        const values = [name, role || null, comment, rating || 5, display_order || 0, is_approved !== undefined ? is_approved : 1];
        
        // Add image_url to query if we need to update it
        if (shouldUpdateImage) {
            query += ', image_url = ?';
            values.push(image_url);
        }
        
        query += ' WHERE id = ?';
        values.push(id);
        
        console.log('Executing query:', query);
        console.log('Values:', values);
        
        await db.execute(query, values);
        
        res.json({ message: 'Testimonial updated successfully' });
    } catch (error) {
        console.error('Update testimonial error:', error);
        res.status(500).json({ error: 'Failed to update testimonial: ' + error.message });
    }
};

// Delete testimonial
const deleteTestimonial = async (req, res) => {
    try {
        // Get image to delete it
        const [current] = await db.execute('SELECT image_url FROM testimonials WHERE id = ?', [req.params.id]);
        if (current[0]?.image_url) {
            const imagePath = path.join(__dirname, '../../', current[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted testimonial image:', imagePath);
            }
        }
        
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