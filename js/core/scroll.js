import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Naroa 2026 - Luxury Smooth Scroll
 * Powered by Lenis + GSAP Integration
 */

gsap.registerPlugin(ScrollTrigger);

class SmoothScrollSystem {
  constructor() {
    this.lenis = null;
    this.init();
  }

  init() {
    // Initialize Lenis with "luxury" settings
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Sync Lenis with GSAP ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);

    // GSAP Ticker for high-performance RAF
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    // Disable lag smoothing for instant response
    gsap.ticker.lagSmoothing(0);

    // Access for other modules
    window.NaroaScroll = this.lenis;
    
  }

  // Method to programmatically scroll
  scrollTo(target, options = {}) {
    this.lenis.scrollTo(target, options);
  }
}

// Auto-start
new SmoothScrollSystem();
