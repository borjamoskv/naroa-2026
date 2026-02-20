/**
 * Ambient Drone — Sonic Atmosphere Engine
 * Web Audio API-based generative ambient drone that shifts with scroll position.
 * Activated only on first user interaction (browser autoplay policy).
 */

export default class AmbientDrone {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.oscillators = [];
    this.isActive = false;
    this.currentSection = 'home';
    this.volume = 0.03; // Very subtle

    // Frequency mapping per section
    this.sectionFreqs = {
      home:     { base: 55,  harmony: 82.5,  sub: 27.5  },  // Low, grounding
      galeria:  { base: 110, harmony: 165,   sub: 55    },  // Airy, open
      about:    { base: 73,  harmony: 110,   sub: 36.5  },  // Warm, personal
      contacto: { base: 65,  harmony: 98,    sub: 32.5  },  // Inviting
    };

    this.bindActivation();
  }

  bindActivation() {
    const activate = () => {
      if (!this.isActive) {
        this.start();
        document.removeEventListener('click', activate);
        document.removeEventListener('scroll', activate);
      }
    };
    document.addEventListener('click', activate, { once: true });
    document.addEventListener('scroll', activate, { once: true });
  }

  start() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    // Create 3 oscillators: base, harmony, sub
    ['base', 'harmony', 'sub'].forEach((type, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = i === 2 ? 'sine' : 'triangle';
      osc.frequency.value = this.sectionFreqs.home[type];
      
      gain.gain.value = i === 2 ? 0.5 : 0.3;
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      
      this.oscillators.push({ osc, gain, type });
    });

    // Fade in
    this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 3);
    this.isActive = true;

    // Observe sections
    this.observeSections();
  }

  observeSections() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          let section = 'home';
          if (id.includes('archivo') || id.includes('galeria') || id.includes('destacada')) section = 'galeria';
          else if (id.includes('about')) section = 'about';
          else if (id.includes('contacto')) section = 'contacto';
          
          if (section !== this.currentSection) {
            this.morphTo(section);
            this.currentSection = section;
          }
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.view, [id^="view-"]').forEach(el => {
      observer.observe(el);
    });
  }

  morphTo(section) {
    const freqs = this.sectionFreqs[section] || this.sectionFreqs.home;
    const now = this.ctx.currentTime;
    
    this.oscillators.forEach(({ osc, type }) => {
      osc.frequency.linearRampToValueAtTime(freqs[type], now + 2);
    });
  }
}
