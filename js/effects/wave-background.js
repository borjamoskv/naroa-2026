/**
 * WAVE BACKGROUND ENGINE - Fondos dinámicos relajantes
 * Ondas suaves tipo oleaje para experiencia zen
 */

(function() {
  'use strict';

  class WaveBackground {
    constructor() {
      this.container = null;
      this.enabled = true;
      this.init();
    }

    init() {
      this.createWaveContainer();
      this.bindScrollThrottle();
      console.log('[WaveBackground] 🌊 Oleaje zen activado');
    }

    createWaveContainer() {
      // Container for waves
      this.container = document.createElement('div');
      this.container.className = 'wave-background';
      this.container.innerHTML = `
        <div class="wave wave--1"></div>
        <div class="wave wave--2"></div>
        <div class="wave wave--3"></div>
      `;
      
      // Insert at start of body
      document.body.insertBefore(this.container, document.body.firstChild);
      
      // Inject styles
      this.injectStyles();
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .wave-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
          opacity: 0.4;
        }

        .wave {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 200%;
          height: 100%;
          background-repeat: repeat-x;
          transform-origin: center bottom;
        }

        .wave--1 {
          background: linear-gradient(180deg, 
            transparent 0%, 
            transparent 85%,
            rgba(0, 47, 167, 0.08) 85%,
            rgba(0, 47, 167, 0.15) 100%
          );
          animation: wave-sway 8s ease-in-out infinite;
          transform: translateX(-50%);
        }

        .wave--2 {
          background: linear-gradient(180deg, 
            transparent 0%, 
            transparent 80%,
            rgba(135, 206, 235, 0.06) 80%,
            rgba(135, 206, 235, 0.12) 100%
          );
          animation: wave-sway 6s ease-in-out infinite reverse;
          transform: translateX(-50%);
          animation-delay: -2s;
        }

        .wave--3 {
          background: linear-gradient(180deg, 
            transparent 0%, 
            transparent 75%,
            rgba(232, 168, 124, 0.05) 75%,
            rgba(232, 168, 124, 0.1) 100%
          );
          animation: wave-sway 10s ease-in-out infinite;
          transform: translateX(-50%);
          animation-delay: -4s;
        }

        @keyframes wave-sway {
          0%, 100% {
            transform: translateX(-50%) translateY(0) scaleY(1);
          }
          50% {
            transform: translateX(-45%) translateY(-2%) scaleY(1.05);
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .wave {
            animation: none;
          }
        }

        /* Hide on game views to avoid distraction */
        .view--juegos:not(.active) ~ .wave-background,
        .game-view.active ~ .wave-background {
          opacity: 0;
        }
      `;
      document.head.appendChild(style);
    }

    bindScrollThrottle() {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            // Fade out waves as user scrolls down
            const opacity = Math.max(0.1, 0.4 - (scrollY / windowHeight) * 0.3);
            if (this.container) {
              this.container.style.opacity = opacity;
            }
            ticking = false;
          });
          ticking = true;
        }
      });
    }

    toggle(enable) {
      this.enabled = enable;
      if (this.container) {
        this.container.style.display = enable ? 'block' : 'none';
      }
    }
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WaveBackground());
  } else {
    new WaveBackground();
  }

  window.WaveBackground = WaveBackground;
})();
