import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gamesData, categories } from '../games';
import { FiArrowRight } from 'react-icons/fi';

const categoryIcons = {
  Action: '🎮',
  Puzzle: '🧩',
  Strategy: '♟️',
  Sports: '⚽',
  Arcade: '🕹️',
};

const categoryDescriptions = {
  Action: 'Fast-paced action games that test your reflexes',
  Puzzle: 'Brain-teasing puzzles and logic challenges',
  Strategy: 'Tactical games that require careful planning',
  Sports: 'Sports-themed games for competitive fun',
  Arcade: 'Classic arcade games for quick sessions',
};

export default function Categories() {
  const getGameCount = (cat) => gamesData.filter((g) => g.category === cat).length;

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="section-title text-4xl mb-2">Game Categories</h1>
          <p className="text-gray-400">Browse games by category and find your next favorite</p>
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((cat) => {
            const count = getGameCount(cat);
            return (
              <motion.div
                key={cat}
                variants={{
                  initial: { opacity: 0, y: 30 },
                  animate: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -6 }}
              >
                <Link
                  to={`/games?category=${encodeURIComponent(cat)}`}
                  className="glassmorphism rounded-xl p-8 flex flex-col items-center text-center hover:border-primary/30 transition-all duration-300 group block h-full"
                >
                  <motion.span
                    className="text-6xl mb-4 block"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                  >
                    {categoryIcons[cat] || '🎯'}
                  </motion.span>
                  <h2 className="text-2xl font-bold text-white group-hover:text-primary transition-colors mb-2">
                    {cat}
                  </h2>
                  <p className="text-sm text-gray-400 mb-4">
                    {categoryDescriptions[cat] || `Explore ${cat} games`}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {count} {count === 1 ? 'Game' : 'Games'}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse {cat} <FiArrowRight />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
