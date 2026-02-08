/**
 * Breakout Game - Naroa 2026
 * @description Break artwork bricks with a neon ball — premium visual upgrade
 * Agent A01: Neon ball trail, brick shatter particles, paddle glow pulse
 */
(function() {
  'use strict';

  const W = 400, H = 500;
  let state = {
    ball: null, paddle: null, bricks: [], score: 0, combo: 0,
    timer: null, artworks: [], particles: [], trails: [], shakeFrames: 0
  };

  async function init() {
    const container = document.getElementById('breakout-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.slice(0, 24);
    } catch (e) {}

    container.innerHTML = `
      <div class="breakout-header">
        <span>Puntos: <strong id="breakout-score">0</strong></span>
        <span>Combo: <strong id="breakout-combo" style="color:#d4af37">x0</strong></span>
        <button class="game-btn" id="breakout-start">▶ Jugar</button>
      </div>
      <canvas id="breakout-canvas" width="${W}" height="${H}"></canvas>
      <div id="breakout-ranking"></div>
    `;

    if (window.RankingSystem) {
      window.RankingSystem.renderLeaderboard('breakout', 'breakout-ranking');
    }

    document.getElementById('breakout-start')?.addEventListener('click', startGame);
    document.addEventListener('mousemove', e => {
      const canvas = document.getElementById('breakout-canvas');
      if (canvas && state.paddle) {
        const rect = canvas.getBoundingClientRect();
        state.paddle.x = Math.max(0, Math.min(W - 80, e.clientX - rect.left - 40));
      }
    });
    // Touch support
    document.addEventListener('touchmove', e => {
      const canvas = document.getElementById('breakout-canvas');
      if (canvas && state.paddle) {
        const rect = canvas.getBoundingClientRect();
        state.paddle.x = Math.max(0, Math.min(W - 80, e.touches[0].clientX - rect.left - 40));
      }
    }, { passive: true });
  }

  function startGame() {
    state.ball = { x: W/2, y: H - 50, dx: 3, dy: -3, r: 8 };
    state.paddle = { x: W/2 - 40, y: H - 20, w: 80, h: 12 };
    state.bricks = [];
    state.score = 0;
    state.combo = 0;
    state.particles = [];
    state.trails = [];
    state.shakeFrames = 0;

    const cols = 8, rows = 5;
    const hues = [0, 45, 90, 270, 330]; // red, orange, green, purple, pink
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        state.bricks.push({
          x: c * 48 + 8, y: r * 28 + 45, w: 44, h: 24, alive: true,
          hue: hues[r], hp: r === 0 ? 2 : 1,
          art: state.artworks[(r * cols + c) % state.artworks.length]
        });
      }
    }

    if (state.timer) cancelAnimationFrame(state.timer);
    document.getElementById('breakout-score').textContent = 0;
    document.getElementById('breakout-combo').textContent = 'x0';
    gameLoop();
  }

  function spawnParticles(x, y, hue, count = 8) {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        hue,
        size: 2 + Math.random() * 3
      });
    }
  }

  function gameLoop() {
    const { ball, paddle, bricks } = state;

    // Ball trail
    state.trails.push({ x: ball.x, y: ball.y, life: 1 });
    if (state.trails.length > 12) state.trails.shift();

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x <= ball.r || ball.x >= W - ball.r) ball.dx *= -1;
    if (ball.y <= ball.r) ball.dy *= -1;

    // Paddle collision
    if (ball.y + ball.r >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
      ball.dy = -Math.abs(ball.dy);
      ball.dx += (ball.x - paddle.x - paddle.w/2) * 0.1;
      spawnParticles(ball.x, paddle.y, 80, 4);
    }

    // Game over
    if (ball.y > H) {
      if (window.RankingSystem) {
        window.RankingSystem.showSubmitModal('breakout', state.score, () => {
          window.RankingSystem.renderLeaderboard('breakout', 'breakout-ranking');
        });
      } else {
        alert(`Game Over - Puntos: ${state.score}`);
      }
      if (window.GameEffects) GameEffects.cameraShake(document.getElementById('breakout-canvas'), 8);
      return;
    }

    // Brick collision
    let hitThisFrame = false;
    bricks.forEach(b => {
      if (b.alive && ball.x >= b.x && ball.x <= b.x + b.w && ball.y >= b.y && ball.y <= b.y + b.h) {
        b.hp--;
        if (b.hp <= 0) {
          b.alive = false;
          spawnParticles(b.x + b.w/2, b.y + b.h/2, b.hue, 12);
          state.shakeFrames = 4;
          hitThisFrame = true;
        }
        ball.dy *= -1;
        state.score += 10 * (1 + Math.floor(state.combo / 3));
        state.combo++;
        document.getElementById('breakout-score').textContent = state.score;
        document.getElementById('breakout-combo').textContent = `x${state.combo}`;

        if (window.GameEffects) {
          GameEffects.scorePopAnimation(document.getElementById('breakout-score'), `+${10 * (1 + Math.floor(state.combo / 3))}`);
        }
      }
    });

    if (!hitThisFrame && state.combo > 0) {
      // Reset combo if ball hits paddle without hitting bricks
    }

    // Update particles
    state.particles = state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= 0.03;
      return p.life > 0;
    });

    // Trail decay
    state.trails.forEach(t => t.life -= 0.08);
    state.trails = state.trails.filter(t => t.life > 0);

    // Shake decay
    if (state.shakeFrames > 0) state.shakeFrames--;

    // Win check
    if (bricks.every(b => !b.alive)) {
      const finalScore = state.score + 1000;
      if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('breakout-canvas'));
      if (window.RankingSystem) {
        window.RankingSystem.showSubmitModal('breakout', finalScore, () => {
          window.RankingSystem.renderLeaderboard('breakout', 'breakout-ranking');
        });
      } else {
        alert(`🎉 ¡Victoria! Puntos: ${finalScore}`);
      }
      return;
    }

    draw();
    state.timer = requestAnimationFrame(gameLoop);
  }

  function draw() {
    const canvas = document.getElementById('breakout-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Shake offset
    const sx = state.shakeFrames > 0 ? (Math.random() - 0.5) * 4 : 0;
    const sy = state.shakeFrames > 0 ? (Math.random() - 0.5) * 4 : 0;
    ctx.save();
    ctx.translate(sx, sy);

    // Background gradient
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
    grad.addColorStop(0, '#0d0d1a');
    grad.addColorStop(1, '#050510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Dot grid
    ctx.fillStyle = 'rgba(212, 175, 55, 0.02)';
    for (let gx = 0; gx < W; gx += 20) {
      for (let gy = 0; gy < H; gy += 20) {
        ctx.fillRect(gx, gy, 1, 1);
      }
    }

    // Ball trail
    state.trails.forEach((t, i) => {
      ctx.globalAlpha = t.life * 0.4;
      ctx.fillStyle = '#ff003c';
      ctx.beginPath();
      ctx.arc(t.x, t.y, state.ball.r * t.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Bricks with neon glow
    state.bricks.forEach(b => {
      if (!b.alive) return;
      const color = `hsl(${b.hue}, 100%, ${b.hp > 1 ? '65%' : '55%'})`;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = b.hp > 1 ? 12 : 8;
      // Rounded brick
      const r = 3;
      ctx.beginPath();
      ctx.moveTo(b.x + r, b.y);
      ctx.lineTo(b.x + b.w - r, b.y);
      ctx.quadraticCurveTo(b.x + b.w, b.y, b.x + b.w, b.y + r);
      ctx.lineTo(b.x + b.w, b.y + b.h - r);
      ctx.quadraticCurveTo(b.x + b.w, b.y + b.h, b.x + b.w - r, b.y + b.h);
      ctx.lineTo(b.x + r, b.y + b.h);
      ctx.quadraticCurveTo(b.x, b.y + b.h, b.x, b.y + b.h - r);
      ctx.lineTo(b.x, b.y + r);
      ctx.quadraticCurveTo(b.x, b.y, b.x + r, b.y);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Inner shine
      ctx.strokeStyle = `hsla(${b.hue}, 100%, 80%, 0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Particles
    state.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = `hsl(${p.hue}, 100%, 70%)`;
      ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Paddle — fluor neon with glow
    const paddleGrad = ctx.createLinearGradient(state.paddle.x, 0, state.paddle.x + state.paddle.w, 0);
    paddleGrad.addColorStop(0, '#d4af37');
    paddleGrad.addColorStop(0.5, '#eeff66');
    paddleGrad.addColorStop(1, '#d4af37');
    ctx.fillStyle = paddleGrad;
    ctx.shadowColor = 'rgba(212, 175, 55, 0.7)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball with glow
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 0, 60, 0.9)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
    ctx.fill();
    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(state.ball.x - 2, state.ball.y - 2, state.ball.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Combo display
    if (state.combo >= 3) {
      ctx.fillStyle = `hsla(80, 100%, 60%, ${0.5 + Math.sin(Date.now() / 200) * 0.3})`;
      ctx.font = 'bold 18px Satoshi, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 COMBO x${state.combo}`, W/2, H - 40);
    }

    ctx.restore();
  }

  window.BreakoutGame = { init };
})();
