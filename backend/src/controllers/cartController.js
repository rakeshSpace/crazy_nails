const db = require('../config/database');

const getCart = async (req, res) => {
    try {
        const [items] = await db.execute(
            `SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity 
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.id 
             WHERE ci.user_id = ?`,
            [req.user.id]
        );
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

const addToCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;
        
        // Check if product exists
        const [product] = await db.execute('SELECT * FROM products WHERE id = ? AND is_active = 1', [product_id]);
        if (product.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Check if already in cart
        const [existing] = await db.execute(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );
        
        if (existing.length > 0) {
            await db.execute(
                'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, req.user.id, product_id]
            );
        } else {
            await db.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.user.id, product_id, quantity]
            );
        }
        
        res.json({ message: 'Added to cart successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to cart' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (quantity <= 0) {
            await db.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user.id]);
        } else {
            await db.execute('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, id, req.user.id]);
        }
        
        res.json({ message: 'Cart updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cart' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        await db.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };