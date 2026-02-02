/**
 * Spotify Rotator - Rota álbumes/playlists cada minuto
 * Moskvlogia Collection
 */

class SpotifyRotator {
  constructor() {
    this.currentIndex = 0;
    
    // Álbumes y playlists de Borja Moskv - Colección completa
    this.embeds = [
      // Álbumes principales
      { type: 'album', id: '7HTxaYpcYV5sVDlj2kzx7y', name: 'Nuevo Álbum' },
      { type: 'album', id: '3Kx5S9L4U8XdU8nHrWgZuT', name: 'Lo Inmanente' },
      { type: 'album', id: '4rN3VvCVqG4RfCqbFZKnqT', name: 'Álbum 2' },
      
      // Playlists curadas
      { type: 'playlist', id: '37i9dQZF1DZ06evO0yVlvS', name: 'Moskvlogia 2008' },
      { type: 'playlist', id: '37i9dQZF1E4zsLJZKF3MvZ', name: 'This Is Borja Moskv' },
      { type: 'playlist', id: '5Rrf7mqN8uKqGAJfY2eYbK', name: 'Los Himnos De Moskv' },
      { type: 'playlist', id: '0vvXsWCC9xrXsKd4FyS8kM', name: 'Electrónica Espacial' },
      { type: 'playlist', id: '3cEYpjA9ozERzCPQSqbz7e', name: 'Ambient Industrial' },
      { type: 'playlist', id: '6b0k8sG7f8fYnq7S4xP9Rv', name: 'Synthwave Nocturno' },
      { type: 'playlist', id: '1HmF9nMgxkDy3ZPJ8kVq2x', name: 'Radio Moskvlogia' },
      
      // Perfil del artista
      { type: 'artist', id: '4NHQUGzhtTLFvgF5SZesLK', name: 'Borja Moskv' }
    ];
    
    this.init();
  }
  
  init() {
    this.container = document.querySelector('.hero__spotify');
    if (!this.container) return;
    
    // Calcular semana del año para rotación semanal
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
    
    // Seleccionar embed basado en semana del año
    this.currentIndex = weekNumber % this.embeds.length;
    
    // Aplicar embed de esta semana
    this.applyEmbed();
    
    console.log('🎵', this.embeds[this.currentIndex].name);
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
