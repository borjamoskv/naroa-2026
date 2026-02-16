/**
 * 🔄 Retry Utilities
 * 
 * Exponential backoff with jitter for resilient API calls
 * 
 * @version 1.0.0
 */

/**
 * Sleep/delay utility
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and full jitter
 * @param {number} attempt - Attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in ms
 * @param {number} maxDelay - Maximum delay in ms
 * @returns {number} Calculated delay
 */
export function calculateBackoff(attempt, baseDelay = 1000, maxDelay = 30000) {
  const exponential = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * exponential;
  return Math.min(jitter, maxDelay);
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.baseDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
 * @param {Function} options.shouldRetry - Custom retry condition
 * @param {Function} options.onRetry - Callback on each retry attempt
 * @returns {Promise<any>} Result of fn
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = (error) => {
      // Retry on network errors or 5xx server errors
      const status = error.response?.status;
      return !status || status >= 500 || status === 429;
    },
    onRetry = null
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt or if shouldRetry returns false
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = calculateBackoff(attempt, baseDelay, maxDelay);

      if (onRetry) {
        onRetry({ attempt: attempt + 1, maxRetries, delay, error });
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Create a retryable wrapper for any function
 * @param {Function} fn - Function to wrap
 * @param {Object} defaultOptions - Default retry options
 * @returns {Function} Wrapped function
 */
export function withRetry(fn, defaultOptions = {}) {
  return async (...args) => {
    return retryWithBackoff(() => fn(...args), defaultOptions);
  };
}

export default { retryWithBackoff, calculateBackoff, sleep, withRetry };
