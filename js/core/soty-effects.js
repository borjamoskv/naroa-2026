/**
 * Kinetic Typography - Naroa 2026
 * Distortion and movement effects for hero text
 */

(function() {
  'use strict';
  
  // ==========================================
  // KINETIC TEXT CONTROLLER
  // ==========================================
  
  class KineticText {
    constructor(element) {
      this.element = element;
      this.chars = [];
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (!this.isReducedMotion) {
        this.init();
      }
    }
    
    init() {
      // Split text into individual characters
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
      
      // Add mouse interaction
      this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
      this.element.addEventListener('mouseleave', () => this.onMouseLeave());
    }
    
    onMouseMove(e) {
      const rect = this.element.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      this.chars.forEach((char, i) => {
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
  
  // ==========================================
  // SCROLL REVEAL OBSERVER
  // ==========================================
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // ==========================================
  // CURSOR TRAIL (Optional Premium Effect)
  // ==========================================
  
  class CursorTrail {
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
  
  // ==========================================
  // MAGNETIC BUTTON EFFECT
  // ==========================================
  
  function initMagneticButtons() {
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
  }
  
  // ==========================================
  // PUBLIC API
  // ==========================================
  
  window.SOTYEffects = {
    initKineticText(selector) {
      document.querySelectorAll(selector).forEach(el => new KineticText(el));
    },
    
    initScrollReveal(selector) {
      document.querySelectorAll(selector).forEach(el => revealObserver.observe(el));
    },
    
    initCursorTrail() {
      new CursorTrail();
    },
    
    initMagneticButtons,
    
    initAll() {
      // 1. Kinetic Text
      this.initKineticText('.kinetic-text');
      
      // 2. Scroll Reveal (Auto-apply to key elements)
      const revealTargets = document.querySelectorAll('h2, .section-subtitle, .gallery__item, .game-card, .about__card, .contact__card');
      revealTargets.forEach(el => {
        el.classList.add('reveal-on-scroll');
        revealObserver.observe(el);
      });
      // Also observe explicit classes
      this.initScrollReveal('.reveal-on-scroll, .reveal-stagger');

      // 3. Magnetic Buttons
      this.initMagneticButtons();
      
      // 4. Cursor Trail (Enabled for Premium Feel)
      this.initCursorTrail();
    }
  };
  
  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure layout is stable
    setTimeout(() => window.SOTYEffects.initAll(), 100);
  });
  
})();
