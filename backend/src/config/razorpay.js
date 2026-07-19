const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (amount, currency = 'INR') => {
    try {
        const options = {
            amount: amount * 100, // Amount in paise
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw error;
    }
};

const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    
    return expectedSignature === razorpaySignature;
};

module.exports = { razorpay, createOrder, verifyPayment };