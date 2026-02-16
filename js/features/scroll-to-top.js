/**
 * ScrollToTop Module
 */
export const ScrollToTop = {
  init() {
    const btn = document.createElement('button');
    btn.className = 'scroll-to-top';
    btn.setAttribute('aria-label', 'Volver arriba');
    btn.setAttribute('title', 'Volver arriba');
    document.body.appendChild(btn);
    
    let ticking = false;
    const THRESHOLD = 300;
    
    const updateButton = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY > THRESHOLD) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateButton);
        ticking = true;
      }
    }, { passive: true });
    
    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      if (window.AudioSynth && !window.ImmersiveAudio?.isMuted) {
        AudioSynth.uiClick?.();
      }
    });
    
    updateButton();
  }
};
