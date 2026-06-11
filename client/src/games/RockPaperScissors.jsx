import { useState, useCallback } from 'react';

const CHOICES = [
  { name: 'Rock', emoji: '🪨', beats: 'Scissors' },
  { name: 'Paper', emoji: '📄', beats: 'Rock' },
  { name: 'Scissors', emoji: '✂️', beats: 'Paper' },
];

function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

function getRoundResult(player, computer) {
  if (player.name === computer.name) return 'draw';
  if (player.beats === computer.name) return 'win';
  return 'lose';
}

export default function RockPaperScissors({ onScoreUpdate }) {
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [round, setRound] = useState(1);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [animating, setAnimating] = useState(false);

  const play = useCallback((choice) => {
    if (gameOver || animating) return;

    setAnimating(true);
    setPlayerChoice(choice);

    const comp = getComputerChoice();
    const res = getRoundResult(choice, comp);

    setTimeout(() => {
      setComputerChoice(comp);
      setResult(res);

      if (res === 'win') {
        const newScore = playerScore + 1;
        setPlayerScore(newScore);
        if (newScore >= 3) {
          setGameOver(true);
          setWinner('Player');
          onScoreUpdate?.({ player: newScore, computer: computerScore, winner: 'Player' });
        }
      } else if (res === 'lose') {
        const newScore = computerScore + 1;
        setComputerScore(newScore);
        if (newScore >= 3) {
          setGameOver(true);
          setWinner('Computer');
          onScoreUpdate?.({ player: playerScore, computer: newScore, winner: 'Computer' });
        }
      }

      setRound((r) => r + 1);
      setAnimating(false);
    }, 500);
  }, [playerScore, computerScore, gameOver, animating, onScoreUpdate]);

  const restart = useCallback(() => {
    setPlayerScore(0);
    setComputerScore(0);
    setRound(1);
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setGameOver(false);
    setWinner(null);
    setAnimating(false);
  }, []);

  const resultColor = result === 'win' ? '#22c55e' : result === 'lose' ? '#ef4444' : '#f59e0b';
  const resultText = result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Draw!';

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
          Rock Paper Scissors
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>You: {playerScore}</span>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>CPU: {computerScore}</span>
          <span style={{ color: '#666', fontWeight: 600 }}>Round {round}</span>
          <button onClick={restart} style={{
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

      {gameOver ? (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          marginBottom: '16px',
        }}>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: winner === 'Player' ? '#22c55e' : '#ef4444',
            marginBottom: '8px',
          }}>
            {winner === 'Player' ? '🎉 You Win the Match!' : '💻 Computer Wins!'}
          </div>
          <div style={{ color: '#888', fontSize: '1rem' }}>
            Final Score: {playerScore} - {computerScore}
          </div>
          <button onClick={restart} style={{
            marginTop: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
          }}>
            Play Again
          </button>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            marginBottom: '24px',
            padding: '20px',
            background: 'rgba(18, 18, 42, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>You</div>
              <div style={{
                fontSize: '3rem',
                transition: 'all 0.3s',
                transform: animating ? 'scale(0.8)' : 'scale(1)',
                opacity: playerChoice ? 1 : 0.3,
              }}>
                {playerChoice ? playerChoice.emoji : '❔'}
              </div>
              {playerChoice && (
                <div style={{ color: '#06b6d4', fontSize: '0.85rem', marginTop: '4px' }}>
                  {playerChoice.name}
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '2rem',
              color: '#555',
            }}>
              VS
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>CPU</div>
              <div style={{
                fontSize: '3rem',
                transition: 'all 0.3s',
                transform: animating ? 'scale(0.8)' : 'scale(1)',
                opacity: computerChoice ? 1 : 0.3,
              }}>
                {computerChoice ? computerChoice.emoji : '❔'}
              </div>
              {computerChoice && (
                <div style={{ color: '#7c3aed', fontSize: '0.85rem', marginTop: '4px' }}>
                  {computerChoice.name}
                </div>
              )}
            </div>
          </div>

          {result && (
            <div style={{
              textAlign: 'center',
              marginBottom: '16px',
              padding: '8px',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: resultColor,
              transition: 'all 0.3s',
            }}>
              {resultText}
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {CHOICES.map((choice) => (
              <button
                key={choice.name}
                onClick={() => play(choice)}
                disabled={animating}
                style={{
                  background: animating
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(18, 18, 42, 0.8)',
                  border: playerChoice?.name === choice.name
                    ? '2px solid #06b6d4'
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  cursor: animating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '100px',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{choice.emoji}</span>
                <span style={{
                  color: playerChoice?.name === choice.name ? '#06b6d4' : '#aaa',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}>
                  {choice.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {!gameOver && (
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          color: '#666',
          fontSize: '0.8rem',
        }}>
          Best of 5 rounds • First to 3 wins
        </div>
      )}
    </div>
  );
}
