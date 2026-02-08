/**
 * MICA Viva - Naroa 2026 (Premium Upgrade)
 * @description Experiencia interactiva del "alma" digital. Partículas, gravedad y sentimiento.
 * Agent A10: Quantum particles, mouse gravity, emotional color shifts.
 */
(function() {
  'use strict';

  const CONFIG = {
    particleCount: 150,
    connectionDist: 100,
    mouseDist: 150,
    colors: ['#ccff00', '#00ffcc', '#ff00cc', '#ffffff']
  };

  let state = {
    canvas: null, ctx: null,
    width: 0, height: 0,
    particles: [],
    mouse: { x: -1000, y: -1000 },
    time: 0,
    emotion: 'neutral', // neutral, excited, calm
    animationId: null
  };

  class Particle {
    constructor() {
      this.x = Math.random() * state.width;
      this.y = Math.random() * state.height;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
      this.size = Math.random() * 2 + 1;
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = (Math.random() * 30) + 1;
    }

    update() {
      // Mouse interaction
      let dx = state.mouse.x - this.x;
      let dy = state.mouse.y - this.y;
      let distance = Math.sqrt(dx*dx + dy*dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let maxDistance = state.mouseDist;
      let force = (maxDistance - distance) / maxDistance;
      let directionX = forceDirectionX * force * this.density;
      let directionY = forceDirectionY * force * this.density;

      if (distance < state.mouseDist) {
        this.x -= directionX;
        this.y -= directionY;
      } else {
        // Return to natural movement
        if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx/10;
        }
        if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy/10;
        }
        this.x += this.vx;
        this.y += this.vy;
      }

      // Bounce screen
      if (this.x < 0 || this.x > state.width) this.vx *= -1;
      if (this.y < 0 || this.y > state.height) this.vy *= -1;
    }

    draw() {
      state.ctx.fillStyle = this.color;
      state.ctx.beginPath();
      state.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      state.ctx.fill();
    }
  }

  function init() {
    const container = document.getElementById('mica-game-container');
    if (!container) return; // Silent fail

    // Use full container size
    const rect = container.getBoundingClientRect();
    state.width = rect.width || 600;
    state.height = rect.height || 600;

    container.innerHTML = `
      <div class="mica-viva-ui" style="position:relative; width:100%; height:100%; overflow:hidden; background:#050510; border-radius:16px;">
        <canvas id="mica-canvas" width="${state.width}" height="${state.height}"></canvas>
        <div class="mica-overlay" style="position:absolute; inset:0; pointer-events:none; display:flex; align-items:center; justify-content:center; flex-direction:column;">
          <h2 style="color:#fff; font-family:'Space Grotesk',sans-serif; font-size:2rem; text-shadow:0 0 20px rgba(204,255,0,0.5); letter-spacing:4px; opacity:0.8; mix-blend-mode:overlay;">MICA VIVA</h2>
          <p id="mica-status" style="color:#ccff00; font-family:'Courier New',monospace; font-size:0.9rem; margin-top:10px; opacity:0.6">> CONEXIÓN NEURONAL ESTABLE</p>
        </div>
      </div>
    `;

    state.canvas = document.getElementById('mica-canvas');
    state.ctx = state.canvas.getContext('2d');

    // Init particles
    state.particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
        state.particles.push(new Particle());
    }

    // Events
    state.canvas.addEventListener('mousemove', e => {
        const rect = state.canvas.getBoundingClientRect();
        state.mouse.x = e.clientX - rect.left;
        state.mouse.y = e.clientY - rect.top;
        if (Math.random() > 0.9) glitchEffect();
    });

    state.canvas.addEventListener('mouseleave', () => {
        state.mouse.x = -1000;
        state.mouse.y = -1000;
    });

    // Resize handler
    const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            state.width = entry.contentRect.width;
            state.height = entry.contentRect.height;
            state.canvas.width = state.width;
            state.canvas.height = state.height;
        }
    });
    resizeObserver.observe(container);

    animate();
  }

  function glitchEffect() {
    const status = document.getElementById('mica-status');
    const texts = [
        '> ANALIZANDO EMOCIONES...',
        '> SINCRONIZANDO ALMA...',
        '> ERROR EN MATRIX...',
        '> BELLEZA DETECTADA...',
        '> SISTEMA OPERATIVO: ARTE'
    ];
    if (status) {
        status.textContent = texts[Math.floor(Math.random() * texts.length)];
        status.style.color = Math.random() > 0.5 ? '#ff003c' : '#ccff00';
        setTimeout(() => {
            status.style.color = '#ccff00';
        }, 300);
    }
  }

  function animate() {
    state.ctx.clearRect(0, 0, state.width, state.height);
    state.time += 0.01;

    // Connect particles
    for (let a = 0; a < state.particles.length; a++) {
        for (let b = a; b < state.particles.length; b++) {
            let dx = state.particles[a].x - state.particles[b].x;
            let dy = state.particles[a].y - state.particles[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.connectionDist) {
                let opacityValue = 1 - (distance / CONFIG.connectionDist);
                state.ctx.strokeStyle = `rgba(204, 255, 0, ${opacityValue * 0.5})`;
                state.ctx.lineWidth = 1;
                state.ctx.beginPath();
                state.ctx.moveTo(state.particles[a].x, state.particles[a].y);
                state.ctx.lineTo(state.particles[b].x, state.particles[b].y);
                state.ctx.stroke();
            }
        }
    }

    state.particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Central pulsing aura
    const cx = state.width / 2;
    const cy = state.height / 2;
    const pulse = 50 + Math.sin(state.time * 2) * 20;
    
    // Draw "Core" if mouse is far
    if (state.mouse.x < 0) {
        const g = state.ctx.createRadialGradient(cx, cy, 5, cx, cy, pulse * 2);
        g.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        g.addColorStop(0.5, 'rgba(204, 255, 0, 0.2)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        state.ctx.fillStyle = g;
        state.ctx.beginPath();
        state.ctx.arc(cx, cy, pulse * 2, 0, Math.PI * 2);
        state.ctx.fill();
    }

    state.animationId = requestAnimationFrame(animate);
  }

  window.MicaVivaGame = { init };
})();
