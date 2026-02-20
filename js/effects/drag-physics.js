/**
 * Drag Physics — Gallery Card Physics Engine
 * Pointer-driven drag with velocity tracking, inertia release, and elastic boundary bounce.
 */

export default class DragPhysics {
  constructor(selector = '.gallery-massive__item') {
    this.items = [];
    this.active = null;
    this.startX = 0;
    this.startY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.friction = 0.92;
    this.bounce = -0.6;
    this.rafId = null;
    
    this.init(selector);
  }

  init(selector) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      el.style.position = 'relative';
      el.style.zIndex = '1';
      el.style.transition = 'none';
      
      const state = {
        el,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        isDragging: false
      };
      
      this.items.push(state);
      
      el.addEventListener('pointerdown', (e) => this.onDown(e, state));
    });
    
    document.addEventListener('pointermove', (e) => this.onMove(e));
    document.addEventListener('pointerup', () => this.onUp());
    
    this.loop();
  }

  onDown(e, state) {
    e.preventDefault();
    this.active = state;
    state.isDragging = true;
    state.el.style.zIndex = '100';
    state.el.style.cursor = 'grabbing';
    
    this.startX = e.clientX - state.x;
    this.startY = e.clientY - state.y;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  onMove(e) {
    if (!this.active) return;
    
    const x = e.clientX - this.startX;
    const y = e.clientY - this.startY;
    
    this.velocityX = e.clientX - this.lastX;
    this.velocityY = e.clientY - this.lastY;
    
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    
    this.active.x = x;
    this.active.y = y;
    this.active.el.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
  }

  onUp() {
    if (!this.active) return;
    
    this.active.vx = this.velocityX * 2;
    this.active.vy = this.velocityY * 2;
    this.active.isDragging = false;
    this.active.el.style.cursor = 'pointer';
    this.active.el.style.zIndex = '1';
    this.active = null;
  }

  loop() {
    this.items.forEach(state => {
      if (state.isDragging) return;
      
      if (Math.abs(state.vx) > 0.1 || Math.abs(state.vy) > 0.1) {
        state.x += state.vx;
        state.y += state.vy;
        state.vx *= this.friction;
        state.vy *= this.friction;
        
        // Boundary bounce (keep within ±200px of origin)
        const maxDrift = 200;
        if (Math.abs(state.x) > maxDrift) {
          state.x = Math.sign(state.x) * maxDrift;
          state.vx *= this.bounce;
        }
        if (Math.abs(state.y) > maxDrift) {
          state.y = Math.sign(state.y) * maxDrift;
          state.vy *= this.bounce;
        }
        
        state.el.style.transform = `translate(${state.x}px, ${state.y}px)`;
      } else if (Math.abs(state.x) > 0.5 || Math.abs(state.y) > 0.5) {
        // Return to origin with spring
        state.x *= 0.9;
        state.y *= 0.9;
        
        if (Math.abs(state.x) < 0.5) state.x = 0;
        if (Math.abs(state.y) < 0.5) state.y = 0;
        
        state.el.style.transform = `translate(${state.x}px, ${state.y}px)`;
      }
    });
    
    this.rafId = requestAnimationFrame(() => this.loop());
  }
}
