import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { gamesData } from '../games';
import { FiMonitor, FiAward, FiTrendingUp, FiHeart, FiPlay, FiBarChart2, FiUsers, FiClock } from 'react-icons/fi';
import { FaRocket } from 'react-icons/fa';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentPlayed, setRecentPlayed] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setStatsLoading(true);
    api.get('/auth/stats')
      .then((res) => setStats(res.data.stats || res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));

    try {
      const stored = JSON.parse(localStorage.getItem('jas1_recently_played') || '[]');
      const games = stored.map((id) => gamesData.find((g) => g.id === id)).filter(Boolean);
      setRecentPlayed(games);
    } catch {
      setRecentPlayed([]);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const statCards = [
    { label: 'Games Played', value: stats?.gamesPlayed || 0, icon: FiMonitor, color: 'from-blue-500/20 to-blue-600/10', textColor: 'text-blue-400' },
    { label: 'Total Score', value: (stats?.totalScore || 0).toLocaleString(), icon: FiAward, color: 'from-yellow-500/20 to-yellow-600/10', textColor: 'text-yellow-400' },
    { label: 'Ranking', value: `#${stats?.ranking || stats?.rank || '-'}`, icon: FiTrendingUp, color: 'from-purple-500/20 to-purple-600/10', textColor: 'text-purple-400' },
    { label: 'Favorites', value: stats?.favoritesCount || user.favorites?.length || 0, icon: FiHeart, color: 'from-red-500/20 to-red-600/10', textColor: 'text-red-400' },
  ];

  const quickActions = [
    { label: 'Play Games', icon: FiPlay, to: '/games', color: 'bg-primary/10 text-primary hover:bg-primary/20' },
    { label: 'Leaderboard', icon: FiBarChart2, to: '/leaderboard', color: 'bg-secondary/10 text-secondary hover:bg-secondary/20' },
    { label: 'Browse Categories', icon: FiGrid, to: '/categories', color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
    { label: 'View Profile', icon: FiUsers, to: '/profile', color: 'bg-green-500/10 text-green-400 hover:bg-green-500/20' },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {(user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, <span className="gradient-text">{user.username || 'Player'}</span>
              </h1>
              <p className="text-gray-400">Ready to level up your gaming?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glassmorphism rounded-xl p-5 bg-gradient-to-br ${stat.color} relative overflow-hidden group hover:border-primary/20 transition-all duration-300`}
              >
                <stat.icon className={`text-2xl mb-3 ${stat.textColor}`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glassmorphism rounded-xl p-6 h-full"
              >
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiClock className="text-primary" /> Recently Played
                </h2>
                {recentPlayed.length === 0 ? (
                  <div className="text-center py-10">
                    <FiMonitor className="text-4xl text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No games played yet</p>
                    <Link to="/games" className="btn-primary text-sm mt-4 inline-flex items-center gap-2">
                      <FiPlay /> Start Playing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {recentPlayed.slice(0, 6).map((game) => (
                      <Link
                        key={game.id}
                        to={`/games/${game.id}`}
                        className="glassmorphism rounded-lg p-4 text-center hover:border-primary/30 transition-all duration-300 group"
                      >
                        <span className="text-3xl block mb-2">🎮</span>
                        <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{game.title}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{game.category}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glassmorphism rounded-xl p-6"
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaRocket className="text-primary" /> Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action, i) => (
                  <Link
                    key={i}
                    to={action.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${action.color}`}
                  >
                    <action.icon size={18} />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FiGrid(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
