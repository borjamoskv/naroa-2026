/**
 * App - Main application bootstrap for Naroa 2026
 * 360° Scroll Edition — all main sections visible
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
  // ROUTE REGISTRATION (360° MODE)
  // ===========================================

  function registerRoutes() {
    const router = window.Router;

    // Main scroll sections — these just scroll, no hide/show
    router
      .register('#/', () => {
        // Home — already visible, just scroll
      })
      .register('#/galeria', () => {
        loadArchive();
      })
      .register('#/archivo', () => {
        loadArchive();
      })
      .register('#/about', () => {
        // Already visible in scroll
      })
      .register('#/contacto', () => {
        loadContactoPanel();
      })
      // Game overlay routes
      .register('#/juegos', () => {
        router.showView('view-juegos');
      })
      .register('#/juego', () => {
        router.showView('view-juego');
        loadGame();
      })
      .register('#/tetris', () => {
        router.showView('view-tetris');
        loadTetris();
      })
      .register('#/memory', () => {
        router.showView('view-memory');
        if (window.MemoryGame) window.MemoryGame.init();
      })
      .register('#/puzzle', () => {
        router.showView('view-puzzle');
        if (window.PuzzleGame) window.PuzzleGame.init();
      })
      .register('#/snake', () => {
        router.showView('view-snake');
        if (window.SnakeGame) window.SnakeGame.init();
      })
      .register('#/breakout', () => {
        router.showView('view-breakout');
        if (window.BreakoutGame) window.BreakoutGame.init();
      })
      .register('#/whack', () => {
        router.showView('view-whack');
        if (window.WhackGame) window.WhackGame.init();
      })
      .register('#/simon', () => {
        router.showView('view-simon');
        if (window.SimonGame) window.SimonGame.init();
      })
      .register('#/quiz', () => {
        router.showView('view-quiz');
        if (window.QuizGame) window.QuizGame.init();
      })
      .register('#/catch', () => {
        router.showView('view-catch');
        if (window.CatchGame) window.CatchGame.init();
      })
      .register('#/collage', () => {
        router.showView('view-collage');
        if (window.CollageGame) window.CollageGame.init();
      })
      .register('#/reinas', () => {
        router.showView('view-reinas');
        if (window.ReinasGame) window.ReinasGame.init();
      })
      .register('#/mica', () => {
        router.showView('view-mica');
        if (window.MicaGame) window.MicaGame.init();
      })
      .register('#/kintsugi', () => {
        router.showView('view-kintsugi');
        if (window.KintsugiGame) window.KintsugiGame.init();
      })
      .register('#/pong', () => {
        router.showView('view-pong');
        if (window.PongGame) window.PongGame.init();
      })
      .register('#/reaction', () => {
        router.showView('view-reaction');
        if (window.ReactionGame) window.ReactionGame.init();
      })
      .register('#/typing', () => {
        router.showView('view-typing');
        if (window.TypingGame) window.TypingGame.init();
      })
      .register('#/chess', () => {
        router.showView('view-chess');
        const container = document.getElementById('chess-container');
        if (container && window.initChessGame) window.initChessGame(container);
      })
      .register('#/checkers', () => {
        router.showView('view-checkers');
        const container = document.getElementById('checkers-container');
        if (container && window.initCheckersGame) window.initCheckersGame(container);
      })
      .register('#/connect4', () => {
        router.showView('view-connect4');
        const container = document.getElementById('connect4-container');
        if (container && window.initConnect4Game) window.initConnect4Game(container);
      })
      .register('#/reversi', () => {
        router.showView('view-reversi');
        const container = document.getElementById('reversi-container');
        if (container && window.initReversiGame) window.initReversiGame(container);
      })
      .register('#/runner', () => {
        router.showView('view-runner');
        const container = document.getElementById('runner-container');
        if (container && window.initRunnerGame) window.initRunnerGame(container);
      })
      .register('#/rotate', () => {
        router.showView('view-rotate');
        const container = document.getElementById('rotate-container');
        if (container && window.initRotateGame) window.initRotateGame(container);
      })
      .register('#/scratch', () => {
        router.showView('view-scratch');
        const container = document.getElementById('scratch-container');
        if (container && window.initScratchGame) window.initScratchGame(container);
      })
      .register('#/target', () => {
        router.showView('view-target');
        const container = document.getElementById('target-container');
        if (container && window.initTargetGame) window.initTargetGame(container);
      })
      .register('#/restaurador', () => {
        router.showView('view-restaurador');
        if (window.RestauradorGame) window.RestauradorGame.init();
      })
      .register('#/exposiciones', () => {
        router.showView('view-exposiciones');
        loadExposiciones();
      })
      .register('#/mica-dashboard', () => {
        router.showView('view-mica-dashboard');
        loadMicaDashboard();
      });

    // Dynamic route for artwork details: #/obra/:artworkId
    const originalHandleRoute = router.handleRoute.bind(router);
    router.handleRoute = function() {
      const path = this.getCurrentRoute();
      
      if (path.startsWith('#/obra/')) {
        const artworkId = path.replace('#/obra/', '');
        if (artworkId) {
          this.showView('view-obra');
          loadArtworkDetail(artworkId);
          return;
        }
      }
      
      originalHandleRoute();
    };

    // Lifecycle hooks — minimal in 360° mode
    router.beforeEach = (to, from) => {
      document.body.classList.add('navigating');
    };

    router.afterEach = (to, from) => {
      setTimeout(() => {
        document.body.classList.remove('navigating');
      }, 800);
    };

    router.init();
  }

  // ===========================================
  // SCROLL SYSTEMS
  // ===========================================

  function initScrollSystems() {
    const scrollThread = document.getElementById('scroll-thread');
    const nav = document.getElementById('main-nav');
    let ticking = false;

    function onScrollUpdate() {
      // Scroll Progress Bar (Gold Thread)
      if (scrollThread) {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollThread.style.width = scrolled + "%";
      }

      // Nav scroll effect (compact on scroll)
      if (nav) {
        nav.classList.toggle('nav--scrolled', window.scrollY > 100);
      }

      ticking = false;
    }

    // Use Lenis for scroll loop if active (ultra-smooth sync)
    // Retry finding instance if module loaded late
    const bindScroll = () => {
      if (window.NaroaScroll) {
        window.NaroaScroll.on('scroll', onScrollUpdate);
        console.log('[App] Synced with NaroaScroll');
      } else {
        window.addEventListener('scroll', () => {
          if (!ticking) {
            requestAnimationFrame(onScrollUpdate);
            ticking = true;
          }
        }, { passive: true });
      }
    };
    
    // Attempt binding slightly delayed to ensure module init
    setTimeout(bindScroll, 100);

    // Scroll reveal for sections (IntersectionObserver — already efficient)
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.view[data-scroll-reveal]').forEach(section => {
      revealObserver.observe(section);
    });
  }

  // ===========================================
  // NAV — smooth scroll links
  // ===========================================

  function initNavigation() {
    // Make nav links use smooth scroll instead of route changes
    document.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Check if it's a main section
        const sectionMap = {
          '#/': 'view-home',
          '#/galeria': 'view-archivo',
          '#/about': 'view-about',
          '#/contacto': 'view-contacto',
        };
        
        if (sectionMap[href]) {
          e.preventDefault();
          
          // Close mobile menu if open
          const navLinks = document.querySelector('.nav__links');
          const navToggle = document.getElementById('nav-toggle');
          if (navLinks) navLinks.classList.remove('nav__links--open');
          if (navToggle) navToggle.classList.remove('nav__toggle--active');
          
          // Update hash without triggering route change
          history.pushState(null, null, href);
          
          // Smooth scroll to section
          const targetId = sectionMap[href];
          const target = document.getElementById(targetId);
          if (target) {
            const navHeight = document.querySelector('.nav')?.offsetHeight || 60;
            const elementPosition = target.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - navHeight - 10;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
          
          // Trigger any needed loading (e.g., gallery)
          if (href === '#/galeria') loadArchive();
          if (href === '#/contacto') loadContactoPanel();
        }
      });
    });

    // Mobile hamburger toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav__links');
    
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('nav__toggle--active');
        navLinks.classList.toggle('nav__links--open');
      });
    }
  }

  // ===========================================
  // LOADERS
  // ===========================================

  function loadArchive() {
    if (window.Gallery) {
      window.Gallery.loadArchive();
    }
  }

  function loadGame() {
    if (window.OcaGame) {
      window.OcaGame.init();
    }
  }

  function loadTetris() {
    if (window.TetrisGame) {
      window.TetrisGame.init();
    }
  }

  async function loadExposiciones() {
    try {
      const module = await import('../features/exposiciones-timeline.js');
      if (module.exposicionesTimeline) {
        module.exposicionesTimeline.init('exposiciones-container');
      }
    } catch (e) {
      window.NaroaObs?.log('ERROR', 'Exposiciones module failed to load', { error: e });
      console.error('[App] Exposiciones load error:', e);
    }
  }

  async function loadArtworkDetail(artworkId) {
    try {
      const module = await import('../features/artwork-detail.js');
      if (module.artworkDetail) {
        module.artworkDetail.init(artworkId);
      }
    } catch (e) {
      window.NaroaObs?.log('ERROR', 'Artwork Detail module failed to load', { id: artworkId, error: e });
      console.error('[App] Artwork Detail load error:', e);
    }
  }

  async function loadContactoPanel() {
    try {
      const module = await import('../features/videocall-panel.js');
      if (module.videoCallPanel) {
        module.videoCallPanel.init('contacto-container');
        const fallback = document.getElementById('contact-fallback');
        if (fallback) fallback.style.display = 'none';
      }
    } catch (e) {
      window.NaroaObs?.log('ERROR', 'VideoCall Panel failed to load', { error: e });
      console.error('[App] VideoCall Panel load error:', e);
    }
  }

  async function loadMicaDashboard() {
    try {
      const module = await import('../features/mica-dashboard.js');
      if (module.micaDashboard) {
        module.micaDashboard.init('mica-dashboard-container');
      }
    } catch (e) {
      window.NaroaObs?.log('ERROR', 'MICA Dashboard failed to load', { error: e });
      console.error('[App] MICA Dashboard load error:', e);
    }
  }

  // ===========================================
  // INITIALIZATION
  // ===========================================

  async function init() {
    
    // Load Gallery data
    if (window.Gallery) {
      await window.Gallery.init();
      // Pre-load gallery since it's always visible in scroll
      window.Gallery.loadArchive();
    }
    
    // Register routes (for game overlays + hash handling)
    registerRoutes();
    
    // Setup scroll-based systems
    initScrollSystems();
    
    // Setup smooth scroll navigation
    initNavigation();
    
    // Initialize UI controls
    initUIControls();

    // Initialize premium effects
    if (window.initMagnet) window.initMagnet();
    if (window.Lightbox) window.Lightbox.init();

  }

  function initUIControls() {
    const chaosBtn = document.getElementById('chaos-toggle');
    if (chaosBtn && window.ChaosEngine) {
      chaosBtn.addEventListener('click', () => {
        const isActive = window.ChaosEngine.toggle();
        if (isActive) {
          chaosBtn.classList.add('active');
          chaosBtn.textContent = '⚡ CAOS ACTIVO';
        } else {
          chaosBtn.classList.remove('active');
          chaosBtn.textContent = '⚡ MODO CAOS';
        }
      });
    }
  }

  // Boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
