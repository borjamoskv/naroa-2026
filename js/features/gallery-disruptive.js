/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GALERÍA DISRUPTIVA 2.0 - Ultra Engine
 * Naroa Gutiérrez Gil 2026
 * 
 * FEATURES:
 * ✓ IntersectionObserver con threshold granular [0,0.1,0.25,0.5,0.75,1]
 * ✓ Parallax RAF optimizado
 * ✓ Mouse tracking 3D tilt
 * ✓ Lazy loading blur-up progresivo
 * ✓ Lightbox con swipe, pinch-to-zoom
 * ✓ Smooth scroll snapping mobile
 * ✓ Preload de imágenes adyacentes
 * ✓ Keyboard navigation completa
 * ✓ Cursor customizado contextual
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const GalleryDisruptive = {
  // State
  initialized: false,
  lightbox: null,
  cursor: null,
  currentIndex: 0,
  artworks: [],
  observer: null,
  revealObserver: null,
  rafId: null,
  
  // Zoom/Pan state
  zoom: {
    scale: 1,
    panning: false,
    pointX: 0,
    pointY: 0,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0
  },
  
  // Touch state
  touch: {
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startDistance: 0,
    startScale: 1,
    isPinching: false
  },
  
  // Parallax state
  parallax: {
    ticking: false,
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═════════════════════════════════════════════════════════════════════════════

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Load metadata first for premium experience
    this.loadMetadata();

    this.setupLazyLoading();
    this.setupRevealAnimations();
    this.setupLightbox();
    this.setupCinematicScroll();
    this.setupParallax();
    this.setupKeyboardNav();
    this.setupCustomCursor();
    this.setupMouseTracking();
    this.setupAdjacentPreload();

    console.log('🖼️ Gallery Disruptive 2.0 Engine initialized');
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // METADATA LOADING - PREMIUM UPGRADE
  // ═════════════════════════════════════════════════════════════════════════════

  async loadMetadata() {
    try {
      const resp = await fetch('data/artworks-metadata.json');
      if (resp.ok) {
        const data = await resp.json();
        this.metadata = {};
        // Map by ID for quick lookup
        data.artworks.forEach(art => {
          this.metadata[art.id] = art;
        });
        this.injectGridMetadata();
      }
    } catch (e) {
      console.warn('Metadata load skipped', e);
    }
  },

  injectGridMetadata() {
    if (!this.metadata) return;

    const items = document.querySelectorAll('.gallery-massive__item');
    items.forEach(item => {
      const img = item.querySelector('img');
      if (!img) return;

      // Extract ID from filename (e.g. "cantinflas-0.webp" -> "cantinflas-0")
      // Check both src and data-src
      const src = img.getAttribute('data-src') || img.src;
      const filename = src.split('/').pop();
      const id = filename.replace(/\.(webp|jpg|png|jpeg)$/i, '');

      // Lookup metadata (try exact match, then base name)
      let meta = this.metadata[id];
      if (!meta) {
        // Try removing -hq suffix if present
        const baseId = id.replace(/-hq-\d+$/, '');
        meta = this.metadata[baseId];
      }

      if (meta) {
        // Store metadata on DOM element for lightbox access
        item.dataset.metaYear = meta.year || '';
        item.dataset.metaTechnique = meta.technique || '';
        item.dataset.metaTitle = meta.title || '';

        // Inject into Overlay if not already present
        const overlay = item.querySelector('.gallery-massive__overlay');
        if (overlay && !overlay.querySelector('.gallery-massive__meta')) {
          const metaEl = document.createElement('p');
          metaEl.className = 'gallery-massive__meta';
          metaEl.textContent = `${meta.year} • ${meta.technique}`;
          overlay.appendChild(metaEl);
        }
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // LAZY LOADING CON BLUR-UP PROGRESIVO
  // ═════════════════════════════════════════════════════════════════════════════

  setupLazyLoading() {
    const options = {
      root: null,
      rootMargin: '300px 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, options);

    document.querySelectorAll('.gallery-lazy img[data-src]').forEach(img => {
      observer.observe(img);
    });
  },

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    // Progressive blur-up: start with high blur
    img.style.filter = 'blur(10px)';
    img.style.transform = 'scale(1.05)';

    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      if (srcset) img.srcset = srcset;
      
      // Progressive blur reduction
      requestAnimationFrame(() => {
        img.style.filter = 'blur(5px)';
        
        setTimeout(() => {
          img.style.filter = 'blur(2px)';
          
          setTimeout(() => {
            img.classList.add('loaded');
            img.style.filter = 'blur(0)';
            img.style.transform = 'scale(1)';
          }, 100);
        }, 100);
      });

      // Sound effect
      if (window.AudioSynth && !window.ImmersiveAudio?.isMuted) {
        const rect = img.getBoundingClientRect();
        const pan = (rect.left / window.innerWidth) * 2 - 1;
        const panner = window.ImmersiveAudio?.create3DPanner?.(pan * 3, 0, -4);
        AudioSynth.artworkReveal?.(panner);
      }
    };
    
    tempImg.onerror = () => {
      img.classList.add('loaded');
      img.style.filter = 'blur(0)';
    };
    
    tempImg.src = src;
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // REVEAL ANIMATIONS - GRANULAR INTERSECTION OBSERVER
  // ═════════════════════════════════════════════════════════════════════════════

  setupRevealAnimations() {
    // Granular thresholds for progressive reveals
    const thresholds = [0, 0.1, 0.25, 0.5, 0.75, 1];
    
    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const ratio = entry.intersectionRatio;
        
        if (entry.isIntersecting) {
          // Progressive reveal based on visibility ratio
          if (ratio >= 0.25) {
            entry.target.classList.add('visible');
            entry.target.dataset.revealProgress = 'full';
          } else if (ratio >= 0.1) {
            entry.target.style.opacity = Math.max(0.3, ratio);
            entry.target.dataset.revealProgress = 'partial';
          }
        } else {
          // Optional: remove visible class when out of view
          if (entry.boundingClientRect.top > window.innerHeight) {
            entry.target.classList.remove('visible');
          }
        }
      });
    }, {
      threshold: thresholds,
      rootMargin: '-50px 0px'
    });

    document.querySelectorAll('.gallery-reveal, .gallery-massive__item').forEach(el => {
      this.revealObserver.observe(el);
    });
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // LIGHTBOX INMERSIVO - SWIPE, PINCH-TO-ZOOM, KEYBOARD
  // ═════════════════════════════════════════════════════════════════════════════

  setupLightbox() {
    // Create lightbox HTML structure
    this.lightbox = document.createElement('div');
    this.lightbox.className = 'gallery-lightbox';
    this.lightbox.setAttribute('role', 'dialog');
    this.lightbox.setAttribute('aria-modal', 'true');
    this.lightbox.setAttribute('aria-label', 'Visor de imágenes');
    this.lightbox.innerHTML = `
      <div class="gallery-lightbox__close" role="button" aria-label="Cerrar" tabindex="0"></div>
      <div class="gallery-lightbox__nav gallery-lightbox__nav--prev" role="button" aria-label="Imagen anterior" tabindex="0"></div>
      <div class="gallery-lightbox__nav gallery-lightbox__nav--next" role="button" aria-label="Imagen siguiente" tabindex="0"></div>
      <div class="gallery-lightbox__counter"><span class="current">1</span> / <span class="total">1</span></div>
      <div class="gallery-lightbox__container">
        <!-- Content will be injected here based on type (img or video) -->
      </div>
      <div class="gallery-lightbox__zoom-hint">Doble toque para zoom</div>
      <div class="gallery-lightbox__details">
        <h3 class="gallery-lightbox__title"></h3>
        <p class="gallery-lightbox__meta"></p>
        <p class="gallery-lightbox__series"></p>
      </div>
    `;
    document.body.appendChild(this.lightbox);

    // Collect all artworks
    this.artworks = Array.from(
      document.querySelectorAll('.gallery-massive__item, .gallery__item, .gallery-hero__artwork')
    );

    // Update counter total
    this.lightbox.querySelector('.total').textContent = this.artworks.length;

    // Click handlers
    this.artworks.forEach((item, index) => {
      item.addEventListener('click', () => this.openLightbox(index));
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.openLightbox(index);
      });
    });

    // Close handlers
    const closeBtn = this.lightbox.querySelector('.gallery-lightbox__close');
    closeBtn.addEventListener('click', () => this.closeLightbox());
    closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') this.closeLightbox();
    });

    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) this.closeLightbox();
    });

    // Navigation handlers
    const prevBtn = this.lightbox.querySelector('.gallery-lightbox__nav--prev');
    const nextBtn = this.lightbox.querySelector('.gallery-lightbox__nav--next');
    
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prevImage();
    });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextImage();
    });

    // Touch gestures
    this.setupTouchGestures();
    
    // Zoom handlers
    this.setupZoomHandlers();
  },

  openLightbox(index) {
    this.currentIndex = index;
    this.updateLightboxImage(false);
    
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    this.lightbox.querySelector('.gallery-lightbox__close').focus();

    // Preload adjacent images
    this.preloadAdjacent();

    // Sound effect
    if (window.AudioSynth && !window.ImmersiveAudio?.isMuted) {
      AudioSynth.success?.();
    }
  },

  openArtworkById(id) {
    if (!this.artworks.length) this.setupLightbox(); // Ensure artworks are collected
    
    // Find index by checking src filename or dataset
    const index = this.artworks.findIndex(item => {
      const img = item.querySelector('img');
      if (!img) return false;
      const src = img.getAttribute('data-src') || img.src;
      return src.includes(id) || (item.dataset.metaTitle && item.dataset.metaTitle.toLowerCase() === id.toLowerCase());
    });

    if (index !== -1) {
      this.openLightbox(index);
      return true;
    }
    console.warn(`Artwork ${id} not found`);
    return false;
  },

  closeLightbox() {
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset zoom
    this.resetZoom();

    // Return focus to triggering element
    if (this.artworks[this.currentIndex]) {
      this.artworks[this.currentIndex].focus();
    }

    // Sound effect
    if (window.AudioSynth && !window.ImmersiveAudio?.isMuted) {
      AudioSynth.transition?.();
    }
  },

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.artworks.length;
    this.updateLightboxImage(true);
    this.preloadAdjacent();
  },

  prevImage() {
    this.currentIndex = (this.currentIndex - 1 + this.artworks.length) % this.artworks.length;
    this.updateLightboxImage(true);
    this.preloadAdjacent();
  },

  updateLightboxImage(animate = true) {
    const item = this.artworks[this.currentIndex];
    const img = item?.querySelector('img');
    const container = this.lightbox.querySelector('.gallery-lightbox__container');
    
    // Clear previous content
    container.innerHTML = '';

    // Update counter
    this.lightbox.querySelector('.current').textContent = this.currentIndex + 1;

    // Update metadata
    const titleEl = this.lightbox.querySelector('.gallery-lightbox__title');
    const metaEl = this.lightbox.querySelector('.gallery-lightbox__meta');
    const seriesEl = this.lightbox.querySelector('.gallery-lightbox__series');
    
    // Extract metadata
    const meta = {
        title: item.dataset.metaTitle || img?.alt || '',
        year: item.dataset.metaYear || '',
        technique: item.dataset.metaTechnique || '',
        series: item.dataset.metaSeries || '',
        type: item.dataset.metaType || 'image', // Default to image
        src: item.dataset.hires || img?.src || '',
        videoSrc: item.dataset.videoSrc || '' // If video
    };

    if (item) {
      titleEl.textContent = meta.title;
      metaEl.textContent = meta.year ? `${meta.year} • ${meta.technique}` : '';
      seriesEl.textContent = meta.series ? `Serie: ${meta.series.toUpperCase()}` : '';

      // Determine Content Type
      let contentEl;
      
      if (meta.type === 'video' || meta.videoSrc) {
          // VIDEO MODE
          contentEl = document.createElement('video');
          contentEl.className = 'gallery-lightbox__video';
          contentEl.controls = true;
          contentEl.autoplay = true;
          contentEl.loop = true;
          contentEl.src = meta.videoSrc;
          // Add mp4 fallback if needed
      } else {
          // IMAGE MODE
          contentEl = document.createElement('img');
          contentEl.className = 'gallery-lightbox__image';
          contentEl.src = meta.src;
          contentEl.alt = meta.title;
          contentEl.draggable = false;
      }

      // Add to container
      container.appendChild(contentEl);

      // Animate
      if (animate && contentEl) {
        contentEl.style.opacity = '0';
        contentEl.style.transform = 'scale(0.9)';
        contentEl.style.filter = 'blur(10px)';
        contentEl.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                contentEl.style.opacity = '1';
                contentEl.style.transform = 'scale(1)';
                contentEl.style.filter = 'blur(0)';
            });
        });
      }

      // Sound
      if (window.AudioSynth && !window.ImmersiveAudio?.isMuted) {
        AudioSynth.gameMove?.();
      }
    }
    
    this.resetZoom();
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // TOUCH GESTURES - SWIPE & PINCH
  // ═════════════════════════════════════════════════════════════════════════════

  setupTouchGestures() {
    const container = this.lightbox.querySelector('.gallery-lightbox__container');
    let touchStartTime = 0;
    let hasMoved = false;

    this.lightbox.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      hasMoved = false;
      
      if (e.touches.length === 1) {
        // Single touch - pan or swipe
        this.touch.startX = e.touches[0].clientX;
        this.touch.startY = e.touches[0].clientY;
        this.touch.lastX = this.touch.startX;
        this.touch.lastY = this.touch.startY;
        
        if (this.zoom.scale > 1) {
          this.zoom.panning = true;
          this.zoom.startX = this.touch.startX - this.zoom.translateX;
          this.zoom.startY = this.touch.startY - this.zoom.translateY;
        }
      } else if (e.touches.length === 2) {
        // Pinch zoom
        this.touch.isPinching = true;
        this.touch.startDistance = this.getPinchDistance(e.touches);
        this.touch.startScale = this.zoom.scale;
      }
    }, { passive: true });

    this.lightbox.addEventListener('touchmove', (e) => {
      hasMoved = true;
      
      if (e.touches.length === 1 && this.zoom.panning) {
        // Panning while zoomed
        e.preventDefault();
        this.zoom.translateX = e.touches[0].clientX - this.zoom.startX;
        this.zoom.translateY = e.touches[0].clientY - this.zoom.startY;
        this.applyZoomTransform();
      } else if (e.touches.length === 2 && this.touch.isPinching) {
        // Pinch zooming
        e.preventDefault();
        const distance = this.getPinchDistance(e.touches);
        const scale = Math.min(Math.max(
          this.touch.startScale * (distance / this.touch.startDistance),
          1
        ), 4);
        this.setZoom(scale);
      }
      
      this.touch.lastX = e.touches[0]?.clientX;
      this.touch.lastY = e.touches[0]?.clientY;
    }, { passive: false });

    this.lightbox.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      const diffX = this.touch.lastX - this.touch.startX;
      const diffY = this.touch.lastY - this.touch.startY;
      
      // Reset pinch state
      if (e.touches.length < 2) {
        this.touch.isPinching = false;
      }
      
      // Reset panning state
      if (e.touches.length === 0) {
        this.zoom.panning = false;
      }
      
      // Swipe detection (only if not zoomed and significant movement)
      if (this.zoom.scale === 1 && hasMoved && touchDuration < 300) {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0) {
            this.prevImage();
          } else {
            this.nextImage();
          }
        } else if (diffY > 100) {
          this.closeLightbox();
        }
      }
      
      // Double tap to zoom detection
      if (!hasMoved && touchDuration < 200) {
        if (this.lastTap && (Date.now() - this.lastTap) < 300) {
          // Double tap
          if (this.zoom.scale > 1) {
            this.resetZoom();
          } else {
            this.setZoom(2.5);
          }
        }
        this.lastTap = Date.now();
      }
    }, { passive: true });
  },

  getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  setupZoomHandlers() {
    // Mouse wheel zoom
    this.lightbox.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(this.zoom.scale * delta, 1), 4);
        this.setZoom(newScale);
      }
    }, { passive: false });

    // Mouse pan when zoomed
    const img = this.lightbox.querySelector('.gallery-lightbox__image');
    
    img.addEventListener('mousedown', (e) => {
      if (this.zoom.scale > 1) {
        e.preventDefault();
        this.zoom.panning = true;
        this.zoom.startX = e.clientX - this.zoom.translateX;
        this.zoom.startY = e.clientY - this.zoom.translateY;
        img.classList.add('is-zoomed');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.zoom.panning) {
        this.zoom.translateX = e.clientX - this.zoom.startX;
        this.zoom.translateY = e.clientY - this.zoom.startY;
        this.applyZoomTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      this.zoom.panning = false;
    });
  },

  setZoom(scale) {
    this.zoom.scale = scale;
    const img = this.lightbox.querySelector('.gallery-lightbox__image');
    
    if (scale > 1) {
      img.classList.add('is-zoomed');
      this.lightbox.style.cursor = 'grab';
    } else {
      this.resetZoom();
    }
    
    this.applyZoomTransform();
  },

  resetZoom() {
    this.zoom.scale = 1;
    this.zoom.translateX = 0;
    this.zoom.translateY = 0;
    this.zoom.panning = false;
    
    const img = this.lightbox.querySelector('.gallery-lightbox__image');
    img.classList.remove('is-zoomed');
    img.style.transform = '';
    this.lightbox.style.cursor = '';
  },

  applyZoomTransform() {
    const img = this.lightbox.querySelector('.gallery-lightbox__image');
    img.style.transform = `translate(${this.zoom.translateX}px, ${this.zoom.translateY}px) scale(${this.zoom.scale})`;
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // SCROLL CINEMATOGRÁFICO CON SMOOTH SNAP
  // ═════════════════════════════════════════════════════════════════════════════

  setupCinematicScroll() {
    const container = document.querySelector('.gallery-cinematic');
    if (!container) return;

    const slides = container.querySelectorAll('.gallery-cinematic__slide');
    const dots = container.querySelectorAll('.gallery-cinematic__dot');
    let scrollTimeout;

    // Update active dot on scroll with throttling
    container.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const width = container.offsetWidth;
        const currentSlide = Math.round(scrollLeft / width);

        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentSlide);
        });
      }, 50);
    }, { passive: true });

    // Click on dots to navigate with smooth scroll
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        container.scrollTo({
          left: i * container.offsetWidth,
          behavior: 'smooth'
        });
      });
    });

    // Snap scroll on mobile with momentum detection
    let isScrolling = false;
    let startScrollLeft = 0;
    let startTime = 0;

    container.addEventListener('touchstart', () => {
      isScrolling = true;
      startScrollLeft = container.scrollLeft;
      startTime = Date.now();
    }, { passive: true });

    container.addEventListener('touchend', () => {
      if (!isScrolling) return;
      isScrolling = false;
      
      const scrollDelta = container.scrollLeft - startScrollLeft;
      const timeDelta = Date.now() - startTime;
      const velocity = Math.abs(scrollDelta / timeDelta);
      
      // If slow drag, snap to nearest slide
      if (velocity < 0.5) {
        const width = container.offsetWidth;
        const targetSlide = Math.round(container.scrollLeft / width);
        
        container.scrollTo({
          left: targetSlide * width,
          behavior: 'smooth'
        });
      }
    }, { passive: true });
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // PARALLAX 3D CON RAF OPTIMIZADO
  // ═════════════════════════════════════════════════════════════════════════════

  setupParallax() {
    const parallaxContainer = document.querySelector('.gallery-parallax');
    if (!parallaxContainer) return;

    const layers = parallaxContainer.querySelectorAll('.gallery-parallax__layer');
    
    const updateParallax = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      layers.forEach((layer, i) => {
        const speed = parseFloat(layer.style.getPropertyValue('--parallax-speed')) || (1 - i * 0.25);
        const rect = layer.getBoundingClientRect();
        
        // Only animate when in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          const yPos = scrollY * speed * 0.1;
          layer.style.transform = `translateY(${yPos}px)`;
        }
      });
      
      this.parallax.ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!this.parallax.ticking) {
        this.rafId = requestAnimationFrame(updateParallax);
        this.parallax.ticking = true;
      }
    }, { passive: true });

    // Initial call
    updateParallax();
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // MOUSE TRACKING - 3D TILT EFFECT
  // ═════════════════════════════════════════════════════════════════════════════

  setupMouseTracking() {
    const items = document.querySelectorAll('.gallery-massive__item, .gallery-hero__artwork');
    
    items.forEach(item => {
      let rafId = null;
      let targetRotateX = 0;
      let targetRotateY = 0;
      let currentRotateX = 0;
      let currentRotateY = 0;
      
      const updateTilt = () => {
        // Smooth interpolation
        currentRotateX += (targetRotateX - currentRotateX) * 0.1;
        currentRotateY += (targetRotateY - currentRotateY) * 0.1;
        
        const img = item.querySelector('img');
        if (img) {
          img.style.transform = `perspective(1000px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(1.02)`;
        }
        
        if (Math.abs(targetRotateX - currentRotateX) > 0.01 || 
            Math.abs(targetRotateY - currentRotateY) > 0.01) {
          rafId = requestAnimationFrame(updateTilt);
        }
      };
      
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate tilt (max 10 degrees)
        targetRotateY = ((x - centerX) / centerX) * 10;
        targetRotateX = -((y - centerY) / centerY) * 10;
        
        if (!rafId) {
          rafId = requestAnimationFrame(updateTilt);
        }
      });
      
      item.addEventListener('mouseleave', () => {
        targetRotateX = 0;
        targetRotateY = 0;
        
        // Reset transform after animation
        setTimeout(() => {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          const img = item.querySelector('img');
          if (img) {
            img.style.transform = '';
          }
        }, 300);
      });
    });
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // CUSTOM CURSOR CONTEXTUAL
  // ═════════════════════════════════════════════════════════════════════════════

  setupCustomCursor() {
    // Only on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.cursor = document.createElement('div');
    this.cursor.className = 'gallery-cursor';
    this.cursor.textContent = 'Ver';
    document.body.appendChild(this.cursor);
    
    let cursorX = 0;
    let cursorY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId = null;
    let isVisible = false;
    
    const updateCursor = () => {
      cursorX += (targetX - cursorX) * 0.15;
      cursorY += (targetY - cursorY) * 0.15;
      
      this.cursor.style.left = cursorX - 40 + 'px';
      this.cursor.style.top = cursorY - 40 + 'px';
      
      if (isVisible) {
        rafId = requestAnimationFrame(updateCursor);
      }
    };
    
    // Gallery items hover
    const galleryItems = document.querySelectorAll('.gallery-massive__item, .gallery-hero__artwork');
    
    galleryItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.cursor.classList.add('visible', 'gallery-cursor--zoom');
        this.cursor.textContent = 'Ver';
        isVisible = true;
        if (!rafId) rafId = requestAnimationFrame(updateCursor);
      });
      
      item.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('visible');
        isVisible = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    });
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // KEYBOARD NAVIGATION
  // ═════════════════════════════════════════════════════════════════════════════

  setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Lightbox keyboard navigation
      if (this.lightbox.classList.contains('active')) {
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            this.closeLightbox();
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            this.nextImage();
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            this.prevImage();
            break;
          case '+':
          case '=':
            e.preventDefault();
            this.setZoom(Math.min(this.zoom.scale * 1.5, 4));
            break;
          case '-':
            e.preventDefault();
            this.setZoom(Math.max(this.zoom.scale / 1.5, 1));
            break;
          case '0':
            e.preventDefault();
            this.resetZoom();
            break;
          case 'Home':
            e.preventDefault();
            this.currentIndex = 0;
            this.updateLightboxImage(true);
            break;
          case 'End':
            e.preventDefault();
            this.currentIndex = this.artworks.length - 1;
            this.updateLightboxImage(true);
            break;
        }
      }
      
      // Gallery grid keyboard navigation
      const focusedItem = document.activeElement;
      if (focusedItem?.classList.contains('gallery-massive__item')) {
        const items = Array.from(document.querySelectorAll('.gallery-massive__item'));
        const currentIdx = items.indexOf(focusedItem);
        const cols = window.innerWidth > 1024 ? 4 : window.innerWidth > 768 ? 3 : 2;
        
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            if (items[currentIdx + 1]) items[currentIdx + 1].focus();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (items[currentIdx - 1]) items[currentIdx - 1].focus();
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (items[currentIdx + cols]) items[currentIdx + cols].focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (items[currentIdx - cols]) items[currentIdx - cols].focus();
            break;
          case 'Enter':
            e.preventDefault();
            focusedItem.click();
            break;
        }
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // ADJACENT IMAGE PRELOADING
  // ═════════════════════════════════════════════════════════════════════════════

  setupAdjacentPreload() {
    // Preload images on gallery hover
    const galleryItems = document.querySelectorAll('.gallery-massive__item');
    
    galleryItems.forEach((item, index) => {
      item.addEventListener('mouseenter', () => {
        // Preload next 2 and previous 2 images
        for (let i = -2; i <= 2; i++) {
          if (i === 0) continue;
          
          const preloadIndex = (index + i + galleryItems.length) % galleryItems.length;
          const preloadItem = galleryItems[preloadIndex];
          const img = preloadItem?.querySelector('img');
          
          if (img && img.dataset.src && !img.src) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'image';
            link.href = img.dataset.src;
            document.head.appendChild(link);
          }
        }
      });
    });
  },

  preloadAdjacent() {
    // Preload next and previous images in lightbox
    const indices = [
      (this.currentIndex + 1) % this.artworks.length,
      (this.currentIndex - 1 + this.artworks.length) % this.artworks.length
    ];
    
    indices.forEach(idx => {
      const item = this.artworks[idx];
      const img = item?.querySelector('img');
      
      if (img?.dataset.hires) {
        const preloadImg = new Image();
        preloadImg.src = img.dataset.hires;
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // FACTORY: Create massive grid automatically
  // ═════════════════════════════════════════════════════════════════════════════

  createMassiveGrid(artworks, container) {
    const sizes = ['colossal', 'large', 'medium', 'medium', 'small', 'small'];
    let sizeIndex = 0;

    artworks.forEach((artwork, i) => {
      const size = sizes[sizeIndex % sizes.length];
      sizeIndex++;

      const item = document.createElement('div');
      item.className = `gallery-massive__item gallery-massive__item--${size} gallery-lazy gallery-reveal`;
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.innerHTML = `
        <img 
          data-src="${artwork.src}" 
          data-hires="${artwork.hires || artwork.src}"
          alt="${artwork.title}"
          class="gallery-massive__img"
          loading="lazy"
        >
        <div class="gallery-massive__overlay">
          <h3 class="gallery-massive__title">${artwork.title}</h3>
        </div>
      `;

      container.appendChild(item);
    });

    // Re-init for new items
    this.setupLazyLoading();
    this.setupRevealAnimations();
    this.setupMouseTracking();
    this.setupCustomCursor();
    
    // Update artworks list
    this.artworks = Array.from(
      document.querySelectorAll('.gallery-massive__item, .gallery__item, .gallery-hero__artwork')
    );
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═════════════════════════════════════════════════════════════════════════════

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    if (this.revealObserver) {
      this.revealObserver.disconnect();
    }
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.lightbox) {
      this.lightbox.remove();
    }
    
    if (this.cursor) {
      this.cursor.remove();
    }
    
    this.initialized = false;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GalleryDisruptive.init());
} else {
  GalleryDisruptive.init();
}

// Expose globally
window.GalleryDisruptive = GalleryDisruptive;
