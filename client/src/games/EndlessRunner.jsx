import { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_W = 800;
const CANVAS_H = 400;
const GROUND_Y = CANVAS_H - 50;
const PLAYER_W = 30;
const PLAYER_H = 40;
const GRAVITY = 0.6;
const JUMP_VEL = -11;
const BASE_SPEED = 5;

export default function EndlessRunner({ onScoreUpdate }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameState, setGameState] = useState('idle');
  const animRef = useRef(null);
  const gameRef = useRef(null);

  const initGame = useCallback(() => {
    const state = {
      player: {
        x: 80,
        y: GROUND_Y - PLAYER_H,
        w: PLAYER_W,
        h: PLAYER_H,
        vy: 0,
        jumps: 0,
        maxJumps: 2,
      },
      obstacles: [],
      groundOffset: 0,
      score: 0,
      speed: BASE_SPEED,
      gameOver: false,
      frame: 0,
      stars: Array.from({ length: 30 }, () => ({
        x: Math.random() * CANVAS_W,
        y: Math.random() * (GROUND_Y - 50),
        size: 1 + Math.random() * 2,
        speed: 0.2 + Math.random() * 0.3,
      })),
      mountains: Array.from({ length: 5 }, (_, i) => ({
        x: i * 200,
        h: 60 + Math.random() * 80,
        w: 150 + Math.random() * 100,
      })),
    };
    gameRef.current = state;
    return state;
  }, []);

  const newGame = useCallback(() => {
    initGame();
    setScore(0);
    setGameOver(false);
    setGameState('playing');
    if (onScoreUpdate) onScoreUpdate(0);
  }, [initGame, onScoreUpdate]);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.gameOver) return;
    if (g.player.jumps < g.player.maxJumps) {
      g.player.vy = JUMP_VEL * (g.player.jumps === 1 ? 0.85 : 1);
      g.player.jumps++;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (gameRef.current?.gameOver) return;
        if (gameState === 'idle') {
          newGame();
          return;
        }
        jump();
      }
      if (e.key === 'Enter' && gameOver) {
        newGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, newGame, gameState, gameOver]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      const g = gameRef.current;
      if (!g || g.gameOver) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        return;
      }

      g.frame++;
      g.speed = BASE_SPEED + g.score * 0.02;
      if (g.speed > 12) g.speed = 12;

      const p = g.player;
      p.vy += GRAVITY;
      p.y += p.vy;

      if (p.y + p.h >= GROUND_Y) {
        p.y = GROUND_Y - p.h;
        p.vy = 0;
        p.jumps = 0;
      }

      if (g.frame % Math.max(30, 80 - Math.floor(g.speed * 5)) === 0) {
        const obsH = 20 + Math.random() * 40;
        const obsW = 15 + Math.random() * 20;
        const gapY = GROUND_Y - obsH;
        g.obstacles.push({
          x: CANVAS_W,
          y: gapY,
          w: obsW,
          h: obsH,
        });

        if (Math.random() < 0.3) {
          const gapH = 30 + Math.random() * 30;
          const gapTop = 60 + Math.random() * (GROUND_Y - 120 - gapH);
          g.obstacles.push({
            x: CANVAS_W + 40,
            y: 0,
            w: 15 + Math.random() * 10,
            h: gapTop,
            isTop: true,
          });
          g.obstacles.push({
            x: CANVAS_W + 40,
            y: gapTop + gapH,
            w: 15 + Math.random() * 10,
            h: GROUND_Y - gapTop - gapH,
            isTop: false,
          });
        }
      }

      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        const obs = g.obstacles[i];
        obs.x -= g.speed;
        if (obs.x + obs.w < 0) {
          g.obstacles.splice(i, 1);
          continue;
        }

        if (
          p.x < obs.x + obs.w &&
          p.x + p.w > obs.x &&
          p.y < obs.y + obs.h &&
          p.y + p.h > obs.y
        ) {
          g.gameOver = true;
          gameRef.current = g;
          setGameOver(true);
          setGameState('idle');
          return;
        }
      }

      g.groundOffset = (g.groundOffset + g.speed) % 40;
      g.score = Math.floor(g.frame / 10);
      setScore(g.score);
      if (onScoreUpdate) onScoreUpdate(g.score);

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bgGrad.addColorStop(0, '#0a0a2e');
      bgGrad.addColorStop(0.6, '#0a0a1a');
      bgGrad.addColorStop(1, '#12122a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      g.stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) star.x = CANVAS_W;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.3})`;
        ctx.fill();
      });

      g.mountains.forEach(m => {
        m.x -= 0.5;
        if (m.x + m.w < 0) m.x = CANVAS_W + Math.random() * 100;
        ctx.beginPath();
        ctx.moveTo(m.x, GROUND_Y);
        ctx.lineTo(m.x + m.w / 2, GROUND_Y - m.h);
        ctx.lineTo(m.x + m.w, GROUND_Y);
        ctx.fillStyle = 'rgba(30,30,60,0.4)';
        ctx.fill();
      });

      for (let i = 0; i < 12; i++) {
        const gx = i * 40 - g.groundOffset;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(6,182,212,0.15)' : 'rgba(124,58,237,0.15)';
        ctx.fillRect(gx, GROUND_Y, 40, 3);
      }

      ctx.fillStyle = '#1a1a3e';
      ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

      ctx.strokeStyle = 'rgba(6,182,212,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.stroke();

      g.obstacles.forEach(obs => {
        const grad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.w, obs.y);
        grad.addColorStop(0, '#7c3aed');
        grad.addColorStop(1, '#6d28d9');
        ctx.fillStyle = grad;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = 'rgba(124,58,237,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      });

      const pg = ctx.createRadialGradient(p.x + p.w / 2, p.y + p.h / 2, 2, p.x + p.w / 2, p.y + p.h / 2, p.w);
      pg.addColorStop(0, '#22d3ee');
      pg.addColorStop(1, '#06b6d4');
      ctx.fillStyle = pg;
      ctx.shadowColor = 'rgba(6,182,212,0.5)';
      ctx.shadowBlur = 15;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.shadowBlur = 0;

      if (p.jumps > 0) {
        ctx.fillStyle = 'rgba(6,182,212,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(6,182,212,0.3)';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        if (p.jumps > 1) {
          ctx.beginPath();
          ctx.arc(p.x + p.w / 2 + 8, p.y + p.h + 5, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Score: ${g.score}`, CANVAS_W - 12, 28);
      ctx.fillText(`Speed: ${g.speed.toFixed(1)}`, CANVAS_W - 12, 50);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, onScoreUpdate]);

  const handleCanvasClick = () => {
    if (gameState === 'playing') {
      jump();
    } else if (gameState === 'idle' && !gameOver) {
      newGame();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('click', handleCanvasClick);
    return () => canvas.removeEventListener('click', handleCanvasClick);
  });

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Endless Runner
        </h2>
        <div className="flex gap-3">
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
            <div className="text-xl font-bold text-cyan-400">{score}</div>
          </div>
        </div>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border border-white/5">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-auto cursor-pointer touch-none"
          style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-red-400 mb-2">Crash!</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
              {score}
            </div>
            <div className="text-gray-400 mb-4">distance traveled</div>
            <button
              onClick={newGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-lg transition-all"
            >
              Play Again
            </button>
          </div>
        )}

        {gameState === 'idle' && !gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-cyan-400 mb-4">Endless Runner</div>
            <button
              onClick={newGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-lg transition-all"
            >
              Start Run
            </button>
          </div>
        )}
      </div>

      {!gameOver && gameState === 'playing' && (
        <button
          onClick={newGame}
          className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all"
        >
          New Game (Enter)
        </button>
      )}

      <div className="mt-3 text-center text-sm text-gray-400">
        <span className="text-cyan-400">Space</span> / <span className="text-cyan-400">Click</span> to jump | Double jump allowed
      </div>
    </div>
  );
}
