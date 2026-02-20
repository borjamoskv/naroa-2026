/**
 * GalleryEffects — Sovereign Visuals
 * Refactored from GalleryDisruptive
 */
import { Logger } from '../../core/logger.js';

export const GalleryEffects = {
  handlers: {},
  rafId: null,

  init() {
    this.setupParallax();
    this.setupMouseTracking();
    this.setupCustomCursor();
    Logger.debug('[Effects] Module Initialized');
  },

  setupParallax() {
    const parallaxContainer = document.querySelector('.gallery-parallax');
    if (!parallaxContainer) return;

    const layers = parallaxContainer.querySelectorAll('.gallery-parallax__layer');
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      layers.forEach((layer, i) => {
        const speed = parseFloat(layer.style.getPropertyValue('--parallax-speed')) || (1 - i * 0.25);
        const yPos = scrollY * speed * 0.1;
        layer.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    this.handlers.parallax = handleScroll;
  },

  setupMouseTracking() {
    const items = document.querySelectorAll('.gallery-massive__item, .gallery-hero__artwork');
    items.forEach(item => {
      let rafId = null;
      let targetRotateX = 0; let targetRotateY = 0;
      let currX = 0; let currY = 0;
      
      const update = () => {
        currX += (targetRotateX - currX) * 0.1;
        currY += (targetRotateY - currY) * 0.1;
        const img = item.querySelector('img');
        if (img) img.style.transform = `perspective(1000px) rotateX(${currX}deg) rotateY(${currY}deg) scale(1.02)`;
        if (Math.abs(targetRotateX - currX) > 0.01 || Math.abs(targetRotateY - currY) > 0.01) {
          rafId = requestAnimationFrame(update);
        }
      };

      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        targetRotateY = ((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 10;
        targetRotateX = -((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 10;
        if (!rafId) rafId = requestAnimationFrame(update);
      });

      item.addEventListener('mouseleave', () => {
        targetRotateX = 0; targetRotateY = 0;
        setTimeout(() => {
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          const img = item.querySelector('img');
          if (img) img.style.transform = '';
        }, 300);
      });
    });
  },

  setupCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const cursor = document.createElement('div');
    cursor.className = 'gallery-cursor';
    cursor.textContent = 'Ver';
    document.body.appendChild(cursor);
    
    let curX = 0, curY = 0, tarX = 0, tarY = 0;
    let visible = false;

    const move = () => {
      curX += (tarX - curX) * 0.15;
      curY += (tarY - curY) * 0.15;
      cursor.style.left = curX - 40 + 'px';
      cursor.style.top = curY - 40 + 'px';
      if (visible) requestAnimationFrame(move);
    };

    document.querySelectorAll('.gallery-massive__item, .gallery-hero__artwork').forEach(item => {
      item.onmouseenter = () => { cursor.classList.add('visible'); visible = true; move(); };
      item.onmouseleave = () => { cursor.classList.remove('visible'); visible = false; };
    });

    document.onmousemove = (e) => { tarX = e.clientX; tarY = e.clientY; };
  }
};
