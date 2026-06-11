const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const {
  getGames,
  getGame,
  getCategories,
  getTrending,
  incrementPlayCount,
  submitScore,
  getLeaderboard,
  getGlobalLeaderboard,
} = require('../controllers/gameController');

router.get('/', getGames);
router.get('/categories', getCategories);
router.get('/trending', getTrending);
router.get('/global/leaderboard', getGlobalLeaderboard);
router.get('/:gameId', getGame);
router.post('/:gameId/play', optionalAuth, incrementPlayCount);
router.post('/:gameId/score', auth, submitScore);
router.get('/:gameId/leaderboard', getLeaderboard);

module.exports = router;
