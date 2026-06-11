import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { gamesData } from '../games';
import { FiAward, FiUsers, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('global');
  const [selectedGame, setSelectedGame] = useState('');
  const [gameLeaderboard, setGameLeaderboard] = useState([]);
  const [gameLbLoading, setGameLbLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/leaderboard')
      .then((res) => {
        const data = res.data;
        setLeaderboard(data.leaderboard || data.data || data || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load leaderboard');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedGame) {
      setGameLeaderboard([]);
      return;
    }
    setGameLbLoading(true);
    api.get(`/games/${selectedGame}/leaderboard`)
      .then((res) => {
        const data = res.data;
        setGameLeaderboard(data.leaderboard || data.data || data || []);
      })
      .catch(() => setGameLeaderboard([]))
      .finally(() => setGameLbLoading(false));
  }, [selectedGame]);

  const displayData = activeTab === 'global' ? leaderboard : gameLeaderboard;
  const isLoading = activeTab === 'global' ? loading : gameLbLoading;

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-5xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="section-title text-4xl mb-2">Leaderboard</h1>
          <p className="text-gray-400">Top players competing across JAS1 games</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'global'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'glassmorphism text-gray-400 hover:text-white'
              }`}
            >
              <FiTrendingUp className="inline mr-1.5" /> Global
            </button>
            <button
              onClick={() => setActiveTab('game')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'game'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'glassmorphism text-gray-400 hover:text-white'
              }`}
            >
              <FiAward className="inline mr-1.5" /> Per Game
            </button>
          </div>

          {activeTab === 'game' && (
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="input-field max-w-xs text-sm"
            >
              <option value="">Select a game...</option>
              {gamesData.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <span className="text-5xl block mb-4">⚠️</span>
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-outline inline-flex items-center gap-2">
              <FiRefreshCw /> Retry
            </button>
          </motion.div>
        ) : displayData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FiAward className="text-5xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No entries yet</h3>
            <p className="text-gray-400">Be the first to make it on the leaderboard!</p>
          </motion.div>
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.05 } },
            }}
          >
            <div className="glassmorphism rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Player</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Games Played</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayData.slice(0, 50).map((entry, i) => (
                      <motion.tr
                        key={entry._id || entry.userId || i}
                        variants={{
                          initial: { opacity: 0, x: -20 },
                          animate: { opacity: 1, x: 0 },
                        }}
                        className={`hover:bg-white/5 transition-colors ${
                          i < 3 ? 'bg-gradient-to-r from-transparent via-transparent to-transparent' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {i === 0 ? (
                              <span className="text-2xl">🥇</span>
                            ) : i === 1 ? (
                              <span className="text-2xl">🥈</span>
                            ) : i === 2 ? (
                              <span className="text-2xl">🥉</span>
                            ) : (
                              <span className="text-sm font-bold text-gray-500 w-8 text-center">#{i + 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              i === 1 ? 'bg-gray-400/20 text-gray-300' :
                              i === 2 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {(entry.username || entry.user?.username || 'A').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-white">
                              {entry.username || entry.user?.username || 'Anonymous'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-bold ${
                            i === 0 ? 'text-yellow-400' :
                            i === 1 ? 'text-gray-300' :
                            i === 2 ? 'text-orange-400' :
                            'text-primary'
                          }`}>
                            {entry.score?.toLocaleString() || entry.totalScore?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-400 hidden sm:table-cell">
                          {entry.gamesPlayed || entry.games_count || 0}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
