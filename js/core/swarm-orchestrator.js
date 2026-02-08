/**
 * SWARM ORCHESTRATOR v2 — Naroa 2026
 * 10-Agent Architecture for the 360° Experience
 * Each agent is autonomous and manages its own domain.
 */

class SwarmAgent {
  constructor(name) {
    this.name = name;
    this.active = false;
  }
  log(msg) { console.log(`[🐝 ${this.name}] ${msg}`); }
  activate() { this.active = true; this.log('Online ✅'); }
}

// ═══════════════════════════════════════════
// 1. NAVIGATOR — Controls 360° movement
// ═══════════════════════════════════════════
class SwarmNavigator extends SwarmAgent {
  constructor() {
    super('Navigator');
    this.viewMap = {
      'view-home':      { x: 0, y: 0 },
      'view-gallery':   { x: '100vw', y: 0 },
      'view-archivo':   { x: '100vw', y: 0 },
      'view-about':     { x: 0, y: '100vh' },
      'view-contacto':  { x: '100vw', y: '100vh' },
    };
  }

  activate() {
    super.activate();
    window.addEventListener('scroll', () => {
      const compass = document.getElementById('swarm-compass');
      if (compass) {
        const deg = Math.atan2(window.scrollY, window.scrollX) * (180 / Math.PI);
        compass.style.transform = `rotate(${deg}deg)`;
      }
    }, { passive: true });
  }

  flyTo(viewId) {
    const el = document.getElementById(viewId);
    if (!el) return this.log(`View ${viewId} not found`);
    this.log(`Flying to ${viewId} 🚀`);
    el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  }

  flyToCoords(x, y) {
    this.log(`Flying to (${x}, ${y}) 🚀`);
    window.scrollTo({ left: x, top: y, behavior: 'smooth' });
  }
}

// ═══════════════════════════════════════════
// 2. CURATOR — Manages gallery asset loading
// ═══════════════════════════════════════════
class SwarmCurator extends SwarmAgent {
  constructor() { super('Curator'); }

  activate() {
    super.activate();
    this.forceLoadGallery();
  }

  forceLoadGallery() {
    const images = document.querySelectorAll('img[data-src]');
    let loaded = 0;
    images.forEach(img => {
      img.onerror = () => {
        img.style.display = 'none';
        console.warn(`[Swarm Curator] Failed to load: ${img.src}`);
      };
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
      loaded++;
    });
    if (loaded > 0) this.log(`Force-loaded ${loaded} images 🖼️ (with fallback)`);
  }
}

// ═══════════════════════════════════════════
// 3. FX — Global visual effects
// ═══════════════════════════════════════════
class SwarmFX extends SwarmAgent {
  constructor() { super('FX'); }
  activate() {
    super.activate();
    this.log('Atmosphere active 🌟');
  }
}

// ═══════════════════════════════════════════
// 4. SENTINEL — Performance monitor
// ═══════════════════════════════════════════
class SwarmSentinel extends SwarmAgent {
  constructor() { super('Sentinel'); }
  activate() {
    super.activate();
    this.monitor();
  }
  monitor() {
    if ('PerformanceObserver' in window) {
      const obs = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.duration > 50) this.log(`Slow task: ${entry.duration.toFixed(0)}ms ⚠️`);
        });
      });
      try { obs.observe({ entryTypes: ['longtask'] }); } catch(e) {}
    }
  }
}

// ═══════════════════════════════════════════
// 5. LIAISON — External API coordinator
// ═══════════════════════════════════════════
class SwarmLiaison extends SwarmAgent {
  constructor() { super('Liaison'); }
  activate() { super.activate(); }
}

// ═══════════════════════════════════════════
// 6. GAMEMASTER — Game session manager
// ═══════════════════════════════════════════
class SwarmGamemaster extends SwarmAgent {
  constructor() {
    super('Gamemaster');
    this.activeSessions = new Map();
  }
  activate() {
    super.activate();
    this.log('Ready to host games 🎮');
  }
  startGame(gameId) {
    this.activeSessions.set(gameId, { startTime: Date.now(), score: 0 });
    this.log(`Game started: ${gameId}`);
  }
  endGame(gameId) {
    const session = this.activeSessions.get(gameId);
    if (session) {
      const duration = ((Date.now() - session.startTime) / 1000).toFixed(1);
      this.log(`Game ${gameId} ended. Duration: ${duration}s, Score: ${session.score}`);
      this.activeSessions.delete(gameId);
    }
  }
}

// ═══════════════════════════════════════════
// 7. MEMORY — Session state persistence
// ═══════════════════════════════════════════
class SwarmMemory extends SwarmAgent {
  constructor() { super('Memory'); }
  activate() {
    super.activate();
    this.restore();
  }
  save(key, value) {
    try { sessionStorage.setItem(`swarm_${key}`, JSON.stringify(value)); } catch(e) {}
  }
  recall(key) {
    try { return JSON.parse(sessionStorage.getItem(`swarm_${key}`)); } catch(e) { return null; }
  }
  restore() {
    const lastRoute = this.recall('lastRoute');
    if (lastRoute) this.log(`Restored last route: ${lastRoute}`);
  }
}

// ═══════════════════════════════════════════
// 8. STYLIST — Dynamic theme management
// ═══════════════════════════════════════════
class SwarmStylist extends SwarmAgent {
  constructor() { super('Stylist'); }
  activate() {
    super.activate();
    this.applyTimeTheme();
  }
  applyTimeTheme() {
    const hour = new Date().getHours();
    const isNight = hour < 7 || hour > 20;
    document.body.classList.toggle('theme-night', isNight);
    document.body.classList.toggle('theme-day', !isNight);
    this.log(`Theme: ${isNight ? '🌙 Night' : '☀️ Day'}`);
  }
}

// ═══════════════════════════════════════════
// 9. ACCESSIBILITY — A11y enhancements
// ═══════════════════════════════════════════
class SwarmA11y extends SwarmAgent {
  constructor() { super('A11y'); }
  activate() {
    super.activate();
    this.enhanceLinks();
    this.announceRouteChanges();
  }
  enhanceLinks() {
    document.querySelectorAll('a:not([aria-label])').forEach(a => {
      if (a.textContent.trim()) a.setAttribute('aria-label', a.textContent.trim());
    });
  }
  announceRouteChanges() {
    let announcer = document.getElementById('route-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'route-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
      document.body.appendChild(announcer);
    }
  }
}

// ═══════════════════════════════════════════
// 10. ANALYTICS — Interaction tracking
// ═══════════════════════════════════════════
class SwarmAnalytics extends SwarmAgent {
  constructor() { 
    super('Analytics');
    this.events = [];
  }
  activate() {
    super.activate();
    this.trackNavigation();
    this.trackInteractions();
  }
  trackNavigation() {
    window.addEventListener('hashchange', () => {
      this.events.push({ type: 'nav', route: location.hash, time: Date.now() });
    });
  }
  trackInteractions() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, .stitch-card, .gallery__item');
      if (target) {
        this.events.push({
          type: 'click',
          element: target.tagName + (target.id ? '#' + target.id : ''),
          time: Date.now()
        });
      }
    }, { passive: true });
  }
  getReport() {
    return { totalEvents: this.events.length, events: this.events.slice(-20) };
  }
}

// ═══════════════════════════════════════════
// MASTER ORCHESTRATOR
// ═══════════════════════════════════════════
class SwarmOrchestrator {
  constructor() {
    this.navigator   = new SwarmNavigator();
    this.curator     = new SwarmCurator();
    this.fx          = new SwarmFX();
    this.sentinel    = new SwarmSentinel();
    this.liaison     = new SwarmLiaison();
    this.gamemaster  = new SwarmGamemaster();
    this.memory      = new SwarmMemory();
    this.stylist     = new SwarmStylist();
    this.a11y        = new SwarmA11y();
    this.analytics   = new SwarmAnalytics();
    
    this.agents = [
      this.navigator, this.curator, this.fx, this.sentinel,
      this.liaison, this.gamemaster, this.memory, this.stylist, 
      this.a11y, this.analytics
    ];
  }

  init() {
    console.group('🐝 SWARM v2 — 10 Agents Initializing');
    this.agents.forEach(agent => agent.activate());
    console.log(`✅ All ${this.agents.length} agents online`);
    console.groupEnd();
    window.Swarm = this;
  }

  status() {
    return this.agents.map(a => ({ name: a.name, active: a.active }));
  }
}

export const Swarm = new SwarmOrchestrator();
