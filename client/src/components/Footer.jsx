import { Link } from 'react-router-dom';
import { FaTwitter, FaDiscord, FaGithub, FaYoutube } from 'react-icons/fa';

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'All Games', path: '/games' },
  { name: 'Categories', path: '/categories' },
  { name: 'Leaderboard', path: '/leaderboard' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const gameCategories = [
  { name: 'Action', path: '/games?category=Action' },
  { name: 'Puzzle', path: '/games?category=Puzzle' },
  { name: 'Strategy', path: '/games?category=Strategy' },
  { name: 'Racing', path: '/games?category=Racing' },
  { name: 'Sports', path: '/games?category=Sports' },
  { name: 'Arcade', path: '/games?category=Arcade' },
];

const socialLinks = [
  { name: 'Twitter', icon: FaTwitter, href: 'https://twitter.com/jas1gaming', color: 'hover:text-blue-400' },
  { name: 'Discord', icon: FaDiscord, href: 'https://discord.gg/jas1gaming', color: 'hover:text-indigo-400' },
  { name: 'GitHub', icon: FaGithub, href: 'https://github.com/jas1gaming', color: 'hover:text-gray-300' },
  { name: 'YouTube', icon: FaYoutube, href: 'https://youtube.com/@jas1gaming', color: 'hover:text-red-500' },
];

export default function Footer() {
  return (
    <footer className="relative bg-dark-100 border-t border-white/5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          <div>
            <Link to="/" className="text-2xl font-gaming font-bold neon-text tracking-wider">
              JAS1
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Your ultimate destination for free online games. Play action, puzzle, strategy, and more — all in one place. Level up your gaming experience.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 ${social.color} hover:bg-white/10 transition-all duration-300 hover:scale-110`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-gaming font-semibold text-white tracking-wider uppercase mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-gaming font-semibold text-white tracking-wider uppercase mb-5">
              Game Categories
            </h3>
            <ul className="space-y-3">
              {gameCategories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    to={cat.path}
                    className="text-sm text-gray-400 hover:text-primary transition-colors duration-300"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-gaming font-semibold text-white tracking-wider uppercase mb-5">
              Newsletter
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Stay updated with new games and exclusive features.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field text-sm"
              />
              <button type="submit" className="btn-primary text-sm py-2.5">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} JAS1 Gaming. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
