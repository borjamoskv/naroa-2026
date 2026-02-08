/**
 * Rocks Showcase — Cinematic Parallax + Reveal
 * Handles scroll-driven animations for the Rocks Series section
 */
(function() {
  'use strict';

  function initRocksShowcase() {
    const panels = document.querySelectorAll('.rock-panel');
    if (!panels.length) return;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Reveal Observer
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });

    panels.forEach(panel => revealObserver.observe(panel));

    // 2. Parallax (skip if reduced motion)
    if (!isReducedMotion) {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        
        requestAnimationFrame(() => {
          panels.forEach(panel => {
            const rect = panel.getBoundingClientRect();
            const vh = window.innerHeight;
            
            // Only process panels near viewport
            if (rect.top < vh * 1.5 && rect.bottom > -vh * 0.5) {
              const progress = (vh - rect.top) / (vh + rect.height);
              const translateY = (progress - 0.5) * -40; // -20px to +20px
              
              const imgWrap = panel.querySelector('.rock-panel__image-wrap');
              if (imgWrap && panel.classList.contains('revealed')) {
                imgWrap.style.transform = `translateY(${translateY}px)`;
              }
            }
          });
          ticking = false;
        });
      }, { passive: true });
    }

    // 3. Lazy load images
    const lazyImages = document.querySelectorAll('.rock-panel__img[data-src]');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '200px 0px'
    });

    lazyImages.forEach(img => imgObserver.observe(img));
  }

  // Init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRocksShowcase);
  } else {
    initRocksShowcase();
  }
})();
