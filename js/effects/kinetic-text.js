/**
 * Kinetic Typography v3 - SOTY 2026
 * Character-level repulsion effect that responds to cursor proximity
 * 
 * Features:
 * - Physical repulsion from cursor
 * - Smooth cubic-bezier transitions
 * - Staggered delay per character
 * - Full prefers-reduced-motion support
 * 
 * @see Premium Effects Library 2026 #24
 */

class KineticText {
  constructor(options = {}) {
    this.maxDist = options.maxDist || 150;
    this.influence = options.influence || 0.15;
    this.staggerDelay = options.staggerDelay || 0.02;
    this.ease = options.ease || 'cubic-bezier(0.16, 1, 0.3, 1)';
    this.duration = options.duration || 0.4;
    
    this.elements = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.rafId = null;
    this.isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init(selector) {
    if (this.isReduced) {
      return this;
    }

    const targets = document.querySelectorAll(selector);
    
    targets.forEach(target => {
      this.wrapCharacters(target);
    });

    this.bindEvents();
    this.startLoop();
    
    return this;
  }

  wrapCharacters(element) {
    const text = element.textContent;
    const lines = element.querySelectorAll('.hero__line');
    
    if (lines.length > 0) {
      // Handle multi-line hero titles
      lines.forEach(line => {
        this.wrapLine(line);
      });
    } else {
      // Handle single text block
      this.wrapLine(element);
    }
  }

  wrapLine(element) {
    const text = element.textContent;
    element.innerHTML = '';
    element.setAttribute('aria-label', text);
    
    const chars = [];
    
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.className = 'kinetic-char';
      span.style.cssText = `
        display: inline-block;
        transition: transform ${this.duration}s ${this.ease} ${i * this.staggerDelay}s;
        will-change: transform;
      `;
      span.setAttribute('aria-hidden', 'true');
      
      element.appendChild(span);
      chars.push(span);
    });
    
    this.elements.push({
      container: element,
      chars: chars
    });
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Handle reduced motion preference change
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.isReduced = e.matches;
      if (this.isReduced) {
        this.resetAll();
      }
    });
  }

  startLoop() {
    const update = () => {
      if (!this.isReduced) {
        this.updateCharacters();
      }
      this.rafId = requestAnimationFrame(update);
    };
    this.rafId = requestAnimationFrame(update);
  }

  updateCharacters() {
    this.elements.forEach(({ chars }) => {
      chars.forEach(char => {
        const rect = char.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        
        const dx = this.mouseX - charX;
        const dy = this.mouseY - charY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.maxDist) {
          const influence = 1 - (dist / this.maxDist);
          const moveX = -dx * influence * this.influence;
          const moveY = -dy * influence * this.influence;
          
          char.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          char.style.transform = 'translate(0, 0)';
        }
      });
    });
  }

  resetAll() {
    this.elements.forEach(({ chars }) => {
      chars.forEach(char => {
        char.style.transform = 'translate(0, 0)';
      });
    });
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    // Restore original text
    this.elements.forEach(({ container, chars }) => {
      const text = chars.map(c => c.textContent === '\u00A0' ? ' ' : c.textContent).join('');
      container.textContent = text;
    });
    
    this.elements = [];
  }
}

// Export for module systems
export { KineticText };
/*
window.KineticText = KineticText;

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.kineticTextInstance = new KineticText({
    maxDist: 150,
    influence: 0.15,
    staggerDelay: 0.02
  }).init('.kinetic-text');
});
*/
