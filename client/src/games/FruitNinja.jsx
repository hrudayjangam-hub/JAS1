import { useState, useEffect, useRef, useCallback } from 'react';

const FRUIT_EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍉', '🍓', '🍑', '🍒'];
const CANVAS_W = 600;
const CANVAS_H = 500;
const GRAVITY = 0.25;
const LIVES = 3;

class Fruit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 22 + Math.random() * 10;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = -(8 + Math.random() * 5);
    this.emoji = FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)];
    this.isBomb = false;
    this.sliced = false;
    this.offScreen = false;
  }

  update() {
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;
    if (this.y > CANVAS_H + 50) {
      this.offScreen = true;
    }
  }

  draw(ctx) {
    if (this.sliced) return;
    ctx.save();
    ctx.font = `${this.radius * 1.5}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, this.x, this.y);

    if (this.isBomb) {
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,0,0,0.15)';
      ctx.fill();
    }
    ctx.restore();
  }

  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

class Bomb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 22 + Math.random() * 8;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = -(7 + Math.random() * 4);
    this.sliced = false;
    this.offScreen = false;
  }

  update() {
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;
    if (this.y > CANVAS_H + 50) {
      this.offScreen = true;
    }
  }

  draw(ctx) {
    if (this.sliced) return;
    ctx.save();
    ctx.font = `${this.radius * 1.5}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💣', this.x, this.y);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,0,0,0.1)';
    ctx.fill();
    ctx.restore();
  }

  contains(px, py) {
    const dx = px - this.px;
    const dy = py - this.py;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

export default function FruitNinja({ onScoreUpdate }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [gameState, setGameState] = useState('idle');
  const animRef = useRef(null);
  const fruitsRef = useRef([]);
  const bombsRef = useRef([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(LIVES);
  const gameOverRef = useRef(false);
  const mousePosRef = useRef(null);
  const trailRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const difficultyRef = useRef(1);

  const newGame = useCallback(() => {
    setScore(0);
    setLives(LIVES);
    setGameOver(false);
    setGameState('playing');
    scoreRef.current = 0;
    livesRef.current = LIVES;
    gameOverRef.current = false;
    fruitsRef.current = [];
    bombsRef.current = [];
    trailRef.current = [];
    spawnTimerRef.current = 0;
    difficultyRef.current = 1;
    if (onScoreUpdate) onScoreUpdate(0);
  }, [onScoreUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - r.left) * scaleX,
        y: (clientY - r.top) * scaleY,
      };
    };

    const handlePointerDown = (e) => {
      if (gameOverRef.current) return;
      const pos = getPos(e);
      mousePosRef.current = pos;
      trailRef.current = [{ x: pos.x, y: pos.y, time: Date.now() }];
    };

    const handlePointerMove = (e) => {
      if (gameOverRef.current) return;
      if (!mousePosRef.current) return;
      const pos = getPos(e);
      trailRef.current.push({ x: pos.x, y: pos.y, time: Date.now() });
      if (trailRef.current.length > 20) trailRef.current.shift();

      const fruits = fruitsRef.current;
      const bombs = bombsRef.current;
      for (let i = fruits.length - 1; i >= 0; i--) {
        const f = fruits[i];
        if (!f.sliced && f.contains(pos.x, pos.y)) {
          f.sliced = true;
          scoreRef.current += 10;
          setScore(scoreRef.current);
          if (onScoreUpdate) onScoreUpdate(scoreRef.current);
        }
      }
      for (let i = bombs.length - 1; i >= 0; i--) {
        const b = bombs[i];
        if (!b.sliced && b.contains(pos.x, pos.y)) {
          b.sliced = true;
          gameOverRef.current = true;
          setGameOver(true);
          setGameState('idle');
        }
      }
    };

    const handlePointerUp = () => {
      mousePosRef.current = null;
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas.addEventListener('touchend', handlePointerUp);

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchend', handlePointerUp);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [onScoreUpdate]);

  useEffect(() => {
    if (gameState !== 'playing' || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      if (gameOverRef.current) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        return;
      }

      spawnTimerRef.current++;
      const spawnRate = Math.max(15, 40 - difficultyRef.current * 2);

      if (spawnTimerRef.current % spawnRate === 0) {
        const x = 50 + Math.random() * (CANVAS_W - 100);
        const f = new Fruit(x, CANVAS_H + 20);
        fruitsRef.current.push(f);
      }

      if (spawnTimerRef.current % (spawnRate * 3) === 0 && difficultyRef.current > 1) {
        const x = 50 + Math.random() * (CANVAS_W - 100);
        const b = new Bomb(x, CANVAS_H + 20);
        bombsRef.current.push(b);
      }

      if (spawnTimerRef.current % 300 === 0) {
        difficultyRef.current += 0.5;
      }

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = 'rgba(10,10,26,0.95)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const gradient = ctx.createLinearGradient(0, CANVAS_H - 20, 0, CANVAS_H);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, 'rgba(6,182,212,0.15)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, CANVAS_H - 20, CANVAS_W, 20);

      const fruits = fruitsRef.current;
      const bombs = bombsRef.current;

      for (let i = fruits.length - 1; i >= 0; i--) {
        const f = fruits[i];
        f.update();
        if (f.offScreen && !f.sliced) {
          livesRef.current--;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            gameOverRef.current = true;
            setGameOver(true);
            setGameState('idle');
          }
          fruits.splice(i, 1);
          continue;
        }
        if (f.sliced) {
          fruits.splice(i, 1);
          continue;
        }
        f.draw(ctx);
      }

      for (let i = bombs.length - 1; i >= 0; i--) {
        const b = bombs[i];
        b.update();
        if (b.sliced || b.offScreen) {
          bombs.splice(i, 1);
          continue;
        }
        b.draw(ctx);
      }

      const now = Date.now();
      trailRef.current = trailRef.current.filter(p => now - p.time < 150);
      if (trailRef.current.length > 1) {
        for (let i = 1; i < trailRef.current.length; i++) {
          const alpha = i / trailRef.current.length;
          ctx.beginPath();
          ctx.moveTo(trailRef.current[i - 1].x, trailRef.current[i - 1].y);
          ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.8})`;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.strokeStyle = `rgba(124, 58, 237, ${alpha * 0.4})`;
          ctx.lineWidth = 8;
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${scoreRef.current}`, 12, 30);
      ctx.fillText(`❤️ ${livesRef.current}`, 12, 56);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, gameOver]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Fruit Ninja
        </h2>
        <div className="flex gap-3">
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
            <div className="text-xl font-bold text-cyan-400">{score}</div>
          </div>
          <div className="bg-dark-100 rounded-lg px-4 py-2 text-center border border-white/5">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Lives</div>
            <div className="text-xl font-bold text-red-400">{'❤️'.repeat(lives)}{'🖤'.repeat(LIVES - lives)}</div>
          </div>
        </div>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border border-white/5">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-auto cursor-crosshair touch-none"
          style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-red-400 mb-2">Game Over!</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
              {score}
            </div>
            <div className="text-gray-400 mb-4">points</div>
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
            <div className="text-2xl font-bold text-cyan-400 mb-4">Fruit Ninja</div>
            <button
              onClick={newGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-lg transition-all"
            >
              Start Game
            </button>
          </div>
        )}
      </div>

      {!gameOver && gameState === 'playing' && (
        <button
          onClick={newGame}
          className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all"
        >
          New Game
        </button>
      )}

      <div className="mt-3 text-center text-sm text-gray-400">
        Click & drag to <span className="text-cyan-400">slice</span> fruits | Avoid <span className="text-red-400">bombs</span> 💣
      </div>
    </div>
  );
}
