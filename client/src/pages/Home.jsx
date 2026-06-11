import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gamesData, categories } from '../games';
import { FiPlay, FiTrendingUp, FiGrid, FiUsers, FiAward, FiZap, FiBarChart2, FiRefreshCw } from 'react-icons/fi';
import { FaGamepad, FaRocket } from 'react-icons/fa';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-100px' },
  transition: { staggerChildren: 0.1 },
};

const featuredGames = gamesData.slice(0, 6);
const stats = [
  { icon: FaGamepad, value: `${gamesData.length}+`, label: 'Games Available' },
  { icon: FiUsers, value: '5,000+', label: 'Active Players' },
  { icon: FiAward, value: '50,000+', label: 'Scores Submitted' },
  { icon: FiZap, value: '99.9%', label: 'Uptime' },
];

const features = [
  { icon: FiTrendingUp, title: 'Modern Design', desc: 'Sleek, responsive interface with neon aesthetics and smooth animations.' },
  { icon: FaRocket, title: 'Free to Play', desc: 'All games are completely free. No hidden costs, no subscriptions.' },
  { icon: FiBarChart2, title: 'Leaderboards', desc: 'Compete globally with real-time leaderboards and rankings.' },
  { icon: FiRefreshCw, title: 'Regular Updates', desc: 'New games and features added regularly to keep the experience fresh.' },
];

const categoryIcons = {
  Action: '🎮',
  Puzzle: '🧩',
  Strategy: '♟️',
  Sports: '⚽',
  Arcade: '🕹️',
  Racing: '🏎️',
};

export default function Home() {
  return (
    <div className="bg-dark">
      <HeroSection />
      <TrendingGamesSection />
      <CategoriesSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            🎮 Free Online Gaming Platform
          </motion.span>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-gaming font-bold tracking-tight">
            <span className="gradient-text">JAS1</span>{' '}
            <span className="text-white">GAMING</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            Your ultimate destination for free online games. Play action, puzzle, strategy, arcade, and more — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link to="/games" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
              <FiPlay /> Start Playing
            </Link>
            <Link to="/categories" className="btn-outline flex items-center gap-2 text-lg px-8 py-4">
              <FiGrid /> Browse Categories
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span>No download required</span>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <span>Free to play</span>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <span>Competitive leaderboards</span>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
      >
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

function TrendingGamesSection() {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <motion.div {...fadeInUp}>
        <h2 className="section-title text-center mb-2">Trending Games</h2>
        <p className="text-gray-400 text-center mb-12">Most popular games right now</p>
      </motion.div>

      <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </motion.div>

      <motion.div className="text-center mt-10" {...fadeInUp}>
        <Link to="/games" className="btn-outline inline-flex items-center gap-2">
          View All Games <FiArrowRight />
        </Link>
      </motion.div>
    </section>
  );
}

function GameCard({ game }) {
  const emojis = { Action: '🎮', Puzzle: '🧩', Strategy: '♟️', Sports: '⚽', Arcade: '🕹️', Racing: '🏎️' };
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -8 }}
      className="game-card-hover group glassmorphism rounded-xl overflow-hidden"
    >
      <Link to={`/games/${game.id}`}>
        <div className="h-48 bg-gradient-to-br from-primary/20 via-dark to-secondary/20 flex items-center justify-center relative overflow-hidden">
          <motion.span
            className="text-6xl"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            {emojis[game.category] || '🎯'}
          </motion.span>
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
              {game.category}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full border ${
              game.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              game.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {game.difficulty}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{game.title}</h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{game.description}</p>
          <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
            <FiPlay size={14} /> Play Now
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoriesSection() {
  return (
    <section className="py-20 px-4 bg-dark-100/50">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeInUp}>
          <h2 className="section-title text-center mb-2">Game Categories</h2>
          <p className="text-gray-400 text-center mb-12">Find your favorite type of game</p>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat}
              variants={{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <Link
                to={`/games?category=${encodeURIComponent(cat)}`}
                className="glassmorphism rounded-xl p-6 flex flex-col items-center gap-3 text-center hover:border-primary/30 transition-all duration-300 block"
              >
                <span className="text-4xl">{categoryIcons[cat] || '🎯'}</span>
                <span className="text-sm font-medium text-white">{cat}</span>
                <span className="text-xs text-gray-500">{gamesData.filter((g) => g.category === cat).length} games</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={{
              initial: { opacity: 0, y: 30 },
              whileInView: { opacity: 1, y: 0 },
            }}
            className="glassmorphism rounded-xl p-6 text-center hover:border-primary/20 transition-all duration-300"
          >
            <stat.icon className="text-3xl text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold gradient-text">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-dark-100/50">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeInUp}>
          <h2 className="section-title text-center mb-2">Why Choose JAS1?</h2>
          <p className="text-gray-400 text-center mb-12">Built for gamers, by gamers</p>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={{
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0 },
              }}
              className="glassmorphism rounded-xl p-6 hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="text-xl text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />

      <motion.div {...fadeInUp} className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-gaming font-bold text-white mb-4">
          Ready to <span className="gradient-text">Level Up</span>?
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Join thousands of players already enjoying JAS1 Gaming. Create your free account and start playing today!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-lg px-10 py-4 flex items-center gap-2">
            <FaRocket /> Get Started Free
          </Link>
          <Link to="/games" className="btn-outline text-lg px-10 py-4 flex items-center gap-2">
            <FiPlay /> Browse Games
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function FiArrowRight(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
