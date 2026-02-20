/**
 * Logger v1.0 — "El Escriba del Sistema"
 * Unified logging system for Naroa 2026.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Default to DEBUG in development, WARN in production
const CURRENT_LEVEL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? LOG_LEVELS.DEBUG 
  : LOG_LEVELS.WARN;

export const Logger = {
  debug(...args) {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      console.log('💎 [DEBUG]', ...args);
    }
  },
  info(...args) {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      console.info('✨ [INFO]', ...args);
    }
  },
  warn(...args) {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      console.warn('⚠️ [WARN]', ...args);
    }
  },
  error(...args) {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      console.error('🚨 [ERROR]', ...args);
    }
  }
};

// Globalize for legacy scripts compatibility
window.Logger = Logger;

export default Logger;
