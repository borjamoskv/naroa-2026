/**
 * MICA VIVA: Retratos que Laten - Naroa 2026
 * @description Spectacular shader-based game where portrait eyes shimmer and follow viewer
 * Based on Naroa's mineral mica technique in pupils
 */
(function() {
  'use strict';

  let state = {
    canvas: null,
    ctx: null,
    artworks: [],
    currentArt: null,
    mouseX: 0.5,
    mouseY: 0.5,
    time: 0,
    breathing: 0,
    particlesMica: []
  };

  async function init() {
    const container = document.getElementById('mica-container');
    if (!container) return;

    await loadArtworks();
    createUI(container);
    startAnimationLoop();
  }

  async function loadArtworks() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.filter(a => a.id).slice(0, 10);
    } catch (e) {}
  }

  function createUI(container) {
    const art = state.artworks[Math.floor(Math.random() * state.artworks.length)];
    state.currentArt = art;

    container.innerHTML = `
      <div class="mica-experience">
        <div class="mica-portrait-frame">
          <canvas id="mica-canvas" class="mica-canvas"></canvas>
          <img src="images/artworks/${art?.id || 'default'}.webp" 
               alt="${art?.title || 'Retrato'}" 
               class="mica-base-img" 
               id="mica-img"
               crossorigin="anonymous">
          
          <!-- Eyes overlay with mica effect -->
          <div class="mica-eyes" id="mica-eyes">
            <div class="mica-eye mica-eye--left">
              <div class="mica-pupil" id="pupil-left">
                <div class="mica-shimmer"></div>
                <div class="mica-sparkles"></div>
              </div>
            </div>
            <div class="mica-eye mica-eye--right">
              <div class="mica-pupil" id="pupil-right">
                <div class="mica-shimmer"></div>
                <div class="mica-sparkles"></div>
              </div>
            </div>
          </div>
          
          <!-- Floating mica particles -->
          <div class="mica-particles" id="mica-particles"></div>
        </div>
        
        <div class="mica-info">
          <h3 class="mica-title">${art?.title || 'Retrato Viviente'}</h3>
          <p class="mica-desc">Los ojos te siguen... respiran contigo</p>
        </div>
        
        <div class="mica-controls">
          <button class="game-btn mica-btn" id="mica-breathe">🫁 Sincronizar respiración</button>
          <button class="game-btn mica-btn" id="mica-next">🔄 Siguiente retrato</button>
          <button class="game-btn mica-btn" id="mica-light">💡 Cambiar luz</button>
        </div>
      </div>
    `;

    setupCanvas();
    attachEvents(container);
    createMicaParticles();
  }

  function setupCanvas() {
    state.canvas = document.getElementById('mica-canvas');
    if (!state.canvas) return;
    
    state.ctx = state.canvas.getContext('2d');
    state.canvas.width = 400;
    state.canvas.height = 500;
  }

  function attachEvents(container) {
    // Track mouse for eye following
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      state.mouseX = (e.clientX - rect.left) / rect.width;
      state.mouseY = (e.clientY - rect.top) / rect.height;
      updateEyeDirection();
    });

    // Touch support
    container.addEventListener('touchmove', (e) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      state.mouseX = (touch.clientX - rect.left) / rect.width;
      state.mouseY = (touch.clientY - rect.top) / rect.height;
      updateEyeDirection();
    });

    // Buttons
    document.getElementById('mica-breathe')?.addEventListener('click', toggleBreathing);
    document.getElementById('mica-next')?.addEventListener('click', () => {
      createUI(container);
    });
    document.getElementById('mica-light')?.addEventListener('click', cycleLight);
  }

  function updateEyeDirection() {
    const pupils = document.querySelectorAll('.mica-pupil');
    const offsetX = (state.mouseX - 0.5) * 8; // Max 8px movement
    const offsetY = (state.mouseY - 0.5) * 6;

    pupils.forEach(pupil => {
      pupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  }

  function createMicaParticles() {
    const container = document.getElementById('mica-particles');
    if (!container) return;

    container.innerHTML = '';
    state.particlesMica = [];

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'mica-particle';
      
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = 2 + Math.random() * 4;
      const hue = Math.random() > 0.5 ? 75 + Math.random() * 20 : 350 + Math.random() * 20; // Fluor-green or Red
      const duration = 3 + Math.random() * 4;
      const delay = Math.random() * 3;

      particle.style.cssText = `
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, 
          hsla(${hue}, 80%, 70%, 0.9), 
          hsla(${hue}, 60%, 40%, 0));
        animation: mica-float ${duration}s ease-in-out ${delay}s infinite;
        box-shadow: 0 0 ${size * 2}px hsla(${hue}, 80%, 60%, 0.5);
      `;

      container.appendChild(particle);
      state.particlesMica.push({ el: particle, x, y });
    }
  }

  let breathingInterval = null;
  function toggleBreathing() {
    const btn = document.getElementById('mica-breathe');
    if (breathingInterval) {
      clearInterval(breathingInterval);
      breathingInterval = null;
      btn.textContent = '🫁 Sincronizar respiración';
      document.querySelector('.mica-portrait-frame')?.classList.remove('breathing');
    } else {
      btn.textContent = '⏸️ Pausar respiración';
      document.querySelector('.mica-portrait-frame')?.classList.add('breathing');
      
      // Breathing cycle: 4s inhale, 4s exhale
      breathingInterval = setInterval(() => {
        const frame = document.querySelector('.mica-portrait-frame');
        if (frame) {
          frame.classList.toggle('inhale');
        }
      }, 4000);
    }
  }

  let lightMode = 0;
  const lightModes = ['warm', 'cool', 'sunset', 'moonlight'];
  function cycleLight() {
    lightMode = (lightMode + 1) % lightModes.length;
    const frame = document.querySelector('.mica-portrait-frame');
    lightModes.forEach(mode => frame?.classList.remove(`light-${mode}`));
    frame?.classList.add(`light-${lightModes[lightMode]}`);
  }

  function startAnimationLoop() {
    function animate() {
      state.time += 0.016;
      
      // Shimmer effect
      const shimmers = document.querySelectorAll('.mica-shimmer');
      shimmers.forEach((shimmer, i) => {
        const phase = state.time * 2 + i * Math.PI;
        const intensity = 0.5 + Math.sin(phase) * 0.5;
        shimmer.style.opacity = intensity;
      });

      // Subtle eye "breathing" micro-movement
      if (!breathingInterval) {
        const pupils = document.querySelectorAll('.mica-pupil');
        const breathScale = 1 + Math.sin(state.time * 0.5) * 0.02;
        pupils.forEach(p => {
          p.style.scale = breathScale;
        });
      }

      requestAnimationFrame(animate);
    }
    animate();
  }

  function destroy() {
    if (breathingInterval) clearInterval(breathingInterval);
  }

  window.MicaGame = { init, destroy };
})();
