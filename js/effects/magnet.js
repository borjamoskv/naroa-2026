/**
 * MAGNET INTERACTION — Naroa 2026
 * Adds magnetic pull effect to buttons and nav items
 * Part of Swarm Polish Phase
 */

export function initMagnet() {
  const magnets = document.querySelectorAll('.nav__link, .btn, .gallery-filter');
  const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (IS_MOBILE || REDUCED_MOTION) return;

  magnets.forEach(magnet => {
    magnet.addEventListener('mousemove', (e) => {
      const rect = magnet.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Magnetic pull strength
      const strength = 0.4;
      
      magnet.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    magnet.addEventListener('mouseleave', () => {
      magnet.style.transform = 'translate(0, 0)';
    });
  });

  console.log('🧲 Magnet effect initialized');
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMagnet);
} else {
  initMagnet();
}
