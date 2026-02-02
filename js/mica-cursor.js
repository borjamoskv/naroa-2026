/**
 * MICA Cursor - Puntero Mineral Interactivo
 * Textura laminar brillante con estela dorada
 */

class MicaCursor {
  constructor() {
    this.enabled = true;
    this.trailElements = [];
    this.maxTrailLength = 8;
    this.lastX = 0;
    this.lastY = 0;
    this.shimmerInterval = null;
    
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
    
    // Crear pool de elementos para la estela
    this.createTrailPool();
    
    // Event listeners
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('click', (e) => this.onMouseClick(e));
    
    console.log('✨ MICA Cursor activado');
  }
  
  createTrailPool() {
    for (let i = 0; i < this.maxTrailLength; i++) {
      const trail = document.createElement('div');
      trail.className = 'mica-cursor-trail';
      trail.style.opacity = '0';
      document.body.appendChild(trail);
      this.trailElements.push({
        element: trail,
        x: 0,
        y: 0
      });
    }
  }
  
  onMouseMove(e) {
    if (!this.enabled) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    // Mover estela con delay
    this.updateTrail(x, y);
    
    // Shimmer ocasional (partículas de mica)
    if (Math.abs(x - this.lastX) > 20 || Math.abs(y - this.lastY) > 20) {
      if (Math.random() > 0.7) {
        this.createShimmer(x, y);
      }
    }
    
    this.lastX = x;
    this.lastY = y;
  }
  
  updateTrail(x, y) {
    // Shift positions
    for (let i = this.trailElements.length - 1; i > 0; i--) {
      this.trailElements[i].x = this.trailElements[i - 1].x;
      this.trailElements[i].y = this.trailElements[i - 1].y;
    }
    
    this.trailElements[0].x = x;
    this.trailElements[0].y = y;
    
    // Update positions with easing
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
    
    // Remove after animation
    setTimeout(() => shimmer.remove(), 800);
  }
  
  onMouseClick(e) {
    if (!this.enabled) return;
    
    // Burst de partículas al hacer click
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createShimmer(e.clientX, e.clientY);
      }, i * 50);
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
