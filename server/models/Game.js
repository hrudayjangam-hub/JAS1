const mongoose = require('mongoose');

const highScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
}, { _id: false });

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: [true, 'gameId is required'],
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
  instructions: {
    type: String,
    default: '',
  },
  controls: {
    type: String,
    default: '',
  },
  rules: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  maxPlayers: {
    type: Number,
    default: 1,
  },
  highScores: [highScoreSchema],
  playCount: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
}, {
  timestamps: true,
});

gameSchema.index({ category: 1 });
gameSchema.index({ playCount: -1 });
gameSchema.index({ title: 'text', description: 'text' });

gameSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.highScores = obj.highScores.sort((a, b) => b.score - a.score).slice(0, 10);
  return obj;
};

module.exports = mongoose.model('Game', gameSchema);
