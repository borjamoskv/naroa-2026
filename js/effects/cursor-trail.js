/**
 * Golden Cursor Trail - SOTY 2026
 * Premium particle trail effect following cursor movement
 * 
 * Features:
 * - Canvas-based for 60fps performance
 * - Golden particle system with fade
 * - Velocity-based particle emission
 * - Full accessibility support
 * 
 * @see Premium Effects Library 2026 #36
 */

class CursorTrail {
  constructor(options = {}) {
    this.particleCount = options.particleCount || 40;
    this.particleSize = options.particleSize || 2.5;
    this.particleLife = options.particleLife || 1200;
    this.colors = [
      { r: 255, g: 215, b: 0 },   // Naroa Gold
      { r: 204, g: 0, b: 0 },     // Naroa Red
      { r: 184, g: 134, b: 11 }   // Gold Dust
    ];
    this.minVelocity = options.minVelocity || 1.5;
    
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.rafId = null;
    this.lastEmit = 0;
    this.isHoveringLink = false;
    
    this.isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    if (this.isReduced) return this;
    this.createCanvas();
    this.bindEvents();
    this.startLoop();
    return this;
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'mica-dust-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10000;
    `;
    
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      // Check if hovering interactive elements
      const target = e.target;
      this.isHoveringLink = !!target.closest('a, button, .gallery-massive__item, .magnetic-btn');
    });

    window.addEventListener('resize', () => this.resize());
  }

  startLoop() {
    const update = (timestamp) => {
      this.update(timestamp);
      this.render();
      this.rafId = requestAnimationFrame(update);
    };
    this.rafId = requestAnimationFrame(update);
  }

  update(timestamp) {
    const dx = this.mouseX - this.lastMouseX;
    const dy = this.mouseY - this.lastMouseY;
    const velocity = Math.sqrt(dx * dx + dy * dy);
    
    // Density increase on hover
    const emitThreshold = this.isHoveringLink ? 8 : 16;
    
    if ((velocity > this.minVelocity || this.isHoveringLink) && timestamp - this.lastEmit > emitThreshold) {
      const count = this.isHoveringLink ? 3 : 1;
      for (let i = 0; i < count; i++) {
        this.emitParticle();
      }
      this.lastEmit = timestamp;
    }
    
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    
    this.particles = this.particles.filter(p => {
      p.age += 16;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      
      // Floating motion
      p.vy += Math.sin(p.age * 0.01) * 0.05;
      
      return p.age < p.life;
    });
  }

  emitParticle() {
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * (this.isHoveringLink ? 3 : 1.5);
    
    this.particles.push({
      x: this.mouseX + (Math.random() - 0.5) * 10,
      y: this.mouseY + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * (this.isHoveringLink ? 4 : 2) + 0.5,
      life: this.particleLife * (0.5 + Math.random()),
      age: 0,
      color: color,
      twinkle: Math.random()
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      const progress = p.age / p.life;
      const alpha = Math.sin(progress * Math.PI) * (0.3 + Math.sin(p.age * 0.02 + p.twinkle * 10) * 0.2);
      
      this.ctx.beginPath();
      const size = p.size * (1 - progress * 0.5);
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      
      this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
      this.ctx.fill();
      
      if (alpha > 0.4) {
        this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.5})`;
        this.ctx.shadowBlur = p.isHoveringLink ? 15 : 8;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    });
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.cursorTrailInstance = new CursorTrail().init();
});
