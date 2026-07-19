const express = require('express');
const { register, login, getProfile, updateProfile, logout, getAllUsers, updateUserRole, updateUserStatus, deleteUser, updateUser } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

// Admin only routes
router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.put('/users/:id/role', authenticate, authorize('admin'), updateUserRole);
router.put('/users/:id/status', authenticate, authorize('admin'), updateUserStatus);
router.put('/users/:id', authenticate, authorize('admin'), updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;