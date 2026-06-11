const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
} = require('../controllers/authController');

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', auth, getMe);

router.put('/profile', auth, updateProfile);

router.post('/favorites/:gameId', auth, addFavorite);
router.delete('/favorites/:gameId', auth, removeFavorite);
router.get('/favorites', auth, getFavorites);

module.exports = router;
