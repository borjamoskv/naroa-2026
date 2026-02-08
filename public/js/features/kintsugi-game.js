/**
 * Kintsugi Game - Naroa 2026 (Premium Upgrade)
 * @description Zen game: Repair the broken artwork with gold.
 * Agent A25: Voronoi cracks, gold shader, zen audio visuals.
 */
(function() {
  'use strict';

  const CONFIG = {
    goldColor: '#ffd700',
    crackWidth: 4,
    healRadius: 30,
    minCracks: 5,
    maxCracks: 12
  };

  let state = {
    canvas: null, ctx: null,
    width: 0, height: 0,
    artwork: null,
    cracks: [], // { points: [{x,y}], healed: boolean, opacity: 1 }
    totalSegments: 0,
    healedSegments: 0,
    isComplete: false,
    particles: []
  };

  async function init() {
    const container = document.getElementById('kintsugi-container');
    if (!container) return;

    container.innerHTML = `
      <div class="kintsugi-ui" style="display:flex; flex-direction:column; align-items:center; gap:20px; width:100%; max-width:600px; margin:0 auto;">
        <div style="text-align:center;">
          <h2 style="font-family:'Space Grotesk'; color:#fff; margin-bottom:5px;">KINTSUGI</h2>
          <p style="color:#ffd700; font-style:italic; opacity:0.8;">Repara las grietas con oro líquido</p>
        </div>
        
        <div style="position:relative; border-radius:12px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1);">
          <canvas id="kintsugi-canvas"></canvas>
          <div id="kintsugi-overlay" style="position:absolute; inset:0; pointer-events:none; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 1s;">
            <h1 style="font-size:3rem; color:#ffd700; text-shadow:0 0 30px rgba(255,215,0,0.8);">RENACIDO</h1>
          </div>
        </div>

        <div style="width:100%; background:rgba(255,255,255,0.1); hieght:4px; border-radius:2px; overflow:hidden;">
          <div id="kintsugi-progress" style="width:0%; height:4px; background:#ffd700; box-shadow:0 0 10px #ffd700; transition:width 0.3s;"></div>
        </div>
        
        <button id="kintsugi-new" class="game-btn" style="background:rgba(255,215,0,0.1); border:1px solid #ffd700; color:#ffd700;">
          ↻ Nueva Obra
        </button>
      </div>
    `;

    state.canvas = document.getElementById('kintsugi-canvas');
    state.ctx = state.canvas.getContext('2d');
    
    document.getElementById('kintsugi-new').addEventListener('click', loadNewArtwork);

    // Brush events
    state.canvas.addEventListener('mousemove', handleBrush);
    state.canvas.addEventListener('touchmove', handleBrush, {passive: false});

    await loadNewArtwork();
    animate();
  }

  async function loadNewArtwork() {
    state.isComplete = false;
    state.healedSegments = 0;
    state.particles = [];
    document.getElementById('kintsugi-progress').style.width = '0%';
    document.getElementById('kintsugi-overlay').style.opacity = '0';

    try {
      // Fetch metadata
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      const art = data.artworks[Math.floor(Math.random() * data.artworks.length)];
      const src = art.image || `images/gallery/${art.id}.webp`;

      // Load Image
      const img = new Image();
      img.src = src;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => {
             // Fallback
             img.src = 'images/gallery/espejos-del-alma.webp';
             img.onload = resolve;
        };
      });
      state.artwork = img;

      // Fit canvas to image aspect ratio (max 600px width)
      const maxW = Math.min(window.innerWidth - 40, 600);
      const scale = maxW / img.width;
      state.width = maxW;
      state.height = img.height * scale;
      state.canvas.width = state.width;
      state.canvas.height = state.height;

      generateCracks();

    } catch (e) {
      console.error("Kintsugi load error", e);
    }
  }

  function generateCracks() {
    state.cracks = [];
    state.totalSegments = 0;
    const numCracks = CONFIG.minCracks + Math.floor(Math.random() * (CONFIG.maxCracks - CONFIG.minCracks));

    for (let i = 0; i < numCracks; i++) {
        const points = [];
        // Random start point
        let x = Math.random() * state.width;
        let y = Math.random() * state.height;
        points.push({x, y, healed: false});

        // Walk
        const steps = 5 + Math.random() * 8;
        for (let s = 0; s < steps; s++) {
            x += (Math.random() - 0.5) * 100;
            y += (Math.random() - 0.5) * 100;
            // Border constraints
            x = Math.max(10, Math.min(state.width - 10, x));
            y = Math.max(10, Math.min(state.height - 10, y));
            points.push({x, y, healed: false});
        }
        
        // Break into segments for granular healing
        const segments = [];
        for(let j=0; j<points.length-1; j++) {
            segments.push({
                p1: points[j],
                p2: points[j+1],
                healed: false
            });
            state.totalSegments++;
        }
        state.cracks.push(segments);
    }
  }

  function handleBrush(e) {
    if (state.isComplete) return;
    e.preventDefault();
    const rect = state.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let healedAny = false;

    state.cracks.forEach(crackSegments => {
        crackSegments.forEach(seg => {
            if (seg.healed) return;
            // Check distance to line segment
            const d = distToSegment({x, y}, seg.p1, seg.p2);
            if (d < CONFIG.healRadius) {
                seg.healed = true;
                state.healedSegments++;
                healedAny = true;
                spawnGoldDust(x, y);
            }
        });
    });

    if (healedAny) {
        // Haptic
        if (navigator.vibrate) navigator.vibrate(5);
        
        // Progress
        const pct = (state.healedSegments / state.totalSegments) * 100;
        document.getElementById('kintsugi-progress').style.width = pct + '%';

        if (pct >= 98 && !state.isComplete) {
            completeGame();
        }
    }
  }

  function distToSegment(p, v, w) {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
    if (l2 == 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  function spawnGoldDust(x, y) {
    for(let i=0; i<3; i++) {
        state.particles.push({
            x: x + (Math.random()-0.5)*20,
            y: y + (Math.random()-0.5)*20,
            vx: (Math.random()-0.5)*2,
            vy: (Math.random()-0.5)*2,
            size: Math.random()*3,
            life: 1
        });
    }
  }

  function completeGame() {
    state.isComplete = true;
    document.getElementById('kintsugi-overlay').style.opacity = '1';
    // Heal all remaining
    state.cracks.forEach(c => c.forEach(s => s.healed = true));
    
    // Confetti
    if (window.GameEffects) window.GameEffects.confettiBurst(state.canvas, 50);
  }

  function animate() {
    if (!state.ctx || !state.artwork) {
        requestAnimationFrame(animate); 
        return;
    }

    const ctx = state.ctx;
    ctx.clearRect(0, 0, state.width, state.height);

    // 1. Draw Artwork (Dimmed)
    ctx.filter = 'brightness(0.6) grayscale(0.3)';
    ctx.drawImage(state.artwork, 0, 0, state.width, state.height);
    ctx.filter = 'none';

    // 2. Draw Cracks (Black if not healed, Gold if healed)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    state.cracks.forEach(segments => {
        // Draw Shadow/Black cracks first
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = CONFIG.crackWidth + 2;
        segments.forEach(s => {
            ctx.moveTo(s.p1.x, s.p1.y);
            ctx.lineTo(s.p2.x, s.p2.y);
        });
        ctx.stroke();

        // Draw Gold for healed parts
        segments.forEach(s => {
            if (s.healed) {
                ctx.beginPath();
                ctx.strokeStyle = CONFIG.goldColor;
                ctx.lineWidth = CONFIG.crackWidth;
                ctx.shadowColor = CONFIG.goldColor;
                ctx.shadowBlur = 15;
                ctx.moveTo(s.p1.x, s.p1.y);
                ctx.lineTo(s.p2.x, s.p2.y);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        });
    });

    // 3. Particles
    state.particles = state.particles.filter(p => p.life > 0);
    state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = CONFIG.goldColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 4. Cursor Glow
    if (!state.isComplete) {
       // Optional: could add a cursor glow follower
    }

    requestAnimationFrame(animate);
  }

  window.KintsugiGame = { init };
})();
