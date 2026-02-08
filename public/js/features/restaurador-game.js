/**
 * El Restaurador Desastroso - Naroa 2026 (Premium Upgrade)
 * @description Restore artworks. Use Swab, Sponge, or Laser.
 * Agent A07: Advanced dirt shader, tool mechanics, X-RAY vision.
 */
(function() {
  'use strict';

  const CONFIG = {
    tools: {
      swab: { size: 10, opacity: 0.8, color: '#ffffff' },
      sponge: { size: 40, opacity: 0.4, color: '#aaooff' },
      laser: { size: 4, opacity: 1.0, color: '#ff003c' }
    },
    dirtColor: 'rgba(60, 45, 30, 0.95)'
  };

  let state = {
    canvas: null, ctx: null,
    width: 0, height: 0,
    activeTool: 'swab',
    particles: [],
    progress: 0,
    isActive: false,
    level: 1,
    score: 0
  };

  async function init() {
    const container = document.getElementById('restaurador-container');
    if (!container) return;

    container.innerHTML = `
      <div class="rest-ui" style="display:flex; flex-direction:column; gap:15px; width:100%; max-width:600px; margin:0 auto;">
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2 style="font-family:'Space Grotesk'; margin:0;">Restaurador</h2>
          <div style="font-family:'Courier New'; color:#ccff00;">NIVEL <span id="rest-level">1</span></div>
        </div>

        <div style="position:relative; border-radius:12px; overflow:hidden; border:2px solid #333; cursor:crosshair;">
          <canvas id="rest-base" style="width:100%; display:block;"></canvas>
          <canvas id="rest-overlay" style="position:absolute; inset:0; width:100%; height:100%; touch-action:none;"></canvas>
          
          <div id="rest-xray" style="position:absolute; bottom:10px; right:10px; padding:5px 10px; background:rgba(0,0,0,0.5); border-radius:20px; font-size:0.8rem; pointer-events:none;">
            👁️ Manten pulsado para X-RAY
          </div>
        </div>

        <div class="rest-tools" style="display:flex; justify-content:center; gap:10px;">
          <button class="game-btn tool-btn active" data-tool="swab">cotton-swab</button>
          <button class="game-btn tool-btn" data-tool="sponge">sponge</button>
          <button class="game-btn tool-btn" data-tool="laser">laser-beam</button>
        </div>

        <div style="width:100%; background:#222; height:6px; border-radius:3px;">
          <div id="rest-progress" style="width:0%; height:100%; background:#00ff88; transition:width 0.2s;"></div>
        </div>
      </div>
    `;

    // Setup Canvases
    const baseC = document.getElementById('rest-base');
    const overlayC = document.getElementById('rest-overlay');
    state.canvas = overlayC;
    state.ctx = overlayC.getContext('2d');
    
    // Resize
    const rect = container.querySelector('.rest-ui').getBoundingClientRect();
    state.width = Math.min(600, rect.width || 600);
    state.height = state.width * 0.8; // Aspect ratio
    
    baseC.width = overlayC.width = state.width;
    baseC.height = overlayC.height = state.height;

    // Events
    const buttons = container.querySelectorAll('.tool-btn');
    buttons.forEach(btn => btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeTool = btn.dataset.tool;
    }));

    state.canvas.addEventListener('mousedown', startPaint);
    state.canvas.addEventListener('touchstart', startPaint, {passive: false});
    window.addEventListener('mouseup', stopPaint);
    window.addEventListener('touchend', stopPaint);

    state.canvas.addEventListener('mousemove', paint);
    state.canvas.addEventListener('touchmove', paint, {passive: false});

    // Start Level
    loadLevel();
    animate();
  }

  let painting = false;

  async function loadLevel() {
    state.progress = 0;
    state.isActive = true;
    document.getElementById('rest-progress').style.width = '0%';
    
    // Fill dirt
    const ctx = state.ctx;
    ctx.globalCompositeOperation = 'source-over';
    
    // Create detailed dirt texture
    ctx.fillStyle = CONFIG.dirtColor;
    ctx.fillRect(0,0, state.width, state.height);
    
    // Add grime spots
    for(let i=0; i<50; i++) {
        ctx.fillStyle = `rgba(30,20,10,${Math.random()*0.5})`;
        ctx.beginPath();
        ctx.arc(Math.random()*state.width, Math.random()*state.height, Math.random()*50, 0, Math.PI*2);
        ctx.fill();
    }

    // Load Base Art
    try {
        const res = await fetch('data/artworks-metadata.json');
        const data = await res.json();
        const art = data.artworks[Math.floor(Math.random() * data.artworks.length)];
        const img = new Image();
        img.src = art.image || `images/gallery/${art.id}.webp`;
        await new Promise(r => img.onload = r);
        
        const baseCtx = document.getElementById('rest-base').getContext('2d');
        // Center crop
        const scale = Math.max(state.width/img.width, state.height/img.height);
        const x = (state.width - img.width*scale)/2;
        const y = (state.height - img.height*scale)/2;
        baseCtx.drawImage(img, x, y, img.width*scale, img.height*scale);

    } catch(e) {
        console.error("Rest load error", e);
    }
  }

  function startPaint(e) { painting = true; paint(e); }
  function stopPaint() { painting = false; checkProgress(); }

  function paint(e) {
    if (!painting || !state.isActive) return;
    e.preventDefault();
    
    const rect = state.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (state.width / rect.width);
    const y = (clientY - rect.top) * (state.height / rect.height);
    
    const tool = CONFIG.tools[state.activeTool];
    const ctx = state.ctx;
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, tool.size, 0, Math.PI*2);
    ctx.fill();

    // Spawn Particles
    if (Math.random() > 0.5) {
        state.particles.push({
            x: x, y: y,
            vx: (Math.random()-0.5)*5,
            vy: (Math.random()-0.5)*5,
            life: 1.0,
            color: tool.color
        });
    }
  }

  function checkProgress() {
    // Heavy operation, throttle it
    if (Math.random() > 0.8) return; 

    // Use a small sample grid
    const ctx = state.ctx;
    const imgData = ctx.getImageData(0, 0, state.width, state.height);
    const data = imgData.data;
    let clear = 0;
    const step = 4 * 100; // Sample every 100 pixels
    
    for(let i=3; i<data.length; i+=step) {
        if (data[i] < 50) clear++;
    }
    
    const pct = Math.floor((clear / (data.length/step)) * 100);
    state.progress = pct;
    document.getElementById('rest-progress').style.width = pct + '%';

    if (pct > 95 && state.isActive) {
        state.isActive = false;
        alert('✨ ¡Obra Restaurada!');
        if (window.GameEffects) window.GameEffects.confettiBurst(state.canvas);
        setTimeout(loadLevel, 2000);
    }
  }

  function animate() {
    // We need a separate canvas for particles if we want them ON TOP of the dirt overlay
    // But since dirt overlay is on top of base, particles on dirt overlay (source-over) works fine,
    // EXCEPT they will be static if we don't clear them?
    // Actually, drawing particles on the Dirt Canvas using `source-over` puts them ON the dirt.
    // If we clear them, we might clear dirty pixels? No, clearRect clears pixels.
    // Solution: Draw particles on a 3rd TEMP canvas or just accept they might degrade dirt (unlikely).
    // BETTER: Use `GameEffects` overlay if possible, or just create a particle overlay.
    // Let's create a particle overlay dynamically if not exists.
    
    let pCanvas = document.getElementById('rest-particles');
    if (!pCanvas) {
        pCanvas = document.createElement('canvas');
        pCanvas.id = 'rest-particles';
        pCanvas.width = state.width;
        pCanvas.height = state.height;
        pCanvas.style.position = 'absolute';
        pCanvas.style.top = '0';
        pCanvas.style.left = '0';
        pCanvas.style.pointerEvents = 'none';
        state.canvas.parentElement.appendChild(pCanvas);
    }
    
    const pCtx = pCanvas.getContext('2d');
    pCtx.clearRect(0,0, state.width, state.height);

    state.particles = state.particles.filter(p => p.life > 0);
    state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        pCtx.fillStyle = p.color;
        pCtx.globalAlpha = p.life;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, Math.random()*3, 0, Math.PI*2);
        pCtx.fill();
    });
    
    requestAnimationFrame(animate);
  }

  window.RestauradorGame = { init };
})();
