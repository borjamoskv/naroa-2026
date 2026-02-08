/**
 * Progressive Hero Loader
 * Shows blur placeholder instantly, then fades in the web-optimized image.
 * 4 Rocks Series: James Dean, Amy Winehouse, Johnny Depp, Marilyn Monroe
 */
(function() {
  'use strict';

  const HERO_IMAGES = [
    { blur: 'images/artworks/blur-james.webp',   web: 'images/artworks/web-james.webp' },
    { blur: 'images/artworks/blur-amy.webp',     web: 'images/artworks/web-amy.webp' },
    { blur: 'images/artworks/blur-johnny.webp',  web: 'images/artworks/web-johnny.webp' },
    { blur: 'images/artworks/blur-marilyn.webp', web: 'images/artworks/web-marilyn.webp' }
  ];

  function init() {
    const slides = document.querySelectorAll('.hero__slide');
    if (!slides.length) return;

    slides.forEach((slide, i) => {
      if (i >= HERO_IMAGES.length) return;
      const tier = HERO_IMAGES[i];

      // Set blur placeholder with artistic effect
      slide.style.backgroundImage = `url('${tier.blur}')`;
      slide.style.backgroundSize = 'cover';
      slide.style.backgroundPosition = 'center';
      slide.style.filter = 'blur(20px)';
      slide.style.transform = 'scale(1.1)';
      slide.style.transition = 'filter 0.8s ease-out, transform 0.8s ease-out';

      // Load first slide immediately, lazy-load rest
      if (i === 0) {
        loadWebImage(slide, tier);
      } else {
        // Load when slide becomes active
        const observer = new MutationObserver(() => {
          if (slide.classList.contains('active') && !slide.dataset.loaded) {
            loadWebImage(slide, tier);
            observer.disconnect();
          }
        });
        observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
        
        // Preload after staggered delay anyway
        setTimeout(() => {
          if (!slide.dataset.loaded) {
            loadWebImage(slide, tier);
            observer.disconnect();
          }
        }, 2000 + (i * 1500));
      }
    });
  }

  function loadWebImage(slide, tier) {
    const img = new Image();
    img.onload = () => {
      slide.style.backgroundImage = `url('${tier.web}')`;
      slide.style.filter = 'none';
      slide.style.transform = 'scale(1)';
      slide.dataset.loaded = 'true';
    };
    img.src = tier.web;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
