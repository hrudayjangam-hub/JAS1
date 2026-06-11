import { useState, useEffect, useCallback, useRef } from 'react';

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'ORANGE', hex: '#f97316' },
  { name: 'PINK', hex: '#ec4899' },
  { name: 'CYAN', hex: '#06b6d4' },
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateRound() {
  const wordColor = getRandomColor();
  const inkColor = getRandomColor();
  const isMatch = wordColor.name === inkColor.name;
  return { word: wordColor.name, ink: inkColor.hex, isMatch };
}

export default function ColorMatch({ onScoreUpdate }) {
  const [round, setRound] = useState(generateRound);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (onScoreUpdate) onScoreUpdate(score);
  }, [score, onScoreUpdate]);

  useEffect(() => {
    if (gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameOver]);

  const nextRound = useCallback(() => {
    setRound(generateRound());
    setFeedback('');
  }, []);

  const handleAnswer = useCallback((answer) => {
    if (gameOver) return;
    const correct = (answer === 'match' && round.isMatch) || (answer === 'nomatch' && !round.isMatch);
    if (correct) {
      setScore(prev => {
        const ns = prev + 1;
        scoreRef.current = ns;
        return ns;
      });
      setStreak(prev => prev + 1);
      setFeedback('correct');
      setTimeout(() => setFeedback(''), 200);
      nextRound();
    } else {
      setFeedback('wrong');
      setGameOver(true);
      setTimeLeft(0);
    }
  }, [gameOver, round, nextRound]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'n' || e.key === 'N') handleAnswer('match');
      if (e.key === 'm' || e.key === 'M') handleAnswer('nomatch');
      if (e.key === 'Enter' && gameOver) newGame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnswer, gameOver]);

  const newGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setGameOver(false);
    setFeedback('');
    setStreak(0);
    setRound(generateRound());
  };

  const flashClass = feedback === 'correct' ? 'border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
    feedback === 'wrong' ? 'border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
    'border-white/5';

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4">
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Color Match
        </h2>
        <div className="flex gap-3">
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
            <div className="text-xl font-bold text-cyan-400">{score}</div>
          </div>
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Time</div>
            <div className={`text-xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-purple-400'}`}>
              {timeLeft}s
            </div>
          </div>
        </div>
      </div>

      {!gameOver ? (
        <div className="w-full">
          <div className="bg-dark-100 rounded-xl p-8 border border-white/5 text-center mb-6 transition-all duration-150"
            style={{ boxShadow: feedback === 'correct' ? 'inset 0 0 30px rgba(34,197,94,0.15)' :
              feedback === 'wrong' ? 'inset 0 0 30px rgba(239,68,68,0.15)' : 'none' }}
          >
            <div
              className="text-5xl md:text-7xl font-black tracking-wider mb-4 select-none transition-colors duration-200"
              style={{ color: round.ink }}
            >
              {round.word}
            </div>
            <div className="text-gray-400 text-sm">
              Does the <span className="text-cyan-400">word</span> match the <span className="text-purple-400">color</span>?
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-4">
            <button
              onClick={() => handleAnswer('match')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
            >
              MATCH <span className="text-sm text-white/60">(N)</span>
            </button>
            <button
              onClick={() => handleAnswer('nomatch')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
            >
              NO MATCH <span className="text-sm text-white/60">(M)</span>
            </button>
          </div>

          {streak > 2 && (
            <div className="text-center text-cyan-400 text-sm mb-2">
              🔥 {streak} streak!
            </div>
          )}

          <div className="w-full bg-dark-100 rounded-full h-2 border border-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(timeLeft / 30) * 100}%`,
                background: timeLeft <= 5
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : 'linear-gradient(90deg, #06b6d4, #7c3aed)',
              }}
            />
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-dark-100 rounded-xl p-8 border border-white/5 text-center mb-6">
            <div className="text-3xl font-bold text-red-400 mb-2">Game Over</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
              {score}
            </div>
            <div className="text-gray-400">points scored</div>
            {streak >= 3 && (
              <div className="text-cyan-400 text-sm mt-2">Best streak: {streak}</div>
            )}
            <button
              onClick={newGame}
              className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-lg transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 text-center text-sm text-gray-400">
        Press <span className="text-green-400">N</span> for MATCH or <span className="text-red-400">M</span> for NO MATCH
      </div>
    </div>
  );
}
