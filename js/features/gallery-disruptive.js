/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GALERÍA DISRUPTIVA 2.0 - Orchestrator Engine
 * Naroa Gutiérrez Gil 2026
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import { Logger } from '../core/logger.js';
import { GalleryLightbox } from './gallery/gallery-lightbox.js';
import { GalleryEffects } from './gallery/gallery-effects.js';

const GalleryDisruptive = {
  initialized: false,
  currentIndex: 0,
  artworks: [],
  metadata: null,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.loadMetadata();
    this.setupLazyLoading();
    this.setupRevealAnimations();
    this.setupMouseTracking(); // Added this line
    this.bindLightboxEvents(); // Added this line
    
    // Delegate complex modules
    this.artworks = Array.from(document.querySelectorAll('.gallery-massive__item, .gallery__item, .gallery-hero__artwork'));
    GalleryLightbox.setup(this.artworks);
    GalleryEffects.init();
    
    this.setupKeyboardNav();
    Logger.info('[Gallery] Disruptive Engine Orchestrated');
  },

  async loadMetadata() {
    try {
      const data = await window.DataCache?.getArtworks();
      if (data) {
        this.metadata = {};
        data.artworks.forEach(art => this.metadata[art.id] = art);
        this.injectGridMetadata();
      }
    } catch (e) {
      Logger.warn('Metadata load skipped', e);
    }
  },

  injectGridMetadata() {
    if (!this.metadata) return;
    document.querySelectorAll('.gallery-massive__item').forEach(item => {
      const img = item.querySelector('img');
      if (!img) return;
      const src = img.getAttribute('data-src') || img.src;
      const id = src.split('/').pop().replace(/\.(webp|jpg|png|jpeg)$/i, '').replace(/-hq-\d+$/, '');
      const meta = this.metadata[id];
      if (meta) {
        item.dataset.metaYear = meta.year || '';
        item.dataset.metaTechnique = meta.technique || '';
        item.dataset.metaTitle = meta.title || '';
      }
    });
  },

  setupLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '300px 0px' });

    document.querySelectorAll('.gallery-lazy img[data-src]').forEach(img => observer.observe(img));
  },

  loadImage(img) {
    if (!img.dataset.src) return;
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    };
    tempImg.src = img.dataset.src;
  },

  setupRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.gallery-reveal, .gallery-massive__item').forEach(el => observer.observe(el));
  },

  setupMouseTracking() {
    GalleryEffects.setupMouseTracking();
  },

  bindLightboxEvents() {
    const items = document.querySelectorAll('.gallery-massive__item, .gallery__item, .gallery-hero__artwork');
    items.forEach((item, index) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('click', () => GalleryLightbox.open(index));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') GalleryLightbox.open(index);
      });
    });
  },

  setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') GalleryLightbox.close();
      if (e.key === 'ArrowRight') GalleryLightbox.next();
      if (e.key === 'ArrowLeft') GalleryLightbox.prev();
    });
  }
};

// AUTO-INITIALIZATION
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GalleryDisruptive.init());
} else {
  GalleryDisruptive.init();
}

window.GalleryDisruptive = GalleryDisruptive;
export { GalleryDisruptive };
