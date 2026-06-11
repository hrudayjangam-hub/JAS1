import { useState, useEffect, useCallback, useRef } from 'react';

const EMPTY = 0;

const PUZZLES = [
  {
    puzzle: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9],
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9],
    ],
  },
  {
    puzzle: [
      [0,0,0,2,6,0,7,0,1],
      [6,8,0,0,7,0,0,9,0],
      [1,9,0,0,0,4,5,0,0],
      [8,2,0,1,0,0,0,4,0],
      [0,0,4,6,0,2,9,0,0],
      [0,5,0,0,0,3,0,2,8],
      [0,0,9,3,0,0,0,7,4],
      [0,4,0,0,5,0,0,3,6],
      [7,0,3,0,1,8,0,0,0],
    ],
    solution: [
      [4,3,5,2,6,9,7,8,1],
      [6,8,2,5,7,1,4,9,3],
      [1,9,7,8,3,4,5,6,2],
      [8,2,6,1,9,5,3,4,7],
      [3,7,4,6,8,2,9,1,5],
      [9,5,1,7,4,3,6,2,8],
      [5,1,9,3,2,6,8,7,4],
      [2,4,8,9,5,7,1,3,6],
      [7,6,3,4,1,8,2,5,9],
    ],
  },
  {
    puzzle: [
      [0,2,0,6,0,8,0,0,0],
      [5,8,0,0,0,9,7,0,0],
      [0,0,0,0,4,0,0,0,0],
      [3,7,0,0,0,0,5,0,0],
      [6,0,0,0,0,0,0,0,4],
      [0,0,8,0,0,0,0,1,3],
      [0,0,0,0,2,0,0,0,0],
      [0,0,9,8,0,0,0,3,6],
      [0,0,0,3,0,6,0,9,0],
    ],
    solution: [
      [1,2,3,6,7,8,9,4,5],
      [5,8,4,2,3,9,7,6,1],
      [9,6,7,1,4,5,3,2,8],
      [3,7,2,4,6,1,5,8,9],
      [6,9,1,5,8,3,2,7,4],
      [4,5,8,7,9,2,6,1,3],
      [8,3,6,9,2,4,1,5,7],
      [2,1,9,8,5,7,4,3,6],
      [7,4,5,3,1,6,8,9,2],
    ],
  },
];

function deepCopy(grid) {
  return grid.map(row => [...row]);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export default function Sudoku({ onScoreUpdate }) {
  const [puzzleIndex, setPuzzleIndex] = useState(getRandomInt(PUZZLES.length));
  const [grid, setGrid] = useState([]);
  const [initial, setInitial] = useState([]);
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  const loadPuzzle = useCallback((idx) => {
    const p = PUZZLES[idx];
    const g = deepCopy(p.puzzle);
    setGrid(g);
    setInitial(deepCopy(p.puzzle));
    setSelected(null);
    setErrors(0);
    setGameOver(false);
    setWon(false);
    setTimer(0);
    setIsRunning(true);
    setMessage('');
  }, []);

  useEffect(() => {
    loadPuzzle(puzzleIndex);
  }, [puzzleIndex, loadPuzzle]);

  useEffect(() => {
    if (isRunning && !gameOver && !won) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, gameOver, won]);

  useEffect(() => {
    if (onScoreUpdate) onScoreUpdate(Math.max(0, 1000 - errors * 200 - timer * 2));
  }, [errors, timer, onScoreUpdate]);

  const getBox = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

  const isValidPlacement = (r, c, val, currentGrid) => {
    for (let i = 0; i < 9; i++) {
      if (i !== c && currentGrid[r][i] === val) return false;
      if (i !== r && currentGrid[i][c] === val) return false;
    }
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let rr = br; rr < br + 3; rr++)
      for (let cc = bc; cc < bc + 3; cc++)
        if ((rr !== r || cc !== c) && currentGrid[rr][cc] === val) return false;
    return true;
  };

  const handleCellClick = (r, c) => {
    if (gameOver || won) return;
    setSelected([r, c]);
  };

  const handleNumberInput = useCallback((num) => {
    if (!selected || gameOver || won) return;
    const [r, c] = selected;
    if (initial[r][c] !== EMPTY) return;
    setGrid(prev => {
      const newGrid = deepCopy(prev);
      if (!isValidPlacement(r, c, num, newGrid)) {
        const newErrors = errors + 1;
        setErrors(newErrors);
        setMessage(`Conflict at row ${r+1}, col ${c+1}`);
        setTimeout(() => setMessage(''), 1500);
        if (newErrors >= 3) {
          setGameOver(true);
          setIsRunning(false);
        }
        return newGrid;
      }
      newGrid[r][c] = num;
      const isFull = newGrid.every(row => row.every(v => v !== EMPTY));
      if (isFull) {
        const sol = PUZZLES[puzzleIndex].solution;
        const correct = newGrid.every((row, ri) => row.every((v, ci) => v === sol[ri][ci]));
        if (correct) {
          setWon(true);
          setIsRunning(false);
          setMessage('Puzzle solved!');
        }
      }
      return newGrid;
    });
  }, [selected, gameOver, won, initial, errors, puzzleIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      }
      if (e.key === 'ArrowUp' && selected) {
        setSelected([Math.max(0, selected[0] - 1), selected[1]]);
      }
      if (e.key === 'ArrowDown' && selected) {
        setSelected([Math.min(8, selected[0] + 1), selected[1]]);
      }
      if (e.key === 'ArrowLeft' && selected) {
        setSelected([selected[0], Math.max(0, selected[1] - 1)]);
      }
      if (e.key === 'ArrowRight' && selected) {
        setSelected([selected[0], Math.min(8, selected[1] + 1)]);
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (!selected) return;
        const [r, c] = selected;
        if (initial[r][c] !== EMPTY) return;
        setGrid(prev => {
          const newGrid = deepCopy(prev);
          newGrid[r][c] = EMPTY;
          return newGrid;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, initial, handleNumberInput]);

  const newGame = () => {
    const idx = getRandomInt(PUZZLES.length);
    setPuzzleIndex(idx);
    loadPuzzle(idx);
  };

  const checkSolution = () => {
    const sol = PUZZLES[puzzleIndex].solution;
    let correct = true;
    const newGrid = deepCopy(grid);
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (newGrid[r][c] !== sol[r][c]) {
          if (newGrid[r][c] === EMPTY) {
            correct = false;
          } else {
            correct = false;
          }
        }
    if (correct && grid.every(row => row.every(v => v !== EMPTY))) {
      setWon(true);
      setIsRunning(false);
      setMessage('Correct! Puzzle solved!');
    } else {
      setMessage('Solution is not correct yet. Keep trying!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const isSameRow = (r, c) => selected && selected[0] === r;
  const isSameCol = (r, c) => selected && selected[1] === c;
  const isSameBox = (r, c) => selected && getBox(r, c) === getBox(selected[0], selected[1]);

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4">
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Sudoku
        </h2>
        <div className="flex gap-3">
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Timer</div>
            <div className="text-lg font-bold text-cyan-400">{formatTime(timer)}</div>
          </div>
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Errors</div>
            <div className="text-lg font-bold text-red-400">{errors}/3</div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-2 px-4 py-2 rounded-lg bg-dark-100 border border-cyan-500/30 text-sm text-cyan-300">
          {message}
        </div>
      )}

      <div className="bg-dark-100 rounded-xl p-1 border border-white/5 select-none">
        <div className="grid grid-cols-9 gap-0">
          {grid.map((row, ri) =>
            row.map((cell, ci) => {
              const isSelected = selected && selected[0] === ri && selected[1] === ci;
              const highlight = selected && (
                isSameRow(ri, ci) || isSameCol(ri, ci) || isSameBox(ri, ci)
              );
              const isInitial = initial[ri][ci] !== EMPTY;
              const isError = cell !== EMPTY && !isValidPlacement(ri, ci, cell, grid);

              let borderRight = ci % 3 === 2 && ci < 8 ? 'border-r-2 border-cyan-500/50' : 'border-r border-white/5';
              let borderBottom = ri % 3 === 2 && ri < 8 ? 'border-b-2 border-cyan-500/50' : 'border-b border-white/5';

              return (
                <div
                  key={`${ri}-${ci}`}
                  className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 cursor-pointer transition-colors duration-100 text-lg font-bold
                    ${borderRight} ${borderBottom}
                    ${isSelected ? 'bg-cyan-500/40' : highlight ? 'bg-cyan-500/10' : 'bg-transparent'}
                    ${isError ? 'text-red-400' : isInitial ? 'text-cyan-300' : 'text-white'}
                    ${!isSelected && !highlight ? 'hover:bg-white/5' : ''}
                  `}
                  onClick={() => handleCellClick(ri, ci)}
                >
                  {cell !== EMPTY && cell}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="grid grid-cols-9 gap-1 mt-4 w-full max-w-sm">
        {[1,2,3,4,5,6,7,8,9].map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-full py-2 rounded-lg bg-dark-100 hover:bg-cyan-500/20 text-white font-bold text-lg border border-white/5 hover:border-cyan-500/30 transition-all"
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={checkSolution}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold transition-all"
        >
          Check
        </button>
        <button
          onClick={newGame}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all"
        >
          New Game
        </button>
      </div>

      {(gameOver || won) && (
        <div className="mt-4 p-4 rounded-xl bg-dark-100 border border-white/5 text-center">
          {gameOver && <div className="text-xl font-bold text-red-400">Game Over - Too many errors!</div>}
          {won && <div className="text-xl font-bold text-green-400">Puzzle Solved!</div>}
          <div className="text-gray-400 mt-1">Time: {formatTime(timer)}</div>
        </div>
      )}

      <div className="mt-3 text-center text-sm text-gray-400">
        Click cell then <span className="text-cyan-400">1-9</span> or keyboard | Arrow keys to navigate
      </div>
    </div>
  );
}
