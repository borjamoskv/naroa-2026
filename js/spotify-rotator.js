/**
 * Spotify Rotator - Rota álbumes/playlists cada minuto
 * Moskvlogia Collection
 */

class SpotifyRotator {
  constructor() {
    this.currentIndex = 0;
    
    // Solo un álbum fijo - Lo Inmanente
    this.embeds = [
      { type: 'album', id: '7HTxaYpcYV5sVDlj2kzx7y', name: 'Lo Inmanente - Borja Moskv' }
    ];
    
    this.init();
  }
  
  init() {
    this.container = document.querySelector('.hero__spotify');
    if (!this.container) return;
    
    // Siempre mostrar el álbum único
    this.currentIndex = 0;
    this.applyEmbed();
    
    console.log('🎵', this.embeds[0].name);
  }
  
  rotate() {
    this.currentIndex = (this.currentIndex + 1) % this.embeds.length;
    this.applyEmbed();
    console.log('🔄 Spotify cambiado a:', this.embeds[this.currentIndex].name);
  }
  
  applyEmbed() {
    const embed = this.embeds[this.currentIndex];
    const url = `https://open.spotify.com/embed/${embed.type}/${embed.id}?utm_source=generator&theme=0`;
    
    this.container.innerHTML = `
      <iframe 
        src="${url}" 
        width="300" 
        height="80" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        title="${embed.name} - Borja Moskv"
        style="border-radius: 12px;">
      </iframe>
    `;
  }
}

// Auto-inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.spotifyRotator = new SpotifyRotator();
});
