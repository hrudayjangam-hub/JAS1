import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jas1_recently_played') || '[]');
    } catch {
      return [];
    }
  });
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    setLoading(true);
    axios.get(`${API}/games`)
      .then((res) => {
        const data = res.data;
        const gameList = data.games || data.data || data || [];
        setGames(Array.isArray(gameList) ? gameList : []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load games');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (games.length > 0 && categories.length === 0) {
      const cats = [...new Set(games.map((g) => g.category).filter(Boolean))];
      setCategories(cats);
    }
  }, [games, categories.length]);

  useEffect(() => {
    if (games.length > 0) {
      const sorted = [...games].sort((a, b) => (b.plays || 0) - (a.plays || 0));
      setTrending(sorted.slice(0, 6));
    }
  }, [games]);

  const addRecentlyPlayed = useCallback((gameId) => {
    setRecentlyPlayed((prev) => {
      const updated = [gameId, ...prev.filter((id) => id !== gameId)].slice(0, 10);
      localStorage.setItem('jas1_recently_played', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const searchGames = useCallback(async (query) => {
    try {
      const res = await axios.get(`${API}/games/search`, { params: { q: query } });
      const data = res.data;
      return data.games || data.data || data || [];
    } catch {
      if (query) {
        const q = query.toLowerCase();
        return games.filter(
          (g) =>
            g.title?.toLowerCase().includes(q) ||
            g.description?.toLowerCase().includes(q) ||
            g.category?.toLowerCase().includes(q)
        );
      }
      return games;
    }
  }, [games]);

  const getGamesByCategory = useCallback(async (category) => {
    try {
      const res = await axios.get(`${API}/games/category/${encodeURIComponent(category)}`);
      const data = res.data;
      return data.games || data.data || data || [];
    } catch {
      return games.filter((g) => g.category === category);
    }
  }, [games]);

  const getGameById = useCallback(async (id) => {
    try {
      const res = await axios.get(`${API}/games/${id}`);
      const data = res.data;
      return data.game || data.data || data;
    } catch {
      return games.find((g) => g._id === id || g.id === id) || null;
    }
  }, [games]);

  const submitScore = useCallback(async (gameId, score) => {
    const res = await axios.post(`${API}/games/${gameId}/score`, { score });
    return res.data;
  }, []);

  const getLeaderboard = useCallback(async (gameId) => {
    const res = await axios.get(`${API}/games/${gameId}/leaderboard`);
    const data = res.data;
    return data.leaderboard || data.data || data || [];
  }, []);

  const getGlobalLeaderboard = useCallback(async () => {
    const res = await axios.get(`${API}/leaderboard`);
    const data = res.data;
    return data.leaderboard || data.data || data || [];
  }, []);

  const value = {
    games,
    categories,
    trending,
    loading,
    error,
    recentlyPlayed,
    searchGames,
    getGamesByCategory,
    getGameById,
    submitScore,
    getLeaderboard,
    getGlobalLeaderboard,
    addRecentlyPlayed,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGames() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGames must be used within GameProvider');
  return ctx;
}

export default GameContext;
