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
    
    this.variants = {
      default: this.cursorDefault.bind(this),
      tritone_trail: this.cursorTritoneTrail.bind(this),
      mica_dust: this.cursorMicaDust.bind(this),
      mood_reactive: this.cursorMoodReactive.bind(this),
      gallery_spotlight: this.cursorGallerySpotlight.bind(this),
      parallax_depth: this.cursorParallaxDepth.bind(this)
    };
    
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

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    
    // Ejecutar la variante activa
    this.variants[this.activeVariant](e);
  }

  // VARIANTE 1: Default (ya existe con CSS)
  cursorDefault(e) {
    // Manejado por CSS
  }

  // VARIANTE 2: Estela Tritono
  cursorTritoneTrail(e) {
    const colors = ['#E5A47B', '#2E2E2E', '#F5F5DC']; // Naranja, Negro, Crema
    
    this.trailParticles.push({
      x: e.clientX,
      y: e.clientY,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      size: 8 + Math.random() * 4,
      life: 1
    });
    
    // Limitar partículas
    if (this.trailParticles.length > 30) {
      this.trailParticles.shift();
    }
  }

  // VARIANTE 3: Polvo Dorado (Mica Dust)
  cursorMicaDust(e) {
    for (let i = 0; i < 2; i++) {
      this.trailParticles.push({
        x: e.clientX + (Math.random() - 0.5) * 20,
        y: e.clientY + (Math.random() - 0.5) * 20,
        color: '#FFD700',
        alpha: 0.8,
        size: 2 + Math.random() * 3,
        life: 1,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1, // Caen hacia abajo
        gravity: 0.1
      });
    }
    
    if (this.trailParticles.length > 100) {
      this.trailParticles.shift();
    }
  }

  // VARIANTE 4: Mood Reactive
  cursorMoodReactive(e) {
    const mood = window.MICA?.getState()?.mood || 'NEUTRAL';
    
    switch(mood) {
      case 'ENERGETIC':
        // Explosión radial
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          this.trailParticles.push({
            x: e.clientX,
            y: e.clientY,
            color: '#FFA500',
            alpha: 1,
            size: 6,
            life: 1,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5
          });
        }
        break;
        
      case 'TIRED':
        // Movimiento lento y pesado
        this.trailParticles.push({
          x: e.clientX,
          y: e.clientY,
          color: '#6B6B6B',
          alpha: 0.5,
          size: 12,
          life: 2, // Más duradero
          vx: 0,
          vy: 0.5
        });
        break;
        
      case 'GRUMPY':
        // Repulsión agresiva
        this.trailParticles.push({
          x: e.clientX,
          y: e.clientY,
          color: '#FF0000',
          alpha: 0.8,
          size: 8,
          life: 0.5,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10
        });
        break;
        
      case 'PLAYFUL':
        // Rebote elástico
        this.trailParticles.push({
          x: e.clientX,
          y: e.clientY,
          color: '#FF69B4',
          alpha: 1,
          size: 10,
          life: 1,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 8, // Salta hacia arriba
          gravity: 0.5,
          bounce: 0.7
        });
        break;
    }
    
    if (this.trailParticles.length > 80) {
      this.trailParticles.shift();
    }
  }

  // VARIANTE 5: Gallery Spotlight (para obras)
  cursorGallerySpotlight(e) {
    // Detectar si está sobre una obra
    const artworkElement = document.elementFromPoint(e.clientX, e.clientY);
    
    if (artworkElement?.classList.contains('artwork-item')) {
      // Crear spotlight circular
      this.trailParticles = [{
        x: e.clientX,
        y: e.clientY,
        type: 'spotlight',
        radius: 150,
        alpha: 0.3,
        color: '#FFD700'
      }];
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
      this.trailParticles.push({
        x: e.clientX + (0.5 - layer.speed) * 20,
        y: e.clientY + (0.5 - layer.speed) * 20,
        color: layer.color,
        alpha: layer.alpha,
        size: layer.size,
        life: 1,
        layer: layer.speed
      });
    });
    
    if (this.trailParticles.length > 60) {
      this.trailParticles.splice(0, 3);
    }
  }

  // Loop de animación
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Actualizar y renderizar partículas
    this.trailParticles = this.trailParticles.filter(p => {
      // Actualizar física
      if (p.vx !== undefined) p.x += p.vx;
      if (p.vy !== undefined) p.y += p.vy;
      if (p.gravity !== undefined) p.vy += p.gravity;
      
      // Rebote en el suelo
      if (p.bounce && p.y > this.canvas.height) {
        p.y = this.canvas.height;
        p.vy *= -p.bounce;
      }
      
      // Decaimiento de vida
      p.life -= 0.02;
      p.alpha = p.life;
      
      // Renderizar
      if (p.type === 'spotlight') {
        const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${p.alpha})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color.includes('#') 
          ? `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`
          : p.color;
        this.ctx.fill();
      }
      
      return p.life > 0;
    });
  }

  // API pública
  setVariant(variantName) {
    if (this.variants[variantName]) {
      this.activeVariant = variantName;
      this.trailParticles = [];
      console.log(`🎨 Cursor variant changed to: ${variantName}`);
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
    console.log('✨ Naroa Cursor System initialized');
    
    // Ejemplo de uso: cambiar variante
    // window.NaroaCursors.setVariant('mica_dust');
  });
}

export default NaroaCursorSystem;
