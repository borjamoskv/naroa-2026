/**
 * Pink Particles Physics — Industrial Noir Edition
 * High-fidelity reactive physics system with Cyber Pink aesthetics.
 */

class PinkParticlesPhysics {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.count = 80;
    this.mouse = { x: -1000, y: -1000, active: false };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // Industrial Noir Pink: Cyber Pink (#FF007F)
    this.primaryColor = '#FF007F';
    this.secondaryColor = '#6600FF'; // Electric Violet for depth
    this.glowColor = 'rgba(255, 0, 127, 0.5)';
    
    this.init();
  }

  init() {
    this.canvas.id = 'pink-particles-physics';
    this.canvas.className = 'mica-dust-overlay'; // Leverage existing mica styles if needed
    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '2', // Above organic particles, below UI
      pointerEvents: 'none',
      mixBlendMode: 'screen',
      opacity: '0.6'
    });
    
    document.body.appendChild(this.canvas);
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    
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
        originX: Math.random() * this.width,
        originY: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.3 ? this.primaryColor : this.secondaryColor,
        alpha: Math.random() * 0.5 + 0.3,
        friction: 0.95,
        ease: 0.05
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.particles.forEach(p => {
      // Basic movement
      p.x += p.vx;
      p.y += p.vy;
      
      // Return to origin (elasticity)
      p.vx += (p.originX - p.x) * 0.001;
      p.vy += (p.originY - p.y) * 0.001;
      
      // Mouse interaction (Repulsion Physics)
      if (this.mouse.active) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;
        
        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist;
          const angle = Math.atan2(dy, dx);
          const fx = Math.cos(angle) * force * 15;
          const fy = Math.sin(angle) * force * 15;
          
          p.vx -= fx;
          p.vy -= fy;
        }
      }
      
      // Friction
      p.vx *= p.friction;
      p.vy *= p.friction;
      
      // Draw with Neon Glow
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      
      // Add bloom effect
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      
      this.ctx.fill();
      
      // Connecting lines if close (Cyber Grid feel)
      this.particles.forEach(p2 => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = p.color;
          this.ctx.globalAlpha = (80 - dist) / 1000;
          this.ctx.stroke();
        }
      });
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

export default PinkParticlesPhysics;
