import { useState, useEffect, useCallback } from 'react';

const EMOJIS = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎸', '🎲', '🎰'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCards() {
  const pairs = shuffle([...EMOJIS, ...EMOJIS]);
  return pairs.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

export default function MemoryMatch({ onScoreUpdate }) {
  const [cards, setCards] = useState(createCards);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [highScore, setHighScore] = useState(
    () => parseInt(localStorage.getItem('mmHighScore') || '999')
  );
  const [locked, setLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    if (matched === 8) {
      setGameComplete(true);
      if (moves < highScore) {
        setHighScore(moves);
        localStorage.setItem('mmHighScore', String(moves));
      }
      onScoreUpdate?.(moves);
    }
  }, [matched, moves, highScore, onScoreUpdate]);

  const handleCardClick = useCallback((id) => {
    if (locked || gameComplete) return;
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return prev;
      if (flipped.length === 2) return prev;

      const updated = prev.map((c) =>
        c.id === id ? { ...c, flipped: true } : c
      );
      const newFlipped = [...flipped, updated.find((c) => c.id === id)];

      if (newFlipped.length === 2) {
        setLocked(true);
        setFlipped(newFlipped);
        setMoves((m) => m + 1);

        const [a, b] = newFlipped;
        if (a.emoji === b.emoji) {
          setTimeout(() => {
            setCards((p) =>
              p.map((c) => (c.emoji === a.emoji ? { ...c, matched: true } : c))
            );
            setMatched((m) => m + 1);
            setFlipped([]);
            setLocked(false);
          }, 400);
        } else {
          setTimeout(() => {
            setCards((p) =>
              p.map((c) =>
                c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c
              )
            );
            setFlipped([]);
            setLocked(false);
          }, 800);
        }
      } else {
        setFlipped(newFlipped);
      }

      return updated;
    });
  }, [flipped, locked, gameComplete]);

  const resetGame = useCallback(() => {
    setCards(createCards());
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setLocked(false);
    setGameComplete(false);
  }, []);

  return (
    <div style={{
      background: '#0a0a1a',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '500px',
      margin: '0 auto',
      border: '1px solid rgba(6, 182, 212, 0.2)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Memory Match
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>Moves: {moves}</span>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>
            Best: {highScore === 999 ? '-' : highScore}
          </span>
          <span style={{ color: '#888', fontWeight: 600 }}>{matched}/8</span>
          <button onClick={resetGame} style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}>
            New Game
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        maxWidth: '400px',
        margin: '0 auto',
      }}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            style={{
              aspectRatio: '1',
              background: card.flipped || card.matched
                ? 'rgba(18, 18, 42, 0.9)'
                : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(124, 58, 237, 0.2))',
              border: card.matched
                ? '2px solid #7c3aed'
                : card.flipped
                  ? '1px solid rgba(6, 182, 212, 0.4)'
                  : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              cursor: card.flipped || card.matched || locked ? 'default' : 'pointer',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              transform: card.flipped || card.matched ? 'rotateY(0deg)' : 'rotateY(180deg)',
              boxShadow: card.matched ? '0 0 12px rgba(124, 58, 237, 0.4)' : 'none',
            }}
            disabled={card.flipped || card.matched || locked}
          >
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {gameComplete && (
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          padding: '12px',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#22c55e',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}>
          All Matched! Completed in {moves} moves
          {moves <= highScore && highScore !== 999 ? ' (New Best!)' : ''}
        </div>
      )}
    </div>
  );
}
