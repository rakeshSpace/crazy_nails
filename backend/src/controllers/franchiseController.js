const db = require('../config/database');

// Submit franchise application (Public)
const submitApplication = async (req, res) => {
    try {
        const { full_name, email, phone, city, state, investment_ready, experience, message } = req.body;
        
        console.log('Received franchise application:', { full_name, email, phone, city, state });
        
        if (!full_name || !email || !phone || !city || !state || !investment_ready) {
            return res.status(400).json({ 
                error: 'Please fill all required fields' 
            });
        }
        
        const [result] = await db.execute(
            `INSERT INTO franchise_applications 
             (full_name, email, phone, city, state, investment_ready, experience, message, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [full_name, email, phone, city, state, investment_ready, experience || null, message || null]
        );
        
        console.log('Application saved with ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Application submitted successfully. We will contact you soon!',
            applicationId: result.insertId
        });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ error: 'Failed to submit application: ' + error.message });
    }
};

// Get all applications (Admin)
const getAllApplications = async (req, res) => {
    try {
        console.log('Fetching all franchise applications...');
        
        const { status } = req.query;
        let query = 'SELECT * FROM franchise_applications ORDER BY created_at DESC';
        const values = [];
        
        if (status && status !== 'all') {
            query = 'SELECT * FROM franchise_applications WHERE status = ? ORDER BY created_at DESC';
            values.push(status);
        }
        
        const [applications] = await db.execute(query, values);
        
        console.log(`Found ${applications.length} applications`);
        res.json(applications);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications: ' + error.message });
    }
};

// Update application status (Admin)
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;
        
        console.log('Updating application:', id, 'to status:', status);
        
        await db.execute(
            'UPDATE franchise_applications SET status = ?, admin_notes = ? WHERE id = ?',
            [status, admin_notes || null, id]
        );
        
        // If approved, create franchise partner
        if (status === 'approved') {
            const [app] = await db.execute(
                'SELECT * FROM franchise_applications WHERE id = ?',
                [id]
            );
            
            if (app.length > 0) {
                const partnerCode = 'FRAN-' + Date.now().toString().slice(-8);
                await db.execute(
                    `INSERT INTO franchise_partners 
                     (application_id, partner_code, full_name, email, phone, city, state, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
                    [id, partnerCode, app[0].full_name, app[0].email, app[0].phone, app[0].city, app[0].state]
                );
                console.log('Franchise partner created with code:', partnerCode);
            }
        }
        
        res.json({ success: true, message: 'Application status updated' });
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
};

// Get all franchises (Admin)
const getAllFranchises = async (req, res) => {
    try {
        console.log('Fetching all franchise partners...');
        
        const [franchises] = await db.execute(
            `SELECT fp.*, fa.message as application_message, fa.status as application_status
             FROM franchise_partners fp 
             LEFT JOIN franchise_applications fa ON fp.application_id = fa.id 
             ORDER BY fp.created_at DESC`
        );
        
        console.log(`Found ${franchises.length} franchise partners`);
        res.json(franchises);
    } catch (error) {
        console.error('Get franchises error:', error);
        res.status(500).json({ error: 'Failed to fetch franchises: ' + error.message });
    }
};

// Get franchise revenue (Admin)
const getFranchiseRevenue = async (req, res) => {
    try {
        const { id } = req.params;
        const [revenue] = await db.execute(
            'SELECT * FROM franchise_revenue WHERE franchise_id = ? ORDER BY month DESC',
            [id]
        );
        res.json(revenue);
    } catch (error) {
        console.error('Get revenue error:', error);
        res.status(500).json({ error: 'Failed to fetch revenue' });
    }
};

// Update franchise status (Admin)
const updateFranchiseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await db.execute(
            'UPDATE franchise_partners SET status = ? WHERE id = ?',
            [status, id]
        );
        
        res.json({ success: true, message: 'Franchise status updated' });
    } catch (error) {
        console.error('Update franchise error:', error);
        res.status(500).json({ error: 'Failed to update franchise' });
    }
};

module.exports = {
    submitApplication,
    getAllApplications,
    updateApplicationStatus,
    getAllFranchises,
    getFranchiseRevenue,
    updateFranchiseStatus
};