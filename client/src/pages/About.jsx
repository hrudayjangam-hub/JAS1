import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCode, FiServer, FiDatabase, FiCloud, FiShield, FiZap } from 'react-icons/fi';
import { FaReact, FaNodeJs, FaDocker } from 'react-icons/fa';
import { SiMongodb, SiTailwindcss, SiFramer } from 'react-icons/si';

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

const features = [
  { icon: FiZap, title: 'Lightning Fast', desc: 'Optimized for speed with instant game loading and smooth performance.' },
  { icon: FiShield, title: 'Secure Platform', desc: 'Your data is protected with enterprise-grade security measures.' },
  { icon: FiCloud, title: 'Cloud Powered', desc: 'Built on scalable cloud infrastructure for reliable 24/7 availability.' },
  { icon: FiCode, title: 'Modern Tech Stack', desc: 'Built with cutting-edge technologies for the best experience.' },
];

const techStack = [
  { icon: FaReact, name: 'React', color: 'text-cyan-400' },
  { icon: FaNodeJs, name: 'Node.js', color: 'text-green-400' },
  { icon: SiMongodb, name: 'MongoDB', color: 'text-green-500' },
  { icon: SiTailwindcss, name: 'Tailwind CSS', color: 'text-cyan-300' },
  { icon: SiFramer, name: 'Framer Motion', color: 'text-pink-400' },
  { icon: FaDocker, name: 'Docker', color: 'text-blue-400' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-dark">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <TechStackSection />
      <MissionSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative py-28 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        <motion.span
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          About Us
        </motion.span>
        <h1 className="text-5xl md:text-7xl font-gaming font-bold">
          <span className="gradient-text">JAS1</span>{' '}
          <span className="text-white">Gaming</span>
        </h1>
        <p className="text-lg text-gray-400 mt-6 max-w-3xl mx-auto leading-relaxed">
          We're on a mission to provide the best free online gaming experience. From classic arcade games to challenging puzzles, JAS1 brings together a curated collection of games for players of all ages.
        </p>
      </motion.div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeInUp} className="glassmorphism rounded-2xl p-8 md:p-12">
          <h2 className="section-title text-3xl mb-6">About JAS1</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed">
            <p>
              JAS1 Gaming is a modern online gaming platform that offers a diverse collection of free-to-play games. 
              Our platform features everything from classic arcade games to brain-teasing puzzles, strategy games, 
              and action-packed adventures.
            </p>
            <p>
              Founded with the vision of making quality gaming accessible to everyone, JAS1 eliminates the barriers 
              of downloads, subscriptions, and expensive hardware. All you need is a browser and an internet connection 
              to dive into our growing library of games.
            </p>
            <p>
              We believe gaming should be social and competitive. That's why we've built real-time leaderboards, 
              player profiles, and achievement systems that let you track your progress and compete with players 
              around the world.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-dark-100/50">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-12">
          <h2 className="section-title text-3xl mb-2">What We Offer</h2>
          <p className="text-gray-400">Built with passion for the gaming community</p>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              variants={{
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0 },
              }}
              className="glassmorphism rounded-xl p-6 hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feat.icon className="text-xl text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TechStackSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-12">
          <h2 className="section-title text-3xl mb-2">Our Tech Stack</h2>
          <p className="text-gray-400">Powered by modern technologies</p>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {techStack.map((tech, i) => (
            <motion.div
              key={i}
              variants={{
                initial: { opacity: 0, scale: 0.8 },
                whileInView: { opacity: 1, scale: 1 },
              }}
              whileHover={{ y: -5 }}
              className="glassmorphism rounded-xl p-6 flex flex-col items-center gap-3 text-center hover:border-primary/20 transition-all duration-300"
            >
              <tech.icon className={`text-3xl ${tech.color}`} />
              <span className="text-xs font-medium text-gray-400">{tech.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="py-20 px-4 bg-dark-100/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div {...fadeInUp}>
          <h2 className="section-title text-3xl mb-6">Our Mission</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            To create a welcoming, free, and competitive gaming platform where anyone can play, 
            compete, and connect. We're committed to continuously expanding our game library, 
            improving the player experience, and building a vibrant community of gamers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/games" className="btn-primary px-8 py-3">
              Start Playing
            </Link>
            <Link to="/contact" className="btn-outline px-8 py-3">
              Get In Touch
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
