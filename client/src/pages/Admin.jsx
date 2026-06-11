import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { gamesData } from '../games';
import toast from 'react-hot-toast';
import { FiUsers, FiBarChart2, FiMonitor, FiTrash2, FiShield, FiUserCheck, FiRefreshCw, FiSearch } from 'react-icons/fi';

const tabs = [
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'stats', label: 'Stats', icon: FiBarChart2 },
  { id: 'games', label: 'Games', icon: FiMonitor },
];

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    setUsersLoading(true);
    api.get('/admin/users')
      .then((res) => {
        const data = res.data;
        setUsers(data.users || data.data || data || []);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setUsersLoading(false));

    setStatsLoading(true);
    api.get('/admin/stats')
      .then((res) => setStats(res.data.stats || res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const filteredUsers = users.filter(
    (u) =>
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage users, view stats, and oversee games</p>
        </motion.div>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'glassmorphism text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="glassmorphism rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <div className="relative max-w-xs">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search users..."
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>
                {usersLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <FiUsers className="text-4xl text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Username</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                          <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((u) => (
                          <motion.tr
                            key={u._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold">
                                  {(u.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-white">{u.username || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                            <td className="px-6 py-4">
                              <select
                                value={u.role || 'user'}
                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                className="input-field text-xs py-1.5 px-2 max-w-[110px]"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete user"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {statsLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'text-blue-400' },
                    { label: 'Total Games', value: stats?.totalGames || gamesData.length, icon: FiMonitor, color: 'text-green-400' },
                    { label: 'Total Scores', value: (stats?.totalScores || 0).toLocaleString(), icon: FiBarChart2, color: 'text-yellow-400' },
                    { label: 'Active Today', value: stats?.activeToday || 0, icon: FiUserCheck, color: 'text-purple-400' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glassmorphism rounded-xl p-6 text-center"
                    >
                      <stat.icon className={`text-3xl mx-auto mb-3 ${stat.color}`} />
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'games' && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="glassmorphism rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-lg font-bold text-white">All Games ({gamesData.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Difficulty</th>
                        <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Players</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {gamesData.map((game, i) => (
                        <motion.tr
                          key={game.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🎮</span>
                              <span className="text-sm font-medium text-white">{game.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {game.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                              game.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              game.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {game.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-400">
                            {game.maxPlayers === 1 ? '1 Player' : `${game.maxPlayers} Players`}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
