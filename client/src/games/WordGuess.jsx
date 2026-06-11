import { useState, useEffect, useCallback, useRef } from 'react';

const WORDS = [
  'REACT', 'JAVASCRIPT', 'PYTHON', 'TYPESCRIPT', 'DEVELOPER',
  'GAMING', 'COMPUTER', 'ALGORITHM', 'FUNCTION', 'VARIABLE',
  'DATABASE', 'NETWORK', 'BROWSER', 'SERVER', 'CLIENT',
  'KEYBOARD', 'MONITOR', 'GRAPHICS', 'MEMORY', 'PROCESSOR',
  'SOFTWARE', 'HARDWARE', 'INTERNET', 'WEBSITE', 'APPLICATION',
  'FRAMEWORK', 'LIBRARY', 'COMPONENT', 'INTERFACE', 'MODULE',
  'CONSTANT', 'PROMISE', 'OBSERVER', 'FACTORY', 'BUILDER',
];

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export default function WordGuess({ onScoreUpdate }) {
  const [word, setWord] = useState(getRandomWord);
  const [guessed, setGuessed] = useState(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState('');
  const scoreRef = useRef(0);

  const wordLetters = word.split('');

  const calculateScore = useCallback((wCount) => {
    return Math.max(0, (MAX_WRONG - wCount) * 50);
  }, []);

  useEffect(() => {
    const s = calculateScore(wrongCount);
    scoreRef.current = s;
    if (onScoreUpdate) onScoreUpdate(s);
  }, [wrongCount, calculateScore, onScoreUpdate]);

  const handleGuess = useCallback((letter) => {
    if (gameOver || won) return;
    if (guessed.has(letter)) return;

    setGuessed(prev => new Set(prev).add(letter));

    if (!wordLetters.includes(letter)) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= MAX_WRONG) {
        setGameOver(true);
        setMessage(`Game Over! The word was ${word}`);
      }
    } else {
      const allLetters = wordLetters.filter(l => l !== ' ').length;
      const uniqueCorrect = wordLetters.filter(l => guessed.has(l) || l === letter).length;
      const uniqueWordLetters = new Set(wordLetters);
      const guessedCorrect = [...uniqueWordLetters].filter(l => guessed.has(l) || l === letter).length;
      if (guessedCorrect === uniqueWordLetters.size) {
        setWon(true);
        setMessage('You Win!');
      }
    }
  }, [gameOver, won, guessed, word, wordLetters, wrongCount]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (ALPHABET.includes(key)) {
        handleGuess(key);
      }
      if (e.key === 'Enter') {
        newGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const newGame = () => {
    const w = getRandomWord();
    setWord(w);
    setGuessed(new Set());
    setWrongCount(0);
    setGameOver(false);
    setWon(false);
    setMessage('');
  };

  const displayWord = wordLetters.map((letter, i) => {
    if (letter === ' ') return ' ';
    return guessed.has(letter) ? letter : '_';
  });

  const lives = MAX_WRONG - wrongCount;

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4">
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Word Guess
        </h2>
        <div className="flex gap-3">
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
            <div className="text-xl font-bold text-cyan-400">{scoreRef.current}</div>
          </div>
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Lives</div>
            <div className="text-xl font-bold text-red-400">{'❤️'.repeat(lives)}{'🖤'.repeat(MAX_WRONG - lives)}</div>
          </div>
        </div>
      </div>

      <div className="bg-dark-100 rounded-xl p-6 border border-white/5 w-full">
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {displayWord.map((ch, i) => (
            <div
              key={i}
              className={`w-10 h-12 md:w-12 md:h-14 flex items-center justify-center rounded-lg text-2xl font-bold border-b-2
                ${ch === '_' ? 'border-cyan-500/50 text-transparent' : ch === ' ' ? 'border-transparent' : 'border-green-400/50 text-green-400'}
              `}
              style={{ backgroundColor: ch !== '_' && ch !== ' ' ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.05)' }}
            >
              {ch !== '_' ? ch : ''}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2 text-center">
            Wrong guesses: {wrongCount}/{MAX_WRONG}
          </div>
          <div className="flex justify-center gap-1 flex-wrap min-h-[28px]">
            {[...guessed].filter(l => !wordLetters.includes(l)).map(l => (
              <span key={l} className="text-red-400 font-bold text-sm px-1">{l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 w-full max-w-sm">
        <div className="grid grid-cols-7 gap-1.5">
          {ALPHABET.map(letter => {
            const isUsed = guessed.has(letter);
            const isCorrect = wordLetters.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isUsed || gameOver || won}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-all
                  ${isUsed && isCorrect ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    isUsed ? 'bg-red-500/10 text-red-400/50 border-red-500/10' :
                    gameOver || won ? 'bg-dark-100 text-gray-600 border-white/5' :
                    'bg-dark-100 hover:bg-cyan-500/20 text-white border-white/5 hover:border-cyan-500/30'}
                  border
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={newGame}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all"
        >
          New Game
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded-xl bg-dark-100 border text-center w-full
          ${won ? 'border-green-500/30' : 'border-red-500/30'}`}
        >
          <div className={`text-xl font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </div>
          {won && <div className="text-cyan-400 mt-1">Score: {scoreRef.current}</div>}
        </div>
      )}

      <div className="mt-3 text-center text-sm text-gray-400">
        Click letters or type on <span className="text-cyan-400">keyboard</span> | Enter for new game
      </div>
    </div>
  );
}
