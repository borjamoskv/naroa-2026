/**
 * WOW 3: AMBIENT LIGHT BLEED — Artwork colors leak
 * Extrae el color dominante de la obra visible y lo proyecta
 * como luz ambiental en los bordes de la pantalla.
 * @module effects/wow/ambient-light
 */
export const AmbientLightBleed = {
  currentColor: { r: 0, g: 0, b: 0 },
  targetColor: { r: 0, g: 0, b: 0 },
  overlay: null,

  artworkPalettes: {
    james:   { r: 200, g: 50, b: 30 },
    amy:     { r: 139, g: 92, b: 246 },
    johnny:  { r: 40, g: 120, b: 200 },
    marilyn: { r: 220, g: 60, b: 100 },
    default: { r: 180, g: 140, b: 80 }
  },

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'ambient-light-bleed';
    this.overlay.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;transition:opacity 2s ease;mix-blend-mode:soft-light;`;
    document.body.appendChild(this.overlay);
    this.observeSlides();
    this.animate();
  },

  observeSlides() {
    const observer = new MutationObserver(() => {
      const activeSlide = document.querySelector('.hero__slide.active');
      if (activeSlide) {
        const artwork = activeSlide.dataset.artwork || 'default';
        this.targetColor = this.artworkPalettes[artwork] || this.artworkPalettes.default;
        this.overlay.style.opacity = '0.4';
      }
    });
    const slider = document.getElementById('hero-slider');
    if (slider) {
      observer.observe(slider, { subtree: true, attributes: true, attributeFilter: ['class'] });
      const active = slider.querySelector('.hero__slide.active');
      if (active) {
        this.targetColor = this.artworkPalettes[active.dataset.artwork || 'default'] || this.artworkPalettes.default;
        this.overlay.style.opacity = '0.4';
      }
    }
  },

  animate() {
    this.currentColor.r += (this.targetColor.r - this.currentColor.r) * 0.02;
    this.currentColor.g += (this.targetColor.g - this.currentColor.g) * 0.02;
    this.currentColor.b += (this.targetColor.b - this.currentColor.b) * 0.02;
    const r = Math.round(this.currentColor.r);
    const g = Math.round(this.currentColor.g);
    const b = Math.round(this.currentColor.b);
    if (this.overlay) {
      this.overlay.style.background = `
        radial-gradient(ellipse at 0% 50%, rgba(${r},${g},${b},0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 50%, rgba(${r},${g},${b},0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 0%, rgba(${r},${g},${b},0.15) 0%, transparent 40%)
      `;
    }
    requestAnimationFrame(() => this.animate());
  }
};
