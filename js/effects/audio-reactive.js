/**
 * AUDIO REACTIVE VISUALIZER
 * La web reacciona a lo que suena en el reproductor
 * Usa el micrófono como input para captar el audio ambiente
 * 
 * Efectos:
 * - Resplandor pulsante sincronizado con beats
 * - Partículas que explotan con los graves
 * - Rotación/escala de elementos con la energía
 * - Cambio de colores según frecuencias
 */

class AudioReactiveSystem {
  constructor(options = {}) {
    this.config = {
      sensitivity: options.sensitivity || 1.2,
      smoothing: options.smoothing || 0.85,
      beatThreshold: options.beatThreshold || 0.6,
      reactiveElements: options.reactiveElements || [
        '.hero__line',
        '.hero__palindrome-text',
        '.gallery-massive__item',
        '.artwork-3d'
      ],
      enableMic: options.enableMic !== false,
      visualizerCanvas: options.visualizerCanvas || null,
      ...options
    };

    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.isListening = false;
    this.beatDetected = false;
    this.lastBeatTime = 0;
    this.energy = { low: 0, mid: 0, high: 0, average: 0 };
    this.smoothedEnergy = { low: 0, mid: 0, high: 0, average: 0 };

    this.init();
  }

  async init() {
    // Create the UI button to enable audio
    this.createEnableButton();

    // Setup CSS custom properties for reactive styling
    this.setupCSSProperties();

  }

  createEnableButton() {
    // Create floating button to enable mic
    const button = document.createElement('button');
    button.className = 'audio-reactive-enable';
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
      <span>Audio Reactivo</span>
    `;
    button.title = 'Activar visualización reactiva al audio';
    
    button.addEventListener('click', () => this.requestMicAccess());
    
    document.body.appendChild(button);
    this.enableButton = button;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .audio-reactive-enable {
        position: fixed;
        bottom: 100px;
        left: 2rem;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: rgba(20, 20, 20, 0.9);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 30px;
        color: #d4af37;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .audio-reactive-enable:hover {
        background: rgba(212, 175, 55, 0.2);
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
      }

      .audio-reactive-enable.listening {
        background: rgba(212, 175, 55, 0.3);
        animation: pulse-glow 1s ease-in-out infinite;
      }

      .audio-reactive-enable.listening span::after {
        content: ' ●';
        color: #ff4444;
        animation: blink 1s infinite;
      }

      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 10px rgba(212, 175, 55, 0.3); }
        50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.6); }
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* Audio reactive CSS variables */
      :root {
        --audio-energy: 0;
        --audio-bass: 0;
        --audio-mid: 0;
        --audio-high: 0;
        --audio-beat: 0;
      }

      /* Elements react to audio */
      .audio-reactive .hero__palindrome-text {
        transform: scale(calc(1 + var(--audio-bass) * 0.1));
        filter: blur(calc(var(--audio-bass) * 2px));
        transition: none !important;
      }

      .audio-reactive .hero__line {
        text-shadow: 0 0 calc(var(--audio-energy) * 30px) rgba(212, 175, 55, var(--audio-energy));
      }

      .audio-reactive .gallery-massive__item {
        transform: scale(calc(1 + var(--audio-mid) * 0.05));
      }

      .audio-reactive .hero__spotify {
        transform: scale(calc(1.2 + var(--audio-beat) * 0.3)) !important;
      }

      /* Beat flash overlay */
      .audio-beat-flash {
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
        opacity: 0;
        z-index: 9998;
        transition: opacity 0.1s ease-out;
      }

      .audio-beat-flash.flash {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    // Create beat flash overlay
    this.beatFlash = document.createElement('div');
    this.beatFlash.className = 'audio-beat-flash';
    document.body.appendChild(this.beatFlash);
  }

  setupCSSProperties() {
    // Initialize CSS custom properties
    document.documentElement.style.setProperty('--audio-energy', '0');
    document.documentElement.style.setProperty('--audio-bass', '0');
    document.documentElement.style.setProperty('--audio-mid', '0');
    document.documentElement.style.setProperty('--audio-high', '0');
    document.documentElement.style.setProperty('--audio-beat', '0');
  }

  async requestMicAccess() {
    if (this.isListening) {
      this.stopListening();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });

      this.setupAudioAnalysis(stream);
      this.isListening = true;
      this.enableButton.classList.add('listening');
      this.enableButton.querySelector('span').textContent = 'Escuchando';
      document.body.classList.add('audio-reactive');


    } catch (err) {
      Logger.error('Mic access denied:', err);
      alert('Por favor, permite el acceso al micrófono para que la web reaccione a la música');
    }
  }

  setupAudioAnalysis(stream) {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = this.audioContext.createMediaStreamSource(stream);
    
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = this.config.smoothing;
    
    source.connect(this.analyser);
    
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    this.startAnalysisLoop();
  }

  startAnalysisLoop() {
    const analyze = () => {
      if (!this.isListening) return;

      this.analyser.getByteFrequencyData(this.dataArray);

      // Calculate energy bands
      const bufferLength = this.dataArray.length;
      
      // Bass: 0-10 (low frequencies)
      let bassSum = 0;
      for (let i = 0; i < 10; i++) {
        bassSum += this.dataArray[i];
      }
      this.energy.low = (bassSum / 10 / 255) * this.config.sensitivity;

      // Mid: 10-50
      let midSum = 0;
      for (let i = 10; i < 50; i++) {
        midSum += this.dataArray[i];
      }
      this.energy.mid = (midSum / 40 / 255) * this.config.sensitivity;

      // High: 50-128
      let highSum = 0;
      for (let i = 50; i < bufferLength; i++) {
        highSum += this.dataArray[i];
      }
      this.energy.high = (highSum / (bufferLength - 50) / 255) * this.config.sensitivity;

      // Average
      this.energy.average = (this.energy.low + this.energy.mid + this.energy.high) / 3;

      // Smooth the values
      const smooth = 0.2;
      this.smoothedEnergy.low += (this.energy.low - this.smoothedEnergy.low) * smooth;
      this.smoothedEnergy.mid += (this.energy.mid - this.smoothedEnergy.mid) * smooth;
      this.smoothedEnergy.high += (this.energy.high - this.smoothedEnergy.high) * smooth;
      this.smoothedEnergy.average += (this.energy.average - this.smoothedEnergy.average) * smooth;

      // Beat detection
      const now = performance.now();
      if (this.energy.low > this.config.beatThreshold && 
          now - this.lastBeatTime > 200) { // Min 200ms between beats
        this.onBeat();
        this.lastBeatTime = now;
      }

      // Update CSS properties
      this.updateCSSProperties();

      requestAnimationFrame(analyze);
    };

    analyze();
  }

  onBeat() {
    this.beatDetected = true;
    document.documentElement.style.setProperty('--audio-beat', '1');
    
    // Flash effect
    this.beatFlash.classList.add('flash');
    
    setTimeout(() => {
      this.beatFlash.classList.remove('flash');
      document.documentElement.style.setProperty('--audio-beat', '0');
      this.beatDetected = false;
    }, 100);

    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('audiobeat', {
      detail: { energy: this.energy }
    }));
  }

  updateCSSProperties() {
    const root = document.documentElement;
    root.style.setProperty('--audio-energy', this.smoothedEnergy.average.toFixed(3));
    root.style.setProperty('--audio-bass', this.smoothedEnergy.low.toFixed(3));
    root.style.setProperty('--audio-mid', this.smoothedEnergy.mid.toFixed(3));
    root.style.setProperty('--audio-high', this.smoothedEnergy.high.toFixed(3));
  }

  stopListening() {
    this.isListening = false;
    this.enableButton.classList.remove('listening');
    this.enableButton.querySelector('span').textContent = 'Audio Reactivo';
    document.body.classList.remove('audio-reactive');

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Reset CSS properties
    this.setupCSSProperties();

  }

  // Get current energy levels (for external use)
  getEnergy() {
    return { ...this.smoothedEnergy };
  }

  destroy() {
    this.stopListening();
    this.enableButton?.remove();
    this.beatFlash?.remove();
  }
}

// Auto-initialize
window.AudioReactiveSystem = AudioReactiveSystem;

document.addEventListener('DOMContentLoaded', () => {
  window.audioReactive = new AudioReactiveSystem();
});
