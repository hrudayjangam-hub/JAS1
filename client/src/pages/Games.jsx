import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gamesData, categories, searchGames as searchGamesData } from '../games';
import { FiSearch, FiPlay, FiX } from 'react-icons/fi';

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const emojis = {
  Action: '🎮', Puzzle: '🧩', Strategy: '♟️', Sports: '⚽', Arcade: '🕹️',
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function Games() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const filteredGames = useMemo(() => {
    let result = search ? searchGamesData(search) : gamesData;
    if (activeCategory !== 'All') {
      result = result.filter((g) => g.category === activeCategory);
    }
    return result;
  }, [search, activeCategory]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearch('');
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val && activeCategory !== 'All') {
      setActiveCategory('All');
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title text-4xl mb-2">All Games</h1>
          <p className="text-gray-400">Discover and play our collection of free games</p>
        </motion.div>

        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search games..."
              className="input-field pl-11 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryChange('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeCategory === 'All'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'glassmorphism text-gray-400 hover:text-white hover:border-primary/30'
            }`}
          >
            All
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'glassmorphism text-gray-400 hover:text-white hover:border-primary/30'
              }`}
            >
              {emojis[cat] || '🎯'} {cat}
            </motion.button>
          ))}
        </div>

        {filteredGames.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-xl font-bold text-white mb-2">No games found</h3>
            <p className="text-gray-400">Try a different search term or category</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="btn-outline mt-4 inline-flex items-center gap-2"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="game-card-hover glassmorphism rounded-xl overflow-hidden group"
              >
                <Link to={`/games/${game.id}`}>
                  <div className="h-44 bg-gradient-to-br from-primary/20 via-dark to-secondary/20 flex items-center justify-center relative">
                    <motion.span
                      className="text-5xl"
                      whileHover={{ scale: 1.15, rotate: 8 }}
                    >
                      {emojis[game.category] || '🎯'}
                    </motion.span>
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {game.category}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${difficultyColors[game.difficulty]}`}>
                        {game.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors truncate">{game.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{game.description}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-primary text-xs font-medium">
                      <FiPlay size={12} /> Play Now
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
