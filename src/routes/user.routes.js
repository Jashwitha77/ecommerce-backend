const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');

const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (Logged-in users)
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

// Admin-only routes
router.get('/', authenticate, authorizeRoles('admin'), getAllUsers);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteUser);

module.exports = router;
