/**
 * INTRO ESPECTACULAR - Retratos Flotantes
 * 24 PNGs sin fondo con animación cinética
 */

(function() {
  'use strict';

  const INTRO_BASE = 'img/artworks-intro/';
  let introState = {
    artworks: [],
    elements: [],
    isPlaying: false,
    container: null
  };

  async function loadIntroArtworks() {
    try {
      const response = await fetch('data/intro-artworks.json');
      const data = await response.json();
      introState.artworks = data.artworks;
    } catch (e) {
      Logger.warn('Intro artworks not found, using fallback');
      introState.artworks = [
        { file: 'amy-rocks.webp' },
        { file: 'marilyn-rocks.webp' },
        { file: 'johnny-rocks.webp' },
        { file: 'james-rocks.webp' },
        { file: 'starchild.webp' }
      ];
    }
  }

  function createIntroContainer() {
    // Create fullscreen intro overlay
    const container = document.createElement('div');
    container.id = 'naroa-intro';
    container.innerHTML = `
      <div class="intro-canvas">
        <div class="intro-portraits"></div>
        <div class="intro-title">
          <h1 class="intro-name">NAROA GUTIÉRREZ GIL</h1>
          <p class="intro-tagline">Hiperrealismo POP</p>
        </div>
        <button class="intro-skip" aria-label="Saltar intro">Entrar</button>
      </div>
      <style>
        #naroa-intro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: opacity 1s ease, visibility 0.5s;
        }
        #naroa-intro.hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .intro-canvas {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        .intro-portraits {
          position: absolute;
          inset: 0;
          perspective: 1500px;
        }
        .intro-portrait {
          position: absolute;
          opacity: 0;
          transform: translateZ(-500px) scale(0.5);
          transition: opacity 0.8s, transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 20px 60px rgba(0,0,0,0.8));
          will-change: transform, opacity;
        }
        .intro-portrait.visible {
          opacity: 1;
          transform: translateZ(0) scale(1);
        }
        .intro-portrait img {
          max-width: 200px;
          max-height: 280px;
          object-fit: contain;
        }
        @media (min-width: 768px) {
          .intro-portrait img {
            max-width: 300px;
            max-height: 400px;
          }
        }
        .intro-title {
          position: absolute;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 10;
          opacity: 0;
          animation: fadeInUp 1.5s ease 2s forwards;
        }
        .intro-name {
          font-family: 'Switzer', sans-serif;
          font-size: clamp(2rem, 8vw, 5rem);
          font-weight: 300;
          color: #ffd700;
          text-shadow: 0 4px 30px rgba(255, 215, 0, 0.3);
          margin: 0 0 0.5rem;
          letter-spacing: 0.1em;
        }
        .intro-tagline {
          font-family: 'Satoshi', sans-serif;
          font-size: clamp(0.9rem, 2vw, 1.3rem);
          color: rgba(255,255,255,0.6);
          margin: 0;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }
        .intro-skip {
          position: absolute;
          bottom: 5%;
          left: 50%;
          transform: translateX(-50%);
          background: transparent;
          border: 1px solid rgba(255,215,0,0.5);
          color: #ffd700;
          padding: 0.75rem 2.5rem;
          font-size: 0.9rem;
          letter-spacing: 0.2em;
          cursor: pointer;
          opacity: 0;
          animation: fadeIn 1s ease 3s forwards;
          transition: all 0.3s;
        }
        .intro-skip:hover {
          background: rgba(255,215,0,0.1);
          border-color: #ffd700;
        }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
          from { opacity: 0; transform: translateX(-50%) translateY(30px); }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes floatPortrait {
          0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-15px) rotate(calc(var(--rot, 0deg) + 2deg)); }
        }
        .intro-portrait.floating {
          animation: floatPortrait 4s ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
      </style>
    `;
    
    document.body.appendChild(container);
    introState.container = container;

    // Bind skip button
    container.querySelector('.intro-skip').addEventListener('click', closeIntro);
    
    return container;
  }

  function spawnPortraits() {
    const portraitsContainer = document.querySelector('.intro-portraits');
    if (!portraitsContainer) return;

    // Shuffle and take random selection
    const shuffled = [...introState.artworks].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(12, shuffled.length));

    selected.forEach((art, i) => {
      const el = document.createElement('div');
      el.className = 'intro-portrait';
      
      // Random positioning
      const x = Math.random() * 80 + 10; // 10-90%
      const y = Math.random() * 60 + 15; // 15-75%
      const rot = (Math.random() - 0.5) * 20; // -10 to 10 deg
      const delay = i * 0.15;
      
      el.style.cssText = `
        left: ${x}%;
        top: ${y}%;
        --rot: ${rot}deg;
        --delay: ${delay + 1}s;
        z-index: ${Math.floor(Math.random() * 10)};
      `;
      
      const img = document.createElement('img');
      img.src = INTRO_BASE + art.file;
      img.alt = art.subject || 'Naroa artwork';
      img.loading = 'lazy';
      
      el.appendChild(img);
      portraitsContainer.appendChild(el);
      introState.elements.push(el);

      // Trigger animation after image loads
      img.onload = () => {
        setTimeout(() => {
          el.classList.add('visible');
          setTimeout(() => el.classList.add('floating'), 800);
        }, delay * 1000);
      };
    });
  }

  function closeIntro() {
    if (!introState.container) return;
    introState.container.classList.add('hidden');
    introState.isPlaying = false;
    
    // Store that user has seen intro
    sessionStorage.setItem('naroa-intro-seen', 'true');
    
    // Remove after transition
    setTimeout(() => {
      introState.container?.remove();
      introState.container = null;
    }, 1000);
  }

  async function initIntro() {
    // Skip if already seen this session
    if (sessionStorage.getItem('naroa-intro-seen')) {
      return;
    }
    
    // Skip if navigating directly to a specific route (not home)
    const hash = window.location.hash;
    if (hash && hash !== '#/' && hash !== '#') {
      sessionStorage.setItem('naroa-intro-seen', 'true');
      return;
    }

    await loadIntroArtworks();
    
    if (introState.artworks.length === 0) {
      return;
    }

    createIntroContainer();
    spawnPortraits();
    introState.isPlaying = true;

    // Auto-close after 8 seconds
    setTimeout(() => {
      if (introState.isPlaying) closeIntro();
    }, 8000);
  }

  // Export to window
  window.NaroaIntro = {
    init: initIntro,
    skip: closeIntro,
    replay: async () => {
      sessionStorage.removeItem('naroa-intro-seen');
      await initIntro();
    }
  };

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();
