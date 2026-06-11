import { useState, useEffect, useCallback, useRef } from 'react';

const EMPTY = 0;
const SIZE = 4;

function createEmptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
}

function addRandomTile(grid) {
  const emptyCells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === EMPTY) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return grid;
  const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

function slideRow(row) {
  let arr = row.filter(v => v !== EMPTY);
  let score = 0;
  const merged = [];
  for (let i = 0; i < arr.length; i++) {
    if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
      merged.push(arr[i] * 2);
      score += arr[i] * 2;
      i++;
    } else {
      merged.push(arr[i]);
    }
  }
  while (merged.length < SIZE) merged.push(EMPTY);
  return { row: merged, score };
}

function moveLeft(grid) {
  let newGrid = [];
  let totalScore = 0;
  for (let r = 0; r < SIZE; r++) {
    const { row, score } = slideRow(grid[r]);
    newGrid.push(row);
    totalScore += score;
  }
  return { grid: newGrid, score: totalScore };
}

function rotateRight(grid) {
  const n = grid.length;
  const newGrid = Array.from({ length: n }, () => Array(n).fill(EMPTY));
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      newGrid[c][n - 1 - r] = grid[r][c];
  return newGrid;
}

function rotateLeft(grid) {
  const n = grid.length;
  const newGrid = Array.from({ length: n }, () => Array(n).fill(EMPTY));
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      newGrid[n - 1 - c][r] = grid[r][c];
  return newGrid;
}

function moveRight(grid) {
  const rotated = rotateRight(grid);
  const { grid: moved, score } = moveLeft(rotated);
  return { grid: rotateLeft(moved), score };
}

function moveUp(grid) {
  const rotated = rotateRight(grid);
  const { grid: moved, score } = moveLeft(rotated);
  return { grid: rotateLeft(rotateLeft(rotateLeft(moved))), score };
}

function moveDown(grid) {
  const rotated = rotateLeft(grid);
  const { grid: moved, score } = moveLeft(rotated);
  return { grid: rotateRight(moved), score };
}

function gridsEqual(a, b) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (a[r][c] !== b[r][c]) return false;
  return true;
}

function canMove(grid) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === EMPTY) return true;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  return false;
}

function hasWon(grid) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === 2048) return true;
  return false;
}

const TILE_COLORS = {
  0: { bg: 'rgba(255,255,255,0.05)', color: '#fff' },
  2: { bg: '#1a3a4a', color: '#e0f7fa' },
  4: { bg: '#1a4a4a', color: '#b2ebf2' },
  8: { bg: '#2a6a5a', color: '#fff' },
  16: { bg: '#3a7a4a', color: '#fff' },
  32: { bg: '#5a6a3a', color: '#fff' },
  64: { bg: '#7a5a2a', color: '#fff' },
  128: { bg: '#8a4a2a', color: '#fff' },
  256: { bg: '#9a3a2a', color: '#fff' },
  512: { bg: '#aa2a2a', color: '#fff' },
  1024: { bg: '#ba1a1a', color: '#fff' },
  2048: { bg: '#d4a017', color: '#fff' },
};

function getTileColor(value) {
  return TILE_COLORS[value] || { bg: '#0a0a1a', color: '#fff' };
}

const tileSizeClasses = {
  1: 'text-4xl md:text-5xl',
  2: 'text-3xl md:text-4xl',
  3: 'text-2xl md:text-3xl',
  4: 'text-xl md:text-2xl',
};

function getTileSizeClass(value) {
  const digits = value.toString().length;
  if (digits <= 1) return tileSizeClasses[1];
  if (digits === 2) return tileSizeClasses[2];
  if (digits === 3) return tileSizeClasses[3];
  return tileSizeClasses[4];
}

export default function Game2048({ onScoreUpdate }) {
  const [grid, setGrid] = useState(() => addRandomTile(addRandomTile(createEmptyGrid())));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try { return parseInt(localStorage.getItem('game2048_best') || '0'); } catch { return 0; }
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [moved, setMoved] = useState(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (onScoreUpdate) onScoreUpdate(score);
  }, [score, onScoreUpdate]);

  const handleMove = useCallback((dir) => {
    setGrid(prev => {
      if (gameOver && !keepPlaying) return prev;
      let result;
      switch (dir) {
        case 'left': result = moveLeft(prev); break;
        case 'right': result = moveRight(prev); break;
        case 'up': result = moveUp(prev); break;
        case 'down': result = moveDown(prev); break;
        default: return prev;
      }
      if (gridsEqual(prev, result.grid)) return prev;
      const newGrid = addRandomTile(result.grid);
      const newScore = scoreRef.current + result.score;
      scoreRef.current = newScore;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        try { localStorage.setItem('game2048_best', String(newScore)); } catch {}
      }
      setMoved(prev => !prev);
      if (hasWon(newGrid) && !keepPlaying) {
        setWon(true);
      }
      if (!canMove(newGrid)) {
        setGameOver(true);
      }
      return newGrid;
    });
  }, [gameOver, keepPlaying, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyMap = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        handleMove(dir);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  let touchStartX = 0, touchStartY = 0;
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  };
  const handleTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 20) return;
    if (absDx > absDy) {
      handleMove(dx > 0 ? 'right' : 'left');
    } else {
      handleMove(dy > 0 ? 'down' : 'up');
    }
  };

  const newGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
    setGrid(addRandomTile(addRandomTile(createEmptyGrid())));
  };

  const continueGame = () => {
    setKeepPlaying(true);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4">
      <div className="flex items-center justify-between w-full mb-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            2048
          </h2>
        </div>
        <div className="flex gap-3">
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
            <div className="text-xl font-bold text-cyan-400">{score}</div>
          </div>
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Best</div>
            <div className="text-xl font-bold text-purple-400">{bestScore}</div>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div
          className="relative w-full aspect-square bg-dark-100 rounded-xl p-2 border border-white/5 select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-4 gap-2 w-full h-full">
            {grid.map((row, ri) =>
              row.map((cell, ci) => {
                const colors = getTileColor(cell);
                return (
                  <div
                    key={`${ri}-${ci}`}
                    className={`flex items-center justify-center rounded-lg font-bold transition-all duration-100 ${cell !== EMPTY ? 'scale-100' : 'scale-95'}`}
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.color,
                      aspectRatio: '1',
                      fontSize: cell >= 1000 ? '1.2rem' : cell >= 100 ? '1.5rem' : '2rem',
                      boxShadow: cell >= 128 ? '0 0 12px rgba(255,215,0,0.3)' : 'none',
                    }}
                  >
                    {cell !== EMPTY && cell}
                  </div>
                );
              })
            )}
          </div>

          {(gameOver || won) && (
            <div className="absolute inset-0 bg-black/70 rounded-xl flex flex-col items-center justify-center z-10">
              {gameOver && (
                <>
                  <div className="text-3xl font-bold text-red-400 mb-2">Game Over!</div>
                  <div className="text-gray-300 mb-4">Score: {score}</div>
                </>
              )}
              {won && (
                <>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">You Win!</div>
                  <div className="text-gray-300 mb-4">Score: {score}</div>
                  {!keepPlaying && (
                    <button
                      onClick={continueGame}
                      className="mb-3 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all"
                    >
                      Keep Going
                    </button>
                  )}
                </>
              )}
              <button
                onClick={newGame}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold transition-all"
              >
                New Game
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-400">
        <span className="text-cyan-400">Arrow keys</span> or <span className="text-purple-400">WASD</span> to move | Swipe on mobile
      </div>

      <button
        onClick={newGame}
        className="mt-3 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all"
      >
        New Game
      </button>
    </div>
  );
}
