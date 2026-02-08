/**
 * 360° Scroll Navigation Controller
 * Organic, earthy scroll experience:
 * - IntersectionObserver syncs URL hash with scroll position
 * - % page discovered indicator (replaces dots)
 * - Scroll-driven reveal animations
 * - No perfect circles, no right angles — petrichor
 */

(function() {
  'use strict';

  const SECTIONS = [
    { id: 'view-home',         hash: '#/',            label: 'Inicio' },
    { id: 'view-galeria',      hash: '#/galeria',     label: 'Galería' },
    { id: 'view-archivo',      hash: '#/archivo',     label: 'Archivo' },
    { id: 'view-destacada',    hash: '#/destacada',   label: 'Destacada' },
    { id: 'view-exposiciones', hash: '#/exposiciones', label: 'Expos' },
    { id: 'view-sobre-mi',    hash: '#/sobre-mi',    label: 'Sobre Mí' },
    { id: 'view-contacto',    hash: '#/contacto',    label: 'Contacto' },
    { id: 'view-juegos',      hash: '#/juegos',      label: 'Juegos' }
  ];

  let isScrollingProgrammatically = false;
  let scrollTimeout = null;
  let discoveredSections = new Set();

  // ==========================================
  // 1. BUILD % DISCOVERED INDICATOR
  // ==========================================
  function buildIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-discovery';
    indicator.setAttribute('aria-label', 'Porcentaje de página descubierta');
    indicator.innerHTML = `
      <div class="scroll-discovery__fill"></div>
      <span class="scroll-discovery__text">0%</span>
    `;

    // Inject organic styles
    const style = document.createElement('style');
    style.textContent = `
      .scroll-discovery {
        position: fixed;
        bottom: 28px;
        right: 24px;
        z-index: 800;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px 6px 8px;
        background: rgba(15, 12, 8, 0.7);
        border: 1px solid rgba(212, 175, 55, 0.15);
        border-radius: 14px 8px 12px 6px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        pointer-events: none;
        transition: opacity 0.6s ease, transform 0.4s ease;
        opacity: 0;
        transform: translateY(8px);
      }
      .scroll-discovery.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .scroll-discovery__fill {
        width: 32px;
        height: 5px;
        background: rgba(212, 175, 55, 0.1);
        border-radius: 4px 2px 3px 2px;
        overflow: hidden;
        position: relative;
      }
      .scroll-discovery__fill::after {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 0%;
        background: linear-gradient(90deg, 
          rgba(212, 175, 55, 0.6), 
          rgba(255, 0, 60, 0.5));
        border-radius: 3px 1px 2px 1px;
        transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .scroll-discovery__text {
        font-family: 'Satoshi', sans-serif;
        font-size: 0.65rem;
        color: rgba(212, 175, 55, 0.5);
        letter-spacing: 0.5px;
        font-variant-numeric: tabular-nums;
      }
      @media (max-width: 768px) {
        .scroll-discovery {
          bottom: 16px;
          right: 12px;
          padding: 4px 10px 4px 6px;
        }
        .scroll-discovery__fill { width: 24px; }
        .scroll-discovery__text { font-size: 0.6rem; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(indicator);

    // Show after small delay
    setTimeout(() => indicator.classList.add('visible'), 1500);

    return indicator;
  }

  // ==========================================
  // 2. UPDATE DISCOVERY PERCENTAGE
  // ==========================================
  function updateDiscovery(sectionId) {
    discoveredSections.add(sectionId);
    
    // Count real sections in DOM
    const existingSections = SECTIONS.filter(s => document.getElementById(s.id));
    const total = existingSections.length || 1;
    const pct = Math.round((discoveredSections.size / total) * 100);
    
    const textEl = document.querySelector('.scroll-discovery__text');
    const fillEl = document.querySelector('.scroll-discovery__fill');
    
    if (textEl) textEl.textContent = `${pct}%`;
    if (fillEl) fillEl.style.setProperty('--fill', `${pct}%`);
    // Also set the ::after width via a CSS variable hack
    if (fillEl) {
      fillEl.style.cssText = `--fill-width: ${pct}%`;
      // Direct manipulation of pseudo-element via stylesheet
      let sheet = document.getElementById('scroll-discovery-dynamic');
      if (!sheet) {
        sheet = document.createElement('style');
        sheet.id = 'scroll-discovery-dynamic';
        document.head.appendChild(sheet);
      }
      sheet.textContent = `.scroll-discovery__fill::after { width: ${pct}%; }`;
    }
  }

  // ==========================================
  // 3. INTERSECTION OBSERVER — Hash Sync
  // ==========================================
  function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      if (isScrollingProgrammatically) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const section = SECTIONS.find(s => s.id === entry.target.id);
          if (section) {
            history.replaceState(null, '', section.hash);
            updateDiscovery(section.id);
            updateNavActive(section.hash);
          }
        }
      });
    }, {
      threshold: [0.3, 0.6],
      rootMargin: '-10% 0px -40% 0px'
    });

    SECTIONS.forEach(section => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return observer;
  }

  // ==========================================
  // 4. REVEAL ON SCROLL (in-viewport class)
  // ==========================================
  function initRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-viewport');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.view').forEach(view => {
      observer.observe(view);
    });
  }

  // ==========================================
  // 5. UPDATE NAV LINK ACTIVE STATE
  // ==========================================
  function updateNavActive(hash) {
    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('nav__link--active', href === hash);
    });
  }

  // ==========================================
  // 6. INTERCEPT NAV CLICKS → Smooth Scroll
  // ==========================================
  function interceptNavClicks() {
    document.querySelectorAll('.nav__link[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = link.getAttribute('href');
        const section = SECTIONS.find(s => s.hash === hash);
        
        if (section) {
          isScrollingProgrammatically = true;
          const target = document.getElementById(section.id);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', hash);
            updateDiscovery(section.id);
            updateNavActive(hash);
          }
          
          // Close mobile menu if open
          const navLinks = document.querySelector('.nav__links');
          const navToggle = document.querySelector('.nav__toggle');
          if (navLinks) navLinks.classList.remove('nav__links--open');
          if (navToggle) navToggle.classList.remove('nav__toggle--active');

          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            isScrollingProgrammatically = false;
          }, 1200);
        }
      });
    });
  }

  // ==========================================
  // 7. INITIAL SCROLL TO HASH ON LOAD
  // ==========================================
  function scrollToInitialHash() {
    const hash = window.location.hash || '#/';
    const section = SECTIONS.find(s => s.hash === hash);
    
    if (section) {
      const target = document.getElementById(section.id);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
          updateDiscovery(section.id);
          updateNavActive(hash);
          // Mark all views above as in-viewport
          let found = false;
          SECTIONS.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) {
              if (!found) {
                el.classList.add('in-viewport');
                updateDiscovery(s.id);
              }
              if (s.id === section.id) found = true;
            }
          });
        }, 200);
      }
    }
  }

  // ==========================================
  // INIT
  // ==========================================
  function init() {
    // Force all views visible
    document.querySelectorAll('.view').forEach(v => {
      v.classList.add('active');
    });

    buildIndicator();
    initScrollObserver();
    initRevealObserver();
    interceptNavClicks();
    scrollToInitialHash();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Scroll360 = { init, scrollToInitialHash };

})();
