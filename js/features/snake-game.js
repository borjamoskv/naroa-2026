/**
 * Snake Game - Naroa 2026
 * @description Classic snake collecting artworks
 */
(function() {
  'use strict';

  const GRID = 20, CELL = 20;
  let state = { snake: [], dir: { x: 1, y: 0 }, food: null, score: 0, timer: null, artworks: [] };

  async function init() {
    const container = document.getElementById('snake-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.slice(0, 20);
    } catch (e) {}

    container.innerHTML = `
      <div class="snake-header">
        <span>Puntos: <strong id="snake-score">0</strong></span>
        <button class="game-btn" id="snake-start">▶ Jugar</button>
      </div>
      <canvas id="snake-canvas" width="${GRID*CELL}" height="${GRID*CELL}"></canvas>
      <div id="snake-ranking"></div>
    `;

    if (window.RankingSystem) {
      window.RankingSystem.renderLeaderboard('snake', 'snake-ranking');
    }

    document.getElementById('snake-start')?.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKey);
  }

  function startGame() {
    state.snake = [{ x: 10, y: 10 }];
    state.dir = { x: 1, y: 0 };
    state.score = 0;
    spawnFood();
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(gameLoop, 150);
    document.getElementById('snake-score').textContent = 0;
  }

  function spawnFood() {
    state.food = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
      art: state.artworks[Math.floor(Math.random() * state.artworks.length)]
    };
  }

  function handleKey(e) {
    const dirs = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }
    };
    if (dirs[e.key] && !(dirs[e.key].x === -state.dir.x && dirs[e.key].y === -state.dir.y)) {
      state.dir = dirs[e.key];
    }
  }

  function gameLoop() {
    const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
    
    // Collision check
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID ||
        state.snake.some(s => s.x === head.x && s.y === head.y)) {
      clearInterval(state.timer);
      if (window.RankingSystem) {
        window.RankingSystem.showSubmitModal('snake', state.score, () => {
          // Restart or show menu
          document.getElementById('snake-start').textContent = '🔄 Jugar de nuevo';
          window.RankingSystem.renderLeaderboard('snake', 'snake-ranking');
        });
      } else {
        alert(`Game Over - Puntos: ${state.score}`);
      }
      return;
    }

    state.snake.unshift(head);

    if (head.x === state.food.x && head.y === state.food.y) {
      state.score += 10;
      document.getElementById('snake-score').textContent = state.score;
      spawnFood();
    } else {
      state.snake.pop();
    }

    draw();
  }

  function draw() {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    // Grid sutil
    ctx.strokeStyle = 'rgba(204, 255, 0, 0.04)';
    for (let i = 0; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, GRID * CELL);
      ctx.moveTo(0, i * CELL); ctx.lineTo(GRID * CELL, i * CELL);
      ctx.stroke();
    }

    // Snake
    state.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#ccff00' : '#b3e600';
      ctx.shadowColor = 'rgba(204, 255, 0, 0.5)';
      ctx.shadowBlur = i === 0 ? 8 : 4;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      ctx.shadowBlur = 0;
    });

    // Food
    if (state.food) {
      ctx.fillStyle = '#ff003c';
      ctx.shadowColor = 'rgba(255, 0, 60, 0.6)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(state.food.x * CELL + CELL/2, state.food.y * CELL + CELL/2, CELL/2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText('🎨', state.food.x * CELL + 3, state.food.y * CELL + 14);
    }
  }

  window.SnakeGame = { init };
})();
