/**
 * INFINITE CANVAS 360° - Naroa Gallery Engine
 * Navegación libre en todas direcciones con parallax de profundidad
 * 
 * Features:
 * - Drag/scroll en cualquier dirección
 * - 3 capas de parallax (fondo, medio, frente)
 * - Loop infinito de obras
 * - Zoom con rueda del ratón
 * - Efecto niebla en bordes
 */

class InfiniteCanvas360 {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.state = {
      x: 0,
      y: 0,
      zoom: 1,
      isDragging: false,
      startX: 0,
      startY: 0,
      velocityX: 0,
      velocityY: 0,
      friction: 0.95
    };

    this.layers = {
      back: { speed: 0.3, items: [] },
      mid: { speed: 0.6, items: [] },
      front: { speed: 1.0, items: [] }
    };

    this.artworks = [];
    this.gridSize = 400; // Spacing between artworks
    this.viewportBuffer = 2; // How many screens to pre-render

    this.init();
  }

  async init() {
    this.createDOM();
    this.loadArtworks();
    this.setupEventListeners();
    this.startRenderLoop();
  }

  createDOM() {
    this.container.innerHTML = `
      <div class="canvas360">
        <div class="canvas360__fog canvas360__fog--top"></div>
        <div class="canvas360__fog canvas360__fog--bottom"></div>
        <div class="canvas360__fog canvas360__fog--left"></div>
        <div class="canvas360__fog canvas360__fog--right"></div>
        
        <div class="canvas360__layer canvas360__layer--back"></div>
        <div class="canvas360__layer canvas360__layer--mid"></div>
        <div class="canvas360__layer canvas360__layer--front"></div>
        
        <div class="canvas360__compass">
          <div class="canvas360__compass-needle"></div>
          <span class="canvas360__coords">(0, 0)</span>
        </div>
        
        <div class="canvas360__minimap">
          <div class="canvas360__minimap-viewport"></div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.canvas360');
    this.layerBack = this.container.querySelector('.canvas360__layer--back');
    this.layerMid = this.container.querySelector('.canvas360__layer--mid');
    this.layerFront = this.container.querySelector('.canvas360__layer--front');
    this.compass = this.container.querySelector('.canvas360__compass');
    this.coords = this.container.querySelector('.canvas360__coords');
    this.minimap = this.container.querySelector('.canvas360__minimap-viewport');
  }

  async loadArtworks() {
    try {
      const data = await window.DataCache.getArtworks();
      this.artworks = data.artworks || [];
      this.populateLayers();
    } catch (e) {
      Logger.warn('Using fallback artworks');
      this.artworks = [
        { id: 'amy-rocks', title: 'Amy Rocks' },
        { id: 'espejos-del-alma', title: 'Espejos del Alma' },
        { id: 'baroque-farrokh', title: 'Baroque Farrokh' }
      ];
      this.populateLayers();
    }
  }

  populateLayers() {
    const cols = 10;
    const rows = 10;
    
    this.artworks.forEach((artwork, i) => {
      const layer = i % 3 === 0 ? 'back' : i % 3 === 1 ? 'mid' : 'front';
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const item = {
        id: artwork.id,
        title: artwork.title,
        x: col * this.gridSize + (Math.random() - 0.5) * 100,
        y: row * this.gridSize + (Math.random() - 0.5) * 100,
        rotation: (Math.random() - 0.5) * 15,
        scale: 0.8 + Math.random() * 0.4
      };
      
      this.layers[layer].items.push(item);
    });

    this.renderLayers();
  }

  renderLayers() {
    Object.entries(this.layers).forEach(([layerName, layer]) => {
      const layerEl = this.container.querySelector(`.canvas360__layer--${layerName}`);
      if (!layerEl) return;

      layerEl.innerHTML = layer.items.map(item => `
        <div class="canvas360__item" 
             data-id="${item.id}"
             style="
               --item-x: ${item.x}px;
               --item-y: ${item.y}px;
               --item-rot: ${item.rotation}deg;
               --item-scale: ${item.scale};
             ">
          <img src="images/artworks/${item.id}.webp" 
               alt="${item.title}" 
               loading="lazy"
               onerror="this.style.display='none'">
          <span class="canvas360__item-title">${item.title}</span>
        </div>
      `).join('');
    });
  }

  setupEventListeners() {
    // Mouse drag
    this.canvas.addEventListener('mousedown', (e) => {
      this.state.isDragging = true;
      this.state.startX = e.clientX - this.state.x;
      this.state.startY = e.clientY - this.state.y;
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.state.isDragging) return;
      
      const newX = e.clientX - this.state.startX;
      const newY = e.clientY - this.state.startY;
      
      this.state.velocityX = newX - this.state.x;
      this.state.velocityY = newY - this.state.y;
      
      this.state.x = newX;
      this.state.y = newY;
    });

    window.addEventListener('mouseup', () => {
      this.state.isDragging = false;
      this.canvas.style.cursor = 'grab';
    });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.state.isDragging = true;
      this.state.startX = touch.clientX - this.state.x;
      this.state.startY = touch.clientY - this.state.y;
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.state.isDragging) return;
      const touch = e.touches[0];
      this.state.x = touch.clientX - this.state.startX;
      this.state.y = touch.clientY - this.state.startY;
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.state.isDragging = false;
    });

    // Zoom with wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.state.zoom = Math.max(0.3, Math.min(3, this.state.zoom * delta));
    }, { passive: false });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const speed = 50;
      switch(e.key) {
        case 'ArrowUp': case 'w': this.state.y += speed; break;
        case 'ArrowDown': case 's': this.state.y -= speed; break;
        case 'ArrowLeft': case 'a': this.state.x += speed; break;
        case 'ArrowRight': case 'd': this.state.x -= speed; break;
        case '+': case '=': this.state.zoom = Math.min(3, this.state.zoom * 1.1); break;
        case '-': this.state.zoom = Math.max(0.3, this.state.zoom * 0.9); break;
        case '0': this.state.x = 0; this.state.y = 0; this.state.zoom = 1; break;
      }
    });
  }

  startRenderLoop() {
    const render = () => {
      // Apply momentum
      if (!this.state.isDragging) {
        this.state.x += this.state.velocityX;
        this.state.y += this.state.velocityY;
        this.state.velocityX *= this.state.friction;
        this.state.velocityY *= this.state.friction;
      }

      // Update layer positions with parallax
      Object.entries(this.layers).forEach(([layerName, layer]) => {
        const layerEl = this.container.querySelector(`.canvas360__layer--${layerName}`);
        if (!layerEl) return;
        
        const parallaxX = this.state.x * layer.speed;
        const parallaxY = this.state.y * layer.speed;
        const layerZoom = 1 + (this.state.zoom - 1) * layer.speed;
        
        layerEl.style.transform = `
          translate(${parallaxX}px, ${parallaxY}px) 
          scale(${layerZoom})
        `;
        
        // Depth-based blur for back layer
        if (layerName === 'back') {
          layerEl.style.filter = `blur(${2 / this.state.zoom}px)`;
        }
      });

      // Update compass
      this.coords.textContent = `(${Math.round(-this.state.x)}, ${Math.round(-this.state.y)})`;
      
      // Update minimap viewport
      const minimapScale = 0.02;
      this.minimap.style.transform = `translate(${-this.state.x * minimapScale}px, ${-this.state.y * minimapScale}px)`;

      requestAnimationFrame(render);
    };
    
    requestAnimationFrame(render);
  }

  // API
  goTo(x, y, animate = true) {
    if (animate) {
      this.state.velocityX = (x - this.state.x) * 0.1;
      this.state.velocityY = (y - this.state.y) * 0.1;
    } else {
      this.state.x = x;
      this.state.y = y;
    }
  }

  focusArtwork(artworkId) {
    for (const layer of Object.values(this.layers)) {
      const item = layer.items.find(i => i.id === artworkId);
      if (item) {
        this.goTo(-item.x + window.innerWidth / 2, -item.y + window.innerHeight / 2);
        break;
      }
    }
  }
}

// Auto-init when gallery view is shown
window.InfiniteCanvas360 = InfiniteCanvas360;

// Integration with router
document.addEventListener('DOMContentLoaded', () => {
  // Create instance when gallery is viewed
  const observer = new MutationObserver(() => {
    const galleryView = document.getElementById('view-gallery');
    if (galleryView?.classList.contains('active') && !window.canvas360Instance) {
      window.canvas360Instance = new InfiniteCanvas360('gallery-grid');
    }
  });

  observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
});
