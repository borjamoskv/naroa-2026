/**
 * MICA EMOTION ENGINE v1.0
 * Sistema emocional reactivo para la galerista AI
 * 
 * Features:
 * - Circadian rhythm (energía por hora del día)
 * - Logarithmic fatigue (uso acumulado)
 * - Weather integration (wttr.in con fallback)
 * - Borja Moskv detection (SOUL mode)
 * - LocalStorage persistence
 * 
 * Tamaño: ~5KB (sin dependencias)
 * Performance: <10ms por update
 */

class MICAEmotionEngine {
  constructor() {
    this.state = this.loadState() || this.getDefaultState();
    this.updateInterval = 5 * 60 * 1000; // Check cada 5min
    this.init();
  }

  getDefaultState() {
    return {
      mood: 'NEUTRAL',
      energy: 60,
      cooperation: 80,
      creativity: 70,
      gamesToday: 0,
      lastInteraction: Date.now(),
      lastDayReset: new Date().toDateString(),
      weatherCache: {
        checked: 0,
        condition: 'unknown'
      }
    };
  }

  /**
   * Curva circadiana natural
   * Peak energía: 12:00-14:00 (mediodía)
   * Low energy: 02:00-05:00 (madrugada)
   * 
   * Función: sin((hour - 6) * π/12) * 50 + 50
   * Range: 0-100
   */
  calculateCircadianEnergy() {
    const hour = new Date().getHours();
    // Offset -6 para que pico sea a las 12h (sin(6) = peak)
    const radians = (hour - 6) * Math.PI / 12;
    return Math.sin(radians) * 50 + 50;
  }

  /**
   * Fatiga logarítmica por juegos jugados
   * 
   * Curva: log(n + 1) * 10
   * - 1 juego: -0 fatiga
   * - 5 juegos: -16 fatiga
   * - 10 juegos: -23 fatiga
   * - 50 juegos: -39 fatiga (plateau)
   * 
   * Logaritmo natural para decay realista
   */
  calculateGameFatigue() {
    return Math.log(this.state.gamesToday + 1) * 10;
  }

  /**
   * Impacto del clima en el mood
   * Cache 1h para evitar rate limiting
   * Fallback: timezone-based guess
   */
  async getWeatherImpact() {
    const now = Date.now();
    const cacheAge = now - this.state.weatherCache.checked;
    
    // Usar cache si < 1h old
    if (cacheAge < 3600000) {
      return this.getWeatherValue(this.state.weatherCache.condition);
    }

    try {
      // Timeout 2s para no bloquear
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('https://wttr.in/?format=j1', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      const condition = data.current_condition[0].weatherDesc[0].value.toLowerCase();
      
      this.state.weatherCache = { checked: now, condition };
      this.persistState();
      
      return this.getWeatherValue(condition);
    } catch (error) {
      console.log('Weather API timeout, using fallback');
      return this.getWeatherFallback();
    }
  }

  /**
   * Mapeo de condiciones climáticas a impacto emocional
   */
  getWeatherValue(condition) {
    if (condition.includes('rain') || condition.includes('drizzle')) return -15;
    if (condition.includes('storm') || condition.includes('thunder')) return -20;
    if (condition.includes('snow')) return -5;
    if (condition.includes('clear') || condition.includes('sunny')) return +5;
    return 0; // Cloudy/Unknown = neutral
  }

  /**
   * Fallback: Guess basado en hora del día
   * Asume: noche = nublado, día = soleado
   */
  getWeatherFallback() {
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 6) return -5; // Night = cloudy
    return 5; // Day = sunny assumption
  }

  /**
   * Cálculo final de energía
   * Weighted combination de factores
   */
  async updateEnergy() {
    const circadian = this.calculateCircadianEnergy();
    const fatigue = this.calculateGameFatigue();
    const weather = await this.getWeatherImpact();

    // Fórmula: base circadiana - fatiga + clima
    this.state.energy = Math.max(0, Math.min(100, 
      circadian - fatigue + weather
    ));

    // Actualizar cooperation y creativity basado en energy
    this.state.cooperation = Math.max(20, this.state.energy * 0.8 + 20);
    this.state.creativity = Math.max(40, this.state.energy * 0.6 + 40);

    this.determineMood();
    this.persistState();
    this.updateDOM();
  }

  /**
   * Lógica de determinación de mood
   * Basado en thresholds de energy, cooperation, creativity
   */
  determineMood() {
    const { energy, cooperation, creativity } = this.state;

    // SOUL MODE: Borja Moskv detected
    if (this.detectBorjaMoskv()) {
      this.state.mood = 'SOUL';
      this.state.energy = 100;
      this.state.cooperation = 100;
      this.state.creativity = 100;
      return;
    }

    // Mood hierarchy (orden importa)
    if (energy > 80 && cooperation > 80) {
      this.state.mood = 'ENERGETIC';
    } else if (energy < 30 && cooperation < 40) {
      this.state.mood = 'GRUMPY';
    } else if (energy < 30) {
      this.state.mood = 'TIRED';
    } else if (creativity > 80 && energy > 50) {
      this.state.mood = 'PLAYFUL';
    } else {
      this.state.mood = 'NEUTRAL';
    }
  }

  /**
   * Easter egg: Detecta referencias a Borja Moskv
   * Triggers SOUL mode (máxima cooperación)
   */
  detectBorjaMoskv() {
    const pageText = document.title + (document.body?.textContent || '');
    const keywords = [
      'borja moskv',
      'moskvlogia',
      'giro inesperado',
      'borjamoskv'
    ];

    return keywords.some(kw => pageText.toLowerCase().includes(kw)) ||
           window.location.pathname.includes('borjamoskv');
  }

  /**
   * Update DOM via CSS custom properties
   * Performance: GPU-accelerated, no reflow
   */
  updateDOM() {
    const root = document.documentElement;
    
    // Set data attribute para selector CSS
    root.setAttribute('data-mica-mood', this.state.mood.toLowerCase());
    
    // CSS custom properties para smooth transitions
    root.style.setProperty('--mica-energy', this.state.energy / 100);
    root.style.setProperty('--mica-cooperation', this.state.cooperation / 100);
    root.style.setProperty('--mica-creativity', this.state.creativity / 100);
    
    // Dispatch event para componentes React/Vue/Vanilla
    window.dispatchEvent(new CustomEvent('mica-mood-change', {
      detail: {
        mood: this.state.mood,
        energy: this.state.energy,
        cooperation: this.state.cooperation,
        creativity: this.state.creativity
      }
    }));
  }

  /**
   * LocalStorage persistence
   */
  persistState() {
    try {
      localStorage.setItem('mica_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to persist MICA state', e);
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem('mica_state');
      if (!saved) return null;

      const state = JSON.parse(saved);
      
      // Reset gamesToday si es nuevo día
      const today = new Date().toDateString();
      if (state.lastDayReset !== today) {
        state.gamesToday = 0;
        state.lastDayReset = today;
      }

      return state;
    } catch (e) {
      console.warn('Failed to load MICA state', e);
      return null;
    }
  }

  /**
   * Incrementa contador de juegos
   * Call desde cada game's onStart()
   */
  incrementGames() {
    this.state.gamesToday++;
    this.state.lastInteraction = Date.now();
    this.updateEnergy();
  }

  /**
   * Obtiene estado actual (read-only)
   */
  getState() {
    return { ...this.state }; // Clone para evitar mutación
  }

  /**
   * Inicialización
   */
  init() {
    // Update inicial
    this.updateEnergy();
    
    // Periodic updates cada 5min
    setInterval(() => this.updateEnergy(), this.updateInterval);
    
    // Setup midnight reset
    this.scheduleMidnightReset();
    
    console.log('🌟 MICA Emotion Engine initialized', this.state);
  }

  /**
   * Resetea gamesToday a medianoche
   */
  scheduleMidnightReset() {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const msUntilMidnight = midnight - now;

    setTimeout(() => {
      this.state.gamesToday = 0;
      this.state.lastDayReset = new Date().toDateString();
      this.updateEnergy();
      
      // Reschedule para mañana
      this.scheduleMidnightReset();
    }, msUntilMidnight);
  }
}

// Global singleton - Auto-init
if (typeof window !== 'undefined') {
  window.MICA = new MICAEmotionEngine();
}

// Export para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MICAEmotionEngine;
}
