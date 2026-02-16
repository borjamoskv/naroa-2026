/**
 * Page Transitions Engine
 * Luxury clip-path animations for seamless navigation.
 */

export class PageTransition {
  constructor() {
    this.overlay = null;
    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'page-transition-overlay';
    document.body.appendChild(this.overlay);
  }

  async play(callback) {
    if (!this.overlay) return callback();

    const tl = gsap.timeline({
      onStart: () => {
        document.body.classList.add('transition-active');
      },
      onComplete: () => {
        document.body.classList.remove('transition-active');
      }
    });

    // 1. Enter (Slide/Clip up)
    await tl.fromTo(this.overlay, 
      { translateY: '100%', clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)' },
      { translateY: '0%', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 0.8, ease: 'expo.inOut' }
    );

    // 2. Perform action (Change route / scroll)
    if (callback) await callback();

    // 3. Exit (Slide/Clip down)
    await tl.to(this.overlay, {
      translateY: '-100%',
      clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
      duration: 0.8,
      ease: 'expo.inOut',
      delay: 0.2
    });

    // Reset for next time
    gsap.set(this.overlay, { translateY: '100%' });
  }
}

// Singleton for easy access
export const transition = new PageTransition();
