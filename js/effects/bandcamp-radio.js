/**
 * BANDCAMP RADIO ROTARI
 * Reproductor que rota álbumes de Borja Moskv aleatoriamente
 * Se integra en el dock de audio existente
 */
class BandcampRadio {
  constructor() {
    // IDs extraídos manualmente de Borja Moskv
    this.albums = [
      '3541743596', // This Was In Rainbows
      '3994364503', // Instructions For Flying
      '3198055933'  // B
    ];
    
    this.currentIdx = 0;
    this.isPlaying = false;
    this.container = null;
    this.iframe = null;
    
    this.init();
  }

  init() {
    this.createDOM();
    this.bindEvents();
    console.log('📻 Bandcamp Radio initialized');
  }

  createDOM() {
    // Container oculto por defecto
    this.container = document.createElement('div');
    this.container.className = 'bandcamp-radio-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 300px;
      height: 350px;
      z-index: 1001; /* Fix z-index issue */
      transform: translateY(120%);
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      border-radius: 12px;
      overflow: hidden;
      background: #000;
      /* Mobile override handled in CSS */
    `;
    
    document.body.appendChild(this.container);
  }

  bindEvents() {
    const toggle = document.getElementById('audio-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.togglePlayer());
    }
  }

  togglePlayer() {
    this.isPlaying = !this.isPlaying;
    const dock = document.getElementById('audio-dock');
    
    if (this.isPlaying) {
      this.container.style.transform = 'translateY(0)';
      dock.classList.add('playing');
      this.loadRandomAlbum();
    } else {
      this.container.style.transform = 'translateY(120%)';
      dock.classList.remove('playing');
      // Limpiar iframe para detener audio
      setTimeout(() => {
        this.container.innerHTML = '';
        this.iframe = null;
      }, 500);
    }
  }

  loadRandomAlbum(force = false) {
    // Si ya hay iframe y no forzamos, no hacer nada
    if (this.iframe && !force) return;

    // Pick random album
    const randomId = this.albums[Math.floor(Math.random() * this.albums.length)];
    const embedUrl = `https://bandcamp.com/EmbeddedPlayer/album=${randomId}/size=large/bgcol=333333/linkcol=e99708/tracklist=false/transparent=true/`;
    
    if (this.container.querySelector('iframe')) {
        this.container.querySelector('iframe').src = embedUrl;
        return;
    }

    this.container.innerHTML = `
      <iframe style="border: 0; width: 100%; height: 100%;" 
              src="${embedUrl}" 
              seamless>
        <a href="https://borjamoskv.bandcamp.com/music">Borja Moskv Music</a>
      </iframe>
      <button class="bandcamp-close-btn" style="
        position: absolute; 
        top: 10px; 
        left: 10px; 
        background: rgba(0,0,0,0.7); 
        color: #fff; 
        border: none; 
        border-radius: 50%; 
        width: 30px; 
        height: 30px; 
        cursor: pointer;
        z-index: 1002;">✕</button>
      <button class="bandcamp-next-btn" style="
        position: absolute; 
        top: 10px; 
        right: 10px; 
        background: rgba(0,0,0,0.7); 
        color: #fff; 
        border: none; 
        border-radius: 50%; 
        width: 30px; 
        height: 30px; 
        cursor: pointer;
        z-index: 1002;">↻</button>
    `;
    
    this.iframe = this.container.querySelector('iframe');
    
    this.container.querySelector('.bandcamp-next-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.loadRandomAlbum(true); // Force reload
    });

    this.container.querySelector('.bandcamp-close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlayer();
    });
  }
}

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.BandcampRadio = new BandcampRadio());
} else {
    window.BandcampRadio = new BandcampRadio();
}
