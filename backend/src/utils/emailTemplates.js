// backend/src/utils/emailTemplates.js

const wrapper = (bodyHtml) => `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #2c2c2c;">
        <div style="background: linear-gradient(135deg, #d4a574, #8b7355); padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 20px;">Crazy Nails & Lashes</h1>
        </div>
        <div style="border: 1px solid #eee; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            ${bodyHtml}
        </div>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 16px;">
            This is an automated email. For queries, contact us at your registered support email.
        </p>
    </div>
`;

const bookingConfirmation = (booking) => `
    <h2>Booking Confirmed!</h2>
    <p>Dear ${booking.customer_name},</p>
    <p>Your appointment has been confirmed for ${booking.booking_date} at ${booking.booking_time}.</p>
    <p><strong>Service:</strong> ${booking.service_name}</p>
    <p><strong>Price:</strong> ₹${booking.price}</p>
    <p>Please arrive 10 minutes before your appointment time.</p>
`;

// ---------------------------------------------------------------------------
// Order lifecycle templates
// ---------------------------------------------------------------------------

const orderPlaced = (order) => wrapper(`
    <h2 style="color:#d4a574;">Order Placed Successfully! 🎉</h2>
    <p>Hi ${order.customer_name},</p>
    <p>Thank you for your order! Here are the details:</p>
    <table style="width:100%; margin: 16px 0; font-size: 14px;">
        <tr><td style="padding:4px 0;color:#777;">Order Number</td><td style="padding:4px 0;font-weight:bold;">${order.order_number}</td></tr>
        <tr><td style="padding:4px 0;color:#777;">Total Amount</td><td style="padding:4px 0;font-weight:bold;">₹${order.total_amount}</td></tr>
        <tr><td style="padding:4px 0;color:#777;">Payment Method</td><td style="padding:4px 0;">${order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</td></tr>
    </table>
    <p>We'll notify you as soon as your order is confirmed and shipped.</p>
`);

const orderConfirmed = (order) => wrapper(`
    <h2 style="color:#27ae60;">Order Confirmed ✅</h2>
    <p>Hi ${order.customer_name},</p>
    <p>Great news — your payment has been received and order <strong>#${order.order_number}</strong> is now confirmed. We're preparing it for shipment.</p>
    <p><strong>Total Paid:</strong> ₹${order.total_amount}</p>
`);

const orderStatusUpdate = (order, status, extra = {}) => {
    const statusMessages = {
        processing: { title: 'Order is Being Processed 📦', desc: 'Your order is being prepared and will be shipped soon.' },
        shipped: { title: 'Order Shipped! 🚚', desc: 'Your order is on its way to you.' },
        out_for_delivery: { title: 'Out for Delivery 🛵', desc: 'Your order will be delivered today!' },
        delivered: { title: 'Order Delivered! 🎁', desc: 'Your order has been delivered. We hope you love it!' }
    };
    const info = statusMessages[status] || { title: 'Order Status Updated', desc: `Your order status is now: ${status}` };

    return wrapper(`
        <h2 style="color:#d4a574;">${info.title}</h2>
        <p>Hi ${order.customer_name},</p>
        <p>${info.desc}</p>
        <table style="width:100%; margin: 16px 0; font-size: 14px;">
            <tr><td style="padding:4px 0;color:#777;">Order Number</td><td style="padding:4px 0;font-weight:bold;">${order.order_number}</td></tr>
            ${extra.courier_name ? `<tr><td style="padding:4px 0;color:#777;">Courier</td><td style="padding:4px 0;">${extra.courier_name}</td></tr>` : ''}
            ${extra.tracking_number ? `<tr><td style="padding:4px 0;color:#777;">Tracking Number</td><td style="padding:4px 0;">${extra.tracking_number}</td></tr>` : ''}
        </table>
    `);
};

const orderCancelled = (order, cancelledBy = 'customer') => wrapper(`
    <h2 style="color:#e74c3c;">Order Cancelled</h2>
    <p>Hi ${order.customer_name},</p>
    <p>Your order <strong>#${order.order_number}</strong> has been cancelled${cancelledBy === 'admin' ? ' by our team' : ''}.</p>
    ${order.cancellation_reason ? `<p><strong>Reason:</strong> ${order.cancellation_reason}</p>` : ''}
    <p>If you paid online, your refund of ₹${order.total_amount} will be processed within 5-7 business days.</p>
`);

const returnApproved = (order, refundAmount) => wrapper(`
    <h2 style="color:#27ae60;">Return Approved ✅</h2>
    <p>Hi ${order.customer_name},</p>
    <p>Your return request for order <strong>#${order.order_number}</strong> has been approved.</p>
    <p>Our courier partner will pick up the item shortly. A refund of ₹${refundAmount} will be initiated once the item passes quality check.</p>
`);

const returnRejected = (order, adminNote) => wrapper(`
    <h2 style="color:#e74c3c;">Return Request Update</h2>
    <p>Hi ${order.customer_name},</p>
    <p>Unfortunately, your return request for order <strong>#${order.order_number}</strong> could not be approved.</p>
    ${adminNote ? `<p><strong>Reason:</strong> ${adminNote}</p>` : ''}
    <p>If you have questions, please reach out to our support team.</p>
`);

const refundInitiated = (order, amount) => wrapper(`
    <h2 style="color:#27ae60;">Refund Initiated 💰</h2>
    <p>Hi ${order.customer_name},</p>
    <p>A refund of <strong>₹${amount}</strong> for order <strong>#${order.order_number}</strong> has been initiated to your original payment method.</p>
    <p>It typically takes 5-7 business days to reflect in your account.</p>
`);

module.exports = {
    bookingConfirmation,
    orderPlaced,
    orderConfirmed,
    orderStatusUpdate,
    orderCancelled,
    returnApproved,
    returnRejected,
    refundInitiated
};