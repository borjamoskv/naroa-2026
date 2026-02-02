/**
 * MICA Media Engine - Motor de Imágenes Adaptativo Emocional
 * Carga inteligente con detección de formato, caché IndexedDB, y filtros emocionales
 */

class MICAMediaEngine {
  constructor() {
    this.cache = new Map();
    this.db = null;
    this.formats = { avif: false, webp: false };
    this.quality = 'high';
    this.mood = 'NEUTRAL';
    
    this.presets = {
      NEUTRAL: { saturation: 1, contrast: 1, brightness: 1, blur: 0 },
      ENERGETIC: { saturation: 1.2, contrast: 1.1, brightness: 1.05, blur: 0 },
      TIRED: { saturation: 0.8, contrast: 0.9, brightness: 0.95, blur: 1 },
      GRUMPY: { saturation: 1.3, contrast: 1.3, brightness: 0.9, sepia: 0.2 },
      PLAYFUL: { saturation: 1.4, contrast: 1.1, brightness: 1.1, hue: 10 }
    };
    
    this.init();
  }

  async init() {
    this.formats.avif = await this.checkFormat('image/avif');
    this.formats.webp = await this.checkFormat('image/webp');
    this.db = await this.openDB();
    this.updateConnectionQuality();
    navigator.connection?.addEventListener('change', () => this.updateConnectionQuality());
    this.observeImages();
  }

  checkFormat(mime) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `data:${mime};base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQ==`;
    });
  }

  updateConnectionQuality() {
    const conn = navigator.connection;
    if (!conn) return;
    
    if (conn.saveData || conn.effectiveType === '2g') {
      this.quality = 'low';
    } else if (conn.effectiveType === '3g') {
      this.quality = 'medium';
    } else {
      this.quality = 'high';
    }
  }

  getOptimalFormat() {
    if (this.quality === 'low') return 'webp';
    if (this.formats.avif) return 'avif';
    if (this.formats.webp) return 'webp';
    return 'jpg';
  }

  async loadImage(src, options = {}) {
    const { emotional = true, gameId = null } = options;
    const format = this.getOptimalFormat();
    const optimizedSrc = this.transformUrl(src, format);
    const cacheKey = `${optimizedSrc}_${this.mood}_${this.quality}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const cached = await this.getFromDB(cacheKey);
    if (cached) {
      this.cache.set(cacheKey, cached);
      return cached;
    }
    
    try {
      const img = await this.fetchImage(optimizedSrc);
      
      if (emotional && this.mood !== 'NEUTRAL') {
        const processed = await this.applyCanvasFilter(img.src, this.presets[this.mood]);
        await this.saveToDB(cacheKey, processed);
        this.cache.set(cacheKey, processed);
        return processed;
      }
      
      this.cache.set(cacheKey, img.src);
      return img.src;
    } catch (e) {
      return src;
    }
  }

  fetchImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  transformUrl(url, format) {
    if (url.includes('cloudinary') || url.includes('imgix')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}f=${format}&q=${this.quality === 'low' ? 60 : 80}`;
    }
    return url.replace(/\.(jpg|png)$/, `.${format}`);
  }

  applyCanvasFilter(imgSrc, preset) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        let filterString = `saturate(${preset.saturation}) contrast(${preset.contrast}) brightness(${preset.brightness})`;
        if (preset.blur) filterString += ` blur(${preset.blur}px)`;
        if (preset.sepia) filterString += ` sepia(${preset.sepia})`;
        if (preset.hue) filterString += ` hue-rotate(${preset.hue}deg)`;
        
        ctx.filter = filterString;
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas.toDataURL('image/webp', 0.8));
      };
      img.onerror = reject;
      img.src = imgSrc;
    });
  }

  observeImages() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          const gameId = img.dataset.game;
          
          if (src) {
            this.loadImage(src, { gameId }).then(url => {
              img.src = url;
              img.classList.add('mica-loaded');
            });
            observer.unobserve(img);
          }
        }
      });
    }, { rootMargin: '50px' });

    document.querySelectorAll('img[data-mica="true"]').forEach(img => {
      observer.observe(img);
    });
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MICA_Media_Cache', 1);
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        e.target.result.createObjectStore('images', { keyPath: 'id' });
      };
    });
  }

  async saveToDB(id, data) {
    const tx = this.db.transaction(['images'], 'readwrite');
    const store = tx.objectStore('images');
    store.put({ id, data, timestamp: Date.now(), mood: this.mood });
  }

  async getFromDB(id) {
    return new Promise((resolve) => {
      const tx = this.db.transaction(['images'], 'readonly');
      const store = tx.objectStore('images');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result?.data);
    });
  }

  setMood(mood) {
    this.mood = mood;
    this.cache.clear();
    
    document.querySelectorAll('img[data-mica="true"]').forEach(img => {
      if (img.classList.contains('mica-loaded')) {
        img.style.filter = this.generateCSSFilter(mood);
      }
    });
  }

  generateCSSFilter(mood) {
    const p = this.presets[mood];
    return `saturate(${p.saturation}) contrast(${p.contrast}) brightness(${p.brightness})`;
  }
}

// Export singleton
const MediaEngine = new MICAMediaEngine();
if (typeof window !== 'undefined') window.MediaEngine = MediaEngine;
export default MediaEngine;
