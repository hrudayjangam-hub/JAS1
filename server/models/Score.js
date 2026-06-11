const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
  },
  username: {
    type: String,
    required: true,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

scoreSchema.index({ gameId: 1, score: -1 });
scoreSchema.index({ userId: 1, gameId: 1 });

module.exports = mongoose.model('Score', scoreSchema);
