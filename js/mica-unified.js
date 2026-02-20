/**
 * MICA v5.0 - Unified Orchestrator
 * Central controller for all MICA subsystems
 * 
 * Architecture:
 * - Lazy loading de módulos pesados (avatar 3D, particles)
 * - API pública unificada
 * - Event-driven communication
 */

class MICAOrchestrator {
  constructor() {
    this.modules = {
      chat: null,
      emotion: null,
      avatar: null,
      particles: null,
      typewriter: null,
      nlp: null
    };
    
    this.loaded = new Set();
    this.events = new EventTarget();
    
    // Auto-init core modules
    this.initCore();
  }
  
  async initCore() {
    // Emotion engine siempre carga (ligero, ~8KB)
    try {
      const EmotionEngine = await import('./mica-emotion-engine.js');
      this.modules.emotion = window.MICA || new EmotionEngine.default();
      this.loaded.add('emotion');
    } catch (e) {
      Logger.warn('[MICA] Emotion engine not available:', e);
    }
  }
  
  /**
   * Lazy load heavy modules on demand
   */
  async load(moduleName) {
    if (this.loaded.has(moduleName)) {
      return this.modules[moduleName];
    }
    
    const loaders = {
      avatar: async () => {
        const { default: MicaAvatar } = await import('./mica-avatar-3d.js');
        return new MicaAvatar('mica-avatar-container');
      },
      particles: async () => {
        const { default: Particles } = await import('./mica-particles-webgl.js');
        return new Particles();
      },
      typewriter: async () => {
        const { default: Typewriter } = await import('./mica-typewriter.js');
        return new Typewriter();
      },
      nlp: async () => {
        const { default: NLP } = await import('./mica-naroa-nlp.js');
        return window.MicaNLP || new NLP();
      }
    };
    
    if (loaders[moduleName]) {
      try {
        this.modules[moduleName] = await loaders[moduleName]();
        this.loaded.add(moduleName);
        return this.modules[moduleName];
      } catch (e) {
        Logger.warn(`[MICA] Failed to load ${moduleName}:`, e);
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Public API
   */
  
  // Get current mood
  get mood() {
    return this.modules.emotion?.getState?.()?.mood || 'NEUTRAL';
  }
  
  // Get energy level (0-100)
  get energy() {
    return this.modules.emotion?.getState?.()?.energy || 50;
  }
  
  // Chat with MICA (delegates to main chat module)
  async chat(message) {
    // Load NLP if not loaded
    await this.load('nlp');
    
    // If window.micaChat exists (from mica.js), use it
    if (window.micaChat) {
      window.micaChat.handleSend(message);
      return;
    }
    
    // Fallback: generate response via NLP
    if (this.modules.nlp) {
      return this.modules.nlp.generate(message);
    }
    
    return "Lo siento, estoy cargando...";
  }
  
  // Trigger avatar speech animation
  async speak() {
    const avatar = await this.load('avatar');
    avatar?.activarHabla?.();
  }
  
  // Particle burst effect
  async particles(type = 'burst') {
    const particles = await this.load('particles');
    if (type === 'burst') {
      particles?.burst?.();
    } else if (type === 'trail') {
      particles?.startTrail?.();
    }
  }
  
  // Typewriter effect
  async type(text, element) {
    const typewriter = await this.load('typewriter');
    return typewriter?.escribir?.(text, element);
  }
  
  // Event system
  on(event, callback) {
    this.events.addEventListener(event, callback);
  }
  
  emit(event, detail = {}) {
    this.events.dispatchEvent(new CustomEvent(event, { detail }));
  }
  
  // Increment game counter (for emotion fatigue)
  incrementGames() {
    this.modules.emotion?.incrementGames?.();
  }
}

// Singleton instance
const micaOrchestrator = new MICAOrchestrator();

// Expose unified API
window.MICAv5 = micaOrchestrator;

// Backwards compatibility
window.MICAOrchestrator = micaOrchestrator;

// Export
export default MICAOrchestrator;
export { micaOrchestrator };

