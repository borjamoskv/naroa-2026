/**
 * Reveal Observer v2 - SOTY 2026
 * Scroll-triggered staggered reveal animations
 * 
 * Features:
 * - IntersectionObserver for performance
 * - CSS variable-based stagger delays
 * - Configurable thresholds
 * - Full accessibility support
 * 
 * @see Premium Effects Library 2026 #69
 */

class RevealObserver {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.15;
    this.rootMargin = options.rootMargin || '0px 0px -50px 0px';
    this.staggerBase = options.staggerBase || 0.05;
    this.maxStagger = options.maxStagger || 0.35;
    
    this.observer = null;
    this.isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init(selector = '.reveal, .reveal-on-scroll, .reveal-stagger, .reveal-left, .reveal-scale, .gallery-reveal, .gallery-hero__artwork, .gallery-lazy') {
    if (this.isReduced) {
      // For reduced motion, show all content immediately
      document.querySelectorAll(selector).forEach(el => {
        el.classList.add('revealed');
      });
      return this;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );

    document.querySelectorAll(selector).forEach(el => {
      // Set stagger delays for children
      if (el.classList.contains('reveal-stagger')) {
        this.setStaggerDelays(el);
      }
      
      this.observer.observe(el);
    });

    // Handle reduced motion preference change
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.isReduced = e.matches;
      if (this.isReduced) {
        document.querySelectorAll('.reveal-on-scroll, .reveal-stagger').forEach(el => {
          el.classList.add('revealed');
        });
      }
    });
    
    return this;
  }

  setStaggerDelays(container) {
    const children = container.children;
    
    Array.from(children).forEach((child, index) => {
      const delay = Math.min(this.staggerBase * (index + 1), this.maxStagger);
      child.style.setProperty('--reveal-delay', `${delay}s`);
      child.style.transitionDelay = `${delay}s`;
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        entry.target.classList.add('visible');
        
        // Stop observing after reveal (one-time animation)
        this.observer.unobserve(entry.target);
      }
    });
  }

  // Add new elements dynamically
  observe(element) {
    if (this.observer && !this.isReduced) {
      if (element.classList.contains('reveal-stagger')) {
        this.setStaggerDelays(element);
      }
      this.observer.observe(element);
    } else if (this.isReduced) {
      element.classList.add('revealed');
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Export for module systems and global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RevealObserver;
}

window.RevealObserver = RevealObserver;

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.revealObserverInstance = new RevealObserver({
    threshold: 0.15,
    staggerBase: 0.05
  }).init();
});
