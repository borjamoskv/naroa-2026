/**
 * Cursor Spotlight Effect
 * Adds a subtle 'flashlight' glow that follows the cursor,
 * revealing Mica textures or mineral gradients.
 * 
 * @module effects/cursor-spotlight
 */
(function () {
  'use strict';

  let spotlight;
  let mouseX = 0, mouseY = 0;
  let posX = 0, posY = 0;

  function init() {
    // Create spotlight element if it doesn't exist
    spotlight = document.createElement('div');
    spotlight.className = 'cursor-spotlight';
    document.body.appendChild(spotlight);

    // Initial styles via JS to ensure connectivity
    Object.assign(spotlight.style, {
      position: 'fixed',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '1',
      opacity: '0',
      transition: 'opacity 1s ease',
      mixBlendMode: 'screen',
      left: '-200px',
      top: '-200px',
      willChange: 'transform'
    });

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    requestAnimationFrame(loop);
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (spotlight.style.opacity === '0') spotlight.style.opacity = '1';
  }

  function loop() {
    // Smooth trailing effect
    posX += (mouseX - posX) * 0.08;
    posY += (mouseY - posY) * 0.08;

    spotlight.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;

    requestAnimationFrame(loop);
  }

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
