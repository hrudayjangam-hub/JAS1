import { useState, useEffect, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getGameById } from '../games';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GameContext';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiAward, FiUsers, FiTarget, FiAlertCircle, FiInfo, FiPlay, FiClock } from 'react-icons/fi';

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addRecentlyPlayed, submitScore, getLeaderboard } = useGames();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [score, setScore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    const g = getGameById(gameId);
    if (g) {
      setGame(g);
      setLoading(false);
      addRecentlyPlayed(gameId);
      api.post(`/games/${gameId}/play`).catch(() => {});
      setPlayCount((prev) => prev + 1);
    } else {
      setLoading(false);
      setGame(null);
    }
  }, [gameId, getGameById, addRecentlyPlayed]);

  useEffect(() => {
    if (!gameId) return;
    setLbLoading(true);
    getLeaderboard(gameId)
      .then((data) => setLeaderboard(Array.isArray(data) ? data.slice(0, 10) : []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLbLoading(false));
  }, [gameId, getLeaderboard]);

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit scores');
      return;
    }
    const scoreVal = parseInt(score);
    if (isNaN(scoreVal) || scoreVal < 0) {
      toast.error('Please enter a valid score');
      return;
    }
    setSubmitting(true);
    try {
      await submitScore(gameId, scoreVal);
      toast.success('Score submitted!');
      setScore('');
      const updated = await getLeaderboard(gameId);
      setLeaderboard(Array.isArray(updated) ? updated.slice(0, 10) : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-4">
        <span className="text-6xl mb-4">🔍</span>
        <h2 className="text-2xl font-bold text-white mb-2">Game Not Found</h2>
        <p className="text-gray-400 mb-6">The game you're looking for doesn't exist</p>
        <Link to="/games" className="btn-primary">Browse Games</Link>
      </div>
    );
  }

  const GameComponent = game.component;

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <FiArrowLeft /> Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              <div className="glassmorphism rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h1 className="text-3xl font-bold text-white">{game.title}</h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {game.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${difficultyColors[game.difficulty]}`}>
                        {game.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{game.maxPlayers === 1 ? '1 Player' : `${game.maxPlayers} Players`}</span>
                    </div>
                  </div>
                </div>

                <div className="glassmorphism rounded-xl overflow-hidden bg-dark-100/50">
                  <Suspense
                    fallback={
                      <div className="h-[400px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-gray-400">Loading game...</p>
                        </div>
                      </div>
                    }
                  >
                    <GameComponent />
                  </Suspense>
                </div>
              </div>

              <div className="glassmorphism rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <FiInfo className="text-primary" /> About
                </h2>
                <p className="text-gray-400 leading-relaxed">{game.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="glassmorphism rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <FiTarget className="text-primary" /> Instructions
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{game.instructions}</p>
                </div>
                <div className="glassmorphism rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <FiPlay className="text-primary" /> Controls
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{game.controls}</p>
                </div>
                <div className="glassmorphism rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <FiAlertCircle className="text-primary" /> Rules
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{game.rules}</p>
                </div>
              </div>
            </div>

            <div className="lg:w-80 space-y-6">
              <div className="glassmorphism rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiAward className="text-primary" /> Submit Score
                </h2>
                {user ? (
                  <form onSubmit={handleScoreSubmit} className="space-y-3">
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="Enter your score"
                      className="input-field text-sm"
                      min="0"
                    />
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Submit Score'
                      )}
                    </motion.button>
                  </form>
                ) : (
                  <p className="text-sm text-gray-400">
                    <Link to="/login" className="text-primary hover:underline">Login</Link> to submit scores
                  </p>
                )}
              </div>

              <div className="glassmorphism rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiUsers className="text-primary" /> Leaderboard
                </h2>
                {lbLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No scores yet. Be the first!</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => (
                      <motion.div
                        key={entry._id || entry.userId || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center justify-between p-2.5 rounded-lg ${
                          i === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                          i === 1 ? 'bg-gray-400/10 border border-gray-400/20' :
                          i === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                          'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`text-sm font-bold w-6 text-center ${
                            i === 0 ? 'text-yellow-400' :
                            i === 1 ? 'text-gray-300' :
                            i === 2 ? 'text-orange-400' :
                            'text-gray-500'
                          }`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </span>
                          <span className="text-sm text-white truncate max-w-[100px]">
                            {entry.username || entry.user?.username || 'Anonymous'}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-primary">{entry.score}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
