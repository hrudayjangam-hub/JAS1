import { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_W = 500;
const CANVAS_H = 600;
const PADDLE_W = 100;
const PADDLE_H = 14;
const BALL_R = 8;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_W = 55;
const BRICK_H = 20;
const BRICK_PAD = 4;
const BRICK_TOP = 60;

const BRICK_COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#06b6d4',
  '#7c3aed', '#ec4899',
];

function createBricks() {
  const bricks = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: c * (BRICK_W + BRICK_PAD) + BRICK_PAD / 2 + (CANVAS_W - BRICK_COLS * (BRICK_W + BRICK_PAD)) / 2,
        y: r * (BRICK_H + BRICK_PAD) + BRICK_TOP,
        w: BRICK_W,
        h: BRICK_H,
        color: BRICK_COLORS[r % BRICK_COLORS.length],
        alive: true,
      });
    }
  }
  return bricks;
}

export default function Breakout({ onScoreUpdate }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const keysRef = useRef({});
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initState = useCallback(() => ({
    paddle: { x: CANVAS_W / 2 - PADDLE_W / 2, y: CANVAS_H - 40 },
    ball: {
      x: CANVAS_W / 2,
      y: CANVAS_H - 40 - BALL_R - PADDLE_H / 2,
      vx: 4,
      vy: -4,
      radius: BALL_R,
    },
    bricks: createBricks(),
    score: 0,
    lives: 3,
    gameOver: false,
    won: false,
    launched: false,
  }), []);

  if (!stateRef.current) stateRef.current = initState();

  const draw = useCallback((state) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const grd = ctx.createLinearGradient(0, BRICK_TOP - 20, 0, BRICK_TOP + BRICK_ROWS * (BRICK_H + BRICK_PAD));
    grd.addColorStop(0, 'rgba(6, 182, 212, 0.03)');
    grd.addColorStop(1, 'rgba(124, 58, 237, 0.03)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, BRICK_TOP - 20, CANVAS_W, BRICK_ROWS * (BRICK_H + BRICK_PAD) + 20);

    state.bricks.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;
    const p = state.paddle;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, PADDLE_W, PADDLE_H, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#7c3aed';
    ctx.shadowColor = '#7c3aed';
    ctx.shadowBlur = 12;
    const b = state.ball;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (!state.launched && !state.gameOver && !state.won) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click or press Space to launch', CANVAS_W / 2, CANVAS_H / 2 + 60);
    }

    if (state.won) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('YOU WIN!', CANVAS_W / 2, CANVAS_H / 2 - 10);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '18px sans-serif';
      ctx.fillText(`Score: ${state.score}`, CANVAS_W / 2, CANVAS_H / 2 + 40);
    }

    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 10);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '18px sans-serif';
      ctx.fillText(`Final Score: ${state.score}`, CANVAS_W / 2, CANVAS_H / 2 + 40);
    }
  }, []);

  const update = useCallback((state) => {
    if (state.gameOver || state.won) return;

    const k = keysRef.current;
    if (k['ArrowLeft'] && state.paddle.x > 0) state.paddle.x -= 7;
    if (k['ArrowRight'] && state.paddle.x < CANVAS_W - PADDLE_W) state.paddle.x += 7;

    const b = state.ball;
    if (!state.launched) {
      b.x = state.paddle.x + PADDLE_W / 2;
      b.y = state.paddle.y - BALL_R;
      return;
    }

    b.x += b.vx;
    b.y += b.vy;

    if (b.x - b.radius < 0) { b.x = b.radius; b.vx = -b.vx; }
    if (b.x + b.radius > CANVAS_W) { b.x = CANVAS_W - b.radius; b.vx = -b.vx; }
    if (b.y - b.radius < 0) { b.y = b.radius; b.vy = -b.vy; }

    if (
      b.y + b.radius > state.paddle.y &&
      b.y + b.radius < state.paddle.y + PADDLE_H + 5 &&
      b.x > state.paddle.x &&
      b.x < state.paddle.x + PADDLE_W
    ) {
      const hitPos = (b.x - state.paddle.x) / PADDLE_W;
      const angle = (hitPos - 0.5) * Math.PI * 0.7;
      const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      b.vx = Math.cos(angle) * speed;
      b.vy = -Math.abs(Math.sin(angle) * speed);
      b.y = state.paddle.y - BALL_R;
    }

    if (b.y + b.radius > CANVAS_H) {
      state.lives--;
      setLives(state.lives);
      if (state.lives <= 0) {
        state.gameOver = true;
        setGameOver(true);
      } else {
        state.launched = false;
        b.vx = 4;
        b.vy = -4;
      }
      return;
    }

    let allDead = true;
    state.bricks.forEach((brick) => {
      if (!brick.alive) return;
      allDead = false;
      if (
        b.x + b.radius > brick.x &&
        b.x - b.radius < brick.x + brick.w &&
        b.y + b.radius > brick.y &&
        b.y - b.radius < brick.y + brick.h
      ) {
        brick.alive = false;
        state.score += 10;
        setScore(state.score);
        onScoreUpdate?.(state.score);

        const overlapX = Math.min(b.x + b.radius - brick.x, brick.x + brick.w - (b.x - b.radius));
        const overlapY = Math.min(b.y + b.radius - brick.y, brick.y + brick.h - (b.y - b.radius));
        if (overlapX < overlapY) {
          b.vx = -b.vx;
        } else {
          b.vy = -b.vy;
        }
      }
    });

    if (allDead) {
      state.won = true;
      setWon(true);
    }
  }, [onScoreUpdate]);

  const launch = useCallback(() => {
    const state = stateRef.current;
    if (state.gameOver || state.won) return;
    if (!state.launched) {
      state.launched = true;
    }
  }, []);

  const restart = useCallback(() => {
    stateRef.current = initState();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
  }, [initState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        launch();
      }
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const mx = (e.clientX - rect.left) * scaleX;
      const state = stateRef.current;
      if (state && !state.gameOver && !state.won) {
        state.paddle.x = Math.max(0, Math.min(CANVAS_W - PADDLE_W, mx - PADDLE_W / 2));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvasRef.current?.addEventListener('mousemove', handleMouseMove);
    const canvas = canvasRef.current;
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [launch]);

  useEffect(() => {
    let animId;
    const loop = () => {
      const state = stateRef.current;
      try { update(state); draw(state); } catch (e) { console.error('Breakout error:', e); }
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
      maxWidth: '550px',
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
          Breakout
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>Score: {score}</span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>
            {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
          </span>
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
          cursor: 'none',
        }}
      />

      <div style={{ textAlign: 'center', marginTop: '12px', color: '#666', fontSize: '0.8rem' }}>
        ← → / Mouse to move paddle | Space to launch ball
      </div>
    </div>
  );
}
