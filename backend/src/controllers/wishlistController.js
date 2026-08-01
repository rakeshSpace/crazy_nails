const db = require('../config/database');

exports.getWishlist = async (req, res) => {
    try {
        const [items] = await db.execute(
            `SELECT w.*, p.name, p.price, p.image_url, p.slug 
             FROM wishlist_items w
             JOIN products p ON w.product_id = p.id
             WHERE w.user_id = ?`,
            [req.user.id]
        );
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { product_id } = req.body;
        const userId = req.user.id;

        const [product] = await db.execute('SELECT id FROM products WHERE id = ? AND is_active = 1', [product_id]);
        if (product.length === 0) return res.status(404).json({ error: 'Product not found' });

        const [existing] = await db.execute(
            'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        );
        if (existing.length > 0) return res.status(400).json({ error: 'Already in wishlist' });

        await db.execute(
            'INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
            [userId, product_id]
        );
        res.json({ message: 'Added to wishlist' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?',
            [req.user.id, req.params.productId]
        );
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
};

exports.mergeWishlist = async (req, res) => {
    try {
        const { items } = req.body; // array of product_ids
        const userId = req.user.id;
        if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Invalid items' });

        for (const productId of items) {
            const [existing] = await db.execute(
                'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );
            if (existing.length === 0) {
                const [product] = await db.execute('SELECT id FROM products WHERE id = ? AND is_active = 1', [productId]);
                if (product.length > 0) {
                    await db.execute(
                        'INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
                        [userId, productId]
                    );
                }
            }
        }
        res.json({ message: 'Wishlist merged' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to merge wishlist' });
    }
};