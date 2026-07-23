const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/team');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'team-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// ============ PUBLIC ROUTES ============
// Get all active team members
router.get('/', async (req, res) => {
    try {
        const [members] = await db.execute(
            'SELECT * FROM team_members WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
        );
        res.json(members);
    } catch (error) {
        console.error('Get team members error:', error);
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
});

// Get single team member
router.get('/:id', async (req, res) => {
    try {
        const [members] = await db.execute(
            'SELECT * FROM team_members WHERE id = ? AND is_active = 1',
            [req.params.id]
        );
        if (members.length === 0) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.json(members[0]);
    } catch (error) {
        console.error('Get team member error:', error);
        res.status(500).json({ error: 'Failed to fetch team member' });
    }
});

// ============ ADMIN ROUTES ============
// Get all team members (admin)
router.get('/admin/all', authenticate, authorize('admin'), async (req, res) => {
    try {
        const [members] = await db.execute(
            'SELECT * FROM team_members ORDER BY display_order ASC, id DESC'
        );
        res.json(members);
    } catch (error) {
        console.error('Get all team members error:', error);
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
});

// Create team member
router.post('/', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        const { name, role, experience, specialization, display_order, social_facebook, social_instagram, social_twitter, is_active } = req.body;

        let image_url = null;
        if (req.file) {
            image_url = `/uploads/team/${req.file.filename}`;
        }

        const [result] = await db.execute(
            `INSERT INTO team_members 
            (name, role, experience, specialization, image_url, display_order, social_facebook, social_instagram, social_twitter, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                role,
                experience || null,
                specialization || null,
                image_url,
                display_order || 0,
                social_facebook || null,
                social_instagram || null,
                social_twitter || null,
                is_active !== undefined ? parseInt(is_active) : 1
            ]
        );

        res.status(201).json({ id: result.insertId, message: 'Team member created successfully' });
    } catch (error) {
        console.error('Create team member error:', error);
        res.status(500).json({ error: 'Failed to create team member: ' + error.message });
    }
});

// Update team member
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, role, experience, specialization, display_order, 
            social_facebook, social_instagram, social_twitter, is_active,
            remove_image 
        } = req.body;

        console.log('Updating team member with remove_image:', remove_image);

        // Handle image logic
        let image_url = null;
        let shouldUpdateImage = false;

        // Check if user wants to remove image
        if (remove_image === 'true' || remove_image === true) {
            // Get current image to delete it
            const [current] = await db.execute('SELECT image_url FROM team_members WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old team member image:', oldImagePath);
                }
            }
            image_url = null;
            shouldUpdateImage = true;
            console.log('Team member image removal requested - will set image_url to NULL');
        }
        // Check if new image is uploaded
        else if (req.file) {
            image_url = `/uploads/team/${req.file.filename}`;
            shouldUpdateImage = true;

            // Delete old image if exists
            const [current] = await db.execute('SELECT image_url FROM team_members WHERE id = ?', [id]);
            if (current[0]?.image_url) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Deleted old team member image:', oldImagePath);
                }
            }
            console.log('New team member image uploaded:', image_url);
        }

        let query = `UPDATE team_members SET 
            name = ?, 
            role = ?, 
            experience = ?, 
            specialization = ?, 
            display_order = ?, 
            social_facebook = ?, 
            social_instagram = ?, 
            social_twitter = ?, 
            is_active = ?`;

        const values = [
            name,
            role,
            experience || null,
            specialization || null,
            display_order || 0,
            social_facebook || null,
            social_instagram || null,
            social_twitter || null,
            is_active !== undefined ? parseInt(is_active) : 1
        ];

        // Add image_url to query if we need to update it
        if (shouldUpdateImage) {
            query += ', image_url = ? WHERE id = ?';
            values.push(image_url, id);
        } else {
            query += ' WHERE id = ?';
            values.push(id);
        }

        console.log('Executing query:', query);
        console.log('Values:', values);

        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        res.json({ 
            message: 'Team member updated successfully',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Update team member error:', error);
        res.status(500).json({ error: 'Failed to update team member: ' + error.message });
    }
});

// Delete team member (hard delete)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        // Get image to delete it
        const [current] = await db.execute('SELECT image_url FROM team_members WHERE id = ?', [req.params.id]);
        if (current[0]?.image_url) {
            const imagePath = path.join(__dirname, '../../', current[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted team member image:', imagePath);
            }
        }

        const [result] = await db.execute('DELETE FROM team_members WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        res.json({ message: 'Team member deleted successfully' });
    } catch (error) {
        console.error('Delete team member error:', error);
        res.status(500).json({ error: 'Failed to delete team member' });
    }
});

module.exports = router;