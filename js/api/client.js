/**
 * 🌐 Naroa API Client
 * 
 * Centralized HTTP client with:
 *   - Request/response interceptors
 *   - Automatic caching
 *   - Request deduplication
 *   - Exponential backoff retry
 *   - Error transformation
 * 
 * @version 1.0.0
 */

import { ApiCache } from './cache.js';
import { retryWithBackoff } from './retry.js';

class NaroaApiClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 10000;
    this.cache = new ApiCache({ ttl: config.cacheTtl || 5 * 60 * 1000 });
    this.pendingRequests = new Map();
    
    // Simple fetch wrapper (axios-compatible interface without dependency)
    this._fetch = this._createFetchWrapper();
  }

  _createFetchWrapper() {
    return async (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
        
        const response = await fetch(fullUrl, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.response = {
            status: response.status,
            statusText: response.statusText,
            data: await response.json().catch(() => null)
          };
          throw error;
        }

        const data = await response.json();
        return { data, status: response.status, headers: response.headers };
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          const timeoutError = new Error('Request timeout');
          timeoutError.code = 'TIMEOUT';
          throw timeoutError;
        }
        
        throw error;
      }
    };
  }

  _buildUrl(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  _generateCacheKey(method, url, params) {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  /**
   * Execute request with deduplication and caching
   */
  async request(config, options = {}) {
    const { 
      cacheKey = null, 
      cacheTtl = null, 
      dedupe = true,
      forceRefresh = false,
      retry = true
    } = options;

    const key = cacheKey || this._generateCacheKey(
      config.method || 'GET', 
      config.url, 
      config.params
    );

    // 1. Check cache for GET requests
    if (!forceRefresh && config.method?.toUpperCase() === 'GET' && cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { data: cached, fromCache: true };
      }
    }

    // 2. Deduplicate concurrent requests
    if (dedupe && this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // 3. Execute request with optional retry
    const executeRequest = async () => {
      const url = this._buildUrl(config.url, config.params);
      
      const fetchFn = () => this._fetch(url, {
        method: config.method || 'GET',
        body: config.data ? JSON.stringify(config.data) : undefined
      });

      const response = retry 
        ? await retryWithBackoff(fetchFn, { maxRetries: 3 })
        : await fetchFn();

      // Cache successful GET requests
      if (cacheKey && config.method?.toUpperCase() === 'GET') {
        this.cache.set(cacheKey, response.data, cacheTtl);
      }

      return { data: response.data, fromCache: false };
    };

    const promise = executeRequest()
      .catch(error => {
        throw this._transformError(error);
      })
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    if (dedupe) {
      this.pendingRequests.set(key, promise);
    }

    return promise;
  }

  _transformError(error) {
    // Already transformed
    if (error.code) return error;

    const status = error.response?.status;
    
    return {
      code: status ? `HTTP_${status}` : 'NETWORK_ERROR',
      message: error.response?.data?.message || error.message,
      status: status,
      original: error
    };
  }

  // Convenience methods
  async get(url, config = {}, options = {}) {
    return this.request({ ...config, method: 'GET', url }, options);
  }

  async post(url, data, config = {}, options = {}) {
    return this.request({ ...config, method: 'POST', url, data }, { ...options, dedupe: false });
  }

  async put(url, data, config = {}, options = {}) {
    return this.request({ ...config, method: 'PUT', url, data }, { ...options, dedupe: false });
  }

  async patch(url, data, config = {}, options = {}) {
    return this.request({ ...config, method: 'PATCH', url, data }, { ...options, dedupe: false });
  }

  async delete(url, config = {}, options = {}) {
    return this.request({ ...config, method: 'DELETE', url }, { ...options, dedupe: false });
  }

  // Cache management
  invalidateCache(key) {
    this.cache.delete(key);
  }

  invalidateCachePattern(pattern) {
    this.cache.deletePattern(pattern);
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return this.cache.getStats();
  }
}

// Singleton instance
export const api = new NaroaApiClient();
export default api;
