/**
 * Router - 360° Scroll Navigation for Naroa 2026
 * Main sections are all visible (scroll-based), 
 * game/secondary views are overlay-based
 * @module core/router
 */
import { Logger } from './logger.js';


class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeEach = null;
    this.afterEach = null;
    
    // Main sections that are always visible in scroll
    this.scrollSections = new Map([
      ['#/', 'view-home'],
      ['#/rocks', 'view-rocks'],
      ['#/galeria', 'view-archivo'],
      ['#/archivo', 'view-archivo'],
      ['#/about', 'view-about'],
      ['#/contacto', 'view-contacto'],
    ]);
    
    // Overlay sections (games, etc.)
    this.overlaySections = new Set();
  }

  register(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  navigate(path) {
    window.location.hash = path.replace('#', '');
  }

  getCurrentRoute() {
    const hash = window.location.hash;
    return hash || '#/';
  }

  /**
   * Handle route change — 360° scroll edition
   * Main sections: smooth scroll to target
   * Game sections: show as overlay
   */
  handleRoute() {
    const path = this.getCurrentRoute();
    const previousRoute = this.currentRoute;
    this.currentRoute = path;

    if (this.beforeEach) {
      this.beforeEach(path, previousRoute);
    }

    // Check if this is a scroll section (main content)
    if (this.scrollSections.has(path)) {
      // Close any open game overlay first
      this.closeAllOverlays();
      
      const viewId = this.scrollSections.get(path);
      this.scrollToView(viewId);
      
      // Execute any registered handler (e.g., loadArchive for gallery)
      const handler = this.routes.get(path);
      if (handler) handler(path);
      
      // Update nav active state
      this.updateNavActive(path);
    } else {
      // It's a game/overlay route
      const handler = this.routes.get(path);
      if (handler) {
        handler(path);
      } else {
        // Unknown route, scroll to top
        this.scrollToView('view-home');
      }
    }

    if (this.afterEach) {
      this.afterEach(path, previousRoute);
    }
  }

  /**
   * Smooth scroll to a section
   */
  scrollToView(viewId) {
    const view = document.getElementById(viewId);
    if (!view) return;

    // Offset for fixed nav
    const navHeight = document.querySelector('.nav')?.offsetHeight || 60;
    const elementPosition = view.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - navHeight - 10;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  /**
   * Show a game/overlay view
   */
  showView(viewId) {
    const view = document.getElementById(viewId);
    if (!view) return;

    // Check if it's a main scroll section — just scroll to it
    for (const [, id] of this.scrollSections) {
      if (id === viewId) {
        this.scrollToView(viewId);
        return;
      }
    }

    // It's a game/overlay — show it as overlay
    this.closeAllOverlays();
    
    view.classList.add('active');
    view.style.display = 'block';
    void view.offsetWidth; // Force reflow
    view.style.opacity = '1';
    view.style.pointerEvents = 'auto';
    
    // Add close button if not present
    if (!view.querySelector('.game-view-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'game-view-close';
      closeBtn.innerHTML = '✕';
      closeBtn.setAttribute('aria-label', 'Cerrar');
      closeBtn.addEventListener('click', () => {
        this.closeAllOverlays();
        window.location.hash = '#/';
      });
      view.prepend(closeBtn);
    }

    // Track it
    this.overlaySections.add(viewId);
    
    // Prevent body scroll while overlay is open
    document.body.style.overflow = 'hidden';
  }

  /**
   * NEW: Close overlays but KEEP main scroll position
   */
  closeAllOverlays() {
    document.querySelectorAll('.view').forEach(view => {
      // Only close OVERLAYS (games, details), not scroll sections
      if (this.overlaySections.has(view.id) || view.classList.contains('game-view')) {
        view.classList.remove('active');
        view.style.opacity = '0';
        view.style.pointerEvents = 'none';
        setTimeout(() => {
           // Double check before hiding
           if (!view.classList.contains('active')) view.style.display = 'none';
        }, 500);
      }
    });
    this.overlaySections.clear();
    document.body.style.overflow = '';
  }

  /**
   * DEPRECATED — kept for compatibility but routes to new methods
   */
  hideAllViews() {
    // In 360° mode, we don't hide main views
    // Only close overlays
    this.closeAllOverlays();
  }

  /**
   * Update navigation active state based on scroll position
   */
  updateNavActive(currentPath) {
    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('nav__link--active', href === currentPath);
    });
  }

  /**
   * Setup scroll-based navigation highlighting
   */
  initScrollSpy() {
    const sections = [];
    this.scrollSections.forEach((viewId, path) => {
      const el = document.getElementById(viewId);
      if (el) sections.push({ el, path });
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const scrollPos = window.scrollY + window.innerHeight / 3;
        
        let activeSection = sections[0];
        for (const section of sections) {
          if (section.el.offsetTop <= scrollPos) {
            activeSection = section;
          }
        }
        
        if (activeSection) {
          this.updateNavActive(activeSection.path);
        }
        
        ticking = false;
      });
    }, { passive: true });
  }

  /**
   * Initialize router
   */
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // On DOM ready
    const initRouting = () => {
      // Initialize scroll spy for nav highlights
      this.initScrollSpy();
      
      // Handle initial route
      if (!window.location.hash || window.location.hash === '#/') {
        // Home — just make sure we're at top
        window.scrollTo({ top: 0 });
      } else {
        this.handleRoute();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initRouting);
    } else {
      initRouting();
    }

    return this;
  }
}

// Export class for orchestration
export { Router };
