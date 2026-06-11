import { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 50;
const SPEED_DECREMENT = 3;

function randomFood(snake) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function Snake({ onScoreUpdate }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameState = useRef({
    snake: [{ x: 10, y: 10 }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: randomFood([{ x: 10, y: 10 }]),
    speed: INITIAL_SPEED,
    score: 0,
    gameOver: false,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const gs = gameState.current;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    gs.snake.forEach((seg, i) => {
      const ratio = i / gs.snake.length;
      const r = Math.floor(6 + (124 - 6) * ratio);
      const g = Math.floor(182 + (58 - 182) * ratio);
      const b = Math.floor(212 + (237 - 212) * ratio);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = i === 0 ? 10 : 4;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.fillStyle = '#7c3aed';
    ctx.shadowColor = '#7c3aed';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(
      gs.food.x * CELL_SIZE + CELL_SIZE / 2,
      gs.food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const gameLoop = useCallback(() => {
    const gs = gameState.current;
    if (gs.gameOver) return;

    gs.direction = { ...gs.nextDirection };
    const head = {
      x: gs.snake[0].x + gs.direction.x,
      y: gs.snake[0].y + gs.direction.y,
    };

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gs.gameOver = true;
      setGameOver(true);
      setHighScore((h) => Math.max(h, gs.score));
      return;
    }

    if (gs.snake.some((s) => s.x === head.x && s.y === head.y)) {
      gs.gameOver = true;
      setGameOver(true);
      setHighScore((h) => Math.max(h, gs.score));
      return;
    }

    gs.snake.unshift(head);

    if (head.x === gs.food.x && head.y === gs.food.y) {
      gs.score += 1;
      gs.speed = Math.max(MIN_SPEED, gs.speed - SPEED_DECREMENT);
      setScore(gs.score);
      onScoreUpdate?.(gs.score);
      gs.food = randomFood(gs.snake);
    } else {
      gs.snake.pop();
    }

    draw();

    setTimeout(gameLoop, gs.speed);
  }, [draw, onScoreUpdate]);

  const startGame = useCallback(() => {
    const gs = gameState.current;
    gs.snake = [{ x: 10, y: 10 }];
    gs.direction = { x: 1, y: 0 };
    gs.nextDirection = { x: 1, y: 0 };
    gs.food = randomFood([{ x: 10, y: 10 }]);
    gs.speed = INITIAL_SPEED;
    gs.score = 0;
    gs.gameOver = false;
    setScore(0);
    setGameOver(false);
    draw();
    setTimeout(gameLoop, gs.speed);
  }, [draw, gameLoop]);

  useEffect(() => {
    const handleKey = (e) => {
      const gs = gameState.current;
      if (gs.gameOver) return;
      const key = e.key;
      if (
        (key === 'ArrowUp' || key === 'w' || key === 'W') &&
        gs.direction.y !== 1
      ) {
        e.preventDefault();
        gs.nextDirection = { x: 0, y: -1 };
      } else if (
        (key === 'ArrowDown' || key === 's' || key === 'S') &&
        gs.direction.y !== -1
      ) {
        e.preventDefault();
        gs.nextDirection = { x: 0, y: 1 };
      } else if (
        (key === 'ArrowLeft' || key === 'a' || key === 'A') &&
        gs.direction.x !== 1
      ) {
        e.preventDefault();
        gs.nextDirection = { x: -1, y: 0 };
      } else if (
        (key === 'ArrowRight' || key === 'd' || key === 'D') &&
        gs.direction.x !== -1
      ) {
        e.preventDefault();
        gs.nextDirection = { x: 1, y: 0 };
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    draw();
    const gs = gameState.current;
    setTimeout(gameLoop, gs.speed);
    return () => {
      gs.gameOver = true;
    };
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
        marginBottom: '16px',
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
          Snake
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>Score: {score}</span>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>Best: {highScore}</span>
          <button onClick={startGame} style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}>
            {gameOver ? 'New Game' : 'Restart'}
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        style={{
          display: 'block',
          margin: '0 auto',
          borderRadius: '12px',
          maxWidth: '100%',
          height: 'auto',
        }}
      />

      {gameOver && (
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          padding: '12px',
          fontSize: '1.2rem',
          fontWeight: 600,
          color: '#ef4444',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          Game Over! Score: {score}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '12px', color: '#666', fontSize: '0.8rem' }}>
        Arrow Keys / WASD to move
      </div>
    </div>
  );
}
