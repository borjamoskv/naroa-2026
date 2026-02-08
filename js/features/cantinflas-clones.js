/**
 * Cantinflas Clones — 3D Spotlight Feature
 * A premium 'WOW' effect for the Naroa 2026 experience.
 *
 * Places a floating 3D cluster of the 5 Cantinflas variants at the
 * "Crossroads" of the map (approx 100vw, 50vh), creating a
 * transition piece between Home and Gallery.
 */

export class CantinflasSpotlight {
  constructor() {
    this.container = null;
    this.images = [
      'cantinflas-0.webp',
      'cantinflas-1.webp',
      'cantinflas-2.webp',
      'cantinflas-3.webp',
      'cantinflas-4.webp'
    ];
    this.init();
  }

  init() {
    this.createDOM();
    this.attachEvents();
    console.log('🎭 Cantinflas Spotlight initialized');
  }

  createDOM() {
    // Check if mount point exists, else fallback to app
    const mountPoint = document.getElementById('cantinflas-mount-point') || document.getElementById('app');
    
    this.container = document.createElement('div');
    this.container.id = 'cantinflas-spotlight';
    this.container.className = 'cantinflas-spotlight';
    
    // Structure: Container -> 3D Stage -> Card Fan
    let html = `
      <div class="cantinflas-stage">
        <div class="cantinflas-fan">
    `;
    
    this.images.forEach((img, index) => {
      // Calculate inline variable for fan spread
      // --i goes from -2 to 2 (center is 0)
      const offset = index - 2; 
      const absOffset = Math.abs(offset);
      html += `
        <div class="cantinflas-card" style="--i: ${offset}; --abs-i: ${absOffset}" onclick="window.Lightbox && window.Lightbox.open({file: '${img}', title: 'Cantinflas Variant ${index+1}', technique: 'Mixed Media', year: 2024})">
          <img src="images/artworks/${img}" alt="Cantinflas Variant ${index+1}" loading="lazy">
          <div class="cantinflas-glow"></div>
        </div>
      `;
    });
    
    html += `
        </div>
        <div class="cantinflas-title">
          <h2>CANTINFLAS</h2>
          <p>The Many Faces</p>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    mountPoint.appendChild(this.container);
  }

  attachEvents() {
    // Parallax effect on mouse move
    document.addEventListener('mousemove', (e) => {
      if (!this.container) return;
      
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      this.container.style.setProperty('--mouse-x', x);
      this.container.style.setProperty('--mouse-y', y);
    });
  }
}

// Auto-init if module is imported
new CantinflasSpotlight();
