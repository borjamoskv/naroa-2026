/**
 * 📜 Infinite Artworks Loader
 * 
 * Cursor-based infinite scroll for artworks with:
 *   - State management
 *   - Loading indicators
 *   - Error handling
 *   - Observer-based scroll detection
 * 
 * @version 1.0.0
 */

import { artworksApi } from './artworks.js';

/**
 * Infinite scroll loader for artworks
 */
export class InfiniteArtworksLoader {
  constructor(options = {}) {
    this.pageSize = options.pageSize || 20;
    this.filters = options.filters || {};
    this.onStateChange = options.onStateChange || null;
    
    this.state = {
      items: [],
      cursor: null,
      hasMore: true,
      isLoading: false,
      error: null,
      totalLoaded: 0
    };
    
    this.listeners = new Set();
    this.abortController = null;
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - State change callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   * @private
   */
  _notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  /**
   * Update state
   * @private
   */
  _setState(updates) {
    this.state = { ...this.state, ...updates };
    this._notify();
  }

  /**
   * Load next page of artworks
   * @returns {Promise<Array>} Loaded items
   */
  async loadMore() {
    if (this.state.isLoading || !this.state.hasMore) {
      return [];
    }

    // Cancel any pending request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this._setState({ isLoading: true, error: null });

    try {
      const response = await artworksApi.list({
        ...this.filters,
        limit: this.pageSize,
        cursor: this.state.cursor
      });

      const { items = [], nextCursor, hasMore, total } = response;

      // Deduplicate items by ID
      const existingIds = new Set(this.state.items.map(item => item.id));
      const newItems = items.filter(item => !existingIds.has(item.id));

      this._setState({
        items: [...this.state.items, ...newItems],
        cursor: nextCursor,
        hasMore: hasMore !== false && items.length === this.pageSize,
        isLoading: false,
        totalLoaded: this.state.totalLoaded + newItems.length,
        total
      });

      return newItems;
    } catch (error) {
      // Don't treat abort as error
      if (error.name === 'AbortError') {
        return [];
      }

      this._setState({
        error: error.message || 'Failed to load artworks',
        isLoading: false
      });
      
      throw error;
    }
  }

  /**
   * Refresh data from beginning
   * @returns {Promise<Array>} First page items
   */
  async refresh() {
    this.state.cursor = null;
    this.state.items = [];
    this.state.hasMore = true;
    this.state.totalLoaded = 0;
    return this.loadMore();
  }

  /**
   * Update filters and reload
   * @param {Object} newFilters - New filter values
   * @returns {Promise<Array>} First page with new filters
   */
  async setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    return this.refresh();
  }

  /**
   * Get current state (immutable copy)
   * @returns {Object} Current state
   */
  getState() {
    return {
      ...this.state,
      items: [...this.state.items]
    };
  }

  /**
   * Get item by ID
   * @param {string} id - Artwork ID
   * @returns {Object|undefined}
   */
  getItem(id) {
    return this.state.items.find(item => item.id === id);
  }

  /**
   * Update item in place (for optimistic updates)
   * @param {string} id - Artwork ID
   * @param {Object} updates - Partial updates
   */
  updateItem(id, updates) {
    const index = this.state.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.state.items[index] = { ...this.state.items[index], ...updates };
      this._notify();
    }
  }

  /**
   * Preload next page in background
   */
  async preloadNext() {
    if (!this.state.isLoading && this.state.hasMore) {
      // Silent preload - don't update loading state
      try {
        const response = await artworksApi.list({
          ...this.filters,
          limit: this.pageSize,
          cursor: this.state.cursor
        });
        
        // Cache is already populated by artworksApi.list
      } catch (e) {
        // Silent fail on preload
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.listeners.clear();
  }
}

/**
 * Factory function for creating loaders
 * @param {Object} options - Loader options
 * @returns {InfiniteArtworksLoader}
 */
export function createInfiniteArtworksLoader(options) {
  return new InfiniteArtworksLoader(options);
}

/**
 * Set up infinite scroll with IntersectionObserver
 * @param {string|Element} containerSelector - Container element or selector
 * @param {Object} options - Configuration options
 * @returns {Object} Loader instance with cleanup
 */
export function useInfiniteArtworks(containerSelector, options = {}) {
  const container = typeof containerSelector === 'string' 
    ? document.querySelector(containerSelector)
    : containerSelector;
  
  if (!container) {
    console.error(`[useInfiniteArtworks] Container not found: ${containerSelector}`);
    return null;
  }

  // Create loader
  const loader = new InfiniteArtworksLoader(options);

  // Create sentinel element
  const sentinel = document.createElement('div');
  sentinel.className = 'infinite-scroll-sentinel';
  sentinel.style.cssText = 'height: 1px; visibility: hidden;';
  container.appendChild(sentinel);

  // Set up intersection observer
  const observer = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !loader.state.isLoading && loader.state.hasMore) {
      loader.loadMore();
    }
  }, {
    root: options.scrollContainer || null,
    rootMargin: options.rootMargin || '200px',
    threshold: 0
  });

  observer.observe(sentinel);

  // Enhanced cleanup
  const originalDestroy = loader.destroy.bind(loader);
  loader.destroy = () => {
    observer.disconnect();
    sentinel.remove();
    originalDestroy();
  };

  // Auto-start if requested
  if (options.autoStart !== false) {
    loader.loadMore();
  }

  return loader;
}

export default { InfiniteArtworksLoader, createInfiniteArtworksLoader, useInfiniteArtworks };
