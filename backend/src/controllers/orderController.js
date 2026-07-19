// backend/src/controllers/orderController.js

const db = require('../config/database');
const { createOrder, verifyPayment } = require('../config/razorpay');

// Get delivery settings
const getDeliverySettings = async () => {
    try {
        const [settings] = await db.execute('SELECT setting_key, setting_value FROM delivery_settings');
        const settingsMap = {};
        settings.forEach(s => settingsMap[s.setting_key] = s.setting_value);
        return settingsMap;
    } catch (error) {
        console.log('Using default delivery settings');
        return {
            base_delivery_charge: '100',
            free_delivery_threshold: '2000',
            estimated_delivery_days: '3-5'
        };
    }
};

// Calculate delivery charge
const calculateDeliveryCharge = async (subtotal) => {
    const settings = await getDeliverySettings();
    const freeThreshold = parseFloat(settings.free_delivery_threshold) || 2000;
    const baseCharge = parseFloat(settings.base_delivery_charge) || 100;
    return subtotal >= freeThreshold ? 0 : baseCharge;
};

// Helper function to initiate refund
const initiateRefund = async (orderId, amount, paymentMethod) => {
    try {
        console.log(`Initiating refund of ₹${amount} for order ${orderId}`);
        await db.execute(
            `UPDATE orders SET refund_status = 'processed', refund_processed_at = NOW() WHERE id = ?`,
            [orderId]
        );
        return true;
    } catch (error) {
        console.error('Refund initiation error:', error);
        return false;
    }
};

// Helper function to send notification
const sendOrderUpdateNotification = async (email, orderNumber, status) => {
    try {
        console.log(`Sending ${status} notification for order ${orderNumber} to ${email}`);
    } catch (error) {
        console.error('Notification error:', error);
    }
};

// Helper function to notify admin
const notifyAdmin = async (subject, message) => {
    try {
        console.log(`Admin notification: ${subject} - ${message}`);
    } catch (error) {
        console.error('Admin notification error:', error);
    }
};

// Create order from cart
const createOrderFromCart = async (req, res) => {
    try {
        const { shipping_address, payment_method, notes } = req.body;

        console.log('Creating order for user:', req.user.id);

        const [cartItems] = await db.execute(
            `SELECT ci.*, p.name, p.price 
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.id 
             WHERE ci.user_id = ?`,
            [req.user.id]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharge = await calculateDeliveryCharge(subtotal);
        const totalAmount = subtotal + deliveryCharge;
        const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

        const settings = await getDeliverySettings();
        const estimatedDays = settings.estimated_delivery_days || '3-5';
        const days = estimatedDays.split('-');
        const maxDays = parseInt(days[1]) || 5;

        const today = new Date();
        const estimatedDate = new Date(today);
        estimatedDate.setDate(today.getDate() + maxDays);

        let razorpayOrder = null;
        if (payment_method === 'razorpay') {
            razorpayOrder = await createOrder(totalAmount);
        }

        const [orderResult] = await db.execute(
            `INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, 
             shipping_address, total_amount, delivery_charge, free_delivery_threshold, 
             payment_method, razorpay_order_id, notes, order_status, payment_status, estimated_delivery_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)`,
            [orderNumber, req.user.id, req.user.name, req.user.email, req.user.phone,
                shipping_address, totalAmount, deliveryCharge, settings.free_delivery_threshold || 2000,
                payment_method, razorpayOrder?.id || null, notes, estimatedDate]
        );

        for (const item of cartItems) {
            await db.execute(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderResult.insertId, item.product_id, item.name, item.quantity, item.price]
            );
        }

        await db.execute(
            `INSERT INTO delivery_updates (order_id, status, location, remarks) 
             VALUES (?, 'order_placed', 'System', 'Order has been placed successfully')`,
            [orderResult.insertId]
        );

        await db.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

        res.status(201).json({
            success: true,
            orderId: orderResult.insertId,
            orderNumber: orderNumber,
            razorpayOrder: razorpayOrder,
            totalAmount: totalAmount,
            deliveryCharge: deliveryCharge,
            subtotal: subtotal,
            estimatedDeliveryDate: estimatedDate,
            customerName: req.user.name,
            customerEmail: req.user.email,
            customerPhone: req.user.phone
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order: ' + error.message });
    }
};

// Verify Razorpay payment
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        await db.execute(
            `UPDATE orders SET payment_status = 'success', order_status = 'confirmed', 
             razorpay_payment_id = ?, razorpay_signature = ? 
             WHERE id = ?`,
            [razorpay_payment_id, razorpay_signature, order_id]
        );

        await db.execute(
            `INSERT INTO delivery_updates (order_id, status, location, remarks) 
             VALUES (?, 'confirmed', 'System', 'Payment confirmed. Order is being processed')`,
            [order_id]
        );

        res.json({ success: true, message: 'Payment verified successfully' });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

// Get user orders
const getUserOrders = async (req, res) => {
    try {
        const [orders] = await db.execute(
            `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
            [req.user.id]
        );

        for (let order of orders) {
            const [items] = await db.execute(
                `SELECT * FROM order_items WHERE order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const [orders] = await db.execute(
            `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const [items] = await db.execute(
            `SELECT * FROM order_items WHERE order_id = ?`,
            [req.params.id]
        );

        res.json({ order: orders[0], items });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { order_status, tracking_number, courier_name, tracking_id, remarks } = req.body;

        await db.execute(
            `UPDATE orders SET order_status = ?, tracking_number = ?, courier_name = ?, tracking_id = ? 
             WHERE id = ?`,
            [order_status, tracking_number || null, courier_name || null, tracking_id || null, id]
        );

        await db.execute(
            `INSERT INTO delivery_updates (order_id, status, location, remarks) 
             VALUES (?, ?, 'System', ?)`,
            [id, order_status, remarks || `Order status updated to ${order_status}`]
        );

        if (order_status === 'delivered') {
            await db.execute(
                `UPDATE orders SET actual_delivery_date = CURDATE() WHERE id = ?`,
                [id]
            );
        }

        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

// Get delivery updates for an order
const getDeliveryUpdates = async (req, res) => {
    try {
        const { id } = req.params;
        const [updates] = await db.execute(
            `SELECT * FROM delivery_updates WHERE order_id = ? ORDER BY created_at ASC`,
            [id]
        );
        res.json(updates);
    } catch (error) {
        console.error('Get delivery updates error:', error);
        res.status(500).json({ error: 'Failed to fetch delivery updates' });
    }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
    try {
        const { status, start_date, end_date } = req.query;
        let query = `
            SELECT o.*, COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE 1=1
        `;
        const values = [];

        if (status && status !== 'all') {
            query += ' AND o.order_status = ?';
            values.push(status);
        }

        if (start_date) {
            query += ' AND DATE(o.created_at) >= ?';
            values.push(start_date);
        }

        if (end_date) {
            query += ' AND DATE(o.created_at) <= ?';
            values.push(end_date);
        }

        query += ' GROUP BY o.id ORDER BY o.created_at DESC';

        const [orders] = await db.execute(query, values);

        for (let order of orders) {
            const [items] = await db.execute(
                `SELECT * FROM order_items WHERE order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Update delivery settings (Admin)
const updateDeliverySettings = async (req, res) => {
    try {
        const { base_delivery_charge, free_delivery_threshold, estimated_delivery_days, delivery_partners, cod_available } = req.body;

        if (base_delivery_charge) {
            await db.execute(
                `UPDATE delivery_settings SET setting_value = ? WHERE setting_key = 'base_delivery_charge'`,
                [base_delivery_charge]
            );
        }

        if (free_delivery_threshold) {
            await db.execute(
                `UPDATE delivery_settings SET setting_value = ? WHERE setting_key = 'free_delivery_threshold'`,
                [free_delivery_threshold]
            );
        }

        if (estimated_delivery_days) {
            await db.execute(
                `UPDATE delivery_settings SET setting_value = ? WHERE setting_key = 'estimated_delivery_days'`,
                [estimated_delivery_days]
            );
        }

        if (delivery_partners) {
            await db.execute(
                `UPDATE delivery_settings SET setting_value = ? WHERE setting_key = 'delivery_partners'`,
                [JSON.stringify(delivery_partners)]
            );
        }

        if (cod_available !== undefined) {
            await db.execute(
                `UPDATE delivery_settings SET setting_value = ? WHERE setting_key = 'cod_available'`,
                [cod_available.toString()]
            );
        }

        res.json({ success: true, message: 'Delivery settings updated successfully' });
    } catch (error) {
        console.error('Update delivery settings error:', error);
        res.status(500).json({ error: 'Failed to update delivery settings' });
    }
};

// Get delivery settings API
const getDeliverySettingsAPI = async (req, res) => {
    try {
        const settings = await getDeliverySettings();
        res.json(settings);
    } catch (error) {
        console.error('Get delivery settings error:', error);
        res.status(500).json({ error: 'Failed to fetch delivery settings' });
    }
};

// Request return/refund (Customer)
const requestReturn = async (req, res) => {
    try {
        const { order_id, reason, item_id } = req.body;
        const user_id = req.user.id;

        const [orders] = await db.execute(
            'SELECT * FROM orders WHERE id = ? AND user_id = ? AND order_status = "delivered"',
            [order_id, user_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found or not eligible for return' });
        }

        if (orders[0].return_requested === 1) {
            return res.status(400).json({ error: 'Return already requested for this order' });
        }

        await db.execute(
            `UPDATE orders SET 
                return_requested = 1,
                return_reason = ?,
                return_status = 'pending',
                item_id_for_return = ?
             WHERE id = ?`,
            [reason, item_id || null, order_id]
        );

        await notifyAdmin('New return request', `Order #${orders[0].order_number} has requested return`);

        res.json({ message: 'Return request submitted successfully' });
    } catch (error) {
        console.error('Request return error:', error);
        res.status(500).json({ error: 'Failed to submit return request' });
    }
};

// ============ CANCEL ORDER (Customer) ============
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellation_reason } = req.body;
        const user_id = req.user.id;

        const [orders] = await db.execute(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];

        if (order.order_status !== 'pending' && order.order_status !== 'processing' && order.order_status !== 'confirmed') {
            return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
        }

        await db.execute(
            `UPDATE orders SET 
                order_status = 'cancelled', 
                cancelled_at = NOW(), 
                cancelled_by = ?,
                cancellation_reason = ?
             WHERE id = ?`,
            [user_id, cancellation_reason, id]
        );

        if (order.payment_status === 'success') {
            await initiateRefund(order.id, order.total_amount, order.payment_method);
        }

        await sendOrderUpdateNotification(order.customer_email, order.order_number, 'cancelled');

        res.json({
            message: 'Order cancelled successfully',
            refund_initiated: order.payment_status === 'success'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
};

// ============ ADMIN CANCEL ORDER ============
const adminCancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellation_reason, refund_amount } = req.body;

        const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];

        await db.execute(
            `UPDATE orders SET 
                order_status = 'cancelled', 
                cancelled_at = NOW(), 
                cancelled_by = 'admin',
                cancellation_reason = ?,
                refund_amount = ?,
                refund_status = 'pending'
             WHERE id = ?`,
            [cancellation_reason, refund_amount || order.total_amount, id]
        );

        res.json({ message: 'Order cancelled by admin' });
    } catch (error) {
        console.error('Admin cancel order error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
};

// ============ ADMIN APPROVE/REJECT RETURN ============
const processReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, admin_notes, refund_amount } = req.body;

        const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (action === 'approve') {
            await db.execute(
                `UPDATE orders SET 
                    return_status = 'approved',
                    return_approved_at = NOW(),
                    refund_amount = ?,
                    refund_status = 'pending',
                    admin_notes = ?
                 WHERE id = ?`,
                [refund_amount || orders[0].total_amount, admin_notes, id]
            );

            await initiateRefund(id, refund_amount || orders[0].total_amount, orders[0].payment_method);

            res.json({ message: 'Return approved, refund initiated' });
        } else if (action === 'reject') {
            await db.execute(
                `UPDATE orders SET 
                    return_status = 'rejected',
                    admin_notes = ?
                 WHERE id = ?`,
                [admin_notes, id]
            );
            res.json({ message: 'Return request rejected' });
        } else {
            res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Process return error:', error);
        res.status(500).json({ error: 'Failed to process return' });
    }
};

// ============ GENERATE INVOICE (Returns JSON data for frontend) ============
const generateInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await db.execute(
            `SELECT o.*, u.name as user_name, u.email, u.phone 
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             WHERE o.id = ?`,
            [id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];
        const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [id]);

        // Return JSON data for frontend to generate HTML/PDF
        res.json({
            success: true,
            order: {
                order_number: order.order_number,
                created_at: order.created_at,
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                customer_phone: order.customer_phone,
                shipping_address: order.shipping_address,
                total_amount: order.total_amount,
                delivery_charge: order.delivery_charge,
                payment_method: order.payment_method
            },
            items: items,
            company: {
                name: 'Crazy Nails & Lashes',
                logo: '/logo.png',
                website: 'https://crazynails.com'
            }
        });
    } catch (error) {
        console.error('Generate invoice error:', error);
        res.status(500).json({ error: 'Failed to generate invoice data' });
    }
};

// ============ UPDATE TRACKING ============
const updateTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const { tracking_number, courier_name, estimated_delivery_date } = req.body;

        await db.execute(
            `UPDATE orders SET 
                tracking_number = ?,
                courier_name = ?,
                estimated_delivery_date = ?,
                order_status = 'shipped'
             WHERE id = ?`,
            [tracking_number, courier_name, estimated_delivery_date, id]
        );

        await db.execute(
            `INSERT INTO delivery_updates (order_id, status, remarks, created_at)
             VALUES (?, 'shipped', 'Order has been shipped with ${courier_name}', NOW())`,
            [id]
        );

        res.json({ message: 'Tracking updated successfully' });
    } catch (error) {
        console.error('Update tracking error:', error);
        res.status(500).json({ error: 'Failed to update tracking' });
    }
};

// ============ ADD DELIVERY UPDATE ============
const addDeliveryUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, location, remarks } = req.body;

        await db.execute(
            `INSERT INTO delivery_updates (order_id, status, location, remarks, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [id, status, location, remarks]
        );

        if (status === 'out_for_delivery') {
            await db.execute('UPDATE orders SET order_status = "out_for_delivery" WHERE id = ?', [id]);
        } else if (status === 'delivered') {
            await db.execute(
                'UPDATE orders SET order_status = "delivered", actual_delivery_date = NOW() WHERE id = ?',
                [id]
            );
        }

        res.json({ message: 'Delivery update added' });
    } catch (error) {
        console.error('Add delivery update error:', error);
        res.status(500).json({ error: 'Failed to add delivery update' });
    }
};

// Export all functions
module.exports = {
    createOrderFromCart,
    verifyRazorpayPayment,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getDeliveryUpdates,
    getAllOrders,
    updateDeliverySettings,
    getDeliverySettingsAPI,
    requestReturn,
    cancelOrder,
    adminCancelOrder,
    processReturn,
    generateInvoice,
    updateTracking,
    addDeliveryUpdate
};