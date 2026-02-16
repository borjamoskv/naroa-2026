/**
 * SOTY Effects Class - Refactored for ES Modules
 */

class KineticTextSOTY {
  constructor(element) {
    this.element = element;
    this.chars = [];
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!this.isReducedMotion) {
      this.init();
    }
  }
  
  init() {
    const text = this.element.textContent;
    this.element.innerHTML = '';
    this.element.setAttribute('aria-label', text);
    
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'kinetic-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.setProperty('--char-index', i);
      span.style.display = 'inline-block';
      span.style.transition = `transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.02}s`;
      this.element.appendChild(span);
      this.chars.push(span);
    });
    
    this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.element.addEventListener('mouseleave', () => this.onMouseLeave());
  }
  
  onMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    this.chars.forEach((char) => {
      const charRect = char.getBoundingClientRect();
      const charCenterX = charRect.left + charRect.width / 2 - rect.left;
      const charCenterY = charRect.top + charRect.height / 2 - rect.top;
      
      const distX = mouseX - charCenterX;
      const distY = mouseY - charCenterY;
      const dist = Math.sqrt(distX * distX + distY * distY);
      
      const maxDist = 100;
      const influence = Math.max(0, 1 - dist / maxDist);
      
      const moveX = -distX * influence * 0.15;
      const moveY = -distY * influence * 0.15;
      const rotate = distX * influence * 0.05;
      
      char.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg)`;
    });
  }
  
  onMouseLeave() {
    this.chars.forEach(char => {
      char.style.transform = '';
    });
  }
}

class CursorTrailSOTY {
  constructor() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.isReducedMotion) return;
    
    this.lastX = 0;
    this.lastY = 0;
    this.throttle = false;
    
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }
  
  onMouseMove(e) {
    if (this.throttle) return;
    this.throttle = true;
    
    const dist = Math.sqrt(
      Math.pow(e.clientX - this.lastX, 2) + 
      Math.pow(e.clientY - this.lastY, 2)
    );
    
    if (dist > 15) {
      this.createParticle(e.clientX, e.clientY);
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
    
    setTimeout(() => { this.throttle = false; }, 30);
  }
  
  createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'cursor-trail-particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    document.body.appendChild(particle);
    
    particle.addEventListener('animationend', () => particle.remove());
  }
}

export const SOTYEffects = {
  revealObserver: new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        SOTYEffects.revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  }),

  initKineticText(selector) {
    document.querySelectorAll(selector).forEach(el => new KineticTextSOTY(el));
  },
  
  initScrollReveal(selector) {
    document.querySelectorAll(selector).forEach(el => this.revealObserver.observe(el));
  },
  
  initCursorTrail() {
    new CursorTrailSOTY();
  },
  
  initMagneticButtons() {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;
    
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  },
  
  initAll() {
    this.initKineticText('.kinetic-text');
    const revealTargets = document.querySelectorAll('h2, .section-subtitle, .gallery__item, .game-card, .about__card, .contact__card');
    revealTargets.forEach(el => {
      el.classList.add('reveal-on-scroll');
      this.revealObserver.observe(el);
    });
    this.initScrollReveal('.reveal-on-scroll, .reveal-stagger');
    this.initMagneticButtons();
    this.initCursorTrail();
  }
};
