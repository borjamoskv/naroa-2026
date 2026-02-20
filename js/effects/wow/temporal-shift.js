/**
 * WOW 10: TEMPORAL SHIFT — La hora del día cambia la estética
 * Amanecer = cálido dorado. Noche = azul profundo.
 * Intención: la web es un organismo vivo que respira el tiempo.
 * @module effects/wow/temporal-shift
 */
export const TemporalShift = {
  palettes: {
    dawn:      { filter: 'sepia(0.08) hue-rotate(-10deg)',  accent: '#ff9f43', bg: '#1a1510' },
    morning:   { filter: 'saturate(1.05)',                   accent: '#feca57', bg: '#0f0f12' },
    noon:      { filter: 'saturate(1.1) contrast(1.02)',     accent: '#ff6348', bg: '#0a0a0f' },
    afternoon: { filter: 'sepia(0.04) saturate(1.05)',       accent: '#e17055', bg: '#0d0a0f' },
    golden:    { filter: 'sepia(0.12) saturate(1.15)',       accent: '#f0932b', bg: '#120e08' },
    dusk:      { filter: 'hue-rotate(10deg) saturate(1.1)',  accent: '#e056a0', bg: '#0f0812' },
    night:     { filter: 'saturate(0.85) brightness(0.95)',  accent: '#7c5cbf', bg: '#06060c' },
    midnight:  { filter: 'saturate(0.7) brightness(0.9)',    accent: '#3d5af1', bg: '#04040a' }
  },

  init() {
    const hour = new Date().getHours();
    let period;
    if (hour >= 5 && hour < 7)       period = 'dawn';
    else if (hour >= 7 && hour < 10)  period = 'morning';
    else if (hour >= 10 && hour < 13) period = 'noon';
    else if (hour >= 13 && hour < 17) period = 'afternoon';
    else if (hour >= 17 && hour < 19) period = 'golden';
    else if (hour >= 19 && hour < 21) period = 'dusk';
    else if (hour >= 21 || hour < 1)  period = 'night';
    else                               period = 'midnight';

    const palette = this.palettes[period];
    const root = document.documentElement;
    root.style.setProperty('--temporal-filter', palette.filter);
    root.style.setProperty('--temporal-accent', palette.accent);
    root.style.setProperty('--temporal-bg', palette.bg);
    document.body.style.filter = palette.filter;
  }
};
