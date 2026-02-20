/**
 * WOW 1: BREATH SYNC — La web respira con el usuario
 * Cada sección "inhala" (escala sutil 1.002) y "exhala" (1.0).
 * Intención: crear conexión empática inconsciente.
 * @module effects/wow/breath-sync
 */
export const BreathSync = {
  phase: 0,
  bpm: 12,

  init() {
    this.animate();
  },

  animate() {
    this.phase += (Math.PI * 2 * this.bpm) / (60 * 60);
    const breath = 1 + Math.sin(this.phase) * 0.002;
    const opacity = 0.92 + Math.sin(this.phase) * 0.08;
    document.documentElement.style.setProperty('--breath-scale', breath);
    document.documentElement.style.setProperty('--breath-opacity', opacity);
    requestAnimationFrame(() => this.animate());
  }
};
