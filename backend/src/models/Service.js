const db = require('../config/database');

class Service {
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM services WHERE is_active = 1';
        const values = [];
        
        if (filters.category) {
            query += ' AND category = ?';
            values.push(filters.category);
        }
        
        query += ' ORDER BY display_order ASC, id ASC';
        
        const [rows] = await db.execute(query, values);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM services WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(serviceData) {
        const { name, category, description, price, duration, image_url, display_order } = serviceData;
        const [result] = await db.execute(
            'INSERT INTO services (name, category, description, price, duration, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, category, description, price, duration, image_url, display_order]
        );
        return result.insertId;
    }

    static async update(id, updateData) {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length === 0) return false;
        
        values.push(id);
        const [result] = await db.execute(
            `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute('UPDATE services SET is_active = 0 WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Service;