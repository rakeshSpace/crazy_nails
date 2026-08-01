const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    mergeWishlist
} = require('../controllers/wishlistController');

router.use(authenticate);
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/merge', mergeWishlist);

module.exports = router;