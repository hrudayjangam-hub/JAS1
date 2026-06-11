import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jas1_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API}/auth/me`)
        .then((res) => {
          setUser(res.data.user || res.data);
        })
        .catch(() => {
          localStorage.removeItem('jas1_token');
          setToken(null);
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const data = res.data;
    const t = data.token || data.accessToken;
    localStorage.setItem('jas1_token', t);
    setToken(t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setUser(data.user || data);
    return data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await axios.post(`${API}/auth/register`, { username, email, password });
    const data = res.data;
    const t = data.token || data.accessToken;
    localStorage.setItem('jas1_token', t);
    setToken(t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setUser(data.user || data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jas1_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const res = await axios.put(`${API}/auth/profile`, updates);
    const data = res.data;
    setUser(data.user || data);
    return data;
  }, []);

  const addFavorite = useCallback(async (gameId) => {
    const res = await axios.post(`${API}/auth/favorites/${gameId}`);
    setUser((prev) => ({
      ...prev,
      favorites: [...(prev?.favorites || []), gameId],
    }));
    return res.data;
  }, []);

  const removeFavorite = useCallback(async (gameId) => {
    const res = await axios.delete(`${API}/auth/favorites/${gameId}`);
    setUser((prev) => ({
      ...prev,
      favorites: (prev?.favorites || []).filter((id) => id !== gameId),
    }));
    return res.data;
  }, []);

  const getFavorites = useCallback(async () => {
    const res = await axios.get(`${API}/auth/favorites`);
    return res.data.favorites || res.data;
  }, []);

  const isFavorite = useCallback((gameId) => {
    if (!user?.favorites) return false;
    return user.favorites.some((f) => (typeof f === 'string' ? f === gameId : f._id === gameId));
  }, [user?.favorites]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
