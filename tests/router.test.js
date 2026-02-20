// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Router } from '../js/core/router.js';

describe('Router', () => {
  let router;

  beforeEach(() => {
    // Reset hash
    window.location.hash = '';
    router = new Router();
  });

  it('should initialize with scroll sections map', () => {
    expect(router.scrollSections).toBeDefined();
    expect(router.scrollSections.size).toBeGreaterThan(0);
    expect(router.scrollSections.get('#/')).toBe('view-home');
  });

  it('should initialize with empty overlay sections', () => {
    expect(router.overlaySections).toBeDefined();
    expect(router.overlaySections.size).toBe(0);
  });

  it('register() should add route handler', () => {
    const handler = vi.fn();
    router.register('#/test', handler);
    expect(router.routes.has('#/test')).toBe(true);
  });

  it('register() should be chainable', () => {
    const result = router.register('#/a', () => {}).register('#/b', () => {});
    expect(result).toBe(router);
  });

  it('getCurrentRoute() should return hash or default', () => {
    window.location.hash = '';
    expect(router.getCurrentRoute()).toBe('#/');
    
    window.location.hash = '#/galeria';
    expect(router.getCurrentRoute()).toBe('#/galeria');
  });

  it('navigate() should set window.location.hash', () => {
    router.navigate('#/about');
    expect(window.location.hash).toBe('#/about');
  });

  it('handleRoute() should call beforeEach hook', () => {
    const spy = vi.fn();
    router.beforeEach = spy;
    router.handleRoute();
    expect(spy).toHaveBeenCalled();
  });

  it('handleRoute() should call afterEach hook', () => {
    const spy = vi.fn();
    router.afterEach = spy;
    router.handleRoute();
    expect(spy).toHaveBeenCalled();
  });

  it('updateNavActive() should toggle active class on nav links', () => {
    // Create mock nav links
    const nav = document.createElement('nav');
    const link1 = document.createElement('a');
    link1.className = 'nav__link';
    link1.setAttribute('href', '#/');
    const link2 = document.createElement('a');
    link2.className = 'nav__link';
    link2.setAttribute('href', '#/about');
    nav.appendChild(link1);
    nav.appendChild(link2);
    document.body.appendChild(nav);

    router.updateNavActive('#/about');
    
    expect(link1.classList.contains('nav__link--active')).toBe(false);
    expect(link2.classList.contains('nav__link--active')).toBe(true);

    document.body.removeChild(nav);
  });

  it('closeAllOverlays() should clear overlay set', () => {
    router.overlaySections.add('test-view');
    router.closeAllOverlays();
    expect(router.overlaySections.size).toBe(0);
  });

  it('closeAllOverlays() should restore body overflow', () => {
    document.body.style.overflow = 'hidden';
    router.closeAllOverlays();
    expect(document.body.style.overflow).toBe('');
  });
});
