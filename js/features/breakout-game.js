/**
 * Breakout Game - Naroa 2026
 * @description Break artwork bricks with a ball
 */
(function() {
  'use strict';

  const W = 400, H = 500;
  let state = { ball: null, paddle: null, bricks: [], score: 0, timer: null, artworks: [] };

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
  }

  function startGame() {
    state.ball = { x: W/2, y: H - 50, dx: 3, dy: -3, r: 8 };
    state.paddle = { x: W/2 - 40, y: H - 20, w: 80, h: 12 };
    state.bricks = [];
    state.score = 0;

    const cols = 8, rows = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        state.bricks.push({
          x: c * 48 + 8, y: r * 30 + 40, w: 44, h: 26, alive: true,
          art: state.artworks[(r * cols + c) % state.artworks.length]
        });
      }
    }

    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(gameLoop, 16);
    document.getElementById('breakout-score').textContent = 0;
  }

  function gameLoop() {
    const { ball, paddle, bricks } = state;
    
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x <= ball.r || ball.x >= W - ball.r) ball.dx *= -1;
    if (ball.y <= ball.r) ball.dy *= -1;

    // Paddle collision
    if (ball.y + ball.r >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
      ball.dy = -Math.abs(ball.dy);
      ball.dx += (ball.x - paddle.x - paddle.w/2) * 0.1;
    }

    // Game over
    if (ball.y > H) {
      clearInterval(state.timer);
      if (window.RankingSystem) {
        window.RankingSystem.showSubmitModal('breakout', state.score, () => {
          window.RankingSystem.renderLeaderboard('breakout', 'breakout-ranking');
        });
      } else {
        alert(`Game Over - Puntos: ${state.score}`);
      }
      return;
    }

    // Brick collision
    bricks.forEach(b => {
      if (b.alive && ball.x >= b.x && ball.x <= b.x + b.w && ball.y >= b.y && ball.y <= b.y + b.h) {
        b.alive = false;
        ball.dy *= -1;
        state.score += 10;
        document.getElementById('breakout-score').textContent = state.score;
      }
    });

    // Win check
    if (bricks.every(b => !b.alive)) {
      clearInterval(state.timer);
      const finalScore = state.score + 1000; // Win bonus
      if (window.RankingSystem) {
        window.RankingSystem.showSubmitModal('breakout', finalScore, () => {
          window.RankingSystem.renderLeaderboard('breakout', 'breakout-ranking');
        });
      } else {
        alert(`🎉 ¡Victoria! Puntos: ${finalScore}`);
      }
    }

    draw();
  }

  function draw() {
    const canvas = document.getElementById('breakout-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);

    // Dot grid
    ctx.fillStyle = 'rgba(204, 255, 0, 0.03)';
    for (let gx = 0; gx < W; gx += 24) {
      for (let gy = 0; gy < H; gy += 24) {
        ctx.fillRect(gx, gy, 1, 1);
      }
    }

    // Bricks — alternating red/fluor rows
    state.bricks.forEach((b, i) => {
      if (!b.alive) return;
      const row = Math.floor(i / 8);
      ctx.fillStyle = row % 2 === 0 ? '#ff003c' : '#ccff00';
      ctx.shadowColor = row % 2 === 0 ? 'rgba(255,0,60,0.4)' : 'rgba(204,255,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    });

    // Paddle — fluor neon
    ctx.fillStyle = '#ccff00';
    ctx.shadowColor = 'rgba(204, 255, 0, 0.6)';
    ctx.shadowBlur = 10;
    ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h);
    ctx.shadowBlur = 0;

    // Ball — white with red glow
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 0, 60, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  window.BreakoutGame = { init };
})();
