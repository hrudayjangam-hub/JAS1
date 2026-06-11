import { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_W = 600;
const CANVAS_H = 400;
const PADDLE_W = 10;
const PADDLE_H = 80;
const BALL_SIZE = 10;
const BALL_SPEED = 5;
const WIN_SCORE = 7;

export default function Pong({ onScoreUpdate }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const keysRef = useRef({});
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [winner, setWinner] = useState(null);

  const initState = useCallback(() => ({
    paddle1: { y: CANVAS_H / 2 - PADDLE_H / 2 },
    paddle2: { y: CANVAS_H / 2 - PADDLE_H / 2 },
    ball: {
      x: CANVAS_W / 2,
      y: CANVAS_H / 2,
      vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() - 0.5) * 3,
      size: BALL_SIZE,
    },
    score1: 0,
    score2: 0,
    winner: null,
    serving: true,
    serveTimer: 0,
  }), []);

  if (!stateRef.current) stateRef.current = initState();

  const draw = useCallback((state) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.fillRect(20, state.paddle1.y, PADDLE_W, PADDLE_H);
    ctx.fillRect(CANVAS_W - 20 - PADDLE_W, state.paddle2.y, PADDLE_W, PADDLE_H);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#7c3aed';
    ctx.shadowColor = '#7c3aed';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.score1, CANVAS_W / 2 - 60, 60);
    ctx.fillText(state.score2, CANVAS_W / 2 + 60, 60);

    if (state.serving) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '16px sans-serif';
      ctx.fillText('Press Space to serve', CANVAS_W / 2, CANVAS_H / 2 + 50);
    }

    if (state.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Player ${state.winner} Wins!`, CANVAS_W / 2, CANVAS_H / 2 - 10);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '18px sans-serif';
      ctx.fillText(`${state.score1} - ${state.score2}`, CANVAS_W / 2, CANVAS_H / 2 + 40);
    }
  }, []);

  const update = useCallback((state) => {
    if (state.winner) return;

    const k = keysRef.current;
    const PADDLE_SPEED = 5;

    if (k['w'] || k['W']) state.paddle1.y = Math.max(0, state.paddle1.y - PADDLE_SPEED);
    if (k['s'] || k['S']) state.paddle1.y = Math.min(CANVAS_H - PADDLE_H, state.paddle1.y + PADDLE_SPEED);

    if (k['ArrowUp']) state.paddle2.y = Math.max(0, state.paddle2.y - PADDLE_SPEED);
    if (k['ArrowDown']) state.paddle2.y = Math.min(CANVAS_H - PADDLE_H, state.paddle2.y + PADDLE_SPEED);

    if (state.serving) return;

    const b = state.ball;
    b.x += b.vx;
    b.y += b.vy;

    if (b.y - b.size < 0) { b.y = b.size; b.vy = -b.vy; }
    if (b.y + b.size > CANVAS_H) { b.y = CANVAS_H - b.size; b.vy = -b.vy; }

    if (
      b.x - b.size < 20 + PADDLE_W &&
      b.x - b.size > 20 &&
      b.y > state.paddle1.y &&
      b.y < state.paddle1.y + PADDLE_H
    ) {
      const hitPos = (b.y - state.paddle1.y) / PADDLE_H;
      const angle = (hitPos - 0.5) * Math.PI * 0.6;
      const speed = Math.abs(b.vx) + 0.3;
      b.vx = Math.cos(angle) * speed;
      b.vy = Math.sin(angle) * speed;
      b.x = 20 + PADDLE_W + b.size;
    }

    if (
      b.x + b.size > CANVAS_W - 20 - PADDLE_W &&
      b.x + b.size < CANVAS_W - 20 &&
      b.y > state.paddle2.y &&
      b.y < state.paddle2.y + PADDLE_H
    ) {
      const hitPos = (b.y - state.paddle2.y) / PADDLE_H;
      const angle = (hitPos - 0.5) * Math.PI * 0.6;
      const speed = Math.abs(b.vx) + 0.3;
      b.vx = -Math.cos(angle) * speed;
      b.vy = Math.sin(angle) * speed;
      b.x = CANVAS_W - 20 - PADDLE_W - b.size;
    }

    if (b.x - b.size < 0) {
      state.score2++;
      setScore2(state.score2);
      onScoreUpdate?.({ player1: state.score1, player2: state.score2 });
      if (state.score2 >= WIN_SCORE) {
        state.winner = 2;
        setWinner(2);
      } else {
        resetBall(state, 1);
      }
    }

    if (b.x + b.size > CANVAS_W) {
      state.score1++;
      setScore1(state.score1);
      onScoreUpdate?.({ player1: state.score1, player2: state.score2 });
      if (state.score1 >= WIN_SCORE) {
        state.winner = 1;
        setWinner(1);
      } else {
        resetBall(state, -1);
      }
    }
  }, [onScoreUpdate]);

  function resetBall(state, dir) {
    state.ball = {
      x: CANVAS_W / 2,
      y: CANVAS_H / 2,
      vx: BALL_SPEED * dir,
      vy: (Math.random() - 0.5) * 3,
      size: BALL_SIZE,
    };
    state.serving = true;
  }

  const serve = useCallback(() => {
    const state = stateRef.current;
    if (!state.serving || state.winner) return;
    state.serving = false;
  }, []);

  const restart = useCallback(() => {
    stateRef.current = initState();
    setScore1(0);
    setScore2(0);
    setWinner(null);
  }, [initState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        serve();
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [serve]);

  useEffect(() => {
    let animId;
    const loop = () => {
      const state = stateRef.current;
      try { update(state); draw(state); } catch (e) { console.error('Pong error:', e); }
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
      maxWidth: '650px',
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
          Pong
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>
            P1: {score1}
          </span>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>
            P2: {score2}
          </span>
          <span style={{ color: '#666', fontSize: '0.85rem' }}>
            First to {WIN_SCORE}
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
        }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '12px',
        color: '#666',
        fontSize: '0.8rem',
      }}>
        <span>Player 1: W / S</span>
        <span>Space to serve</span>
        <span>Player 2: ↑ / ↓</span>
      </div>
    </div>
  );
}
