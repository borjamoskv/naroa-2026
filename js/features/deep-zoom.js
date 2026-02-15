/**
 * Deep Zoom Viewer - Powered by OpenSeadragon
 * Enables infinite zoom for high-resolution artworks
 * @module features/deep-zoom
 * 
 * Requires: OpenSeadragon loaded via CDN in index.html
 */

(function() {
  'use strict';

  let viewer = null;
  const ZOOM_CONTAINER_ID = 'deep-zoom-container';
  const ZOOM_VIEWER_ID = 'openseadragon-viewer';

  /**
   * Initialize Deep Zoom Viewer structure in DOM
   */
  function initDOM() {
    if (document.getElementById(ZOOM_CONTAINER_ID)) return;

    const container = document.createElement('div');
    container.id = ZOOM_CONTAINER_ID;
    container.className = 'deep-zoom-overlay';
    container.hidden = true;

    container.innerHTML = `
      <div class="deep-zoom-controls">
        <button id="dz-close" class="dz-btn" aria-label="Cerrar Zoom">&times;</button>
        <div class="dz-toolbar">
          <button id="dz-home" class="dz-btn" aria-label="Reiniciar">⟲</button>
          <button id="dz-in" class="dz-btn" aria-label="Acercar">+</button>
          <button id="dz-out" class="dz-btn" aria-label="Alejar">-</button>
          <button id="dz-full" class="dz-btn" aria-label="Pantalla Completa">⛶</button>
        </div>
      </div>
      <div id="${ZOOM_VIEWER_ID}" class="deep-zoom-viewer"></div>
      <div class="deep-zoom-loading">Cargando Alta Resolución...</div>
    `;

    document.body.appendChild(container);

    // Event Listeners
    document.getElementById('dz-close').addEventListener('click', closeZoom);
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !container.hidden) {
        closeZoom();
      }
    });
  }

  /**
   * Open Deep Zoom for a specific artwork
   * @param {string} imagePath - Path to high-res image
   */
  function openZoom(imagePath) {
    // Check OpenSeadragon is available
    if (typeof OpenSeadragon === 'undefined') {
      console.warn('[DeepZoom] OpenSeadragon not loaded. Falling back to lightbox.');
      return false;
    }

    initDOM();
    const container = document.getElementById(ZOOM_CONTAINER_ID);
    const loading = container.querySelector('.deep-zoom-loading');
    
    container.hidden = false;
    document.body.style.overflow = 'hidden'; // Lock scroll
    loading.style.display = 'block';

    // Destroy previous instance
    if (viewer) {
      viewer.destroy();
      viewer = null;
    }

    // Initialize OpenSeadragon
    // For single images without tiles, we use 'image' type
    viewer = OpenSeadragon({
      id: ZOOM_VIEWER_ID,
      prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
      tileSources: {
        type: 'image',
        url: imagePath,
        buildPyramid: false // Single high-res files, not DZI
      },
      animationTime: 0.5,
      blendTime: 0.1,
      constrainDuringPan: true,
      maxZoomPixelRatio: 4,
      minZoomImageRatio: 0.8,
      visibilityRatio: 1,
      zoomPerScroll: 1.2,
      showNavigationControl: false, // We use custom toolbar
      zoomInButton: 'dz-in',
      zoomOutButton: 'dz-out',
      homeButton: 'dz-home',
      fullPageButton: 'dz-full',
      gestureSettingsTouch: {
        pinchRotate: false
      }
    });

    // Hide loading when ready
    viewer.addHandler('open', () => {
      loading.style.display = 'none';
      
      // Subtle initial zoom animation
      setTimeout(() => {
        viewer.viewport.zoomTo(1.2);
        viewer.viewport.applyConstraints();
      }, 500);
    });

    viewer.addHandler('open-failed', () => {
      loading.textContent = "Error al cargar imagen de alta resolución";
      setTimeout(() => closeZoom(), 2000);
    });

    return true;
  }

  /**
   * Close Zoom Viewer
   */
  function closeZoom() {
    const container = document.getElementById(ZOOM_CONTAINER_ID);
    if (container) {
      container.hidden = true;
      document.body.style.overflow = '';
      if (viewer) {
        viewer.destroy();
        viewer = null;
      }
    }
  }

  // Public API
  window.DeepZoom = {
    open: openZoom,
    close: closeZoom
  };

})();
