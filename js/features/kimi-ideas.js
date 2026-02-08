/**
 * ═══════════════════════════════════════════════════════════════════
 * KIMI K2.5 CREATIVE IDEAS — Interactive Features
 * 9 Features: Firma, Precios, Coleccionista, MICA Contextual,
 *              Lupa, Parallax, Transición Circular, Pinch, Swipe
 * ═══════════════════════════════════════════════════════════════════
 */

const KimiIdeas = {
  isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isMobile: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  favorites: [],

  // ════════════════════════════════════════════
  // INIT ALL
  // ════════════════════════════════════════════
  init() {
    console.log('🎨 Kimi Ideas initializing...');
    this.initCollectorMode();      // #10
    this.initCursorLens();         // #2
    this.initParallaxScroll();     // #1
    this.initBurnTransition();     // #5
    this.initMicaContextual();     // #6
    this.initSwipeGallery();       // #8 + #3 (pinch)
    this.createFavoritesBar();     // #8 UI
    console.log('🎨 Kimi Ideas ready — 9 features loaded');
  },

  // ════════════════════════════════════════════
  // #10 COLLECTOR MODE — Toggle tech specs
  // ════════════════════════════════════════════
  initCollectorMode() {
    // Create toggle button
    const toggle = document.createElement('button');
    toggle.className = 'collector-toggle';
    toggle.setAttribute('aria-label', 'Modo Coleccionista');
    toggle.innerHTML = `
      <span class="collector-toggle__icon">🔍</span>
      <span>Coleccionista</span>
    `;
    document.body.appendChild(toggle);

    toggle.addEventListener('click', () => {
      document.body.classList.toggle('collector');
      const isActive = document.body.classList.contains('collector');
      toggle.setAttribute('aria-pressed', isActive);
    });
  },

  // ════════════════════════════════════════════
  // #2 CURSOR LENS — Zoom on gallery hover
  // ════════════════════════════════════════════
  initCursorLens() {
    if (this.isMobile) return; // No cursor on mobile

    const lens = document.createElement('div');
    lens.className = 'cursor-lens';
    const lensImg = document.createElement('img');
    lensImg.className = 'cursor-lens__img';
    lens.appendChild(lensImg);
    document.body.appendChild(lens);

    let currentItem = null;
    const LENS_SIZE = 140;
    const ZOOM = 2.5;

    document.addEventListener('mousemove', (e) => {
      if (!currentItem) return;
      
      lens.style.left = e.clientX + 'px';
      lens.style.top = e.clientY + 'px';

      const img = currentItem.querySelector('img');
      if (!img) return;

      const rect = currentItem.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      // Position zoomed image inside lens
      const imgW = rect.width * ZOOM;
      const imgH = rect.height * ZOOM;
      lensImg.style.width = imgW + 'px';
      lensImg.style.height = imgH + 'px';
      lensImg.style.left = (LENS_SIZE / 2 - relX * imgW) + 'px';
      lensImg.style.top = (LENS_SIZE / 2 - relY * imgH) + 'px';
    });

    // Delegate hover on gallery items
    document.addEventListener('mouseenter', (e) => {
      const item = e.target.closest('.gallery__item');
      if (!item) return;
      const img = item.querySelector('img');
      if (!img || !img.src) return;

      currentItem = item;
      lensImg.src = img.src;
      lens.classList.add('active');
    }, true);

    document.addEventListener('mouseleave', (e) => {
      const item = e.target.closest('.gallery__item');
      if (item && item === currentItem) {
        currentItem = null;
        lens.classList.remove('active');
      }
    }, true);
  },

  // ════════════════════════════════════════════
  // #1 PARALLAX SCROLL — Depth on gallery items
  // ════════════════════════════════════════════
  initParallaxScroll() {
    if (this.isReducedMotion) return;

    // Assign random subtle speeds to gallery items
    const assignSpeeds = () => {
      const items = document.querySelectorAll('.gallery__item:not([data-speed])');
      items.forEach((item, i) => {
        const speed = ((i % 3) - 1) * 0.03; // -0.03, 0, 0.03
        item.dataset.speed = speed;
      });
    };

    // Watch for new gallery items
    const observer = new MutationObserver(assignSpeeds);
    observer.observe(document.body, { childList: true, subtree: true });
    assignSpeeds();

    // Scroll handler
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        document.querySelectorAll('[data-speed]').forEach(el => {
          const speed = parseFloat(el.dataset.speed);
          if (speed !== 0) {
            el.style.transform = `translateY(${scrollY * speed}px)`;
          }
        });
        ticking = false;
      });
    });
  },

  // ════════════════════════════════════════════
  // #5 BURN TRANSITION — Circular reveal
  // ════════════════════════════════════════════
  initBurnTransition() {
    if (this.isReducedMotion) return;

    const overlay = document.createElement('div');
    overlay.className = 'burn-transition';
    document.body.appendChild(overlay);

    // Intercept nav link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#/"]');
      if (!link) return;

      const href = link.getAttribute('href');
      const currentHash = window.location.hash || '#/';
      if (href === currentHash) return;

      e.preventDefault();

      // Set origin point
      const rect = link.getBoundingClientRect();
      const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
      
      overlay.style.setProperty('--burn-x', x + '%');
      overlay.style.setProperty('--burn-y', y + '%');

      // Phase 1: expand orange circle
      overlay.classList.remove('fading');
      overlay.classList.add('expanding');

      // Phase 2: navigate + fade
      setTimeout(() => {
        window.location.hash = href;
        overlay.classList.add('fading');
        
        setTimeout(() => {
          overlay.classList.remove('expanding', 'fading');
        }, 350);
      }, 500);
    });
  },

  // ════════════════════════════════════════════
  // #6 MICA CONTEXTUAL — Art insights
  // ════════════════════════════════════════════
  initMicaContextual() {
    // Artwork insights database
    const insights = {
      'cantinflas': '🎨 Serie "Cantinflas" — 5 piezas de mixed-media que capturan la esencia del humor mexicano a través del hiperrealismo POP',
      'rocks': '🎸 Serie "Rocks" — Iconos del rock retratados con materiales mixtos y texturas experimentales',
      'espejos-del-alma': '👁️ "Espejos del Alma" — Exploración de la mirada como ventana interior, técnica mixta sobre lienzo',
      'enlatas': '🥫 Serie "En.lata.das" — Collages que recontextualizan retratos dentro de envases de conserva',
      'golden': '✨ Serie "Golden" — Oro y brillo como metáfora del amor y la celebración',
      'amor': '❤️ Serie "Amor" — El sentimiento universal explorado en múltiples técnicas y estilos',
      'retratos': '🖼️ Retratos — Hiperrealismo puro trasladado al POP con materiales mixtos',
      'tributos-musicales': '🎵 Tributos Musicales — Homenajes a figuras icónicas de la música mundial',
      'naturaleza': '🦜 Naturaleza — Fauna y flora con la intensidad del hiperrealismo POP',
      'walking-gallery': '🚶‍♀️ Walking Gallery — Arte portable, galerías en movimiento',
      'bodas': '💍 Bodas — Retratos nupciales con toque POP artístico'
    };

    // Create bubble
    const bubble = document.createElement('div');
    bubble.className = 'mica-context-bubble';
    bubble.innerHTML = `
      <div class="mica-context-bubble__label">MICA dice</div>
      <div class="mica-context-bubble__text"></div>
    `;
    document.body.appendChild(bubble);

    const textEl = bubble.querySelector('.mica-context-bubble__text');
    let hideTimeout;
    let lastSeries = '';

    // Observe gallery items entering viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const item = entry.target;
        const img = item.querySelector('img');
        
        // Try to get series from data attribute or image filename
        let series = item.dataset.series;
        if (!series && img) {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
          const filename = src.split('/').pop().replace(/\.(webp|jpg|png)$/, '');
          // Match known series
          for (const key of Object.keys(insights)) {
            if (filename.toLowerCase().includes(key.replace(/-/g, ''))) {
              series = key;
              break;
            }
          }
          // Check by prefix
          if (!series) {
            if (filename.startsWith('cantinflas')) series = 'cantinflas';
            else if (filename.includes('rocks')) series = 'rocks';
            else if (filename.includes('golden')) series = 'golden';
            else if (filename.includes('love') || filename.includes('amor')) series = 'amor';
          }
        }

        if (series && series !== lastSeries && insights[series]) {
          lastSeries = series;
          textEl.textContent = insights[series];
          bubble.classList.add('visible');

          clearTimeout(hideTimeout);
          hideTimeout = setTimeout(() => {
            bubble.classList.remove('visible');
          }, 5000);
        }
      });
    }, { threshold: 0.6 });

    // Observe existing + newly added gallery items
    const observeItems = () => {
      document.querySelectorAll('.gallery__item').forEach(item => {
        if (!item.dataset.micaObserved) {
          item.dataset.micaObserved = 'true';
          observer.observe(item);
        }
      });
    };

    const mutObserver = new MutationObserver(observeItems);
    mutObserver.observe(document.body, { childList: true, subtree: true });
    observeItems();
  },

  // ════════════════════════════════════════════
  // #8 + #3 SWIPE GALLERY + PINCH-TO-BUY
  // ════════════════════════════════════════════
  initSwipeGallery() {
    if (!this.isMobile) return;

    let startX = 0;
    let startY = 0;
    let startDist = 0;
    let currentTarget = null;

    document.addEventListener('touchstart', (e) => {
      const item = e.target.closest('.gallery__item');
      if (!item) return;

      currentTarget = item;

      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }

      // Pinch detection (2 fingers)
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        startDist = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!currentTarget) return;

      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - startX;
        const dy = endY - startY;

        // Horizontal swipe (min 60px, max vertical 30px)
        if (Math.abs(dx) > 60 && Math.abs(dy) < 30) {
          if (dx > 0) {
            // Swipe right => save to favorites
            this.addFavorite(currentTarget);
            this.showFloatingHeart(endX, endY);
          }
          // Swipe left => just visual feedback (scroll continues naturally)
        }
      }

      currentTarget = null;
    }, { passive: true });

    // Pinch detection
    document.addEventListener('touchmove', (e) => {
      if (!currentTarget || e.touches.length !== 2) return;

      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / startDist;

      // Pinch zoom past 2.5x => open detail / inquiry
      if (scale > 2.5) {
        startDist = dist; // Reset to prevent re-triggering
        const img = currentTarget.querySelector('img');
        if (img) {
          const title = currentTarget.dataset.title || img.alt || 'Esta obra';
          this.showInquiryPrompt(title);
        }
      }
    }, { passive: true });

    // Swipe hint
    const hint = document.createElement('div');
    hint.className = 'swipe-hint';
    hint.innerHTML = '← desliza → para guardar • pinza para consultar';
    document.body.appendChild(hint);

    // Auto-dismiss hint
    setTimeout(() => hint.remove(), 8000);
  },

  // ════════════════════════════════════════════
  // FAVORITES BAR
  // ════════════════════════════════════════════
  createFavoritesBar() {
    const bar = document.createElement('div');
    bar.className = 'favorites-bar empty';
    bar.innerHTML = '<div class="favorites-bar__count">❤️ 0</div>';
    document.body.appendChild(bar);
    this.favBar = bar;
  },

  addFavorite(item) {
    const img = item.querySelector('img');
    if (!img) return;
    
    const src = img.src || img.getAttribute('data-src');
    const title = item.dataset.title || img.alt || '';
    
    // Prevent duplicates
    if (this.favorites.find(f => f.src === src)) return;

    this.favorites.push({ src, title });
    this.updateFavoritesBar();
  },

  updateFavoritesBar() {
    if (!this.favBar) return;

    const count = this.favorites.length;
    this.favBar.classList.toggle('empty', count === 0);

    // Rebuild HTML
    let html = `<div class="favorites-bar__count">❤️ ${count}</div>`;
    this.favorites.slice(-8).forEach(fav => {
      html += `
        <div class="favorites-bar__item" title="${fav.title}">
          <img src="${fav.src}" alt="${fav.title}" loading="lazy">
        </div>
      `;
    });
    this.favBar.innerHTML = html;
  },

  showFloatingHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = '❤️';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 900);
  },

  showInquiryPrompt(title) {
    // Check if MICA chatbot exists
    const micaInput = document.querySelector('#mica-input');
    if (micaInput) {
      micaInput.value = `Me interesa la obra "${title}". ¿Puedo tener más información?`;
      micaInput.focus();
      // Open MICA if closed
      const micaPanel = document.querySelector('#mica-panel, .mica-panel');
      if (micaPanel) micaPanel.classList.add('open');
    } else {
      // Fallback: scroll to contacto
      window.location.hash = '#/contacto';
    }
  }
};

// Auto-init after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => KimiIdeas.init());
} else {
  KimiIdeas.init();
}

window.KimiIdeas = KimiIdeas;
