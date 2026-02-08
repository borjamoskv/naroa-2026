/**
 * Organic Particles - Premium Background Effect
 * Subtle, floating particles that add life to the negative space.
 */

class OrganicParticles {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.count = 50; // Not too many, keep it clean
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.init();
  }

  init() {
    this.canvas.id = 'organic-particles';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '1'; // Behind content, above aurora
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.opacity = '0.4';
    
    document.body.appendChild(this.canvas);
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.createParticles();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createParticles() {
    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.1
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap around screen
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      this.ctx.fill();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new OrganicParticles());
} else {
  new OrganicParticles();
}
