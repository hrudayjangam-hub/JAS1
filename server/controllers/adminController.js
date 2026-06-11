const User = require('../models/User');
const Game = require('../models/Game');
const Score = require('../models/Score');

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('GetUsers error:', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('favorites')
      .populate('recentlyPlayed.gameId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('GetUserById error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, role, avatar } = req.body;
    const updateFields = {};

    if (username !== undefined) updateFields.username = username;
    if (email !== undefined) updateFields.email = email;
    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Role must be user or admin' });
      }
      updateFields.role = role;
    }
    if (avatar !== undefined) updateFields.avatar = avatar;

    if (username || email) {
      const conflictQuery = [];
      if (username) conflictQuery.push({ username, _id: { $ne: req.params.id } });
      if (email) conflictQuery.push({ email, _id: { $ne: req.params.id } });

      if (conflictQuery.length > 0) {
        const existing = await User.findOne({ $or: conflictQuery });
        if (existing) {
          if (username && existing.username === username) {
            return res.status(400).json({ message: 'Username already taken' });
          }
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('UpdateUser error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Score.deleteMany({ userId: req.params.id });

    res.json({ message: 'User and associated scores deleted' });
  } catch (error) {
    console.error('DeleteUser error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGames = await Game.countDocuments();
    const totalScores = await Score.countDocuments();

    const scoreAgg = await Score.aggregate([
      { $group: { _id: null, totalScore: { $sum: '$score' } } },
    ]);
    const totalScore = scoreAgg.length > 0 ? scoreAgg[0].totalScore : 0;

    const userAgg = await User.aggregate([
      { $group: { _id: null, totalGamesPlayed: { $sum: '$stats.gamesPlayed' }, totalRankingPoints: { $sum: '$stats.rankingPoints' } } },
    ]);
    const totalGamesPlayed = userAgg.length > 0 ? userAgg[0].totalGamesPlayed : 0;
    const totalRankingPoints = userAgg.length > 0 ? userAgg[0].totalRankingPoints : 0;

    const topGames = await Game.find().sort({ playCount: -1 }).limit(5).select('title playCount');
    const topPlayers = await Score.aggregate([
      { $group: { _id: '$username', totalScore: { $sum: '$score' } } },
      { $sort: { totalScore: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalUsers,
      totalGames,
      totalScores,
      totalScore,
      totalGamesPlayed,
      totalRankingPoints,
      topGames,
      topPlayers,
    });
  } catch (error) {
    console.error('GetStats error:', error.message);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

exports.createGame = async (req, res) => {
  try {
    const { gameId, title, description, category, thumbnail, url, instructions, controls, rules, difficulty, maxPlayers } = req.body;

    if (!gameId || !title || !category) {
      return res.status(400).json({ message: 'gameId, title, and category are required' });
    }

    const existing = await Game.findOne({ gameId });
    if (existing) {
      return res.status(400).json({ message: 'Game with this gameId already exists' });
    }

    const game = await Game.create({
      gameId,
      title,
      description,
      category,
      thumbnail,
      url,
      instructions,
      controls,
      rules,
      difficulty,
      maxPlayers,
    });

    res.status(201).json({ game });
  } catch (error) {
    console.error('CreateGame error:', error.message);
    res.status(500).json({ message: 'Server error creating game' });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const updateFields = {};

    const fields = ['title', 'description', 'category', 'thumbnail', 'url', 'instructions', 'controls', 'rules', 'difficulty', 'maxPlayers', 'rating'];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }

    const game = await Game.findOneAndUpdate(
      { gameId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({ game });
  } catch (error) {
    console.error('UpdateGame error:', error.message);
    res.status(500).json({ message: 'Server error updating game' });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findOneAndDelete({ gameId });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    await Score.deleteMany({ gameId: game._id });

    await User.updateMany(
      { favorites: game._id },
      { $pull: { favorites: game._id } }
    );

    res.json({ message: 'Game, associated scores, and favorites references deleted' });
  } catch (error) {
    console.error('DeleteGame error:', error.message);
    res.status(500).json({ message: 'Server error deleting game' });
  }
};
