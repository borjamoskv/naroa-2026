/**
 * Core Cursor System
 * Implements the "Stone Glow" trail effect and hover interactions.
 */

export class CursorSystem {
  constructor() {
    this.cursor = document.querySelector('.cursor-stone-glow');
    this.mouse = { x: 0, y: 0 };
    this.pos = { x: 0, y: 0 };
    this.isActive = false;
    
    // Check if touch device
    if (window.matchMedia('(pointer: coarse)').matches) {
      return; 
    }

    this.init();
  }

  init() {
    // Create cursor element if missing
    if (!this.cursor) {
      this.cursor = document.createElement('div');
      this.cursor.className = 'cursor-stone-glow';
      document.body.appendChild(this.cursor);
    }

    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      // Reveal on first move
      if (!this.isActive) {
        this.cursor.style.opacity = '1';
        this.isActive = true;
      }
    });

    // Hover effects
    const hoverSelectors = [
      'a', 'button', '[role="button"]', 
      'input', 'select', 'textarea',
      '.interactive', '.magnetic-btn',
      '.gallery-item', '.nav__link'
    ];
    
    document.querySelectorAll(hoverSelectors.join(',')).forEach(el => {
      this.attachHoverEvents(el);
    });

    // Observe future elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.matches(hoverSelectors.join(','))) {
                this.attachHoverEvents(node);
              }
              // Check children
              node.querySelectorAll(hoverSelectors.join(',')).forEach(child => {
                this.attachHoverEvents(child);
              });
            }
          });
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });

    // GSAP Animation Loop
    gsap.ticker.add(() => {
      const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
      
      this.pos.x += (this.mouse.x - this.pos.x) * dt;
      this.pos.y += (this.mouse.y - this.pos.y) * dt;
      
      // Use transform for performance
      this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
    });

    // Hide on leave
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
      this.isActive = false;
    });

    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
      this.isActive = true;
    });
  }

  attachHoverEvents(el) {
    el.addEventListener('mouseenter', () => {
      this.cursor.classList.add('cursor-stone-glow--active');
      gsap.to(this.cursor, { scale: 1.5, duration: 0.3 });
    });
    
    el.addEventListener('mouseleave', () => {
      this.cursor.classList.remove('cursor-stone-glow--active');
      gsap.to(this.cursor, { scale: 1, duration: 0.3 });
    });
  }
}

// Initialize
if (typeof gsap !== 'undefined') {
  new CursorSystem();
} else {
  // Wait for GSAP
  window.addEventListener('load', () => {
      if (typeof gsap !== 'undefined') new CursorSystem();
  });
}
