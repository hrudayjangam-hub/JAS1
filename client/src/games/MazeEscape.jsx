import { useState, useEffect, useRef, useCallback } from 'react';

const CELL_SIZE = 24;
const WALL = 1;
const PATH = 0;

function generateMaze(rows, cols) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(WALL));

  function carve(r, c) {
    grid[r][c] = PATH;
    const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc] === WALL) {
        grid[r + dr / 2][c + dc / 2] = PATH;
        carve(nr, nc);
      }
    }
  }

  carve(1, 1);
  grid[1][0] = PATH;
  grid[rows - 2][cols - 1] = PATH;
  return grid;
}

export default function MazeEscape({ onScoreUpdate }) {
  const canvasRef = useRef(null);
  const [maze, setMaze] = useState([]);
  const [rows, setRows] = useState(11);
  const [cols, setCols] = useState(11);
  const [playerPos, setPlayerPos] = useState({ r: 1, c: 0 });
  const [goalPos, setGoalPos] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [gameState, setGameState] = useState('idle');
  const timerRef = useRef(null);
  const mazeRef = useRef([]);
  const playerRef = useRef({ r: 1, c: 0 });
  const goalRef = useRef({ r: 0, c: 0 });

  const generateNewMaze = useCallback((lvl) => {
    const r = 5 + lvl * 2;
    const c = 5 + lvl * 2;
    const rEven = r % 2 === 0 ? r + 1 : r;
    const cEven = c % 2 === 0 ? c + 1 : c;
    const g = generateMaze(rEven, cEven);
    g[1][0] = PATH;
    g[rEven - 2][cEven - 1] = PATH;

    mazeRef.current = g;
    setMaze(g);
    setRows(rEven);
    setCols(cEven);

    const start = { r: 1, c: 0 };
    const goal = { r: rEven - 2, c: cEven - 1 };
    playerRef.current = start;
    goalRef.current = goal;
    setPlayerPos(start);
    setGoalPos(goal);
    setMoves(0);
    setTimer(0);
    setWon(false);
    setGameOver(false);
    setGameState('playing');
    if (onScoreUpdate) onScoreUpdate(0);
  }, [onScoreUpdate]);

  const newGame = useCallback(() => {
    generateNewMaze(level);
  }, [level, generateNewMaze]);

  const nextLevel = useCallback(() => {
    const next = level + 1;
    setLevel(next);
    generateNewMaze(next);
  }, [level, generateNewMaze]);

  useEffect(() => {
    if (gameState === 'playing' && !won && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, won, gameOver]);

  useEffect(() => {
    if (won && onScoreUpdate) {
      const s = Math.max(0, 1000 - timer * 10 - moves * 2 + level * 100);
      onScoreUpdate(s);
    }
  }, [won, timer, moves, level, onScoreUpdate]);

  const tryMove = useCallback((dr, dc) => {
    const g = mazeRef.current;
    if (!g || g.length === 0) return;
    if (won || gameOver) return;
    const p = playerRef.current;
    const nr = p.r + dr;
    const nc = p.c + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;
    if (g[nr][nc] === WALL) return;

    const newPos = { r: nr, c: nc };
    playerRef.current = newPos;
    setPlayerPos(newPos);
    setMoves(prev => prev + 1);

    if (nr === goalRef.current.r && nc === goalRef.current.c) {
      setWon(true);
      clearInterval(timerRef.current);
    }
  }, [rows, cols, won, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); tryMove(-1, 0); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); tryMove(1, 0); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); tryMove(0, -1); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); tryMove(0, 1); break;
        case 'Enter':
          if (won) nextLevel();
          else if (gameOver || gameState === 'idle') newGame();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tryMove, nextLevel, newGame, gameOver, gameState, won]);

  useEffect(() => {
    if (maze.length === 0) {
      generateNewMaze(1);
    }
  }, [maze, generateNewMaze]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || maze.length === 0) return;
    const ctx = canvas.getContext('2d');
    const m = mazeRef.current;

    const cw = cols * CELL_SIZE;
    const ch = rows * CELL_SIZE;
    canvas.width = cw;
    canvas.height = ch;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, cw, ch);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (m[r][c] === WALL) {
          ctx.fillStyle = '#1a1a3e';
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = 'rgba(6,182,212,0.1)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    const gr = goalRef.current;
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = 'rgba(34,197,94,0.6)';
    ctx.shadowBlur = 15;
    ctx.fillRect(gr.c * CELL_SIZE + 2, gr.r * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', gr.c * CELL_SIZE + CELL_SIZE / 2, gr.r * CELL_SIZE + CELL_SIZE / 2);

    const pr = playerRef.current;
    const px = pr.c * CELL_SIZE + CELL_SIZE / 2;
    const py = pr.r * CELL_SIZE + CELL_SIZE / 2;
    const pg = ctx.createRadialGradient(px, py, 2, px, py, CELL_SIZE / 2);
    pg.addColorStop(0, '#22d3ee');
    pg.addColorStop(1, '#06b6d4');
    ctx.fillStyle = pg;
    ctx.shadowColor = 'rgba(6,182,212,0.6)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px, py, CELL_SIZE / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('●', px, py);

    const visitedGrad = ctx.createLinearGradient(0, 0, cw, ch);
    visitedGrad.addColorStop(0, 'rgba(6,182,212,0.02)');
    visitedGrad.addColorStop(1, 'rgba(124,58,237,0.02)');
    ctx.fillStyle = visitedGrad;
    ctx.fillRect(0, 0, cw, ch);
  }, [maze, rows, cols, playerPos, goalPos, won]);

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4">
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Maze Escape
        </h2>
        <div className="flex gap-2">
          <div className="bg-dark-100 rounded-lg px-3 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Level</div>
            <div className="text-lg font-bold text-purple-400">{level}</div>
          </div>
          <div className="bg-dark-100 rounded-lg px-3 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Timer</div>
            <div className="text-lg font-bold text-cyan-400">{formatTime(timer)}</div>
          </div>
          <div className="bg-dark-100 rounded-lg px-3 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Moves</div>
            <div className="text-lg font-bold text-yellow-400">{moves}</div>
          </div>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-white/5 bg-dark-100">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto touch-none"
          style={{ maxHeight: '70vh' }}
        />

        {won && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-green-400 mb-2">Maze Solved!</div>
            <div className="text-gray-300 mb-1">Time: {formatTime(timer)}</div>
            <div className="text-gray-300 mb-4">Moves: {moves}</div>
            <button
              onClick={nextLevel}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-lg transition-all mb-2"
            >
              Next Level
            </button>
            <button
              onClick={() => { setLevel(1); generateNewMaze(1); }}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all"
            >
              Restart from Level 1
            </button>
          </div>
        )}

        {gameState === 'idle' && !won && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-cyan-400 mb-4">Maze Escape</div>
            <button
              onClick={newGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-lg transition-all"
            >
              Start Game
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={newGame}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all"
        >
          New Game
        </button>
      </div>

      <div className="mt-3 text-center text-sm text-gray-400">
        <span className="text-cyan-400">Arrow keys</span> or <span className="text-purple-400">WASD</span> to move | Reach the ★
      </div>
    </div>
  );
}
