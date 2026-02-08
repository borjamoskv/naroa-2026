/**
 * Target Practice - Naroa 2026
 * Agent A22: Target pop with ring pulse, hit splatter, miss X-mark
 */
(function() {
  'use strict';

  let state = { targets: [], score: 0, misses: 0, combo: 0, timeLeft: 30, timer: null, running: false, spawnTimer: null };

  function init() {
    const container = document.getElementById('target-container');
    if (!container) return;

    container.innerHTML = `
      <div class="target-ui">
        <div class="target-stats">
          <span>⏱️ <strong id="target-time">30</strong>s</span>
          <span>🎯 <strong id="target-score" style="color:#d4af37">0</strong></span>
          <span>🔥 <strong id="target-combo">x0</strong></span>
        </div>
        <div id="target-field" style="position:relative;width:100%;height:400px;background:radial-gradient(circle,#0d0d1a,#050510);border-radius:12px;overflow:hidden;cursor:crosshair"></div>
        <button class="game-btn" id="target-start">🎯 Empezar</button>
      </div>
    `;

    document.getElementById('target-start').addEventListener('click', startGame);
    document.getElementById('target-field').addEventListener('click', e => {
      if (!state.running) return;
      // Check if clicked on empty space (miss)
      if (e.target.id === 'target-field') {
        state.misses++;
        state.combo = 0;
        document.getElementById('target-combo').textContent = 'x0';
        // Show X mark
        const x = document.createElement('div');
        x.textContent = '✕';
        x.style.cssText = `position:absolute;left:${e.offsetX-10}px;top:${e.offsetY-10}px;color:#ff003c;font-size:20px;pointer-events:none;animation:fadeOut 0.5s forwards`;
        document.getElementById('target-field').appendChild(x);
        setTimeout(() => x.remove(), 500);
      }
    });
  }

  function startGame() {
    state.score = 0;
    state.misses = 0;
    state.combo = 0;
    state.timeLeft = 30;
    state.running = true;
    state.targets = [];
    document.getElementById('target-score').textContent = '0';
    document.getElementById('target-combo').textContent = 'x0';
    document.getElementById('target-start').style.display = 'none';

    // Clear field
    const field = document.getElementById('target-field');
    field.querySelectorAll('.target-dot').forEach(d => d.remove());

    state.timer = setInterval(() => {
      state.timeLeft--;
      document.getElementById('target-time').textContent = state.timeLeft;
      if (state.timeLeft <= 0) endGame();
    }, 1000);

    spawnTarget();
  }

  function spawnTarget() {
    if (!state.running) return;
    const field = document.getElementById('target-field');
    const rect = field.getBoundingClientRect();
    const size = 30 + Math.random() * 30;
    const x = Math.random() * (rect.width - size);
    const y = Math.random() * (rect.height - size);
    const hue = Math.random() * 360;
    const lifetime = 2000 + Math.random() * 1500; // 2-3.5s

    const dot = document.createElement('div');
    dot.className = 'target-dot';
    dot.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle,hsl(${hue},80%,60%),hsl(${hue},80%,30%));box-shadow:0 0 15px hsla(${hue},80%,50%,0.6);cursor:pointer;transition:transform 0.1s;animation:targetPop 0.3s ease-out`;

    // Ring
    const ring = document.createElement('div');
    ring.style.cssText = `position:absolute;inset:-5px;border-radius:50%;border:2px solid hsla(${hue},80%,60%,0.5);animation:ringPulse 1s infinite`;
    dot.appendChild(ring);

    dot.addEventListener('click', e => {
      e.stopPropagation();
      state.combo++;
      const points = Math.round((60 - size) * (1 + state.combo * 0.2)); // Smaller = more points
      state.score += points;
      document.getElementById('target-score').textContent = state.score;
      document.getElementById('target-combo').textContent = `x${state.combo}`;

      // Hit splatter
      dot.style.transform = 'scale(1.5)';
      dot.style.opacity = '0';
      setTimeout(() => dot.remove(), 200);

      if (window.GameEffects) {
        GameEffects.scorePopAnimation(document.getElementById('target-score'), `+${points}`);
        GameEffects.hapticFeedback();
      }
    });

    field.appendChild(dot);

    // Auto-remove after lifetime
    setTimeout(() => {
      if (dot.parentNode) {
        dot.remove();
        if (state.running) {
          state.misses++;
          state.combo = 0;
          document.getElementById('target-combo').textContent = 'x0';
        }
      }
    }, lifetime);

    // Schedule next target
    const delay = Math.max(300, 800 - state.score * 2); // Gets faster
    state.spawnTimer = setTimeout(spawnTarget, delay);
  }

  function endGame() {
    state.running = false;
    clearInterval(state.timer);
    clearTimeout(state.spawnTimer);
    document.getElementById('target-start').style.display = 'inline-block';

    if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('target-field'));
    alert(`🎯 Score: ${state.score} | Misses: ${state.misses}`);
  }

  window.TargetGame = { init };
})();
