/**
 * MICA Cursor - Puntero Rotativo cada minuto
 * Cambia entre Risitas, Limone Cat y MICA
 */

class MicaCursor {
  constructor() {
    this.enabled = true;
    this.trailElements = [];
    this.maxTrailLength = 8;
    this.lastX = 0;
    this.lastY = 0;
    this.currentCursorIndex = 0;
    
    // Cursores disponibles — stone es el default principal
    this.cursors = [
      { name: 'stone', small: 'stone-cursor-32.png', large: 'stone-cursor-48.png' },
      { name: 'risitas', small: 'risitas-32.png', large: 'risitas-48.png' },
      { name: 'limone', small: 'limone-cat-32.png', large: 'limone-cat-48.png' },
      { name: 'mica', small: 'mica-pointer-32.png', large: 'mica-pointer-48.png' }
    ];
    
    this.init();
  }
  
  init() {
    // Solo en desktop
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.enabled = false;
      return;
    }
    
    // Activar clase en HTML
    document.documentElement.classList.add('mica-cursor');
    
    // Aplicar cursor inicial
    this.applyCursor();
    
    // Rotar cada minuto
    setInterval(() => this.rotateCursor(), 60000);
    
    // Crear pool de elementos para la estela
    this.createTrailPool();
    
    // Event listeners
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('click', (e) => this.onMouseClick(e));
    
  }
  
  rotateCursor() {
    this.currentCursorIndex = (this.currentCursorIndex + 1) % this.cursors.length;
    this.applyCursor();
  }
  
  applyCursor() {
    const cursor = this.cursors[this.currentCursorIndex];
    const basePath = '/assets/cursors/';
    
    // Crear o actualizar estilos dinámicos
    let style = document.getElementById('dynamic-cursor-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'dynamic-cursor-style';
      document.head.appendChild(style);
    }
    
    style.textContent = `
      html.mica-cursor,
      html.mica-cursor *,
      html.mica-cursor a,
      html.mica-cursor button,
      html.mica-cursor input,
      html.mica-cursor textarea,
      html.mica-cursor select {
        cursor: url('${basePath}${cursor.small}') 4 0, auto !important;
      }
      
      html.mica-cursor a:hover,
      html.mica-cursor button:hover,
      html.mica-cursor [role="button"]:hover,
      html.mica-cursor .gallery-item:hover,
      html.mica-cursor .mica-toggle:hover,
      html.mica-cursor .game-card:hover {
        cursor: url('${basePath}${cursor.large}') 6 0, pointer !important;
      }
    `;
  }
  
  createTrailPool() {
    for (let i = 0; i < this.maxTrailLength; i++) {
      const trail = document.createElement('div');
      trail.className = 'mica-cursor-trail';
      trail.style.opacity = '0';
      document.body.appendChild(trail);
      this.trailElements.push({ element: trail, x: 0, y: 0 });
    }
  }
  
  onMouseMove(e) {
    if (!this.enabled) return;
    const x = e.clientX;
    const y = e.clientY;
    this.updateTrail(x, y);
    
    if (Math.abs(x - this.lastX) > 20 || Math.abs(y - this.lastY) > 20) {
      if (Math.random() > 0.7) this.createShimmer(x, y);
    }
    this.lastX = x;
    this.lastY = y;
  }
  
  updateTrail(x, y) {
    for (let i = this.trailElements.length - 1; i > 0; i--) {
      this.trailElements[i].x = this.trailElements[i - 1].x;
      this.trailElements[i].y = this.trailElements[i - 1].y;
    }
    this.trailElements[0].x = x;
    this.trailElements[0].y = y;
    
    this.trailElements.forEach((trail, i) => {
      const opacity = 1 - (i / this.maxTrailLength);
      const scale = 1 - (i * 0.1);
      trail.element.style.left = trail.x + 'px';
      trail.element.style.top = trail.y + 'px';
      trail.element.style.opacity = opacity * 0.4;
      trail.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
    });
  }
  
  createShimmer(x, y) {
    const shimmer = document.createElement('div');
    shimmer.className = 'mica-shimmer';
    shimmer.style.left = (x + (Math.random() - 0.5) * 20) + 'px';
    shimmer.style.top = (y + (Math.random() - 0.5) * 20) + 'px';
    document.body.appendChild(shimmer);
    setTimeout(() => shimmer.remove(), 800);
  }
  
  onMouseClick(e) {
    if (!this.enabled) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.createShimmer(e.clientX, e.clientY), i * 50);
    }
  }
  
  disable() {
    this.enabled = false;
    document.documentElement.classList.remove('mica-cursor');
    this.trailElements.forEach(t => t.element.remove());
  }
  
  enable() {
    if (!('ontouchstart' in window)) {
      this.enabled = true;
      document.documentElement.classList.add('mica-cursor');
    }
  }
}

// Auto-inicializar
window.micaCursor = new MicaCursor();
