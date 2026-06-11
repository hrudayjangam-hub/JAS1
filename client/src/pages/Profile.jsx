import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { gamesData } from '../games';
import toast from 'react-hot-toast';
import { FiEdit2, FiSave, FiX, FiAward, FiMonitor, FiStar, FiTrendingUp, FiClock, FiHeart, FiPlay } from 'react-icons/fi';

export default function Profile() {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setUsername(user.username || '');
    setStatsLoading(true);
    api.get('/auth/stats')
      .then((res) => setStats(res.data.stats || res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));

    setFavLoading(true);
    api.get('/auth/favorites')
      .then((res) => {
        const data = res.data.favorites || res.data || [];
        setFavorites(Array.isArray(data) ? data : []);
      })
      .catch(() => setFavorites([]))
      .finally(() => setFavLoading(false));
  }, [user]);

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ username: username.trim() });
      toast.success('Username updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.username || user.email || 'U').charAt(0).toUpperCase();
  const favoriteGames = gamesData.filter((g) =>
    Array.isArray(favorites)
      ? favorites.some((f) => (typeof f === 'string' ? f === g.id : f._id === g.id || f === g.id))
      : false
  );

  const statCards = [
    { label: 'Games Played', value: stats?.gamesPlayed || 0, icon: FiMonitor, color: 'text-blue-400' },
    { label: 'Total Score', value: stats?.totalScore?.toLocaleString() || 0, icon: FiAward, color: 'text-yellow-400' },
    { label: 'Ranking Points', value: stats?.rankingPoints || stats?.points || 0, icon: FiTrendingUp, color: 'text-purple-400' },
    { label: 'Achievements', value: stats?.achievements || 0, icon: FiStar, color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-5xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glassmorphism rounded-2xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold relative flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field text-lg font-bold py-2 max-w-[200px]"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveUsername}
                        disabled={saving}
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiSave size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => { setEditing(false); setUsername(user.username || ''); }}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-white">{user.username || 'User'}</h1>
                      <button
                        onClick={() => setEditing(true)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-gray-400 mt-1">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glassmorphism rounded-xl p-5 text-center"
              >
                <stat.icon className={`text-2xl mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="glassmorphism rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FiHeart className="text-red-400" /> Favorite Games
            </h2>
            {favLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : favoriteGames.length === 0 ? (
              <div className="text-center py-8">
                <FiStar className="text-3xl text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No favorite games yet</p>
                <Link to="/games" className="text-primary text-sm hover:underline mt-1 inline-block">Browse Games</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {favoriteGames.map((game) => (
                  <Link
                    key={game.id}
                    to={`/games/${game.id}`}
                    className="glassmorphism rounded-lg p-3 text-center hover:border-primary/30 transition-all duration-300 group"
                  >
                    <span className="text-2xl block mb-1">🎮</span>
                    <p className="text-xs font-medium text-white truncate group-hover:text-primary transition-colors">{game.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="glassmorphism rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FiClock className="text-primary" /> Recently Played
            </h2>
            {stats?.recentlyPlayed?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {stats.recentlyPlayed.slice(0, 8).map((item) => {
                  const game = gamesData.find((g) => g.id === (typeof item === 'string' ? item : item.gameId));
                  if (!game) return null;
                  return (
                    <Link
                      key={typeof item === 'string' ? item : item.gameId}
                      to={`/games/${game.id}`}
                      className="glassmorphism rounded-lg p-3 text-center hover:border-primary/30 transition-all duration-300 group"
                    >
                      <span className="text-2xl block mb-1">🎮</span>
                      <p className="text-xs font-medium text-white truncate group-hover:text-primary transition-colors">{game.title}</p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiPlay className="text-3xl text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No games played yet</p>
                <Link to="/games" className="text-primary text-sm hover:underline mt-1 inline-block">Start Playing</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
