/**
 * INFINITE HERO — NAROA COSMOVISIÓN
 * Awwwards-level immersive zoom experience
 * 
 * Techniques inspired by Feb 2026 SOTD winners:
 *  - SILEENT (GSAP + Three.js smooth transitions)
 *  - The Renaissance Edition (scroll-driven hero transitions, 7.92 score)
 *  - Explore Primland (gesture interaction, immersive maps)
 * 
 * Features:
 *  - Hardware-accelerated CSS3 matrix transforms
 *  - Momentum-based inertia (GSAP-style cubic bezier)
 *  - Scroll-driven zoom with "scrollytelling" narrative
 *  - Kinetic typography (title reacts to zoom level)
 *  - Touch pinch-to-zoom with velocity tracking
 *  - Auto-zoom intro animation on load
 */
export class InfiniteHero {
  constructor() {
    this.container = document.querySelector('.hero-infinite');
    this.canvas = document.querySelector('.hero-infinite__canvas');
    this.image = document.querySelector('.hero-infinite__img');
    this.title = document.querySelector('.hero-infinite__title');
    this.subtitle = document.querySelector('.hero-infinite__subtitle');
    this.hints = document.querySelector('.hero-infinite__hints');
    
    if (!this.container || !this.canvas || !this.image) return;

    // State
    this.state = {
      x: 0, y: 0, scale: 1,
      targetX: 0, targetY: 0, targetScale: 1,
      isDragging: false,
      lastMouseX: 0, lastMouseY: 0,
      velocityX: 0, velocityY: 0
    };

    // Configuration — tuned for premium feel
    this.config = {
      minScale: 1,
      maxScale: 32,
      friction: 0.06,           // Lower = smoother/slower (GSAP-style)
      zoomSpeed: 0.0008,        // Mouse wheel sensitivity
      pinchSpeed: 0.012,        // Touch pinch sensitivity
      inertiaDamping: 0.92,     // Velocity decay (higher = longer coast)
      snapBack: 0.04,           // Edge snap-back strength
      introZoomTarget: 1.8,     // Initial auto-zoom level
      introDuration: 3000,      // ms for intro animation
    };

    this.rafId = null;
    this.imageLoaded = false;
    this.introComplete = false;
    this.lastTouchDist = 0;

    this._bindEvents();
    this._waitForImage();
  }

  // ── INITIALIZATION ──────────────────────────────────────

  _waitForImage() {
    if (this.image.complete && this.image.naturalWidth > 0) {
      this._onImageReady();
    } else {
      this.image.addEventListener('load', () => this._onImageReady(), { once: true });
    }
  }

  _onImageReady() {
    this.imageLoaded = true;
    this.image.classList.add('loaded');
    
    // Calculate cover scale
    const coverScale = this._getCoverScale();
    this.config.minScale = coverScale;
    
    // Start centered
    this.state.scale = coverScale;
    this.state.targetScale = coverScale;
    this._centerImage();
    
    // Start render loop
    this._animate();
    
    // Intro animation — slow auto-zoom like Awwwards winners
    this._playIntro();
  }

  _getCoverScale() {
    if (!this.image.naturalWidth) return 1;
    const wRatio = window.innerWidth / this.image.naturalWidth;
    const hRatio = window.innerHeight / this.image.naturalHeight;
    return Math.max(wRatio, hRatio);
  }

  _centerImage() {
    const imgW = this.image.naturalWidth * this.state.scale;
    const imgH = this.image.naturalHeight * this.state.scale;
    this.state.x = (window.innerWidth - imgW) / 2;
    this.state.y = (window.innerHeight - imgH) / 2;
    this.state.targetX = this.state.x;
    this.state.targetY = this.state.y;
  }

  // ── INTRO ANIMATION (Awwwards-style) ────────────────────

  _playIntro() {
    const startTime = performance.now();
    const startScale = this.state.targetScale;
    const endScale = startScale * this.config.introZoomTarget;
    const duration = this.config.introDuration;
    
    // Ease: cubic-bezier(0.16, 1, 0.3, 1) — "ease out expo"
    const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      
      const newScale = startScale + (endScale - startScale) * eased;
      
      // Zoom toward center of viewport
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const ratio = newScale / this.state.targetScale;
      const cursorXOnCanvas = cx - this.state.targetX;
      const cursorYOnCanvas = cy - this.state.targetY;
      this.state.targetX -= cursorXOnCanvas * (ratio - 1);
      this.state.targetY -= cursorYOnCanvas * (ratio - 1);
      this.state.targetScale = newScale;
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.introComplete = true;
        // Fade in hints after intro
        if (this.hints) {
          this.hints.style.opacity = '1';
          this.hints.style.transition = 'opacity 1s ease';
        }
      }
    };
    
    // Hide hints during intro
    if (this.hints) this.hints.style.opacity = '0';
    
    requestAnimationFrame(step);
  }

  // ── EVENT BINDING ───────────────────────────────────────

  _bindEvents() {
    // Wheel / trackpad
    this.container.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
    
    // Mouse drag
    this.container.addEventListener('mousedown', (e) => this._onMouseDown(e));
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));
    window.addEventListener('mouseup', () => this._onMouseUp());
    
    // Touch
    this.container.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
    this.container.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    this.container.addEventListener('touchend', () => this._onTouchEnd());
    
    // Resize
    window.addEventListener('resize', () => this._onResize());
    
    // Hardware acceleration hint
    this.canvas.style.willChange = 'transform';
  }

  // ── WHEEL/TRACKPAD ──────────────────────────────────────

  _onWheel(e) {
    e.preventDefault();
    const speed = e.ctrlKey ? this.config.pinchSpeed : this.config.zoomSpeed;
    const delta = -e.deltaY * speed;
    this._zoomToward(delta, e.clientX, e.clientY);
  }

  // ── ZOOM MATH ───────────────────────────────────────────

  _zoomToward(delta, cx, cy) {
    const newScale = Math.max(
      this.config.minScale,
      Math.min(this.config.maxScale, this.state.targetScale * (1 + delta))
    );
    
    const ratio = newScale / this.state.targetScale;
    const cursorXOnCanvas = cx - this.state.targetX;
    const cursorYOnCanvas = cy - this.state.targetY;
    
    this.state.targetX -= cursorXOnCanvas * (ratio - 1);
    this.state.targetY -= cursorYOnCanvas * (ratio - 1);
    this.state.targetScale = newScale;
  }

  // ── MOUSE DRAG ──────────────────────────────────────────

  _onMouseDown(e) {
    this.state.isDragging = true;
    this.state.lastMouseX = e.clientX;
    this.state.lastMouseY = e.clientY;
    this.state.velocityX = 0;
    this.state.velocityY = 0;
    this.container.style.cursor = 'grabbing';
  }

  _onMouseMove(e) {
    if (!this.state.isDragging) return;
    
    const dx = e.clientX - this.state.lastMouseX;
    const dy = e.clientY - this.state.lastMouseY;
    
    // Track velocity for inertia
    this.state.velocityX = dx;
    this.state.velocityY = dy;
    
    this.state.targetX += dx;
    this.state.targetY += dy;
    
    this.state.lastMouseX = e.clientX;
    this.state.lastMouseY = e.clientY;
  }

  _onMouseUp() {
    if (!this.state.isDragging) return;
    this.state.isDragging = false;
    this.container.style.cursor = 'grab';
    // Inertia will be applied in the animation loop
  }

  // ── TOUCH ───────────────────────────────────────────────

  _onTouchStart(e) {
    if (e.touches.length === 2) {
      this.lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1) {
      this.state.isDragging = true;
      this.state.lastMouseX = e.touches[0].clientX;
      this.state.lastMouseY = e.touches[0].clientY;
      this.state.velocityX = 0;
      this.state.velocityY = 0;
    }
  }

  _onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - this.lastTouchDist) * this.config.pinchSpeed;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      this._zoomToward(delta, cx, cy);
      this.lastTouchDist = dist;
    } else if (e.touches.length === 1 && this.state.isDragging) {
      const dx = e.touches[0].clientX - this.state.lastMouseX;
      const dy = e.touches[0].clientY - this.state.lastMouseY;
      this.state.velocityX = dx;
      this.state.velocityY = dy;
      this.state.targetX += dx;
      this.state.targetY += dy;
      this.state.lastMouseX = e.touches[0].clientX;
      this.state.lastMouseY = e.touches[0].clientY;
    }
  }

  _onTouchEnd() {
    this.state.isDragging = false;
  }

  // ── RESIZE ──────────────────────────────────────────────

  _onResize() {
    const coverScale = this._getCoverScale();
    this.config.minScale = coverScale;
    if (this.state.targetScale < coverScale) {
      this.state.targetScale = coverScale;
    }
  }

  // ── ANIMATION LOOP ──────────────────────────────────────

  _animate() {
    // Apply inertia when not dragging
    if (!this.state.isDragging) {
      this.state.targetX += this.state.velocityX;
      this.state.targetY += this.state.velocityY;
      this.state.velocityX *= this.config.inertiaDamping;
      this.state.velocityY *= this.config.inertiaDamping;
      
      // Kill tiny velocities
      if (Math.abs(this.state.velocityX) < 0.01) this.state.velocityX = 0;
      if (Math.abs(this.state.velocityY) < 0.01) this.state.velocityY = 0;
    }

    // Lerp for buttery smoothness
    this.state.x += (this.state.targetX - this.state.x) * this.config.friction;
    this.state.y += (this.state.targetY - this.state.y) * this.config.friction;
    this.state.scale += (this.state.targetScale - this.state.scale) * this.config.friction;

    // Apply CSS transform (hardware-accelerated)
    this.canvas.style.transform = 
      `matrix(${this.state.scale}, 0, 0, ${this.state.scale}, ${this.state.x}, ${this.state.y})`;

    // ── KINETIC TYPOGRAPHY — Title reacts to zoom ──
    this._updateKineticUI();

    this.rafId = requestAnimationFrame(() => this._animate());
  }

  // ── KINETIC TYPOGRAPHY ──────────────────────────────────

  _updateKineticUI() {
    if (!this.title) return;
    
    const zoomRatio = this.state.scale / this.config.minScale;
    
    // Title fades out as you zoom in (revealing the art)
    const titleOpacity = Math.max(0, 1 - (zoomRatio - 1) / 3);
    this.title.style.opacity = titleOpacity;
    
    // Subtitle follows with slight delay
    if (this.subtitle) {
      const subOpacity = Math.max(0, 1 - (zoomRatio - 1) / 2);
      this.subtitle.style.opacity = subOpacity;
    }
    
    // Scale title slightly with zoom for parallax depth
    const titleScale = 1 + (zoomRatio - 1) * 0.15;
    this.title.style.transform = `scale(${Math.min(titleScale, 1.5)})`;
    this.title.style.transformOrigin = 'left bottom';
  }

  // ── CLEANUP ─────────────────────────────────────────────

  destroy() {
    cancelAnimationFrame(this.rafId);
  }
}
