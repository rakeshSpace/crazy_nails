const express = require('express');
const { createBooking, getUserBookings, getAllBookings, updateBookingStatus, getAvailableSlots } = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, bookingValidation } = require('../middleware/validation');
const router = express.Router();

router.post('/', validate(bookingValidation), createBooking);
router.get('/slots', getAvailableSlots);
router.get('/my-bookings', authenticate, getUserBookings);
router.get('/', authenticate, authorize('admin', 'staff'), getAllBookings);
router.put('/:id/status', authenticate, authorize('admin', 'staff'), updateBookingStatus);

module.exports = router;