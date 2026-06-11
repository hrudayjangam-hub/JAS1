const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Game = require('../models/Game');

const JWT_SECRET = process.env.JWT_SECRET || 'jas1_jwt_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites')
      .populate('recentlyPlayed.gameId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      favorites: user.favorites,
      recentlyPlayed: user.recentlyPlayed,
      stats: user.stats,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const updateFields = {};

    if (username !== undefined) {
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
      }
      const existing = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updateFields.username = username;
    }

    if (avatar !== undefined) {
      updateFields.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      stats: user.stats,
    });
  } catch (error) {
    console.error('UpdateProfile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.favorites.includes(gameId)) {
      return res.status(400).json({ message: 'Game already in favorites' });
    }

    user.favorites.push(gameId);
    await user.save();

    res.json({ message: 'Game added to favorites', favorites: user.favorites });
  } catch (error) {
    console.error('AddFavorite error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid game ID' });
    }
    res.status(500).json({ message: 'Server error adding favorite' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { gameId } = req.params;

    const user = await User.findById(req.user._id);
    const index = user.favorites.indexOf(gameId);
    if (index === -1) {
      return res.status(400).json({ message: 'Game not in favorites' });
    }

    user.favorites.splice(index, 1);
    await user.save();

    res.json({ message: 'Game removed from favorites', favorites: user.favorites });
  } catch (error) {
    console.error('RemoveFavorite error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid game ID' });
    }
    res.status(500).json({ message: 'Server error removing favorite' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('GetFavorites error:', error.message);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
};
