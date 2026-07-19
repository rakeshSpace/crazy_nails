const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, password_hash, 'user']
        );

        const token = generateToken(result.insertId);

        const [user] = await db.execute(
            'SELECT id, name, email, phone, role FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: user[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        const token = generateToken(user.id);

        // Store session
        await db.execute(
            'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
            [user.id, token]
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

const getProfile = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        await db.execute(
            'UPDATE users SET name = ?, phone = ? WHERE id = ?',
            [name, phone, req.user.id]
        );

        const [users] = await db.execute(
            'SELECT id, name, email, phone, role FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({ message: 'Profile updated successfully', user: users[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

const logout = async (req, res) => {
    try {
        await db.execute('DELETE FROM user_sessions WHERE token = ?', [req.token]);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'User role updated' });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        await db.execute('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);
        res.json({ message: 'User status updated' });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role } = req.body;

        await db.execute(
            'UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
            [name, email, phone, role, id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is admin
        const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [id]);
        if (users[0]?.role === 'admin') {
            return res.status(400).json({ error: 'Cannot delete admin user' });
        }

        await db.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    updateUser,
    deleteUser
};