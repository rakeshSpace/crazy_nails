const express = require('express');
const { 
    getBulkOffers,
    createBulkOffer,
    applyOfferToAllProducts,
    applyOfferByCategory,
    removeAllOffers,
    getProductsByCategory
} = require('../controllers/bulkOfferController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/', getBulkOffers);
router.post('/', createBulkOffer);
router.post('/apply-all', applyOfferToAllProducts);
router.post('/apply-category', applyOfferByCategory);
router.delete('/remove-all', removeAllOffers);
router.get('/categories', getProductsByCategory);

module.exports = router;