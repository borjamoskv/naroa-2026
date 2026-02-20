/**
 * 🗄️ Data Cache — Centralized Data Fetcher
 * 
 * Solves the "15+ files fetching the same JSON" problem.
 * Single source of truth for artworks-metadata.json with:
 *   - In-memory cache (fetch once, serve many)
 *   - AbortSignal timeout (5s max)
 *   - Error resilience with fallback
 *   - Deduplication of concurrent requests
 */

const DataCache = {
  _cache: new Map(),
  _pending: new Map(),
  _TTL: 5 * 60 * 1000, // 5 minutes

  /**
   * Fetch with cache, timeout, and deduplication
   * @param {string} url - URL to fetch
   * @param {object} options - fetch options
   * @param {number} options.timeout - timeout in ms (default: 5000)
   * @param {boolean} options.forceRefresh - bypass cache
   * @returns {Promise<any>} parsed JSON
   */
  async get(url, options = {}) {
    const { timeout = 5000, forceRefresh = false } = options;

    // 1. Return cached if fresh
    if (!forceRefresh && this._cache.has(url)) {
      const { data, timestamp } = this._cache.get(url);
      if (Date.now() - timestamp < this._TTL) {
        return data;
      }
      this._cache.delete(url);
    }

    // 2. Deduplicate concurrent requests
    if (this._pending.has(url)) {
      return this._pending.get(url);
    }

    // 3. Fetch with timeout
    const fetchPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          ...options
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache the result
        this._cache.set(url, { data, timestamp: Date.now() });
        return data;
      } catch (err) {
        if (err.name === 'AbortError') {
          Logger.warn(`[DataCache] Timeout fetching ${url} (${timeout}ms)`);
        } else {
          Logger.warn(`[DataCache] Error fetching ${url}:`, err.message);
        }
        // Return stale cache if available
        if (this._cache.has(url)) {
          Logger.info(`[DataCache] Serving stale cache for ${url}`);
          return this._cache.get(url).data;
        }
        throw err;
      } finally {
        this._pending.delete(url);
      }
    })();

    this._pending.set(url, fetchPromise);
    return fetchPromise;
  },

  /**
   * Shortcut: Get artworks metadata (most common call)
   * @returns {Promise<Array>} artworks array
   */
  async getArtworks() {
    return this.get('data/artworks-metadata.json');
  },

  /**
   * Clear all cached data
   */
  clear() {
    this._cache.clear();
    this._pending.clear();
  },

  /**
   * Preload critical data on page load
   */
  async preload() {
    try {
      await this.getArtworks();
      Logger.info('[DataCache] Artworks preloaded ✓');
    } catch (e) {
      Logger.warn('[DataCache] Preload failed, will retry on demand');
    }
  }
};

// Auto-preload when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DataCache.preload());
  } else {
    DataCache.preload();
  }
}

// Export for both module and script contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataCache;
}
window.DataCache = DataCache;
