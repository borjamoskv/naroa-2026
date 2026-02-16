import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero Animations — Cinematic Entry & Parallax
 * @module effects/hero-animations
 */
export class HeroAnimations {
  constructor() {
    this.ui = {
      hero: document.querySelector('.hero-immersive'),
      image: document.querySelector('.hero-immersive__image'),
      title: document.querySelector('.hero-immersive__title'),
      subtitle: document.querySelector('.hero-immersive__subtitle'),
      cta: document.querySelector('.hero-immersive__cta'),
      meta: document.querySelectorAll('.hero-immersive__meta'),
      scroll: document.querySelector('.hero-immersive__scroll')
    };

    if (this.ui.hero) {
      this.init();
    }
  }

  init() {
    // Initial Reveal Timeline
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    // Reset initial states
    gsap.set(this.ui.image, { scale: 1.2, opacity: 0 });
    gsap.set([this.ui.title, this.ui.subtitle, this.ui.cta, this.ui.meta, this.ui.scroll], {
      y: 30,
      opacity: 0
    });

    // Sequence
    tl.to(this.ui.image, {
      duration: 1.8,
      scale: 1,
      opacity: 1,
      ease: 'expo.out'
    })
    .to(this.ui.title, {
      duration: 1,
      y: 0,
      opacity: 1,
      stagger: 0.1
    }, '-=1.4')
    .to([this.ui.subtitle, this.ui.cta], {
      duration: 0.8,
      y: 0,
      opacity: 1,
      stagger: 0.1
    }, '-=1')
    .to([this.ui.meta, this.ui.scroll], {
      duration: 0.8,
      y: 0,
      opacity: 1,
      stagger: 0.1
    }, '-=0.8');

    // Parallax Effect on Scroll
    gsap.to(this.ui.image, {
      scrollTrigger: {
        trigger: this.ui.hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: 100, // Parallax movement
      scale: 1.1, // Slight zoom in
      opacity: 0.5 // Fade out
    });
    
    // Text Parallax (move faster than bg)
    gsap.to(this.ui.title, {
      scrollTrigger: {
        trigger: this.ui.hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: -50,
      opacity: 0
    });
  }
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new HeroAnimations());
} else {
  new HeroAnimations();
}
