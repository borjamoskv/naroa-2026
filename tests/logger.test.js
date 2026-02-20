// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Logger reads window.location.hostname at import time.
// In jsdom, hostname is 'localhost' → CURRENT_LEVEL = DEBUG (0)
// So ALL log methods should fire.

describe('Logger', () => {
  let Logger;

  beforeEach(async () => {
    vi.restoreAllMocks();
    const mod = await import('../js/core/logger.js');
    Logger = mod.Logger;
  });

  it('should export Logger object with 4 methods', () => {
    expect(Logger).toBeDefined();
    expect(typeof Logger.debug).toBe('function');
    expect(typeof Logger.info).toBe('function');
    expect(typeof Logger.warn).toBe('function');
    expect(typeof Logger.error).toBe('function');
  });

  it('debug() should call console.log with prefix', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    Logger.debug('test message');
    expect(spy).toHaveBeenCalledWith('💎 [DEBUG]', 'test message');
  });

  it('info() should call console.info with prefix', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    Logger.info('info message');
    expect(spy).toHaveBeenCalledWith('✨ [INFO]', 'info message');
  });

  it('warn() should call console.warn with prefix', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    Logger.warn('warn message');
    expect(spy).toHaveBeenCalledWith('⚠️ [WARN]', 'warn message');
  });

  it('error() should call console.error with prefix', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Logger.error('error message');
    expect(spy).toHaveBeenCalledWith('🚨 [ERROR]', 'error message');
  });

  it('should accept multiple arguments', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    Logger.debug('msg', { detail: 42 }, [1, 2, 3]);
    expect(spy).toHaveBeenCalledWith('💎 [DEBUG]', 'msg', { detail: 42 }, [1, 2, 3]);
  });

  it('should be exposed on window.Logger', () => {
    expect(window.Logger).toBeDefined();
    expect(window.Logger.debug).toBe(Logger.debug);
  });
});
