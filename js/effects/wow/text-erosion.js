/**
 * WOW 4: TEXT EROSION — Texto que se erosiona como piedra
 * Intención: nada es permanente — kintsugi filosófico.
 * @module effects/wow/text-erosion
 */
export const TextErosion = {
  init() {
    const style = document.createElement('style');
    style.textContent = `
      .text-erode { position: relative; display: inline-block; }
      .text-erode::after {
        content: ''; position: absolute; inset: 0; background: inherit;
        mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        mask-size: 300% 300%; animation: erode-drift 20s ease-in-out infinite alternate;
        mix-blend-mode: multiply; opacity: 0.15; pointer-events: none;
      }
      @keyframes erode-drift { 0% { mask-position: 0% 0%; } 100% { mask-position: 100% 100%; } }
      .text-erode-reveal { clip-path: inset(0 100% 0 0); transition: clip-path 1.5s cubic-bezier(0.22, 1, 0.36, 1); }
      .text-erode-reveal.in-viewport { clip-path: inset(0 0% 0 0); }
    `;
    document.head.appendChild(style);
    document.querySelectorAll('h2, .section-title, .hero__title').forEach(el => el.classList.add('text-erode'));
  }
};
