/**
 * Gallery - Image grid with lazy loading for Naroa 2026
 * @module features/gallery
 */

(function() {
  'use strict';

  // ===========================================
  // SAMPLE ARTWORK DATA (replace with real data)
  // ===========================================
  
  const ARTWORKS = [
    { id: 1, title: 'Amy Rocks', file: 'amy-rocks.webp', category: 'divinos' },
    { id: 2, title: 'Beatriz de Pandora', file: 'beatriz-de-pandora.webp', category: 'retratos' },
    { id: 3, title: 'Celia Cruz', file: 'celia-cruz.png', category: 'iconos' },
    { id: 4, title: 'Divinos Amy', file: 'divinos-amy.webp', category: 'divinos' },
    { id: 5, title: 'Divinos James', file: 'divinos-james.webp', category: 'divinos' },
    { id: 6, title: 'Divinos Johnny', file: 'divinos-johnny.webp', category: 'divinos' },
    { id: 7, title: 'Divinos Marilyn', file: 'divinos-marilyn.webp', category: 'divinos' },
    { id: 8, title: 'Flying Dragon', file: 'flying-dragon.webp', category: 'fantasia' },
  ];

  const CATEGORIES = ['todos', 'divinos', 'retratos', 'iconos', 'fantasia'];

  // ===========================================
  // LAZY LOADING
  // ===========================================

  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
        }
        lazyObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px'
  });

  // ===========================================
  // RENDER FUNCTIONS
  // ===========================================

  function renderGalleryItem(artwork) {
    const item = document.createElement('div');
    item.className = 'gallery__item';
    item.dataset.category = artwork.category;
    item.dataset.id = artwork.id;

    item.innerHTML = `
      <img 
        data-src="images/artworks/${artwork.file}" 
        alt="${artwork.title}"
        loading="lazy"
      >
      <span class="gallery__caption">${artwork.title}</span>
    `;

    // Setup lazy loading
    const img = item.querySelector('img');
    lazyObserver.observe(img);

    // Click handler for lightbox
    item.addEventListener('click', () => {
      if (window.Lightbox) {
        window.Lightbox.open(artwork, ARTWORKS);
      }
    });

    return item;
  }

  function renderFilters(container) {
    container.innerHTML = '';
    
    CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'gallery__filter';
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      btn.dataset.category = cat;
      
      if (cat === 'todos') {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => filterGallery(cat));
      container.appendChild(btn);
    });
  }

  function filterGallery(category) {
    // Update active filter button
    document.querySelectorAll('.gallery__filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Filter items
    document.querySelectorAll('.gallery__item').forEach(item => {
      if (category === 'todos' || item.dataset.category === category) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // ===========================================
  // PUBLIC API
  // ===========================================

  window.Gallery = {
    loadPortfolio() {
      const container = document.getElementById('portfolio-gallery');
      if (!container) return;

      container.innerHTML = '';
      
      // Show featured items for portfolio
      const featured = ARTWORKS.slice(0, 6);
      featured.forEach(artwork => {
        container.appendChild(renderGalleryItem(artwork));
      });
    },

    loadGallery() {
      const container = document.getElementById('galeria-grid');
      const filtersContainer = document.getElementById('gallery-filters');
      
      if (!container) return;

      // Render filters
      if (filtersContainer) {
        renderFilters(filtersContainer);
      }

      // Render all artworks
      container.innerHTML = '';
      ARTWORKS.forEach(artwork => {
        container.appendChild(renderGalleryItem(artwork));
      });
    },

    // Allow external data injection
    setArtworks(artworks) {
      ARTWORKS.length = 0;
      ARTWORKS.push(...artworks);
    }
  };

})();
