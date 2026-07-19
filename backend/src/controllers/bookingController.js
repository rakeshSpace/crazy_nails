const db = require('../config/database');

const createBooking = async (req, res) => {
    try {
        const { user_id, service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO bookings (user_id, service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [user_id || null, service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes]
        );
        
        const [booking] = await db.execute(
            `SELECT b.*, s.name as service_name, s.duration, s.price 
             FROM bookings b 
             JOIN services s ON b.service_id = s.id 
             WHERE b.id = ?`,
            [result.insertId]
        );
        
        res.status(201).json({
            message: 'Booking created successfully',
            booking: booking[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const [bookings] = await db.execute(
            `SELECT b.*, s.name as service_name, s.duration, s.price 
             FROM bookings b 
             JOIN services s ON b.service_id = s.id 
             WHERE b.user_id = ? 
             ORDER BY b.booking_date DESC, b.booking_time DESC`,
            [req.user.id]
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

const getAllBookings = async (req, res) => {
    try {
        let query = `
            SELECT b.*, s.name as service_name, s.duration, s.price 
            FROM bookings b 
            JOIN services s ON b.service_id = s.id 
            WHERE 1=1
        `;
        const values = [];
        
        if (req.query.status) {
            query += ' AND b.status = ?';
            values.push(req.query.status);
        }
        
        query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';
        
        const [bookings] = await db.execute(query, values);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Booking status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update booking' });
    }
};

const getAvailableSlots = async (req, res) => {
    try {
        const { date, service_id } = req.query;
        
        // Get service duration
        const [service] = await db.execute('SELECT duration FROM services WHERE id = ?', [service_id]);
        const serviceDuration = service[0]?.duration || 60;
        
        // Get booked slotss
        const [bookedSlots] = await db.execute(
            'SELECT booking_time FROM bookings WHERE booking_date = ? AND service_id = ? AND status IN ("pending", "confirmed")',
            [date, service_id]
        );
        
        const bookedTimes = bookedSlots.map(slot => slot.booking_time);
        
        // Generate available time slots (9 AM to 8 PM)
        const allSlots = [];
        for (let hour = 9; hour < 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                if (!bookedTimes.includes(time)) {
                    allSlots.push(time);
                }
            }
        }
        
        res.json({ slots: allSlots });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch available slots' });
    }
};

module.exports = { createBooking, getUserBookings, getAllBookings, updateBookingStatus, getAvailableSlots };