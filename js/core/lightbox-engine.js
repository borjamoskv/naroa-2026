/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LIGHTBOX ENGINE v2.0 - Core Sovereign Component
 * ═══════════════════════════════════════════════════════════════════════════════
 * Handles high-performance image inspection, zooming, and metadata display.
 * Optimized for both desktop (wheel/pan) and mobile (touch/gestures).
 * 
 * @module core/lightbox
 * @author Naroa Gutiérrez Gil 2026
 */

export class LightboxEngine {
  constructor() {
    this.currentIndex = 0;
    this.artworks = [];
    this.isOpen = false;
    this.taxonomy = null;

    this.zoom = {
      scale: 1,
      minScale: 1,
      maxScale: 4,
      panning: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    };

    this.touch = {
      startX: 0,
      startY: 0,
      startTime: 0,
      lastPinchDist: 0
    };

    this.elements = {};
    this.init();
  }

  /**
   * Initializes the Engine, creates DOM, and binds event listeners.
   * @async
   */
  async init() {
    this.createDOM();
    this.bindEvents();
    await this.loadTaxonomy();
  }

  /**
   * Creates the Lightbox HTML structure and injects it into the body.
   */
  createDOM() {
    let lb = document.getElementById('lightbox-v2');
    if (lb) lb.remove();

    lb = document.createElement('div');
    lb.id = 'lightbox-v2';
    lb.className = 'gallery-lightbox'; // Reusing established styles
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.hidden = true;
    
    lb.innerHTML = `
      <div class="gallery-lightbox__close" role="button" aria-label="Cerrar" tabindex="0">✕</div>
      <div class="gallery-lightbox__nav gallery-lightbox__nav--prev" role="button" aria-label="Anterior" tabindex="0">‹</div>
      <div class="gallery-lightbox__nav gallery-lightbox__nav--next" role="button" aria-label="Siguiente" tabindex="0">›</div>
      <div class="gallery-lightbox__counter"><span class="current">1</span> / <span class="total">1</span></div>
      <div class="gallery-lightbox__container"></div>
      <div class="gallery-lightbox__zoom-indicator"></div>
      <div class="gallery-lightbox__details">
        <h3 class="gallery-lightbox__title"></h3>
        <p class="gallery-lightbox__meta"></p>
        <p class="gallery-lightbox__series"></p>
      </div>
    `;
    
    document.body.appendChild(lb);
    this.elements.lightbox = lb;
    this.elements.container = lb.querySelector('.gallery-lightbox__container');
    this.elements.counter = lb.querySelector('.gallery-lightbox__counter');
    this.elements.details = lb.querySelector('.gallery-lightbox__details');
    this.elements.title = lb.querySelector('.gallery-lightbox__title');
    this.elements.meta = lb.querySelector('.gallery-lightbox__meta');
    this.elements.series = lb.querySelector('.gallery-lightbox__series');
  }

  bindEvents() {
    this.elements.lightbox.querySelector('.gallery-lightbox__close').onclick = () => this.close();
    this.elements.lightbox.querySelector('.gallery-lightbox__nav--prev').onclick = (e) => { e.stopPropagation(); this.prev(); };
    this.elements.lightbox.querySelector('.gallery-lightbox__nav--next').onclick = (e) => { e.stopPropagation(); this.next(); };
    
    this.elements.lightbox.onclick = (e) => {
      if (e.target === this.elements.lightbox || e.target === this.elements.container) this.close();
    };

    window.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Zoom/Pan events on container
    this.elements.container.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    this.elements.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());

    // Touch events
    this.elements.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.elements.container.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.elements.container.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  async loadTaxonomy() {
    try {
      const data = await window.DataCache?.getArtworks();
      if (data) {
        this.taxonomy = data.artworks || [];
      }
    } catch (e) {
      Logger.warn('[LightboxEngine] Metadata load skipped', e);
    }
  }

  /**
   * Opens the lightbox with a specific artwork.
   * @param {Object|number} artworkOrIndex - The artwork object or its index in the array.
   * @param {Array} artworks - Optional array of artworks for navigation.
   */
  open(artworkOrIndex, artworks = []) {
    this.artworks = artworks;
    
    if (typeof artworkOrIndex === 'number') {
      this.currentIndex = artworkOrIndex;
    } else {
      this.currentIndex = artworks.findIndex(a => (a.id && a.id === artworkOrIndex.id) || a.src === artworkOrIndex.src);
      if (this.currentIndex === -1) {
        this.artworks = [artworkOrIndex, ...artworks];
        this.currentIndex = 0;
      }
    }

    this.updateContent(false);
    
    this.elements.lightbox.hidden = false;
    this.elements.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
  }

  close() {
    this.elements.lightbox.classList.remove('active');
    setTimeout(() => {
        this.elements.lightbox.hidden = true;
        document.body.style.overflow = '';
        this.isOpen = false;
        this.resetZoom();
    }, 300);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.artworks.length;
    this.updateContent(true);
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.artworks.length) % this.artworks.length;
    this.updateContent(true);
  }

  updateContent(animate = true) {
    const artwork = this.artworks[this.currentIndex];
    if (!artwork) return;

    this.resetZoom();
    this.elements.container.innerHTML = '';
    
    const media = document.createElement('img');
    media.className = 'gallery-lightbox__image';
    const src = artwork.hires || artwork.src || (artwork.file ? `images/artworks/${artwork.file}` : '');
    media.src = src;
    media.alt = artwork.title || '';
    media.draggable = false;
    
    this.elements.container.appendChild(media);
    this.elements.img = media;

    // Update Text
    this.elements.title.textContent = artwork.title || '';
    this.elements.meta.textContent = artwork.year ? `${artwork.year} • ${artwork.technique || ''}` : '';
    this.elements.series.textContent = artwork.series ? `Serie: ${artwork.series.toUpperCase()}` : '';
    
    // Update Counter
    this.elements.counter.querySelector('.current').textContent = this.currentIndex + 1;
    this.elements.counter.querySelector('.total').textContent = this.artworks.length;

    if (animate) {
      // Sovereign Reveal: Combination of blur, scale and exposure
      media.animate([
        { opacity: 0, transform: 'scale(0.95) translateY(10px)', filter: 'blur(20px) brightness(2)' },
        { opacity: 1, transform: 'scale(1) translateY(0)', filter: 'blur(0) brightness(1)' }
      ], { 
        duration: 800, 
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)' 
      });
    }
  }

  // ===========================================
  // ZOOM / PAN LOGIC
  // ===========================================

  resetZoom() {
    this.zoom.scale = 1;
    this.zoom.offsetX = 0;
    this.zoom.offsetY = 0;
    this.zoom.panning = false;
    this.applyTransform();
  }

  handleWheel(e) {
    if (!this.isOpen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom.scale = Math.min(Math.max(this.zoom.scale * delta, 1), 4);
    this.applyTransform();
  }

  handleMouseDown(e) {
    if (this.zoom.scale <= 1) return;
    this.zoom.panning = true;
    this.zoom.startX = e.clientX - this.zoom.offsetX;
    this.zoom.startY = e.clientY - this.zoom.offsetY;
  }

  handleMouseMove(e) {
    if (!this.zoom.panning) return;
    this.zoom.offsetX = e.clientX - this.zoom.startX;
    this.zoom.offsetY = e.clientY - this.zoom.startY;
    this.applyTransform();
  }

  handleMouseUp() {
    this.zoom.panning = false;
  }

  applyTransform() {
    if (this.elements.img) {
      this.elements.img.style.transform = `translate(${this.zoom.offsetX}px, ${this.zoom.offsetY}px) scale(${this.zoom.scale})`;
      this.elements.lightbox.style.cursor = this.zoom.scale > 1 ? 'grab' : '';
    }
  }

  // ===========================================
  // TOUCH LOGIC
  // ===========================================

  handleTouchStart(e) {
    if (e.touches.length === 1) {
      this.touch.startX = e.touches[0].clientX;
      this.touch.startY = e.touches[0].clientY;
      this.touch.startTime = Date.now();
      
      if (this.zoom.scale > 1) {
        this.zoom.panning = true;
        this.zoom.startX = e.touches[0].clientX - this.zoom.offsetX;
        this.zoom.startY = e.touches[0].clientY - this.zoom.offsetY;
      }
    }
  }

  handleTouchMove(e) {
    if (this.zoom.panning && e.touches.length === 1) {
      e.preventDefault();
      this.zoom.offsetX = e.touches[0].clientX - this.zoom.startX;
      this.zoom.offsetY = e.touches[0].clientY - this.zoom.startY;
      this.applyTransform();
    }
  }

  handleTouchEnd(e) {
    if (this.zoom.scale === 1 && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - this.touch.startX;
      const dt = Date.now() - this.touch.startTime;
      if (dt < 300 && Math.abs(dx) > 50) {
        dx > 0 ? this.prev() : this.next();
      }
    }
    this.zoom.panning = false;
  }

  handleKeydown(e) {
    if (!this.isOpen) return;
    if (e.key === 'Escape') this.close();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }
}
