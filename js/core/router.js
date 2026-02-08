/**
 * Router - Hash-based SPA routing for Naroa 2026
 * @module core/router
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeEach = null;
    this.afterEach = null;
  }

  /**
   * Register a route handler
   * @param {string} path - Route path (e.g., '/#/portfolio')
   * @param {Function} handler - Handler function
   */
  register(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  /**
   * Navigate to a route programmatically
   * @param {string} path - Route to navigate to
   */
  navigate(path) {
    window.location.hash = path.replace('#', '');
  }

  /**
   * Get current route from hash
   * @returns {string}
   */
  getCurrentRoute() {
    const hash = window.location.hash;
    return hash || '#/';
  }

  /**
   * Handle route change
   */
  handleRoute() {
    const path = this.getCurrentRoute();
    const previousRoute = this.currentRoute;
    this.currentRoute = path;

    // Before hook
    if (this.beforeEach) {
      this.beforeEach(path, previousRoute);
    }

    // Find matching route
    const handler = this.routes.get(path);
    
    if (handler) {
      handler(path);
    } else {
      // Fallback to home
      const homeHandler = this.routes.get('#/');
      if (homeHandler) homeHandler('#/');
    }

    // After hook
    if (this.afterEach) {
      this.afterEach(path, previousRoute);
    }
  }

  /**
   * Smooth scroll to specific view
   * @param {string} viewId 
   */
  scrollToView(viewId) {
    const view = document.getElementById(viewId);
    if (!view) return;

    // Use robust scrollIntoView
    view.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  /**
   * Hide all view sections - DEPRECATED for Scroll Mode
   */
  hideAllViews() {
    // No-op: We want all views visible for scrolling
  }

  /**
   * Show a specific view by ID - UPDATED to Scroll
   * @param {string} viewId - Element ID of the view
   */
  showView(viewId) {
    this.scrollToView(viewId);
  }

  /**
   * Initialize router and listen for hash changes
   */
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('DOMContentLoaded', () => this.handleRoute());
    
    // If no hash, set to home
    if (!window.location.hash) {
      window.location.hash = '#/';
    } else {
      this.handleRoute();
    }

    return this;
  }
}

// Export singleton
window.Router = new Router();
