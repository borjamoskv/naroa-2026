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
      .register('#/destacada', () => {
        router.showView('view-destacada');
        loadFeatured();
      })
      .register('#/archivo', () => {
        router.showView('view-archivo');
        loadArchive();
      })
      .register('#/about', () => {
        router.showView('view-about');
      })
      .register('#/contacto', () => {
        router.showView('view-contacto');
      })
      .register('#/juego', () => {
        router.showView('view-juego');
        loadGame();
      })
      .register('#/tetris', () => {
        router.showView('view-tetris');
        loadTetris();
      })
      .register('#/juegos', () => {
        router.showView('view-juegos');
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
      });

    // Lifecycle hooks
    // Lifecycle hooks using the "Golden Curtain"
    router.beforeEach = (to, from) => {
      document.body.classList.add('navigating');
      const curtain = document.getElementById('page-curtain');
      if (curtain) curtain.classList.add('active');
    };

    router.afterEach = (to, from) => {
      const curtain = document.getElementById('page-curtain');
      
      setTimeout(() => {
        // Scroll to top while curtain is closed
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        if (curtain) curtain.classList.remove('active');
        
        setTimeout(() => {
          document.body.classList.remove('navigating');
        }, 600);
      }, 400);
    };

    router.init();
  }

  // ===========================================
  // MOBILE NAVIGATION
  // ===========================================

  // ===========================================
  // FLUID SYSTEMS: RED THREAD & MICA
  // ===========================================

  function initFluidSystems() {
    const scrollThread = document.getElementById('scroll-thread');
    
    // Smooth Scroll Progress (Hilo Rojo)
    window.addEventListener('scroll', () => {
      if (!scrollThread) return;
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      scrollThread.style.width = scrolled + "%";
    }, { passive: true });

    // Force MICA presence
    if (window.micaInstance) {
      setTimeout(() => {
        if (!window.micaInstance.isOpen) {
          console.log('[App] MICA invited to lead the conversation');
        }
      }, 2000);
    }
  }

  // ===========================================
  // PLACEHOLDER LOADERS (to be expanded)
  // ===========================================

  function loadFeatured() {
    console.log('[App] Loading Obra Destacada...');
    if (window.Gallery) {
      window.Gallery.loadFeatured();
    }
  }

  function loadArchive() {
    console.log('[App] Loading Archivo...');
    if (window.Gallery) {
      window.Gallery.loadArchive();
    }
  }

  function loadGame() {
    console.log('[App] Loading Juego de la Oca...');
    if (window.OcaGame) {
      window.OcaGame.init();
    }
  }

  function loadTetris() {
    console.log('[App] Loading Tetris Artístico...');
    if (window.TetrisGame) {
      window.TetrisGame.init();
    }
  }

  // ===========================================
  // INITIALIZATION
  // ===========================================

  async function init() {
    console.log('[Naroa 2026] Initializing...');
    
    // CRITICAL: Initialize Gallery BEFORE routes so data is ready
    if (window.Gallery) {
      await window.Gallery.init();
      console.log('[Naroa 2026] Gallery initialized with artwork data');
    }
    
    registerRoutes();
    initFluidSystems();

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
