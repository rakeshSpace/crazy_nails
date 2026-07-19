const db = require('../config/database');

class Booking {
    static async create(bookingData) {
        const { user_id, service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes } = bookingData;
        
        const [result] = await db.execute(
            `INSERT INTO bookings (user_id, service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [user_id, service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes]
        );
        
        const booking = await this.findById(result.insertId);
        return booking;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT b.*, s.name as service_name, s.duration, s.price 
             FROM bookings b 
             JOIN services s ON b.service_id = s.id 
             WHERE b.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async findAll(filters = {}) {
        let query = `
            SELECT b.*, s.name as service_name, s.duration, s.price 
            FROM bookings b 
            JOIN services s ON b.service_id = s.id 
            WHERE 1=1
        `;
        const values = [];
        
        if (filters.user_id) {
            query += ' AND b.user_id = ?';
            values.push(filters.user_id);
        }
        
        if (filters.email) {
            query += ' AND b.customer_email = ?';
            values.push(filters.email);
        }
        
        if (filters.status) {
            query += ' AND b.status = ?';
            values.push(filters.status);
        }
        
        if (filters.start_date) {
            query += ' AND b.booking_date >= ?';
            values.push(filters.start_date);
        }
        
        if (filters.end_date) {
            query += ' AND b.booking_date <= ?';
            values.push(filters.end_date);
        }
        
        query += ' ORDER BY b.booking_date DESC, b.booking_time ASC';
        
        const [rows] = await db.execute(query, values);
        return rows;
    }

    static async updateStatus(id, status) {
        const [result] = await db.execute(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    static async getAvailableSlots(date, serviceId) {
        const [service] = await db.execute('SELECT duration FROM services WHERE id = ?', [serviceId]);
        const serviceDuration = service[0]?.duration || 60;
        
        const [bookedSlots] = await db.execute(
            'SELECT booking_time FROM bookings WHERE booking_date = ? AND service_id = ? AND status IN ("pending", "confirmed")',
            [date, serviceId]
        );
        
        // Generate available time slots (9 AM to 8 PM)
        const allSlots = [];
        const startHour = 9;
        const endHour = 20;
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const isBooked = bookedSlots.some(slot => slot.booking_time === time);
                if (!isBooked) {
                    allSlots.push(time);
                }
            }
        }
        
        return allSlots;
    }
}

module.exports = Booking;