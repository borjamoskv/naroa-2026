/**
 * Morph Transition — Sovereign View Transitions
 * Uses clip-path circle/polygon animations for fluid section changes.
 */

export default class MorphTransition {
  constructor() {
    this.overlay = null;
    this.isAnimating = false;
    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'morph-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '19999',
      pointerEvents: 'none',
      background: '#0A0A0A',
      clipPath: 'circle(0% at 50% 50%)',
      transition: 'clip-path 0.6s cubic-bezier(0.77, 0, 0.175, 1)',
      opacity: '0'
    });
    document.body.appendChild(this.overlay);
  }

  async play(callback) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Expand
    this.overlay.style.opacity = '1';
    this.overlay.style.pointerEvents = 'all';
    this.overlay.style.clipPath = 'circle(150% at 50% 50%)';

    await this.wait(600);

    // Execute route change
    if (callback) callback();

    await this.wait(100);

    // Contract
    this.overlay.style.clipPath = 'circle(0% at 50% 50%)';

    await this.wait(600);

    this.overlay.style.opacity = '0';
    this.overlay.style.pointerEvents = 'none';
    this.isAnimating = false;
  }

  wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}
