const db = require('../config/database');

// Get user certificates
const getUserCertificates = async (req, res) => {
    try {
        const [certificates] = await db.execute(
            `SELECT c.*, crs.title as course_name 
             FROM certificates c 
             JOIN courses crs ON c.course_id = crs.id 
             WHERE c.user_id = ? 
             ORDER BY c.issued_at DESC`,
            [req.user.id]
        );
        res.json(certificates);
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
};

// Verify certificate (public)
const verifyCertificate = async (req, res) => {
    try {
        const { code } = req.params;
        const [certificates] = await db.execute(
            `SELECT c.*, crs.title as course_name 
             FROM certificates c 
             JOIN courses crs ON c.course_id = crs.id 
             WHERE c.verification_code = ?`,
            [code]
        );
        
        if (certificates.length === 0) {
            return res.status(404).json({ valid: false, message: 'Certificate not found' });
        }
        
        res.json({ valid: true, certificate: certificates[0] });
    } catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};

// Generate certificate PDF
const generateCertificatePDF = async (req, res) => {
    try {
        const { certificate_id } = req.body;
        
        const [certificates] = await db.execute(
            `SELECT c.*, crs.title as course_name, u.name as user_name 
             FROM certificates c 
             JOIN courses crs ON c.course_id = crs.id 
             JOIN users u ON c.user_id = u.id 
             WHERE c.id = ? AND c.user_id = ?`,
            [certificate_id, req.user.id]
        );
        
        if (certificates.length === 0) {
            return res.status(404).json({ error: 'Certificate not found' });
        }
        
        const cert = certificates[0];
        
        // Simple JSON response for now (PDF generation can be added later)
        res.json({
            success: true,
            certificate: cert,
            message: 'Certificate data retrieved successfully'
        });
        
    } catch (error) {
        console.error('Certificate generation error:', error);
        res.status(500).json({ error: 'Failed to generate certificate' });
    }
};

module.exports = { getUserCertificates, verifyCertificate, generateCertificatePDF };