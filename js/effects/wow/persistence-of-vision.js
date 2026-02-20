/**
 * WOW 5: PERSISTENCE OF VISION — Afterimages
 * Un "fantasma" del slide anterior persiste 1.5s.
 * Intención: todo deja huella, como en la memoria.
 * @module effects/wow/persistence-of-vision
 */
export const PersistenceOfVision = {
  init() {
    const style = document.createElement('style');
    style.textContent = `
      .hero__slide { transition: opacity 0.8s ease; }
      .hero__slide.ghost { opacity: 0.25; filter: blur(4px) saturate(0.3); transition: opacity 1.5s ease, filter 1.5s ease; pointer-events: none; }
      .hero__slide.ghost-fade { opacity: 0; filter: blur(12px) saturate(0); }
    `;
    document.head.appendChild(style);

    const slider = document.getElementById('hero-slider');
    if (!slider) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.target.classList?.contains('hero__slide') && m.oldValue?.includes('active') && !m.target.classList.contains('active')) {
          m.target.classList.add('ghost');
          setTimeout(() => {
            m.target.classList.add('ghost-fade');
            setTimeout(() => m.target.classList.remove('ghost', 'ghost-fade'), 1500);
          }, 100);
        }
      });
    });

    observer.observe(slider, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });
  }
};
