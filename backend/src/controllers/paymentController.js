// backend/src/controllers/paymentController.js

const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/database');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SotNYgu7LVeM0h',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

const createOrder = async (req, res) => {
    try {
        const { amount, course_id, course_name } = req.body;
        
        console.log('Creating order for course:', course_id, 'Amount:', amount);
        
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: 'INR',
            receipt: `course_${course_id}_${Date.now()}`,
            notes: {
                course_id: course_id,
                course_name: course_name,
                user_id: req.user.id
            }
        };
        
        const order = await razorpay.orders.create(options);
        
        console.log('Order created:', order.id);
        
        // Store order in database (optional)
        await db.execute(
            `INSERT INTO course_payments (user_id, course_id, amount, order_id, status) 
             VALUES (?, ?, ?, ?, 'pending')`,
            [req.user.id, course_id, amount, order.id]
        );
        
        res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order: ' + error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { order_id, payment_id, signature, course_id } = req.body;
        
        const body = order_id + '|' + payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET')
            .update(body.toString())
            .digest('hex');
        
        if (expectedSignature === signature) {
            // Update payment status
            await db.execute(
                `UPDATE course_payments 
                 SET payment_id = ?, status = 'completed', updated_at = NOW() 
                 WHERE order_id = ?`,
                [payment_id, order_id]
            );
            
            // Get payment details
            const [payment] = await db.execute(
                'SELECT user_id, course_id FROM course_payments WHERE order_id = ?',
                [order_id]
            );
            
            if (payment.length > 0) {
                // Check if already enrolled
                const [existing] = await db.execute(
                    'SELECT id FROM user_enrollments WHERE user_id = ? AND course_id = ?',
                    [payment[0].user_id, payment[0].course_id]
                );
                
                if (existing.length === 0) {
                    // Enroll user
                    await db.execute(
                        `INSERT INTO user_enrollments (user_id, course_id, enrollment_date, status, completion_percentage)
                         VALUES (?, ?, NOW(), 'active', 0)`,
                        [payment[0].user_id, payment[0].course_id]
                    );
                }
            }
            
            res.json({ success: true, message: 'Payment verified and enrollment completed' });
        } else {
            res.status(400).json({ success: false, error: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

module.exports = { createOrder, verifyPayment };