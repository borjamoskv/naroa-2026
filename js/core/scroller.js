import Lenis from 'lenis';

/**
 * Premium Smooth Scrolling — Powered by Lenis
 * @see https://github.com/studio-freight/lenis
 */
export class Scroller {
  constructor() {
    this.lenis = null;
    this.init();
  }

  init() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease out
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Sync Lenis with GSAP ScrollTrigger if present
    // requestAnimationFrame(this.raf.bind(this)); // Handled in main loop
    
    // Global RAF loop integration
    this.start();
  }

  start() {
    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  stop() {
    this.lenis?.stop();
  }

  resume() {
    this.lenis?.start();
  }
}

export const scroller = new Scroller();
