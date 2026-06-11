const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getStats,
  createGame,
  updateGame,
  deleteGame,
} = require('../controllers/adminController');

router.use(auth, admin);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);
router.post('/games', createGame);
router.put('/games/:gameId', updateGame);
router.delete('/games/:gameId', deleteGame);

module.exports = router;
