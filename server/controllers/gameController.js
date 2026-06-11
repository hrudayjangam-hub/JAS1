const Game = require('../models/Game');
const Score = require('../models/Score');
const User = require('../models/User');

exports.getGames = async (req, res) => {
  try {
    const { category, search, difficulty, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const games = await Game.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Game.countDocuments(filter);

    res.json({
      games,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('GetGames error:', error.message);
    res.status(500).json({ message: 'Server error fetching games' });
  }
};

exports.getGame = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json({ game });
  } catch (error) {
    console.error('GetGame error:', error.message);
    res.status(500).json({ message: 'Server error fetching game' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Game.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('GetCategories error:', error.message);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const games = await Game.find().sort({ playCount: -1 }).limit(10);
    res.json({ games });
  } catch (error) {
    console.error('GetTrending error:', error.message);
    res.status(500).json({ message: 'Server error fetching trending games' });
  }
};

exports.incrementPlayCount = async (req, res) => {
  try {
    const game = await Game.findOneAndUpdate(
      { gameId: req.params.gameId },
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (req.user) {
      const user = await User.findById(req.user._id);
      const existingIndex = user.recentlyPlayed.findIndex(
        (rp) => rp.gameId && rp.gameId.toString() === game._id.toString()
      );
      const entry = { gameId: game._id, gameName: game.title, playedAt: new Date() };

      if (existingIndex !== -1) {
        user.recentlyPlayed[existingIndex].playedAt = new Date();
      } else {
        user.recentlyPlayed.unshift(entry);
        if (user.recentlyPlayed.length > 20) {
          user.recentlyPlayed = user.recentlyPlayed.slice(0, 20);
        }
      }
      user.stats.gamesPlayed += 1;
      await user.save();
    }

    res.json({ message: 'Play count updated', playCount: game.playCount });
  } catch (error) {
    console.error('IncrementPlayCount error:', error.message);
    res.status(500).json({ message: 'Server error updating play count' });
  }
};

exports.submitScore = async (req, res) => {
  try {
    const { score } = req.body;
    const { gameId } = req.params;

    if (score === undefined || score === null || typeof score !== 'number') {
      return res.status(400).json({ message: 'Valid score is required' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to submit score' });
    }

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const scoreDoc = await Score.create({
      userId: req.user._id,
      gameId: game._id,
      score,
      username: req.user.username,
    });

    const isHighScore = game.highScores.length < 10 || score > game.highScores[game.highScores.length - 1].score;
    if (isHighScore) {
      const existingIndex = game.highScores.findIndex(
        (hs) => hs.userId.toString() === req.user._id.toString()
      );

      if (existingIndex !== -1) {
        if (score > game.highScores[existingIndex].score) {
          game.highScores[existingIndex].score = score;
          game.highScores[existingIndex].date = new Date();
        }
      } else {
        game.highScores.push({
          userId: req.user._id,
          username: req.user.username,
          score,
          date: new Date(),
        });
      }

      game.highScores.sort((a, b) => b.score - a.score);
      if (game.highScores.length > 10) {
        game.highScores = game.highScores.slice(0, 10);
      }
      await game.save();
    }

    const user = await User.findById(req.user._id);
    user.stats.totalScore += score;
    if (score > user.stats.totalScore) {
      user.stats.rankingPoints += Math.floor(score / 10);
    }
    await user.save();

    res.status(201).json({
      message: 'Score submitted',
      score: scoreDoc,
      isHighScore,
    });
  } catch (error) {
    console.error('SubmitScore error:', error.message);
    res.status(500).json({ message: 'Server error submitting score' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const scores = await Score.find({ gameId: game._id })
      .sort({ score: -1 })
      .limit(50)
      .select('username score playedAt');

    res.json({ leaderboard: scores });
  } catch (error) {
    console.error('GetLeaderboard error:', error.message);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Score.aggregate([
      {
        $group: {
          _id: '$username',
          totalScore: { $sum: '$score' },
          gamesPlayed: { $sum: 1 },
          highestScore: { $max: '$score' },
          lastPlayed: { $max: '$playedAt' },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 100 },
    ]);

    res.json({ leaderboard });
  } catch (error) {
    console.error('GetGlobalLeaderboard error:', error.message);
    res.status(500).json({ message: 'Server error fetching global leaderboard' });
  }
};
