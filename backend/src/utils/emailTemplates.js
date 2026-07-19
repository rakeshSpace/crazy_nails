// backend/src/utils/emailTemplates.js
const bookingConfirmation = (booking) => `
    <h2>Booking Confirmed!</h2>
    <p>Dear ${booking.customer_name},</p>
    <p>Your appointment has been confirmed for ${booking.booking_date} at ${booking.booking_time}.</p>
    <p><strong>Service:</strong> ${booking.service_name}</p>
    <p><strong>Price:</strong> ₹${booking.price}</p>
    <p>Please arrive 10 minutes before your appointment time.</p>
`;