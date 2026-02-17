/**
 * NAROA 2026 — Sovereign Orchestration Layer (v∞)
 * 
 * Este es el corazón del sistema. Unifica routing, rankings, IA y efectos
 * en una única arquitectura modular y soberana.
 */

// CSS Pipeline (Vite)
import './css/variables.css';
import './css/naroa-palette.css';
import './css/typography-2026.css';
import './css/base.css';
import './css/layout.css';
import './css/components.css';
import './css/components/notch.css';
import './css/components/bento-grid.css';
import './css/lightbox-premium.css';
import './css/scroll-to-top.css';
import './css/gallery.css';
import './css/about-contact.css';
import './css/footer.css';
import './css/animations.css';
import './css/soty-effects.css';
import './css/wow-effects.css';
import './css/wow-effects-2026.css';
import './css/hero-immersive.css';
import './css/nav.css';
import './css/divinity-awards.css';
import './css/mica-dust.css';

// Core Systems
import { Router } from './js/core/router.js';
import { RankingSystem } from './js/core/ranking-system.js';
import { MicaSystem } from './js/core/mica-orchestrator.js';
import { initEnhancements } from './js/core/enhancements.js';
import { transition as PageTransition } from './js/core/transitions.js';
// Visual Effects & Premium Systems
import { SOTYEffects } from './js/core/soty-effects.js';
import { WOWEffects2026 } from './js/core/wow-effects-2026.js';
import { KineticText } from './js/effects/kinetic-text.js';
import { MagneticButton } from './js/effects/magnetic-button.js';
import { ScrollToTop } from './js/features/scroll-to-top.js';
import { SpotifyRotator } from './js/spotify-rotator.js';

class NaroaApp {
  constructor() {
    this.systems = {};
    this.boot();
  }

  async boot() {
    console.groupCollapsed('🌀 [NEXUS-V∞] Establishing Sovereignty');
    
    try {
      // 1. Core Modules Initialization
      this.systems.router = new Router();
      this.systems.rankings = RankingSystem;
      this.systems.mica = new MicaSystem();
      this.systems.transitions = PageTransition;
      
      // 2. Routing Setup (Migrated from app.js)
      this.setupRouting();
      
      // 3. Progressive Enhancements
      initEnhancements();
      
      // 4. Global Effects
      await this.launch('Scroll', () => import('./js/core/scroll.js'));
      await this.launch('Cursor', () => import('./js/core/cursor.js'));
      
      // Instantiate if they are classes
      if (this.systems.Scroll?.SmoothScrollSystem) {
        this.systems.Scroll = new this.systems.Scroll.SmoothScrollSystem();
      }
      if (this.systems.Cursor?.CursorSystem) {
        this.systems.Cursor = new this.systems.Cursor.CursorSystem();
      }
      
      this.initLegacyModules();
      
      // Sync Logic
      this.ensurePremiumStructuralHarmony();
      
      console.log('✅ [APOTHEOSIS] System Soul active.');
    } catch (error) {
      console.error('❌ [VOID] Critical system failure:', error);
    }
    
    console.groupEnd();
  }

  setupRouting() {
    const r = this.systems.router;

    r.register('#/', () => this.systems.transitions.play(() => window.scrollTo({ top: 0, behavior: 'instant' })));
    r.register('#/galeria', () => this.systems.transitions.play(() => this.loadFeature('gallery', 'loadArchive')));
    r.register('#/archivo', () => this.systems.transitions.play(() => this.loadFeature('gallery', 'loadArchive')));
    r.register('#/contacto', () => this.systems.transitions.play(() => this.loadFeature('videocall', 'init', 'contacto-container')));
    
    // Gallery & Featured
    r.register('#/destacada', () => this.systems.transitions.play(() => r.showView('view-destacada')));
    r.register('#/juegos', () => this.systems.transitions.play(() => r.showView('view-juegos')));
    r.register('#/juego', () => this.systems.transitions.play(() => { 
      r.showView('view-juego'); 
      this.loadFeature('restaurador-game', 'init'); 
    }));
    
    // Auto-init router
    r.init();
    
    // Navigation binding (smooth scroll)
    this.bindNavigation();
  }

  async loadFeature(feature, method, ...args) {
    const map = {
      gallery: () => import('./js/features/gallery.js'),
      videocall: () => import('./js/features/videocall-panel.js'),
      'restaurador-game': () => import('./js/features/restaurador-game.js'),
      exposiciones: () => import('./js/features/exposiciones-timeline.js'),
    };

    if (map[feature]) {
      const module = await map[feature]();
      const instance = module.default || module[feature] || window[feature.charAt(0).toUpperCase() + feature.slice(1)];
      if (instance && instance[method]) instance[method](...args);
    }
  }

  bindNavigation() {
    document.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#/')) {
          e.preventDefault();
          const targetId = `view-${href.replace('#/', '') || 'home'}`;
          const target = document.getElementById(targetId);
          if (target) {
            this.systems.transitions.play(() => {
              if (this.systems.Scroll?.scrollTo) {
                this.systems.Scroll.scrollTo(target.offsetTop - 80);
              } else {
                window.scrollTo({
                  top: target.offsetTop - 80,
                  behavior: 'instant'
                });
              }
              history.pushState(null, null, href);
            });
          }
        }
      });
    });
  }

  async launch(name, importFn) {
    try {
      const module = await importFn();
      this.systems[name] = module.default || module;
    } catch (e) {
      console.warn(`⚠️ [${name}] Launch inhibited:`, e);
    }
  }

  ensurePremiumStructuralHarmony() {
    document.querySelector('.nav__inner')?.classList.add('divinity-active');
  }

  initLegacyModules() {
    // Initialize premium effects now that they are modules
    const kt = new KineticText({
      maxDist: 150,
      influence: 0.15,
      staggerDelay: 0.02
    }).init('.kinetic-text');
    
    const mb = new MagneticButton({
      attraction: 0.2
    }).init('.magnetic-btn');

    this.systems.kineticText = kt;
    this.systems.magneticButton = mb;

    // SOTY & WOW Libraries
    SOTYEffects.initAll();
    WOWEffects2026.initAll();

    // Specific Premium Components
    ScrollToTop.init();
    this.systems.spotify = new SpotifyRotator();

    // Liquid Distortion (Dynamic Import)
    this.launch('LiquidDistortion', () => import('./js/effects/liquid-distortion.js'));
  }
}

// Singleton Manifestation
window.Naroa = new NaroaApp();


