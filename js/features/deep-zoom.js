/**
 * Deep Zoom Viewer v2.0 — Powered by OpenSeadragon + K25 Vision
 * Enables infinite zoom for high-resolution artworks
 * with AI-powered artwork insights panel
 * @module features/deep-zoom
 * 
 * Requires: OpenSeadragon loaded via CDN in index.html
 * Optional: K25VisionService for AI art analysis
 */

(function() {
  'use strict';

  let viewer = null;
  let currentArtwork = null;
  let insightsPanelOpen = false;

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
      <button id="dz-close" class="dz-btn" aria-label="Cerrar Zoom">&times;</button>
      <button id="dz-insights-btn" class="dz-insights-toggle" aria-label="Ver detalles de la obra">
        <span>🔍</span> <span>Insights</span>
      </button>
      <div class="dz-toolbar">
        <button id="dz-home" class="dz-btn" aria-label="Reiniciar">⟲</button>
        <button id="dz-out" class="dz-btn" aria-label="Alejar">−</button>
        <span class="dz-zoom-level" id="dz-level">1.0×</span>
        <button id="dz-in" class="dz-btn" aria-label="Acercar">+</button>
        <button id="dz-full" class="dz-btn" aria-label="Pantalla Completa">⛶</button>
      </div>
      <div id="${ZOOM_VIEWER_ID}" class="deep-zoom-viewer"></div>
      <div class="deep-zoom-loading">Cargando Alta Resolución...</div>
      <aside id="dz-insights" class="dz-insights-panel" aria-label="Detalles de la obra">
        <div id="dz-insights-content"></div>
      </aside>
    `;

    document.body.appendChild(container);

    // Event Listeners
    document.getElementById('dz-close').addEventListener('click', closeZoom);
    document.getElementById('dz-insights-btn').addEventListener('click', toggleInsights);
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !container.hidden) {
        if (insightsPanelOpen) {
          toggleInsights();
        } else {
          closeZoom();
        }
      }
    });
  }

  /**
   * Toggle the artwork insights panel
   */
  function toggleInsights() {
    const panel = document.getElementById('dz-insights');
    const btn = document.getElementById('dz-insights-btn');
    insightsPanelOpen = !insightsPanelOpen;
    
    panel.classList.toggle('open', insightsPanelOpen);
    btn.classList.toggle('active', insightsPanelOpen);
    
    if (insightsPanelOpen && currentArtwork) {
      populateInsights(currentArtwork);
    }
  }

  /**
   * Populate insights panel with artwork data + AI analysis
   * @param {Object} artwork - Artwork data object
   */
  function populateInsights(artwork) {
    const content = document.getElementById('dz-insights-content');
    
    // Static artwork info
    content.innerHTML = `
      <h2 class="dz-insights-title">${artwork.title || 'Sin título'}</h2>
      <p class="dz-insights-technique">${artwork.technique || 'Obra original'} ${artwork.year ? `· ${artwork.year}` : ''}</p>
      
      <div class="dz-insight-card">
        <div class="dz-insight-label">Categoría</div>
        <div class="dz-insight-value">${formatCategory(artwork.category || '')}</div>
      </div>
      
      ${artwork.dimensions ? `
      <div class="dz-insight-card">
        <div class="dz-insight-label">Dimensiones</div>
        <div class="dz-insight-value">${artwork.dimensions}</div>
      </div>` : ''}
      
      <div id="dz-ai-insights">
        <div class="dz-insight-card">
          <div class="dz-insight-label">Análisis IA</div>
          <div class="dz-insight-skeleton" style="width:90%"></div>
          <div class="dz-insight-skeleton" style="width:70%"></div>
          <div class="dz-insight-skeleton" style="width:80%"></div>
        </div>
      </div>
      
      <a href="#contacto" class="dz-cta-btn" onclick="window.DeepZoom.close();">
        ✦ Consultar sobre esta obra
      </a>
    `;

    // Try AI analysis via K25VisionService
    requestAIInsights(artwork);
  }

  /**
   * Request AI-powered artwork analysis
   * @param {Object} artwork - Artwork data
   */
  async function requestAIInsights(artwork) {
    const aiContainer = document.getElementById('dz-ai-insights');
    if (!aiContainer) return;

    // Check if K25VisionService is available
    if (!window.K25VisionService) {
      aiContainer.innerHTML = `
        <div class="dz-insight-card">
          <div class="dz-insight-label">Modo</div>
          <div class="dz-insight-value">Deep Zoom activo · Pinza para hacer zoom</div>
        </div>
      `;
      return;
    }

    try {
      const imagePath = artwork.file.startsWith('/') 
        ? artwork.file 
        : '/images/artworks/' + artwork.file;
      
      const analysis = await window.K25VisionService.analyzeAlbumArt(imagePath);
      
      aiContainer.innerHTML = `
        ${analysis.visual_mood ? `
        <div class="dz-insight-card">
          <div class="dz-insight-label">Estado Emocional</div>
          <div class="dz-insight-value">${analysis.visual_mood}</div>
        </div>` : ''}
        
        ${analysis.chromatic_soul ? `
        <div class="dz-insight-card">
          <div class="dz-insight-label">Alma Cromática</div>
          <div class="dz-insight-value">${analysis.chromatic_soul}</div>
        </div>` : ''}
        
        ${analysis.era_aesthetic ? `
        <div class="dz-insight-card">
          <div class="dz-insight-label">Estética</div>
          <div class="dz-insight-value">${analysis.era_aesthetic}</div>
        </div>` : ''}
        
        ${analysis.genre_visual_match ? `
        <div class="dz-insight-card">
          <div class="dz-insight-label">Género Visual</div>
          <div class="dz-insight-value">${analysis.genre_visual_match}</div>
        </div>` : ''}
      `;
    } catch (err) {
      console.warn('[DeepZoom] AI insights failed, showing fallback', err);
      aiContainer.innerHTML = `
        <div class="dz-insight-card">
          <div class="dz-insight-label">Zoom</div>
          <div class="dz-insight-value">Usa la rueda del ratón o pinza para explorar los detalles</div>
        </div>
      `;
    }
  }

  /**
   * Format category ID to readable name
   */
  function formatCategory(cat) {
    const names = {
      'rocks': 'Rocks',
      'tributos-musicales': 'Tributos Musicales',
      'espejos-del-alma': 'Espejos del Alma',
      'enlatas': 'En.lata.das',
      'golden': 'Golden Series',
      'retratos': 'Retratos',
      'naturaleza': 'Naturaleza',
      'amor': 'Amor'
    };
    return names[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General';
  }

  /**
   * Update zoom level display
   */
  function updateZoomLevel() {
    if (!viewer) return;
    const level = viewer.viewport.getZoom(true);
    const el = document.getElementById('dz-level');
    if (el) {
      el.textContent = level.toFixed(1) + '×';
    }
  }

  /**
   * Open Deep Zoom for a specific artwork
   * @param {string} imagePath - Path to high-res image
   * @param {Object} [artworkData] - Optional artwork metadata for insights
   * @returns {boolean} - true if opened, false if fallback needed
   */
  function openZoom(imagePath, artworkData) {
    // Check OpenSeadragon is available
    if (typeof OpenSeadragon === 'undefined') {
      console.warn('[DeepZoom] OpenSeadragon not loaded. Falling back to lightbox.');
      return false;
    }

    initDOM();
    const container = document.getElementById(ZOOM_CONTAINER_ID);
    const loading = container.querySelector('.deep-zoom-loading');
    
    container.hidden = false;
    // Trigger opacity transition
    requestAnimationFrame(() => {
      container.classList.add('active');
    });
    
    document.body.style.overflow = 'hidden'; // Lock scroll
    loading.style.display = 'flex';

    // Store artwork data for insights panel
    currentArtwork = artworkData || { title: 'Obra', file: imagePath };

    // Reset insights panel state
    insightsPanelOpen = false;
    const panel = document.getElementById('dz-insights');
    const btn = document.getElementById('dz-insights-btn');
    if (panel) panel.classList.remove('open');
    if (btn) btn.classList.remove('active');

    // Destroy previous instance
    if (viewer) {
      viewer.destroy();
      viewer = null;
    }

    // Initialize OpenSeadragon
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
      showNavigationControl: false, // Custom toolbar
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

    // Track zoom level
    viewer.addHandler('zoom', updateZoomLevel);
    viewer.addHandler('animation', updateZoomLevel);

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
      container.classList.remove('active');
      
      // Wait for fade-out transition
      setTimeout(() => {
        container.hidden = true;
        document.body.style.overflow = '';
        if (viewer) {
          viewer.destroy();
          viewer = null;
        }
        currentArtwork = null;
        insightsPanelOpen = false;
      }, 400);
    }
  }

  // Public API
  window.DeepZoom = {
    open: openZoom,
    close: closeZoom
  };

})();
