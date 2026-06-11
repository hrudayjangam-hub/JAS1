# JAS1 Gaming Platform

A modern, full-stack gaming website built with React, Node.js, Express, and MongoDB. Features 15+ playable games, user authentication, leaderboards, and an admin panel.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Authentication:** JWT with bcrypt password hashing
- **Styling:** Dark gaming theme with neon blue/purple accents
- **PWA:** Service worker for offline support

## Features

- 15+ playable games (Tic Tac Toe, Snake, Memory Match, Flappy Bird, Space Shooter, Breakout, Pong, Rock Paper Scissors, 2048, Sudoku, Word Guess, Color Match, Fruit Ninja, Endless Runner, Maze Escape)
- User registration and login with JWT authentication
- Global and per-game leaderboards
- User profiles with stats and game history
- Favorites and recently played tracking
- Admin dashboard for user and game management
- Search and category filtering
- Fully responsive design
- PWA support
- Rate limiting and input validation

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Quick Start

1. **Clone and install dependencies:**

```bash
git clone <repo-url> jas1
cd jas1
npm run install:all
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

3. **Seed the database (optional):**

```bash
cd server
node seed.js
```

4. **Run in development:**

```bash
npm run dev
```

This starts both the server (port 5000) and client (port 5173) concurrently.

5. **Open the app:**

Visit `http://localhost:5173`

## Project Structure

```
jas1/
├── client/                 # React frontend
│   ├── public/            # Static assets, PWA
│   └── src/
│       ├── components/    # Navbar, Footer
│       ├── context/       # AuthContext, GameContext
│       ├── games/         # 15 playable game components
│       ├── pages/         # 12 page components
│       └── main.jsx       # Entry point
├── server/                 # Express backend
│   ├── config/            # Database config
│   ├── controllers/       # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── models/            # Mongoose schemas
│   └── routes/            # API routes
├── .env.example
├── render.yaml
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/favorites/:gameId` - Add favorite
- `DELETE /api/auth/favorites/:gameId` - Remove favorite
- `GET /api/auth/favorites` - Get favorites

### Games
- `GET /api/games` - List games (query: category, search, difficulty)
- `GET /api/games/categories` - Get categories
- `GET /api/games/trending` - Get trending games
- `GET /api/games/:gameId` - Get game details
- `POST /api/games/:gameId/play` - Increment play count
- `POST /api/games/:gameId/score` - Submit score
- `GET /api/games/:gameId/leaderboard` - Game leaderboard
- `GET /api/leaderboard` - Global leaderboard

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - Get user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Platform stats
- `POST /api/admin/games` - Create game
- `PUT /api/admin/games/:gameId` - Update game
- `DELETE /api/admin/games/:gameId` - Delete game

## Deployment (Render)

1. Push code to GitHub
2. On Render, create a **Web Service** for the server:
   - Build command: `cd server && npm install`
   - Start command: `cd server && npm start`
   - Add environment variables from `.env.example`
3. Create a **Static Site** for the client:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `./client/dist`
   - Add env variable `VITE_API_URL` pointing to server URL
4. Deploy both services

The `render.yaml` file in the root can also be used for Infrastructure-as-Code deployment.

## Games

| Game | Category | Difficulty |
|------|----------|------------|
| Tic Tac Toe | Puzzle | Easy |
| Snake | Arcade | Medium |
| Memory Match | Puzzle | Easy |
| Flappy Bird | Arcade | Hard |
| Space Shooter | Action | Medium |
| Breakout | Arcade | Medium |
| Pong | Sports | Medium |
| Rock Paper Scissors | Strategy | Easy |
| 2048 | Puzzle | Medium |
| Sudoku | Puzzle | Hard |
| Word Guess | Puzzle | Medium |
| Color Match | Puzzle | Easy |
| Fruit Ninja | Arcade | Medium |
| Endless Runner | Arcade | Hard |
| Maze Escape | Puzzle | Medium |

## License

MIT
