/**
 * Lightbox - Fullscreen image viewer for Naroa 2026
 * @module features/lightbox
 */

(function() {
  'use strict';

  let currentIndex = 0;
  let artworks = [];
  let isOpen = false;

  const elements = {
    lightbox: null,
    img: null,
    caption: null,
    closeBtn: null,
    prevBtn: null,
    nextBtn: null
  };

  // ===========================================
  // NAVIGATION
  // ===========================================

  function showImage(index) {
    if (index < 0) index = artworks.length - 1;
    if (index >= artworks.length) index = 0;
    
    currentIndex = index;
    const artwork = artworks[currentIndex];

    if (elements.img && artwork) {
      elements.img.src = `images/artworks/${artwork.file}`;
      elements.img.alt = artwork.title;
    }

    if (elements.caption && artwork) {
      elements.caption.textContent = artwork.title;
    }
  }

  function next() {
    showImage(currentIndex + 1);
  }

  function prev() {
    showImage(currentIndex - 1);
  }

  function close() {
    if (elements.lightbox) {
      elements.lightbox.hidden = true;
      isOpen = false;
      document.body.style.overflow = '';
    }
  }

  // ===========================================
  // EVENT HANDLERS
  // ===========================================

  function handleKeydown(e) {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowRight':
        next();
        break;
      case 'ArrowLeft':
        prev();
        break;
      case 'Escape':
        close();
        break;
    }
  }

  function handleClick(e) {
    // Close on background click
    if (e.target === elements.lightbox) {
      close();
    }
  }

  // ===========================================
  // PUBLIC API
  // ===========================================

  window.Lightbox = {
    init() {
      elements.lightbox = document.getElementById('lightbox');
      elements.img = document.getElementById('lightbox-img');
      elements.caption = document.getElementById('lightbox-caption');
      elements.closeBtn = document.querySelector('.lightbox__close');
      elements.prevBtn = document.querySelector('.lightbox__prev');
      elements.nextBtn = document.querySelector('.lightbox__next');

      if (!elements.lightbox) return;

      // Event listeners
      elements.closeBtn?.addEventListener('click', close);
      elements.prevBtn?.addEventListener('click', prev);
      elements.nextBtn?.addEventListener('click', next);
      elements.lightbox.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKeydown);

      console.log('[Lightbox] Initialized');
    },

    open(artwork, allArtworks) {
      artworks = allArtworks || [artwork];
      currentIndex = artworks.findIndex(a => a.id === artwork.id);
      
      if (currentIndex === -1) currentIndex = 0;

      if (elements.lightbox) {
        elements.lightbox.hidden = false;
        isOpen = true;
        document.body.style.overflow = 'hidden';
        showImage(currentIndex);
      }
    },

    close,
    next,
    prev
  };

})();
