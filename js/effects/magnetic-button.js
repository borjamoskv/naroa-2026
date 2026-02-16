/**
 * Magnetic Buttons v3 - SOTY 2026
 * Elastic cursor attraction with golden halo effect
 * 
 * Features:
 * - GPU-accelerated transforms
 * - Spring-based easing
 * - Golden border reveal on hover
 * - Full accessibility support
 * 
 * @see Premium Effects Library 2026 #37
 */

class MagneticButton {
  constructor(options = {}) {
    this.attraction = options.attraction || 0.2;
    this.ease = options.ease || 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    this.duration = options.duration || 0.4;
    
    this.buttons = [];
    this.isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init(selector = '.magnetic-btn') {
    if (this.isReduced) {
      return this;
    }

    const targets = document.querySelectorAll(selector);
    
    targets.forEach(btn => {
      this.setupButton(btn);
    });

    // Handle reduced motion preference change
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.isReduced = e.matches;
      if (this.isReduced) {
        this.resetAll();
      }
    });
    
    return this;
  }

  setupButton(btn) {
    const boundMouseMove = (e) => this.onMouseMove(e, btn);
    const boundMouseLeave = () => this.onMouseLeave(btn);
    
    btn.addEventListener('mousemove', boundMouseMove);
    btn.addEventListener('mouseleave', boundMouseLeave);
    
    // Ensure GPU acceleration
    btn.style.willChange = 'transform';
    btn.style.transition = `transform ${this.duration}s ${this.ease}`;
    
    this.buttons.push({
      element: btn,
      handlers: { move: boundMouseMove, leave: boundMouseLeave }
    });
  }

  onMouseMove(e, btn) {
    if (this.isReduced) return;
    
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) * this.attraction;
    const y = (e.clientY - centerY) * this.attraction;
    
    btn.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
  }

  onMouseLeave(btn) {
    btn.style.transform = 'translate(0, 0) scale(1)';
  }

  resetAll() {
    this.buttons.forEach(({ element }) => {
      element.style.transform = 'translate(0, 0) scale(1)';
    });
  }

  destroy() {
    this.buttons.forEach(({ element, handlers }) => {
      element.removeEventListener('mousemove', handlers.move);
      element.removeEventListener('mouseleave', handlers.leave);
      element.style.willChange = '';
      element.style.transform = '';
    });
    
    this.buttons = [];
  }
}

// Export for module systems
export { MagneticButton };
/*
window.MagneticButton = MagneticButton;

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.magneticButtonInstance = new MagneticButton({
    attraction: 0.2
  }).init('.magnetic-btn');
});
*/
