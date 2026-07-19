const express = require('express');
const { 
    getUserCertificates, 
    verifyCertificate,
    generateCertificatePDF
} = require('../controllers/certificateController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Public route for verification
router.get('/verify/:code', verifyCertificate);

// Protected routes (require authentication)
router.use(authenticate);
router.get('/my-certificates', getUserCertificates);
router.post('/generate-pdf', generateCertificatePDF);

module.exports = router;