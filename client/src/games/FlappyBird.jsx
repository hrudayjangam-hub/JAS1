import { useState, useEffect, useRef, useCallback } from 'react';

const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const GROUND_HEIGHT = 60;
const CANVAS_W = 400;
const CANVAS_H = 600;

function randomPipeY() {
  return Math.floor(Math.random() * (CANVAS_H - GROUND_HEIGHT - PIPE_GAP - 100)) + 50;
}

export default function FlappyBird({ onScoreUpdate }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const initState = useCallback(() => ({
    bird: { x: 80, y: CANVAS_H / 2, vy: 0, size: 20 },
    pipes: [{ x: CANVAS_W, top: randomPipeY() }],
    score: 0,
    gameOver: false,
    started: false,
    frame: 0,
    groundX: 0,
  }), []);

  if (!stateRef.current) stateRef.current = initState();

  const draw = useCallback((state) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const grd = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grd.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
    grd.addColorStop(0.5, 'rgba(124, 58, 237, 0.03)');
    grd.addColorStop(1, 'rgba(6, 182, 212, 0.08)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (!state.started && !state.gameOver) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click / Space to Start', CANVAS_W / 2, CANVAS_H / 2 - 50);
    }

    state.pipes.forEach((pipe) => {
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
      ctx.fillRect(pipe.x, pipe.top + PIPE_GAP, PIPE_WIDTH, CANVAS_H - GROUND_HEIGHT - pipe.top - PIPE_GAP);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(pipe.x - 4, pipe.top - 20, PIPE_WIDTH + 8, 20);
      ctx.fillRect(pipe.x - 4, pipe.top + PIPE_GAP, PIPE_WIDTH + 8, 20);
    });

    ctx.fillStyle = 'rgba(18, 18, 42, 0.9)';
    ctx.fillRect(0, CANVAS_H - GROUND_HEIGHT, CANVAS_W, GROUND_HEIGHT);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H - GROUND_HEIGHT);
    ctx.lineTo(CANVAS_W, CANVAS_H - GROUND_HEIGHT);
    ctx.stroke();

    state.groundX = (state.groundX - PIPE_SPEED) % 24;
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.2)';
    ctx.lineWidth = 1;
    for (let x = state.groundX; x < CANVAS_W; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, CANVAS_H - GROUND_HEIGHT + 4);
      ctx.lineTo(x + 12, CANVAS_H - GROUND_HEIGHT + 4);
      ctx.stroke();
    }

    const b = state.bird;
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7c3aed';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(b.x + 6, b.y - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(b.x + 7, b.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();

    if (state.gameOver) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '16px sans-serif';
      ctx.fillText('Click to Restart', CANVAS_W / 2, CANVAS_H / 2 + 30);
    }
  }, []);

  const update = useCallback((state) => {
    if (state.gameOver) return state;

    const b = state.bird;
    b.vy += GRAVITY;
    b.y += b.vy;

    const newPipes = state.pipes
      .map((p) => ({ ...p, x: p.x - PIPE_SPEED }))
      .filter((p) => p.x + PIPE_WIDTH > -50);

    if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < CANVAS_W - 250) {
      newPipes.push({ x: CANVAS_W, top: randomPipeY() });
    }

    state.pipes = newPipes;

    const firstPipe = newPipes[0];
    if (firstPipe) {
      const birdLeft = b.x - b.size / 2;
      const birdRight = b.x + b.size / 2;
      const birdTop = b.y - b.size / 2;
      const birdBottom = b.y + b.size / 2;

      if (
        birdRight > firstPipe.x &&
        birdLeft < firstPipe.x + PIPE_WIDTH
      ) {
        if (birdTop < firstPipe.top || birdBottom > firstPipe.top + PIPE_GAP) {
          state.gameOver = true;
          setGameOver(true);
          setHighScore((h) => Math.max(h, state.score));
          return state;
        }
      }

      if (firstPipe.x + PIPE_WIDTH < b.x && !firstPipe.passed) {
        firstPipe.passed = true;
        state.score += 1;
        setScore(state.score);
        onScoreUpdate?.(state.score);
      }
    }

    if (b.y + b.size / 2 > CANVAS_H - GROUND_HEIGHT || b.y - b.size / 2 < 0) {
      state.gameOver = true;
      setGameOver(true);
      setHighScore((h) => Math.max(h, state.score));
      return state;
    }

    state.frame++;
    return state;
  }, [onScoreUpdate]);

  const flap = useCallback(() => {
    const state = stateRef.current;
    if (state.gameOver) return;
    if (!state.started) {
      state.started = true;
      setStarted(true);
    }
    state.bird.vy = JUMP_FORCE;
  }, []);

  const restart = useCallback(() => {
    const state = initState();
    stateRef.current = state;
    setScore(0);
    setGameOver(false);
    setStarted(false);
    draw(state);
  }, [initState, draw]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (stateRef.current?.gameOver) {
          restart();
        } else {
          flap();
        }
      }
    };
    const handleClick = () => {
      if (stateRef.current?.gameOver) {
        restart();
      } else {
        flap();
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleClick);
    };
  }, [flap, restart]);

  useEffect(() => {
    let animId;
    const loop = () => {
      const state = stateRef.current;
      try {
        if (state.started) update(state);
        draw(state);
      } catch (e) { console.error('FlappyBird error:', e); }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); };
  }, [draw, update]);

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
          Flappy Bird
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>Score: {score}</span>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>Best: {highScore}</span>
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

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          display: 'block',
          margin: '0 auto',
          borderRadius: '12px',
          maxWidth: '100%',
          height: 'auto',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
