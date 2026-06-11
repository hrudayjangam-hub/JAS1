import { useState, useEffect, useCallback } from 'react';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(squares) {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: combo };
    }
  }
  if (squares.every((s) => s !== null)) return { winner: 'draw', line: null };
  return { winner: null, line: null };
}

export default function TicTacToe({ onScoreUpdate }) {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winLine, setWinLine] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const { winner } = checkWinner(squares);

  useEffect(() => {
    if (winner === 'draw') {
      setGameOver(true);
      setScores((s) => {
        const ns = { ...s, draws: s.draws + 1 };
        onScoreUpdate?.(ns);
        return ns;
      });
    } else if (winner) {
      setGameOver(true);
      setScores((s) => {
        const ns = { ...s, [winner]: s[winner] + 1 };
        onScoreUpdate?.(ns);
        return ns;
      });
    }
  }, [winner]);

  useEffect(() => {
    const { line } = checkWinner(squares);
    setWinLine(line);
  }, [squares]);

  const handleClick = useCallback((i) => {
    if (squares[i] || gameOver) return;
    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  }, [squares, xIsNext, gameOver]);

  const resetGame = useCallback(() => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setWinLine(null);
    setGameOver(false);
  }, []);

  const fullReset = useCallback(() => {
    resetGame();
    setScores({ X: 0, O: 0, draws: 0 });
    onScoreUpdate?.({ X: 0, O: 0, draws: 0 });
  }, [resetGame, onScoreUpdate]);

  const isWin = (i) => winLine?.includes(i);

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
          Tic Tac Toe
        </h2>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>X: {scores.X}</span>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>O: {scores.O}</span>
          <span style={{ color: '#888', fontWeight: 600 }}>Draw: {scores.draws}</span>
          <button onClick={fullReset} style={{
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
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        maxWidth: '360px',
        margin: '0 auto',
      }}>
        {squares.map((val, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            style={{
              aspectRatio: '1',
              background: isWin(i)
                ? 'rgba(6, 182, 212, 0.2)'
                : 'rgba(18, 18, 42, 0.8)',
              border: isWin(i)
                ? '2px solid #06b6d4'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              cursor: gameOver || val ? 'default' : 'pointer',
              color: val === 'X' ? '#06b6d4' : val === 'O' ? '#7c3aed' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isWin(i) ? '0 0 12px rgba(6, 182, 212, 0.4)' : 'none',
            }}
            disabled={!!val || gameOver}
          >
            {val}
          </button>
        ))}
      </div>

      {gameOver && (
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          padding: '8px',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: winner === 'draw' ? '#888' : winner === 'X' ? '#06b6d4' : '#7c3aed',
        }}>
          {winner === 'draw' ? "It's a Draw!" : `${winner} Wins!`}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '16px', color: '#666', fontSize: '0.85rem' }}>
        Turn: <span style={{ color: xIsNext ? '#06b6d4' : '#7c3aed', fontWeight: 600 }}>
          {xIsNext ? 'X' : 'O'}
        </span>
      </div>
    </div>
  );
}
