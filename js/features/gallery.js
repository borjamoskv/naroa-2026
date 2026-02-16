/**
 * Gallery - Image grid with lazy loading and filters for Naroa 2026
 * @module features/gallery
 * @version 3.0.0 - Filter System with Taxonomy Integration
 */

(function() {
  'use strict';

  // ===========================================
  // DYNAMIC ARTWORK DATA LOADING
  // ===========================================
  
  let ARTWORKS = [];
  let TAXONOMY = null;
  let FILTERS = [];
  let currentFilter = 'todos';

  /**
   * Load artwork metadata and taxonomy from JSON
   * Only includes artworks that have corresponding images
   */
  async function loadArtworkData() {
    try {
      const [metadataRes, taxonomyRes] = await Promise.all([
        fetch('/data/database.json')
          .catch(() => fetch('data/database.json')), // Fallback for local
        window.DataCache.get('data/artworks-taxonomy.json') // Primary source from cache
          .then(data => new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })) // Wrap in Response for consistency
          .catch(() => fetch('/data/artworks-taxonomy.json')) // Fallback to fetch if cache fails
          .catch(() => fetch('data/artworks-taxonomy.json'))  // Fallback for local path
      ]);
      
      if (metadataRes.ok) {
        const rawData = await metadataRes.json();
        
        // Map artworks from metadata — handle flat array or object with 'artworks' key
        // Trust JSON as source of truth (no HEAD requests)
        const sourceArtworks = Array.isArray(rawData) ? rawData : (rawData.artworks || []);
        
        ARTWORKS = sourceArtworks
          .map((art, index) => ({
            id: index + 1,
            title: art.title,
            file: art.image ? art.image.replace('images/artworks/', '') : art.file, // Handle both 'image' (path) and legacy 'file' (filename)
            category: (art.series || art.category || 'todos').toLowerCase().replace(/\s+/g, '-'), // Normalize series to category ID
            technique: art.technique,
            year: art.year,
            description: art.description || art.altText || '', // SEO & Accessibility
            originalId: art.id,
            featured: art.featured
          }));
        
      }
      
      if (taxonomyRes.ok) {
        TAXONOMY = await taxonomyRes.json();
        // Use filters array from taxonomy
        if (TAXONOMY.filters && Array.isArray(TAXONOMY.filters)) {
          FILTERS = TAXONOMY.filters;
        }
      }
      
      return true;
    } catch (err) {
      console.warn('[Gallery] Using fallback data:', err);
      return false;
    }
  }

  // Fallback data if JSON fails to load
  const FALLBACK_ARTWORKS = [
    { id: 1, title: 'Amy Rocks', file: 'amy-rocks.webp', category: 'rocks' },
    { id: 2, title: 'James Dean', file: 'james-dean.webp', category: 'retratos' },
    { id: 3, title: 'Johnny Depp', file: 'johnny-depp.webp', category: 'rocks' },
    { id: 4, title: 'Marilyn Monroe', file: 'marilyn-monroe.webp', category: 'rocks' },
    { id: 5, title: 'Audrey Hepburn', file: 'audrey-hepburn.webp', category: 'retratos' },
    { id: 6, title: 'Mr. Fahrenheit', file: 'mr-fahrenheit.webp', category: 'tributos-musicales' },
    { id: 7, title: 'Espejos del Alma', file: 'espejos-del-alma.webp', category: 'espejos-del-alma' },
    { id: 8, title: 'La Llorona', file: 'la-llorona.webp', category: 'naturaleza' },
    { id: 9, title: 'Amor en Conserva', file: 'amor-en-conserva.webp', category: 'enlatas' },
    { id: 10, title: 'The Golden Couple', file: 'the-golden-couple.webp', category: 'golden' }
  ];

  // Fallback filters
  const FALLBACK_FILTERS = [
    { id: 'todos', label: 'Todas', emoji: '🎨' },
    { id: 'rocks', label: 'Rocks', emoji: '🤟' },
    { id: 'tributos-musicales', label: 'Tributos', emoji: '🎤' },
    { id: 'espejos-del-alma', label: 'Espejos', emoji: '🪞' },
    { id: 'enlatas', label: 'En.lata.das', emoji: '🥫' },
    { id: 'golden', label: 'Golden', emoji: '✨' },
    { id: 'retratos', label: 'Retratos', emoji: '👤' },
    { id: 'naturaleza', label: 'Naturaleza', emoji: '🦜' }
  ];

  // ===========================================
  // LAZY LOADING + SHIMMER → REVEAL
  // ===========================================

  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Handle <picture> sources
        const picture = img.closest('picture');
        if (picture) {
          picture.querySelectorAll('source[data-srcset]').forEach(source => {
            source.srcset = source.dataset.srcset;
          });
        }
        
        // Handle img src
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        img.classList.add('loaded');
        lazyObserver.unobserve(img);

        // Remove shimmer when loaded
        img.addEventListener('load', () => {
          const wrapper = img.closest('.stitch-media-wrapper');
          if (wrapper) wrapper.classList.remove('shimmer');
        }, { once: true });
      }
    });
  }, {
    rootMargin: '300% 300%',
    threshold: 0.01
  });

  // Scroll reveal observer — staggers cards into view
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('gallery__item--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.05
  });

  // ===========================================
  // COUNT ARTWORKS BY SERIES
  // ===========================================

  /**
   * Count artworks per series
   * @returns {Object} Map of series id to count
   */
  function getArtworkCounts() {
    const counts = { todos: ARTWORKS.length };
    
    ARTWORKS.forEach(artwork => {
      const series = artwork.category;
      if (series) {
        counts[series] = (counts[series] || 0) + 1;
      }
    });
    
    return counts;
  }

  // ===========================================
  // RENDER FUNCTIONS
  // ===========================================

  /**
   * Render a single gallery item
   * @param {Object} artwork - Artwork data
   * @param {boolean} animate - Whether to add entrance animation
   * @returns {HTMLElement} Gallery item element
   */
  function renderGalleryItem(artwork, animate = false) {
    const item = document.createElement('div');
    // STITCH UI: Premium Card Structure
    item.className = 'gallery__item stitch-card';
    item.dataset.category = artwork.category;
    item.dataset.id = artwork.id;
    if (artwork.description) item.dataset.description = artwork.description;

    // Series color from taxonomy
    const seriesInfo = TAXONOMY?.series?.[artwork.category];
    const seriesColor = seriesInfo?.color || 'var(--gold-metallic, #d4af37)';
    item.style.setProperty('--series-color', seriesColor);

    if (animate) {
      item.classList.add('gallery__item--enter');
    }

    // Check if featured
    const isFeatured = artwork.featured || FEATURED_ARTWORK_IDS.includes(artwork.originalId);

    const baseName = artwork.file.replace('.webp', '');
    const isPlaceholder = artwork.file.includes('placeholder');
    
    if (isPlaceholder) {
      item.innerHTML = `
        <div class="stitch-media-wrapper stitch-placeholder" style="background: linear-gradient(135deg, #111 0%, var(--series-color) 100%); opacity: 0.8;">
          <div class="stitch-placeholder__content">
            <span class="stitch-placeholder__icon">🎨</span>
            <span class="stitch-placeholder__text">Próximamente</span>
          </div>
        </div>
        ${isFeatured ? '<span class="stitch-badge stitch-badge--featured">★ Destacada</span>' : ''}
        <div class="stitch-content">
          <h3 class="stitch-title">${artwork.title}</h3>
          <div class="stitch-subtitle">
            <span>${artwork.technique || 'Obra original'}</span>
            ${artwork.year ? `<span class="stitch-badge">${artwork.year}</span>` : ''}
          </div>
          <a href="#contacto" class="stitch-card__cta" onclick="event.stopPropagation();">✦ Consultar</a>
        </div>
      `;
    } else {
      item.innerHTML = `
        <div class="stitch-media-wrapper shimmer">
          <img 
            data-src="${artwork.file.startsWith('/') ? artwork.file : '/images/artworks/' + artwork.file}" 
            alt="${artwork.description || artwork.title}"
            loading="lazy"
            class="stitch-media-content gallery__img--hq"
            onerror="this.style.display='none'; console.warn('Missing image:', this.dataset.src || this.src);"
          >
        </div>
        ${isFeatured ? '<span class="stitch-badge stitch-badge--featured">★ Destacada</span>' : ''}
        <div class="stitch-content">
          <h3 class="stitch-title">${artwork.title}</h3>
          <div class="stitch-subtitle">
            <span>${artwork.technique || 'Obra original'}</span>
            ${artwork.year ? `<span class="stitch-badge">${artwork.year}</span>` : ''}
          </div>
          <a href="#contacto" class="stitch-card__cta" onclick="event.stopPropagation();">✦ Consultar</a>
        </div>
      `;
    }

    // Setup lazy loading
    const img = item.querySelector('img');
    if (img) lazyObserver.observe(img);

    // Scroll reveal
    revealObserver.observe(item);

    // Click handler for lightbox OR Deep Zoom if available
    item.addEventListener('click', (e) => {
      // High-Res detection: files starting with 'hq-'
      const isHighRes = artwork.file.startsWith('hq-') || artwork.file.includes('-hq-') || artwork.file.includes('high-res');
      
      if (isHighRes && window.DeepZoom) {
         const highResPath = artwork.file.startsWith('/') ? artwork.file : '/images/artworks/' + artwork.file;
         // DeepZoom.open accepts artwork metadata for the insights panel
         const opened = window.DeepZoom.open(highResPath, artwork);
         if (opened) return;
      }
      
      // Default: open lightbox
      if (window.Lightbox) {
        window.Lightbox.open(artwork, ARTWORKS);
      }
    });

    return item;
  }

  /**
   * Render filter buttons with counts
   * @param {HTMLElement} container - Filters container
   */
  function renderFilters(container) {
    container.innerHTML = '';
    // Enable horizontal scroll for mobile
    container.classList.add('gallery-filters--scrollable');
    
    const counts = getArtworkCounts();
    const filtersToUse = FILTERS.length > 0 ? FILTERS : FALLBACK_FILTERS;
    
    filtersToUse.forEach(filter => {
      const count = counts[filter.id] || 0;
      
      // Skip filters with no artworks (except 'todos')
      if (filter.id !== 'todos' && count === 0) {
        return;
      }

      // Get series color from taxonomy
      const seriesInfo = TAXONOMY?.series?.[filter.id];
      const seriesColor = seriesInfo?.color || 'var(--gold-metallic, #d4af37)';
      
      const btn = document.createElement('button');
      btn.className = 'gallery-filter';
      btn.dataset.category = filter.id;
      btn.style.setProperty('--filter-color', seriesColor);
      
      // Use emoji from filter, with fallback
      const emoji = filter.emoji || '🎨';
      
      btn.innerHTML = `
        <span class="gallery-filter__emoji">${emoji}</span>
        <span class="gallery-filter__label">${filter.label}</span>
        <span class="gallery-filter__count">${count}</span>
      `;
      
      // Set active state
      if (filter.id === currentFilter) {
        btn.classList.add('gallery-filter--active');
      }

      btn.addEventListener('click', () => filterGallery(filter.id));
      container.appendChild(btn);
    });
  }

  /**
   * Filter gallery by category with animation
   * @param {string} category - Category ID to filter by
   */
  function filterGallery(category) {
    currentFilter = category;
    const container = document.getElementById('archivo-grid');
    const filtersContainer = document.getElementById('gallery-filters');
    
    if (!container) return;

    // Update active filter button
    document.querySelectorAll('.gallery-filter').forEach(btn => {
      btn.classList.toggle('gallery-filter--active', btn.dataset.category === category);
    });

    // Get filtered artworks
    const filteredArtworks = category === 'todos' 
      ? ARTWORKS 
      : ARTWORKS.filter(artwork => artwork.category === category);

    // Update gallery title
    updateGalleryTitle(category, filteredArtworks.length);

    // Animate out current items
    const currentItems = container.querySelectorAll('.gallery__item');
    
    if (currentItems.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      currentItems.forEach(item => {
        item.classList.add('gallery__item--exit');
      });
      setTimeout(() => {
        renderGalleryGrid(container, filteredArtworks);
      }, 250);
    } else {
      renderGalleryGrid(container, filteredArtworks);
    }

    // Update URL hash for shareable links
    if (category !== 'todos') {
      history.replaceState(null, null, `#/archivo/${category}`);
    } else {
      history.replaceState(null, null, '#/archivo');
    }
  }

  /**
   * Update gallery section title to reflect current filter
   */
  function updateGalleryTitle(category, count) {
    const titleEl = document.querySelector('#view-archivo .section-title, #view-archivo h2');
    if (!titleEl) return;

    if (category === 'todos') {
      titleEl.textContent = 'Archivo Completo';
    } else {
      const filterInfo = FILTERS.find(f => f.id === category);
      const seriesInfo = TAXONOMY?.series?.[category];
      const name = seriesInfo?.displayNameEs || filterInfo?.label || category;
      const emoji = filterInfo?.emoji || '';
      titleEl.textContent = `${emoji} ${name} — ${count} obra${count !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Render the gallery grid with entrance animation
   * @param {HTMLElement} container - Gallery container
   * @param {Array} artworks - Array of artworks to render
   */
  function renderGalleryGrid(container, artworks) {
    container.innerHTML = '';

    if (artworks.length === 0) {
      container.innerHTML = `
        <div class="gallery__empty">
          <span class="gallery__empty-icon">🎨</span>
          <p>No hay obras en esta categoría</p>
        </div>
      `;
      return;
    }
    
    artworks.forEach((artwork, index) => {
      const item = renderGalleryItem(artwork, true);
      
      // Stagger index for reveal observer
      item.style.setProperty('--reveal-index', index);
      
      container.appendChild(item);
    });

    // Trigger reflow to start animations
    container.offsetHeight;

    // Add entering class for animation
    requestAnimationFrame(() => {
      container.querySelectorAll('.gallery__item--enter').forEach(item => {
        item.classList.add('gallery__item--entering');
      });
    });
  }

  // ===========================================
  // FEATURED ARTWORKS (IA Alliance Curated Selection)
  // Criteria: featured:true in metadata + available webp + series diversity
  // ===========================================
  
  // Curated by IA Alliance Protocol - Feb 2026
  // Covering: rocks, tributos-musicales, espejos-del-alma, enlatas, golden, amor, retratos, naturaleza
  // VERIFIED: All IDs match existing .webp files in images/artworks/
  const FEATURED_ARTWORK_IDS = [
    'amy-rocks',                    // Rocks - iconic series opener
    'marilyn-rocks-hq-5',           // Rocks - Marilyn variant (verified)
    'james-rocks-hq-3',             // Rocks - James Dean (verified)
    'baroque-farrokh',              // Tributos Musicales - Freddie Mercury variant
    'audrey-hepburn',               // Tributos - Audrey Lightning
    'espejos-del-alma',             // Espejos del Alma - signature piece
    'amor-en-conserva',             // En.lata.das - conceptual collage
    'hugo-box',                     // En.lata.das - 2024 recent work
    'the-golden-couple-and-balloons', // Golden series
    'lagrimas-de-oro',              // Golden - emotional impact
    'love',                         // Amor series - universal theme
    'smile-world-smiles-back',      // Amor - optimistic message
    'el-gran-dakari',               // Retratos - powerful portrait
    'peter-rowan',                   // Retratos - pencil mastery (now converted to webp)
    'pajarraca-azul'                // Naturaleza - vibrant wildlife
  ];

  // ===========================================
  // PUBLIC API
  // ===========================================

  window.Gallery = {
    loadFeatured() {
      const container = document.getElementById('featured-gallery');
      if (!container) return;

      // DISRUPTIVE GALLERY 2026: Respect static layout if present
      // Check if we have the new massive grid layout with existing items
      const hasDisruptiveLayout = container.classList.contains('gallery-massive') &&
                                  container.querySelectorAll('.gallery-massive__item').length > 0;
      
      if (hasDisruptiveLayout) {
        // Initialize the disruptive gallery engine instead
        if (window.GalleryDisruptive) {
          window.GalleryDisruptive.init();
        }
        return;
      }

      // Fallback: Legacy dynamic loading for non-disruptive layouts
      container.innerHTML = '';
      
      // Match by artwork file ID (without .webp extension)
      const featured = ARTWORKS.filter(a => {
        const fileId = a.file.replace('.webp', '');
        return FEATURED_ARTWORK_IDS.includes(fileId);
      });
      
      // Sort by the order in FEATURED_ARTWORK_IDS for intentional curation
      featured.sort((a, b) => {
        const aIndex = FEATURED_ARTWORK_IDS.indexOf(a.file.replace('.webp', ''));
        const bIndex = FEATURED_ARTWORK_IDS.indexOf(b.file.replace('.webp', ''));
        return aIndex - bIndex;
      });
      
      
      featured.forEach(artwork => {
        container.appendChild(renderGalleryItem(artwork));
      });
    },

    loadArchive() {
      const container = document.getElementById('archivo-grid');
      const filtersContainer = document.getElementById('gallery-filters');
      
      if (!container) return;

      // Render filters
      if (filtersContainer) {
        renderFilters(filtersContainer);
      }

      // Check for category in URL hash
      const hashMatch = window.location.hash.match(/#\/archivo\/(.+)/);
      if (hashMatch && FILTERS.some(f => f.id === hashMatch[1])) {
        filterGallery(hashMatch[1]);
      } else {
        // Render all artworks
        renderGalleryGrid(container, ARTWORKS);
      }
    },

    // Legacy aliases for compatibility
    loadPortfolio() { this.loadFeatured(); },
    loadGallery() { this.loadArchive(); },

    // Allow external data injection
    setArtworks(artworks) {
      ARTWORKS.length = 0;
      ARTWORKS.push(...artworks);
    },

    // Async initialization - loads data from JSON
    async init() {
      const loaded = await loadArtworkData();
      if (!loaded || ARTWORKS.length === 0) {
        ARTWORKS = FALLBACK_ARTWORKS.slice();
        FILTERS = FALLBACK_FILTERS;
      }
    },

    // Get series labels for UI
    getSeriesLabels() {
      const labels = {};
      const filtersToUse = FILTERS.length > 0 ? FILTERS : FALLBACK_FILTERS;
      filtersToUse.forEach(filter => {
        labels[filter.id] = `${filter.label} ${filter.emoji || ''}`;
      });
      return labels;
    },

    // Filter by category (public API)
    filterBy(category) {
      if (FILTERS.some(f => f.id === category) || category === 'todos') {
        filterGallery(category);
      }
    },

    // 360° Canvas toggle
    is360Active: false,
    toggle360() {
      this.is360Active = !this.is360Active;
      const gridContainer = document.getElementById('archivo-grid');
      const filtersContainer = document.getElementById('gallery-filters');
      const canvasContainer = document.getElementById('infinite-canvas-container');
      const toggleBtn = document.getElementById('view-toggle-360');

      if (this.is360Active) {
        if (gridContainer) gridContainer.hidden = true;
        if (filtersContainer) filtersContainer.hidden = true;
        if (canvasContainer) {
          canvasContainer.hidden = false;
          if (window.InfiniteCanvas360) window.InfiniteCanvas360.init?.();
        }
        if (toggleBtn) toggleBtn.classList.add('btn-360--active');
        localStorage.setItem('naroa-gallery-view', '360');
      } else {
        if (gridContainer) gridContainer.hidden = false;
        if (filtersContainer) filtersContainer.hidden = false;
        if (canvasContainer) canvasContainer.hidden = true;
        if (toggleBtn) toggleBtn.classList.remove('btn-360--active');
        localStorage.setItem('naroa-gallery-view', 'grid');
      }
    },

    // Restore view preference
    restoreViewPreference() {
      const pref = localStorage.getItem('naroa-gallery-view');
      if (pref === '360') this.toggle360();
    },

    // Get all artworks (for external use like 360 canvas)
    getArtworks() { return ARTWORKS; },
    getTaxonomy() { return TAXONOMY; }
  };

})();
