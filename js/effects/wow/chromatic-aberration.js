/**
 * WOW 2: CHROMATIC ABERRATION — RGB split on fast scroll
 * Scroll rápido = canales RGB se separan. Lento = imagen perfecta.
 * Intención: premiar la contemplación, penalizar la prisa.
 * @module effects/wow/chromatic-aberration
 */
export const ChromaticAberration = {
  lastScroll: 0,
  velocity: 0,

  init() {
    let lastY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          this.velocity = Math.abs(currentY - lastY);
          lastY = currentY;
          const intensity = Math.min(this.velocity / 100, 1) * 3;
          const sections = document.querySelectorAll('.view, section');
          sections.forEach(el => {
            if (intensity > 0.1) {
              el.style.textShadow = `${intensity}px 0 rgba(255,0,60,0.15), ${-intensity}px 0 rgba(0,180,255,0.15)`;
              el.style.filter = `blur(${intensity * 0.3}px)`;
            } else {
              el.style.textShadow = 'none';
              el.style.filter = 'none';
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }
};
