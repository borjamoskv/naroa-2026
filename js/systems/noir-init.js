/**
 * Industrial Noir — Effect Initialization
 * =========================================
 * Standalone init to activate WebGL signature effects
 * Loads after system scripts via defer ordering
 * 
 * @module systems/noir-init
 */

(function initNoirEffects() {
  'use strict';

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function activate() {
    // Industrial Noir systems activating silently

    // 1. PaperParallax — depth texture layers on body
    if (window.PaperParallax && window.PaperParallax.init) {
      try {
        window.PaperParallax.init(document.body);
        // PaperParallax initialized
      } catch (e) {
        Logger.warn('[Noir] PaperParallax error:', e.message);
      }
    }

    // 2. PigmentTrail — organic cursor particles
    if (window.PigmentTrail && window.PigmentTrail.init) {
      try {
        window.PigmentTrail.init(document.body);
        // PigmentTrail initialized
      } catch (e) {
        Logger.warn('[Noir] PigmentTrail error:', e.message);
      }
    }

    // 3. MicaReactive — shimmer particles on notch
    const notch = document.querySelector('.notch');
    if (notch && window.MicaReactive && window.MicaReactive.init) {
      try {
        window.MicaReactive.init(notch);
        // MicaReactive initialized
      } catch (e) {
        Logger.warn('[Noir] MicaReactive error:', e.message);
      }
    }

    // 4. CharcoalShader — texture overlays on gallery images
    if (window.CharcoalShader) {
      setTimeout(() => {
        const galleryImgs = document.querySelectorAll('.gallery-massive__img');
        galleryImgs.forEach(img => {
          if (img.dataset.charcoalApplied) return;
          const wrapper = img.parentElement;
          if (!wrapper) return;

          const canvas = document.createElement('canvas');
          canvas.className = 'charcoal-overlay';
          canvas.width = img.naturalWidth || 400;
          canvas.height = img.naturalHeight || 400;

          wrapper.addEventListener('mouseenter', () => canvas.style.opacity = '0.7');
          wrapper.addEventListener('mouseleave', () => canvas.style.opacity = '0.4');
          wrapper.style.position = 'relative';
          wrapper.appendChild(canvas);

          const applyShader = () => {
            try {
              if (window.CharcoalShader.init) window.CharcoalShader.init(canvas);
              if (window.CharcoalShader.apply) window.CharcoalShader.apply(img);
            } catch (e) { Logger.warn('[Noir] CharcoalShader init error:', e.message); }
          };

          if (img.complete) applyShader();
          else img.addEventListener('load', applyShader, { once: true });

          img.dataset.charcoalApplied = 'true';
        });
        // CharcoalShader applied to gallery
      }, 800);
    }

    // All Industrial Noir systems initialized
  }

  // Wait for DOM + module scripts to register globals
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(activate, 300));
  } else {
    setTimeout(activate, 300);
  }
})();
