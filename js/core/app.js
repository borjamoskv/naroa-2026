/**
 * App - Main application bootstrap for Naroa 2026
 * @module core/app
 */

(function() {
  'use strict';

  // ===========================================
  // CONFIGURATION
  // ===========================================
  
  const CONFIG = {
    imagesPath: 'images/artworks/',
    thumbnailsPath: 'images/thumbnails/',
    lazyLoadMargin: '200px',
    animationDuration: 300
  };

  // ===========================================
  // ROUTE REGISTRATION
  // ===========================================

  function registerRoutes() {
    const router = window.Router;

    router
      .register('#/', () => {
        router.showView('view-home');
      })
      .register('#/portfolio', () => {
        router.showView('view-portfolio');
        loadPortfolio();
      })
      .register('#/galeria', () => {
        router.showView('view-galeria');
        loadGallery();
      })
      .register('#/about', () => {
        router.showView('view-about');
      })
      .register('#/contacto', () => {
        router.showView('view-contacto');
      });

    // Lifecycle hooks
    router.beforeEach = (to, from) => {
      document.body.classList.add('navigating');
    };

    router.afterEach = (to, from) => {
      setTimeout(() => {
        document.body.classList.remove('navigating');
      }, CONFIG.animationDuration);
      
      // Scroll to top on route change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    router.init();
  }

  // ===========================================
  // MOBILE NAVIGATION
  // ===========================================

  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.querySelector('.nav__menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    // Close menu on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('active');
      });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.classList.remove('active');
      }
    });
  }

  // ===========================================
  // PLACEHOLDER LOADERS (to be expanded)
  // ===========================================

  function loadPortfolio() {
    console.log('[App] Loading portfolio...');
    // Gallery module will handle this
    if (window.Gallery) {
      window.Gallery.loadPortfolio();
    }
  }

  function loadGallery() {
    console.log('[App] Loading gallery...');
    // Gallery module will handle this
    if (window.Gallery) {
      window.Gallery.loadGallery();
    }
  }

  // ===========================================
  // INITIALIZATION
  // ===========================================

  function init() {
    console.log('[Naroa 2026] Initializing...');
    
    registerRoutes();
    initMobileNav();

    // Initialize other modules when ready
    if (window.Lightbox) {
      window.Lightbox.init();
    }

    console.log('[Naroa 2026] Ready ✨');
  }

  // Boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
