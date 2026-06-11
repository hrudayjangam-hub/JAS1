/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#06b6d4',
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        secondary: {
          DEFAULT: '#7c3aed',
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0764',
        },
        accent: {
          DEFAULT: '#00d4ff',
          light: '#33ddff',
          dark: '#00a8cc',
        },
        dark: {
          DEFAULT: '#0a0a1a',
          100: '#12122a',
          200: '#1a1a3e',
          300: '#222252',
          400: '#2a2a66',
        },
        surface: {
          DEFAULT: '#12122a',
          light: '#1a1a3e',
          lighter: '#222252',
        },
      },
      fontFamily: {
        gaming: ['Orbitron', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff, 0 0 15px #00d4ff' },
          '50%': { boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 30px #00d4ff' },
        },
        'glow-purple': {
          '0%, 100%': { boxShadow: '0 0 5px #7c3aed, 0 0 10px #7c3aed, 0 0 15px #7c3aed' },
          '50%': { boxShadow: '0 0 10px #7c3aed, 0 0 20px #7c3aed, 0 0 30px #7c3aed' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        'glow-purple': 'glow-purple 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
