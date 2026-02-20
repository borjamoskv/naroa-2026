/**
 * WOW 6: PETRICHOR MOOD — El clima real cambia la paleta
 * Usa wttr.in (API pública) para ajustar la paleta global.
 * Intención: cada visita es irrepetible, como el petricor.
 * @module effects/wow/petrichor-mood
 */
export const PetrichorMood = {
  moods: {
    sunny:   { hue: 35,  sat: '70%', bg: 'rgba(255,235,180,0.05)', label: '☀️' },
    cloudy:  { hue: 220, sat: '15%', bg: 'rgba(180,190,210,0.08)', label: '☁️' },
    rainy:   { hue: 210, sat: '40%', bg: 'rgba(100,140,200,0.1)',  label: '🌧️' },
    stormy:  { hue: 260, sat: '50%', bg: 'rgba(80,60,140,0.12)',   label: '⛈️' },
    snowy:   { hue: 200, sat: '10%', bg: 'rgba(230,240,255,0.1)',  label: '❄️' },
    night:   { hue: 240, sat: '30%', bg: 'rgba(20,20,60,0.15)',    label: '🌙' },
    default: { hue: 0,   sat: '0%',  bg: 'transparent',            label: '🎨' }
  },

  async init() {
    try {
      const res = await fetch('https://wttr.in/?format=%C+%t', { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error('Weather API failed');
      const text = await res.text();
      this.applyMood(this.parseMood(text.toLowerCase()));
    } catch {
      const hour = new Date().getHours();
      this.applyMood((hour >= 21 || hour < 6) ? this.moods.night : this.moods.default);
    }
  },

  parseMood(text) {
    if (text.includes('rain') || text.includes('drizzle') || text.includes('lluvia')) return this.moods.rainy;
    if (text.includes('thunder') || text.includes('storm'))  return this.moods.stormy;
    if (text.includes('snow') || text.includes('nieve'))     return this.moods.snowy;
    if (text.includes('cloud') || text.includes('overcast') || text.includes('nub')) return this.moods.cloudy;
    if (text.includes('sun') || text.includes('clear') || text.includes('sol'))      return this.moods.sunny;
    return this.moods.default;
  },

  applyMood(mood) {
    document.documentElement.style.setProperty('--petrichor-hue', mood.hue);
    document.documentElement.style.setProperty('--petrichor-sat', mood.sat);
    const tint = document.createElement('div');
    tint.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:0;background:${mood.bg};transition:background 5s ease;`;
    document.body.prepend(tint);
  }
};
