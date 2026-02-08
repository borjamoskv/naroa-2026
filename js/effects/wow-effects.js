/**
 * WOW EFFECTS — Naroa 2026
 * Cursor spotlight, ambient particles, 3D tilt, parallax
 * Merged from naroa-floating-gallery
 */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

// ─── Cursor Spotlight ───
function initCursorLight() {
  if (IS_MOBILE || REDUCED_MOTION) return;

  const light = document.getElementById('cursorLight');
  if (!light) return;

  document.addEventListener('mousemove', (e) => {
    light.style.left = e.clientX + 'px';
    light.style.top = e.clientY + 'px';
  });

  document.addEventListener('mouseleave', () => {
    light.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    light.style.opacity = '1';
  });
}

// ─── Ambient Particles ───
function initParticles() {
  if (REDUCED_MOTION) return;

  const container = document.getElementById('particles');
  if (!container) return;

  const count = IS_MOBILE ? 10 : 30;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 20 + 's';
    p.style.animationDuration = (15 + Math.random() * 10) + 's';
    container.appendChild(p);
  }
}

// ─── 3D Tilt on Gallery Cards ───
function init3DTilt() {
  if (IS_MOBILE || REDUCED_MOTION) return;

  // Target both gallery items and video cards
  const cards = document.querySelectorAll('.gallery__item, .video-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// ─── Hero Parallax ───
function initParallax() {
  if (IS_MOBILE || REDUCED_MOTION) return;

  const hero = document.querySelector('.hero-content, .hero__content, [class*="hero"]');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    hero.style.opacity = Math.max(0, 1 - (scrolled / 700));
  }, { passive: true });
}

// ─── Initialize All ───
export function initWowEffects() {
  initCursorLight();
  initParticles();
  initParallax();

  // 3D tilt needs gallery items to exist — observe DOM
  const galleryObserver = new MutationObserver(() => {
    if (document.querySelectorAll('.gallery__item').length > 0) {
      init3DTilt();
      galleryObserver.disconnect();
    }
  });

  galleryObserver.observe(document.body, { childList: true, subtree: true });

  // Also try immediately in case gallery is already rendered
  if (document.querySelectorAll('.gallery__item').length > 0) {
    init3DTilt();
    galleryObserver.disconnect();
  }
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWowEffects);
} else {
  initWowEffects();
}

console.log('✨ WOW Effects initialized');
