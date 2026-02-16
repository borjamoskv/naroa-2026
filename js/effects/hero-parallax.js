/**
 * Hero Parallax + 3D Tilt Interaction
 * Adds parallax movement to hero image, fade-out on scroll,
 * and mouse-responsive 3D tilt effect.
 * 
 * @module effects/hero-parallax
 * @version 1.1.0
 */
(function () {
  'use strict';

  const PARALLAX_SPEED = 0.35;
  const FADE_START = 100;
  const FADE_END = 800;
  const TILT_MAX = 5; // Degrees

  let hero, heroImage, heroContent, notch, scrollIndicator;
  let ticking = false;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  function init() {
    hero = document.getElementById('hero-immersive');
    heroImage = document.querySelector('.hero-immersive__image');
    heroContent = document.querySelector('.hero-immersive__content');
    notch = document.querySelector('.notch');
    scrollIndicator = document.querySelector('.hero-immersive__scroll');

    if (!hero) return;

    // Use passive listener for performance
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Add mouse interaction
    hero.addEventListener('mousemove', onMouseMove, { passive: true });
    
    // Kick off loops
    requestAnimationFrame(update);
    requestAnimationFrame(smoothMouseLoop);
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function onMouseMove(e) {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Normalize to -1 to 1
    targetX = (clientX / innerWidth - 0.5) * 2;
    targetY = (clientY / innerHeight - 0.5) * 2;
  }

  function smoothMouseLoop() {
    // Basic linear interpolation for smoothness
    mouseX += (targetX - mouseX) * 0.1;
    mouseY += (targetY - mouseY) * 0.1;
    
    const rotateY = mouseX * TILT_MAX;
    const rotateX = -mouseY * TILT_MAX;

    if (heroContent) {
      // Perspective tilt for the content
      heroContent.style.transform = `translateY(${window.scrollY * 0.15}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    }
    
    if (heroImage) {
        // Subtle counter-movement for the image
        const imgX = mouseX * -15;
        const imgY = mouseY * -15;
        heroImage.style.translate = `${imgX}px ${imgY}px`;
    }

    requestAnimationFrame(smoothMouseLoop);
  }

  function update() {
    ticking = false;
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight;

    // ── Hero parallax: image moves slower than scroll ──
    if (heroImage && scrollY < viewportH) {
      const translateY = scrollY * PARALLAX_SPEED;
      // We keep the scale slightly above 1 to cover the edges during tilt
      heroImage.style.transform = `scale(1.15) translateY(${translateY}px)`;
    }

    // ── Hero content fade-out on scroll ──
    if (heroContent && scrollY < FADE_END) {
      const opacity = Math.max(0, 1 - (scrollY - FADE_START) / (FADE_END - FADE_START));
      heroContent.style.opacity = opacity;
    }

    // ── Scroll indicator hide ──
    if (scrollIndicator) {
      scrollIndicator.style.opacity = scrollY > 50 ? '0' : '1';
    }

    // ── Notch shrink behavior (if linked) ──
    if (notch) {
      if (scrollY > 80) {
        notch.classList.add('scrolled');
      } else {
        notch.classList.remove('scrolled');
      }
    }
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

