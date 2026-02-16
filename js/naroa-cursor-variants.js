/**
 * NAROA CURSOR VARIANTS
 * Sistema de cursores dinámicos inspirado en Portal + estilo Naroa
 * 5 variaciones con física reactiva
 */

class NaroaCursorSystem {
  constructor() {
    this.activeVariant = 'default';
    this.trailParticles = [];
    this.canvas = this.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    
    // Pool de partículas para evitar GC
    this.particlePool = [];
    this.poolSize = 150;
    this.initPool();

    this.variants = {
      default: this.cursorDefault.bind(this),
      tritone_trail: this.cursorTritoneTrail.bind(this),
      mica_dust: this.cursorMicaDust.bind(this),
      mood_reactive: this.cursorMoodReactive.bind(this),
      gallery_spotlight: this.cursorGallerySpotlight.bind(this),
      parallax_depth: this.cursorParallaxDepth.bind(this),
      industrial_noir: this.cursorIndustrialNoir.bind(this)
    };
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.vx = 0;
    this.vy = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    this.init();
  }

  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-effects-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9997;
    `;
    document.body.appendChild(canvas);
    return canvas;
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.animate();
  }

  initPool() {
    for (let i = 0; i < this.poolSize; i++) {
        this.particlePool.push({
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 0,
            size: 0,
            color: '#000',
            alpha: 0,
            active: false
        });
    }
  }

  getParticle() {
    return this.particlePool.find(p => !p.active);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    
    // Calculate velocity for ghost prediction
    this.vx = this.mouseX - this.lastMouseX;
    this.vy = this.mouseY - this.lastMouseY;
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    
    // Ejecutar la variante activa
    if (this.variants[this.activeVariant]) {
        this.variants[this.activeVariant](e);
    }
  }

  // VARIANTE 1: Default (ya existe con CSS)
  cursorDefault(e) {
    // Manejado por CSS
  }

  // VARIANTE 2: Estela Tritono
  cursorTritoneTrail(e) {
    const colors = ['#E5A47B', '#2E2E2E', '#F5F5DC']; // Naranja, Negro, Crema
    
    const p = this.getParticle();
    if (p) {
        p.active = true;
        p.x = e.clientX;
        p.y = e.clientY;
        p.color = colors[Math.floor(Math.random() * colors.length)];
        p.alpha = 1;
        p.size = 8 + Math.random() * 4;
        p.life = 1;
        p.vx = 0;
        p.vy = 0;
        p.gravity = 0;
        p.bounce = 0;
        p.type = 'normal';
    }
  }

  // VARIANTE 3: Polvo Dorado (Mica Dust)
  cursorMicaDust(e) {
    for (let i = 0; i < 2; i++) {
      const p = this.getParticle();
      if (p) {
        p.active = true;
        p.x = e.clientX + (Math.random() - 0.5) * 20;
        p.y = e.clientY + (Math.random() - 0.5) * 20;
        p.color = '#FFD700';
        p.alpha = 0.8;
        p.size = 2 + Math.random() * 3;
        p.life = 1;
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = Math.random() * 2 + 1; // Caen hacia abajo
        p.gravity = 0.1;
        p.bounce = 0;
        p.type = 'normal';
      }
    }
  }

  // VARIANTE 4: Mood Reactive
  cursorMoodReactive(e) {
    const mood = window.MICA?.getState()?.mood || 'NEUTRAL';
    
    switch(mood) {
      case 'ENERGETIC':
        // Explosión radial
        for (let i = 0; i < 3; i++) {
          const p = this.getParticle();
          if (p) {
            const angle = Math.random() * Math.PI * 2;
            p.active = true;
            p.x = e.clientX;
            p.y = e.clientY;
            p.color = '#FFA500';
            p.alpha = 1;
            p.size = 6;
            p.life = 1;
            p.vx = Math.cos(angle) * 5;
            p.vy = Math.sin(angle) * 5;
            p.gravity = 0;
            p.bounce = 0;
            p.type = 'normal';
          }
        }
        break;
        
      case 'TIRED':
        // Movimiento lento y pesado
        const pTired = this.getParticle();
        if (pTired) {
            pTired.active = true;
            pTired.x = e.clientX;
            pTired.y = e.clientY;
            pTired.color = '#6B6B6B';
            pTired.alpha = 0.5;
            pTired.size = 12;
            pTired.life = 2; // Más duradero
            pTired.vx = 0;
            pTired.vy = 0.5;
            pTired.gravity = 0;
            pTired.bounce = 0;
            pTired.type = 'normal';
        }
        break;
        
      case 'GRUMPY':
        // Repulsión agresiva
        const pGrumpy = this.getParticle();
        if (pGrumpy) {
            pGrumpy.active = true;
            pGrumpy.x = e.clientX;
            pGrumpy.y = e.clientY;
            pGrumpy.color = '#FF0000';
            pGrumpy.alpha = 0.8;
            pGrumpy.size = 8;
            pGrumpy.life = 0.5;
            pGrumpy.vx = (Math.random() - 0.5) * 10;
            pGrumpy.vy = (Math.random() - 0.5) * 10;
            pGrumpy.gravity = 0;
            pGrumpy.bounce = 0;
            pGrumpy.type = 'normal';
        }
        break;
        
      case 'PLAYFUL':
        // Rebote elástico
        const pPlayful = this.getParticle();
        if (pPlayful) {
            pPlayful.active = true;
            pPlayful.x = e.clientX;
            pPlayful.y = e.clientY;
            pPlayful.color = '#FF69B4';
            pPlayful.alpha = 1;
            pPlayful.size = 10;
            pPlayful.life = 1;
            pPlayful.vx = (Math.random() - 0.5) * 6;
            pPlayful.vy = -Math.random() * 8; // Salta hacia arriba
            pPlayful.gravity = 0.5;
            pPlayful.bounce = 0.7;
            pPlayful.type = 'normal';
        }
        break;
    }
  }

  // VARIANTE 5: Gallery Spotlight (para obras)
  cursorGallerySpotlight(e) {
    // Detectar si está sobre una obra
    const artworkElement = document.elementFromPoint(e.clientX, e.clientY);
    
    if (artworkElement?.classList.contains('artwork-item')) {
      // Crear spotlight circular
      const p = this.getParticle();
      if (p) {
        p.active = true;
        p.x = e.clientX;
        p.y = e.clientY;
        p.type = 'spotlight';
        p.radius = 150;
        p.alpha = 0.3;
        p.color = '#FFD700';
        p.life = 0.1; // Visual effect only lasts one frame per move, logic handled in loop
        p.vx = 0; p.vy = 0; p.gravity = 0;
      }
    }
  }

  // VARIANTE 6: Parallax Depth
  cursorParallaxDepth(e) {
    const layers = [
      { speed: 0.5, color: '#FFD700', size: 4, alpha: 0.3 },
      { speed: 0.8, color: '#E5A47B', size: 6, alpha: 0.5 },
      { speed: 1.0, color: '#F5F5DC', size: 8, alpha: 0.7 }
    ];
    
    layers.forEach(layer => {
      const p = this.getParticle();
      if (p) {
          p.active = true;
        p.x = e.clientX + (0.5 - layer.speed) * 20;
        p.y = e.clientY + (0.5 - layer.speed) * 20;
        p.color = layer.color;
        p.alpha = layer.alpha;
        p.size = layer.size;
        p.life = 1;
        p.layer = layer.speed;
        p.vx = 0; p.vy = 0; p.gravity = 0; p.bounce = 0;
        p.type = 'normal';
      }
    });
  }

  // VARIANTE 7: Industrial Noir (Neon & Glow)
  cursorIndustrialNoir(e) {
    for (let i = 0; i < 3; i++) {
      const p = this.getParticle();
      if (p) {
        p.active = true;
        p.x = e.clientX;
        p.y = e.clientY;
        p.color = '#00d4ff';
        p.alpha = 1;
        p.size = 4 + Math.random() * 6;
        p.life = 1;
        p.vx = (Math.random() - 0.5) * 4;
        p.vy = (Math.random() - 0.5) * 4;
        p.gravity = 0;
        p.bounce = 0;
        p.type = 'neon';
      }
    }
  }

  // Loop de animación
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Renderizar Ghost Cursor (Predictive)
    if (Math.abs(this.vx) > 1 || Math.abs(this.vy) > 1) {
      const ghostAlpha = Math.min(0.2, (Math.abs(this.vx) + Math.abs(this.vy)) / 100);
      const lookAhead = 1.5;
      const gx = this.mouseX + this.vx * lookAhead;
      const gy = this.mouseY + this.vy * lookAhead;
      
      this.ctx.beginPath();
      this.ctx.arc(gx, gy, 12, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(0, 212, 255, ${ghostAlpha})`;
      this.ctx.setLineDash([5, 5]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Actualizar y renderizar partículas usando el pool
    // No usamos filter() ni map() para evitar allocations
    
    for (let i = 0; i < this.poolSize; i++) {
        const p = this.particlePool[i];
        if (!p.active) continue;

      // Actualizar física
      if (p.vx) p.x += p.vx;
      if (p.vy) p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      
      // Rebote en el suelo
      if (p.bounce && p.y > this.canvas.height) {
        p.y = this.canvas.height;
        p.vy *= -p.bounce;
      }
      
      // Decaimiento de vida
      if (p.type !== 'spotlight') {
         p.life -= 0.02;
         p.alpha = p.life;
      } else {
         p.life -= 0.5; // Spotlights decay fast as they are refreshed on move
      }
      
      if (p.life <= 0) {
          p.active = false;
          continue;
      }
      
      // Renderizar
      if (p.type === 'spotlight') {
        const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${p.alpha})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      } else if (p.type === 'neon') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset for performance
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color.includes('#') 
          ? `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`
          : p.color;
        this.ctx.fill();
      }
    }
  }

  // API pública
  setVariant(variantName) {
    if (this.variants[variantName]) {
      this.activeVariant = variantName;
      this.trailParticles = [];
    }
  }

  getAvailableVariants() {
    return Object.keys(this.variants);
  }
}

// Auto-inicializar
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.NaroaCursors = new NaroaCursorSystem();
    
    // Ejemplo de uso: cambiar variante
    // window.NaroaCursors.setVariant('mica_dust');
  });
}

export default NaroaCursorSystem;
