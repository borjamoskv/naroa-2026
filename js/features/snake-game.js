/**
 * Snake Game - Naroa 2026
 * @description Rainbow gradient snake with neon food glow & death explosion
 * Agent A02: Premium visual upgrade
 */
(function() {
  'use strict';

  const GRID = 20, W = 400, H = 400;
  let state = {
    snake: [], dir: { x: 1, y: 0 }, food: null, score: 0, speed: 150,
    timer: null, artworks: [], particles: [], combo: 0, growing: false
  };

  async function init() {
    const container = document.getElementById('snake-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.slice(0, 15);
    } catch (e) {}

    container.innerHTML = `
      <div class="snake-header">
        <span>Puntos: <strong id="snake-score">0</strong></span>
        <span>🔥 <strong id="snake-combo" style="color:#d4af37">x0</strong></span>
        <button class="game-btn" id="snake-start">▶ Jugar</button>
      </div>
      <canvas id="snake-canvas" width="${W}" height="${H}"></canvas>
      <div id="snake-ranking"></div>
    `;

    if (window.RankingSystem) {
      window.RankingSystem.renderLeaderboard('snake', 'snake-ranking');
    }

    document.getElementById('snake-start')?.addEventListener('click', startGame);
    document.addEventListener('keydown', e => {
      const dirs = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }
      };
      if (dirs[e.key] && (dirs[e.key].x !== -state.dir.x || dirs[e.key].y !== -state.dir.y)) {
        state.dir = dirs[e.key];
      }
    });

    // Touch swipe support
    let touchStart = null;
    const canvas = document.getElementById('snake-canvas');
    canvas?.addEventListener('touchstart', e => {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas?.addEventListener('touchend', e => {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        state.dir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        state.dir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }
    }, { passive: true });
  }

  function startGame() {
    const mid = Math.floor((W / GRID) / 2);
    state.snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
    state.dir = { x: 1, y: 0 };
    state.score = 0;
    state.combo = 0;
    state.speed = 150;
    state.particles = [];
    state.growing = false;
    spawnFood();

    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(gameLoop, state.speed);
    document.getElementById('snake-score').textContent = 0;
    document.getElementById('snake-combo').textContent = 'x0';
  }

  function spawnFood() {
    const cols = W / GRID, rows = H / GRID;
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (state.snake.some(s => s.x === pos.x && s.y === pos.y));
    state.food = pos;
  }

  function spawnParticles(x, y, hue, count = 10) {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x: x * GRID + GRID/2, y: y * GRID + GRID/2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1, hue, size: 2 + Math.random() * 4
      });
    }
  }

  function gameLoop() {
    const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
    const cols = W / GRID, rows = H / GRID;

    // Wall/self collision
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
        state.snake.some(s => s.x === head.x && s.y === head.y)) {
      clearInterval(state.timer);
      // Death explosion
      state.snake.forEach(s => spawnParticles(s.x, s.y, 0, 3));
      if (window.GameEffects) GameEffects.cameraShake(document.getElementById('snake-canvas'), 10);
      drawDeath();
      if (window.RankingSystem) {
        window.RankingSystem.showSubmitModal('snake', state.score, () => {
          window.RankingSystem.renderLeaderboard('snake', 'snake-ranking');
        });
      } else {
        alert(`Game Over - Puntos: ${state.score}`);
      }
      return;
    }

    state.snake.unshift(head);

    // Eat food
    if (head.x === state.food.x && head.y === state.food.y) {
      state.score += 10;
      state.combo++;
      document.getElementById('snake-score').textContent = state.score;
      document.getElementById('snake-combo').textContent = `x${state.combo}`;
      spawnParticles(head.x, head.y, 120, 12);
      if (window.GameEffects) {
        GameEffects.scorePopAnimation(document.getElementById('snake-score'), '+10');
        GameEffects.hapticFeedback();
      }
      spawnFood();
      // Speed up gradually
      if (state.speed > 60) {
        state.speed -= 2;
        clearInterval(state.timer);
        state.timer = setInterval(gameLoop, state.speed);
      }
    } else {
      state.snake.pop();
    }

    // Update particles
    state.particles = state.particles.filter(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.2; p.life -= 0.04;
      return p.life > 0;
    });

    draw();
  }

  function draw() {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Background
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.7);
    grad.addColorStop(0, '#0a0a18');
    grad.addColorStop(1, '#050510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.03)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Food with pulse glow
    const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.3;
    ctx.fillStyle = `rgba(255, 0, 60, ${pulse})`;
    ctx.shadowColor = 'rgba(255, 0, 60, 0.8)';
    ctx.shadowBlur = 15 * pulse;
    ctx.beginPath();
    ctx.arc(state.food.x * GRID + GRID/2, state.food.y * GRID + GRID/2, GRID/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    // Food inner glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(state.food.x * GRID + GRID/2 - 2, state.food.y * GRID + GRID/2 - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake with rainbow gradient
    state.snake.forEach((seg, i) => {
      const hue = (i * 15 + Date.now() / 20) % 360;
      const alpha = 1 - (i / state.snake.length) * 0.4;
      ctx.fillStyle = `hsla(${hue}, 100%, 55%, ${alpha})`;
      ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.5)`;
      ctx.shadowBlur = i === 0 ? 12 : 6;
      ctx.beginPath();
      ctx.roundRect(seg.x * GRID + 1, seg.y * GRID + 1, GRID - 2, GRID - 2, i === 0 ? 5 : 3);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Head eyes
    const head = state.snake[0];
    ctx.fillStyle = '#fff';
    const ex1 = head.x * GRID + GRID/2 + state.dir.x * 3 - 3;
    const ey1 = head.y * GRID + GRID/2 + state.dir.y * 3 - 2;
    const ex2 = head.x * GRID + GRID/2 + state.dir.x * 3 + 3;
    const ey2 = head.y * GRID + GRID/2 + state.dir.y * 3 + 2;
    ctx.beginPath(); ctx.arc(ex1, ey1, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2, ey2, 2, 0, Math.PI * 2); ctx.fill();

    // Particles
    state.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
      ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Combo display
    if (state.combo >= 5) {
      ctx.fillStyle = `hsla(80, 100%, 60%, ${0.6 + Math.sin(Date.now() / 150) * 0.3})`;
      ctx.font = 'bold 16px Satoshi, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 x${state.combo}`, W/2, 25);
    }
  }

  function drawDeath() {
    // Animate remaining particles
    let frame = 0;
    function deathAnim() {
      if (frame > 30) return;
      frame++;
      state.particles = state.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.03;
        return p.life > 0;
      });
      draw();
      requestAnimationFrame(deathAnim);
    }
    deathAnim();
  }

  window.SnakeGame = { init };
})();
