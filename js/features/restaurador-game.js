/**
 * El Restaurador Desastroso - Naroa 2026
 * @description Arcade game: "restore" portraits with clumsy tools in 15 seconds
 * Inspired by the Ecce Homo meme - create gloriously bad art
 */
(function() {
  'use strict';

  const CONFIG = {
    GAME_TIME: 15, // seconds
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 500
  };

  const TOOLS = [
    { id: 'brush', name: 'Brocha Gorda', emoji: '🖌️', size: 30, opacity: 0.8 },
    { id: 'spray', name: 'Spray Caótico', emoji: '🎨', size: 15, opacity: 0.4 },
    { id: 'pencil', name: 'Lápiz Tembloroso', emoji: '✏️', size: 8, opacity: 0.9 },
    { id: 'patch', name: 'Parche Misterioso', emoji: '🩹', size: 40, opacity: 1 }
  ];

  const COLORS = [
    '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', 
    '#4dabf7', '#9775fa', '#f783ac', '#495057',
    '#ffffff', '#1a1a1a', '#8b4513', '#b8860b'
  ];

  const PATCHES = ['👁️', '👄', '👃', '👂', '🦷', '😬', '🤡', '💀', '🎭', '⭐'];

  let state = {
    artworks: [],
    currentArtwork: null,
    canvas: null,
    ctx: null,
    baseImage: null,
    selectedTool: TOOLS[0],
    selectedColor: COLORS[0],
    timeLeft: CONFIG.GAME_TIME,
    timerInterval: null,
    isDrawing: false,
    isGameOver: false,
    lastX: 0,
    lastY: 0
  };

  async function init() {
    const container = document.getElementById('restaurador-container');
    if (!container) return;

    await loadArtworks();
    createUI(container);
    startGame();
  }

  async function loadArtworks() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      // Filter only portraits/faces for best effect
      state.artworks = data.artworks
        .filter(a => a.id && !a.id.includes('abstract'))
        .map(a => a.id);
    } catch (e) {
      // Fallback to known good portraits
      state.artworks = [
        'audrey-hepburn', 'james-dean', 'geisha', 'marilyn-rocks-hq-5',
        'baroque-farrokh', 'celia-cruz-asucar', 'la-pensadora', 'el-gordo'
      ];
    }
  }

  function createUI(container) {
    state.currentArtwork = state.artworks[Math.floor(Math.random() * state.artworks.length)];
    state.isGameOver = false;
    state.timeLeft = CONFIG.GAME_TIME;

    container.innerHTML = `
      <div class="restaurador-game">
        <header class="restaurador-header">
          <h2 class="restaurador-title">🎨 El Restaurador Desastroso</h2>
          <p class="restaurador-subtitle">¡Tienes 15 segundos para "restaurar" esta obra maestra!</p>
        </header>

        <div class="restaurador-timer">
          <div class="timer-bar" id="timer-bar"></div>
          <span class="timer-text" id="timer-text">${CONFIG.GAME_TIME}s</span>
        </div>

        <div class="restaurador-workspace">
          <div class="canvas-container">
            <canvas id="restaurador-canvas" width="${CONFIG.CANVAS_WIDTH}" height="${CONFIG.CANVAS_HEIGHT}"></canvas>
          </div>
        </div>

        <div class="restaurador-palette">
          <div class="palette-section tools-section">
            <h4>Herramientas</h4>
            <div class="tool-grid">
              ${TOOLS.map((tool, i) => `
                <button class="tool-btn ${i === 0 ? 'active' : ''}" data-tool="${tool.id}" title="${tool.name}">
                  <span class="tool-emoji">${tool.emoji}</span>
                  <span class="tool-name">${tool.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="palette-section colors-section">
            <h4>Colores</h4>
            <div class="color-grid">
              ${COLORS.map((color, i) => `
                <button class="color-btn ${i === 0 ? 'active' : ''}" data-color="${color}" style="background: ${color}"></button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="restaurador-result" id="result-modal" style="display: none;">
          <div class="result-content">
            <h3 class="result-title">⏰ ¡TIEMPO!</h3>
            <p class="result-subtitle">Tu "restauración" está completa</p>
            <div class="result-preview" id="result-preview"></div>
            <div class="result-actions">
              <button class="action-btn action-download" id="btn-download">
                💾 Descargar mi crimen
              </button>
              <button class="action-btn action-mint" id="btn-mint">
                🪙 Mint Your Fail (Gratis)
              </button>
              <button class="action-btn action-share" id="btn-share">
                🐦 Compartir en X
              </button>
              <button class="action-btn action-retry" id="btn-retry">
                🔄 Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    initCanvas();
    attachEvents(container);
  }

  function initCanvas() {
    state.canvas = document.getElementById('restaurador-canvas');
    state.ctx = state.canvas.getContext('2d');

    // Load base image
    state.baseImage = new Image();
    state.baseImage.crossOrigin = 'anonymous';
    state.baseImage.onload = () => {
      drawBaseImage();
    };
    state.baseImage.src = `images/artworks/${state.currentArtwork}.webp`;
  }

  function drawBaseImage() {
    const { canvas, ctx, baseImage } = state;
    
    // Calculate scaling to fit canvas while maintaining aspect ratio
    const scale = Math.min(canvas.width / baseImage.width, canvas.height / baseImage.height);
    const x = (canvas.width - baseImage.width * scale) / 2;
    const y = (canvas.height - baseImage.height * scale) / 2;
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, x, y, baseImage.width * scale, baseImage.height * scale);
  }

  function attachEvents(container) {
    const canvas = state.canvas;

    // Tool selection
    container.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedTool = TOOLS.find(t => t.id === btn.dataset.tool);
        if (navigator.vibrate) navigator.vibrate(15);
      });
    });

    // Color selection
    container.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedColor = btn.dataset.color;
        if (navigator.vibrate) navigator.vibrate(15);
      });
    });

    // Canvas drawing - Mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Canvas drawing - Touch
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // Result actions
    document.getElementById('btn-download')?.addEventListener('click', downloadImage);
    document.getElementById('btn-share')?.addEventListener('click', shareToTwitter);
    document.getElementById('btn-retry')?.addEventListener('click', () => init());
    document.getElementById('btn-mint')?.addEventListener('click', () => {
      if (window.RestauradorWeb3) {
        window.RestauradorWeb3.mintNFT(state.canvas.toDataURL('image/png'));
      } else {
        alert('Web3 no disponible. Descarga tu imagen en su lugar.');
        downloadImage();
      }
    });
  }

  function getCanvasCoords(e) {
    const rect = state.canvas.getBoundingClientRect();
    const scaleX = state.canvas.width / rect.width;
    const scaleY = state.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const coords = getCanvasCoords(touch);
    state.isDrawing = true;
    state.lastX = coords.x;
    state.lastY = coords.y;
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (!state.isDrawing || state.isGameOver) return;
    const touch = e.touches[0];
    const coords = getCanvasCoords(touch);
    performDraw(coords.x, coords.y);
    state.lastX = coords.x;
    state.lastY = coords.y;
  }

  function startDrawing(e) {
    if (state.isGameOver) return;
    state.isDrawing = true;
    const coords = getCanvasCoords(e);
    state.lastX = coords.x;
    state.lastY = coords.y;
  }

  function draw(e) {
    if (!state.isDrawing || state.isGameOver) return;
    const coords = getCanvasCoords(e);
    performDraw(coords.x, coords.y);
    state.lastX = coords.x;
    state.lastY = coords.y;
  }

  function performDraw(x, y) {
    const { ctx, selectedTool, selectedColor, lastX, lastY } = state;

    ctx.globalAlpha = selectedTool.opacity;

    switch (selectedTool.id) {
      case 'brush':
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = selectedTool.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        break;

      case 'spray':
        for (let i = 0; i < 20; i++) {
          const offsetX = (Math.random() - 0.5) * selectedTool.size * 2;
          const offsetY = (Math.random() - 0.5) * selectedTool.size * 2;
          ctx.fillStyle = selectedColor;
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'pencil':
        // Jittery line
        const jitterX = (Math.random() - 0.5) * 4;
        const jitterY = (Math.random() - 0.5) * 4;
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = selectedTool.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX + jitterX, lastY + jitterY);
        ctx.lineTo(x + jitterX, y + jitterY);
        ctx.stroke();
        break;

      case 'patch':
        // Draw random emoji patch
        const patch = PATCHES[Math.floor(Math.random() * PATCHES.length)];
        ctx.font = `${selectedTool.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(patch, x, y);
        break;
    }

    ctx.globalAlpha = 1;
  }

  function stopDrawing() {
    state.isDrawing = false;
  }

  function startGame() {
    state.timeLeft = CONFIG.GAME_TIME;
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
      state.timeLeft--;
      updateTimerDisplay();

      if (state.timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    
    if (timerBar) {
      const percent = (state.timeLeft / CONFIG.GAME_TIME) * 100;
      timerBar.style.width = `${percent}%`;
      
      // Color transition: green → yellow → red
      if (percent > 50) {
        timerBar.style.background = 'linear-gradient(90deg, #69db7c, #ffd43b)';
      } else if (percent > 25) {
        timerBar.style.background = 'linear-gradient(90deg, #ffd43b, #ff6b6b)';
      } else {
        timerBar.style.background = '#ff6b6b';
        timerBar.classList.add('timer-critical');
      }
    }
    
    if (timerText) {
      timerText.textContent = `${state.timeLeft}s`;
    }
  }

  function endGame() {
    clearInterval(state.timerInterval);
    state.isGameOver = true;

    // Show result modal
    const modal = document.getElementById('result-modal');
    const preview = document.getElementById('result-preview');
    
    if (modal && preview) {
      // Create preview image
      const img = document.createElement('img');
      img.src = state.canvas.toDataURL('image/png');
      img.alt = 'Tu obra maestra desastrosa';
      preview.innerHTML = '';
      preview.appendChild(img);
      
      modal.style.display = 'flex';
      modal.classList.add('modal-enter');
      
      // Vibrate on mobile
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }

  function downloadImage() {
    const link = document.createElement('a');
    link.download = `restauracion-desastrosa-${Date.now()}.png`;
    link.href = state.canvas.toDataURL('image/png');
    link.click();
  }

  function shareToTwitter() {
    const text = encodeURIComponent(
      `🎨💀 Acabo de DESTRUIR una obra de @NaroaGutierrezG en "El Restaurador Desastroso"\n\n` +
      `¿Puedes hacerlo peor? 👉 naroa.online/#/restaurador\n\n` +
      `#NaroaArt #RestauradorDesastroso #MintYourFail`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }

  // Cleanup on route change
  function cleanup() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
  }

  window.RestauradorGame = { init, cleanup };
})();
