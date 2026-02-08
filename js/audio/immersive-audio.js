/**
 * IMMERSIVE 3D AUDIO ENGINE
 * Naroa 2026 - Spatial Audio Experience
 * Web Audio API with HiFi 3D panning
 */

const ImmersiveAudio = {
  ctx: null,
  masterGain: null,
  compressor: null,
  reverb: null,
  sources: new Map(),
  listener: null,
  isEnabled: true,
  isMuted: false,

  // Audio library - ambient sounds for art gallery
  library: {
    ambient: {
      gallery: 'audio/ambient-gallery.mp3',
      nature: 'audio/ambient-nature.mp3',
      minimal: 'audio/ambient-minimal.mp3'
    },
    ui: {
      hover: 'audio/ui-hover.mp3',
      click: 'audio/ui-click.mp3',
      success: 'audio/ui-success.mp3',
      transition: 'audio/ui-transition.mp3'
    },
    game: {
      start: 'audio/game-start.mp3',
      win: 'audio/game-win.mp3',
      score: 'audio/game-score.mp3',
      move: 'audio/game-move.mp3'
    },
    spatial: {
      artwork: 'audio/artwork-reveal.mp3',
      mica: 'audio/mica-shimmer.mp3'
    }
  },

  // Initialize audio context
  async init() {
    try {
      // Create audio context on user interaction
      this.ctx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 48000, // HiFi sample rate
        latencyHint: 'interactive'
      });

      // Master compressor for dynamics
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;

      // Create convolution reverb for spatial depth
      this.reverb = await this.createReverb();

      // Connect: sources -> reverb -> compressor -> master -> output
      this.reverb.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Initialize synthesizer
      if (window.AudioSynth) {
        AudioSynth.init(this.ctx);
        this.synth = AudioSynth;
      }

      // Setup 3D listener (user's position)
      this.setupListener();

      // Create UI controls
      this.createUI();

      // Ambient drone disabled per user request
      // this.startAmbient();

      return true;
    } catch (err) {
      console.warn('Audio not available:', err);
      return false;
    }
  },

  // Start synthesized ambient
  startAmbient() {
    if (this.synth && !this.isMuted) {
      this.ambientDrone = this.synth.createAmbientDrone();
      if (this.ambientDrone) {
        this.ambientDrone.start();
      }
    }
  },

  stopAmbientDrone() {
    if (this.ambientDrone) {
      this.ambientDrone.stop();
      this.ambientDrone = null;
    }
  },

  // Setup 3D listener position
  setupListener() {
    if (this.ctx.listener.positionX) {
      // Modern API
      this.ctx.listener.positionX.value = 0;
      this.ctx.listener.positionY.value = 0;
      this.ctx.listener.positionZ.value = 0;
      this.ctx.listener.forwardX.value = 0;
      this.ctx.listener.forwardY.value = 0;
      this.ctx.listener.forwardZ.value = -1;
      this.ctx.listener.upX.value = 0;
      this.ctx.listener.upY.value = 1;
      this.ctx.listener.upZ.value = 0;
    } else {
      // Legacy API
      this.ctx.listener.setPosition(0, 0, 0);
      this.ctx.listener.setOrientation(0, 0, -1, 0, 1, 0);
    }

    // Track mouse for listener orientation
    document.addEventListener('mousemove', (e) => {
      if (!this.ctx) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * -2;
      
      if (this.ctx.listener.forwardX) {
        this.ctx.listener.forwardX.value = x * 0.5;
        this.ctx.listener.forwardY.value = y * 0.3;
      }
    });
  },

  // Create impulse response for reverb
  async createReverb() {
    const convolver = this.ctx.createConvolver();
    
    // Generate synthetic IR for art gallery reverb
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 2.5; // 2.5 second reverb
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with slight randomness
        const decay = Math.exp(-i / (sampleRate * 0.8));
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    
    convolver.buffer = impulse;
    return convolver;
  },

  // Create 3D panner node
  create3DPanner(x = 0, y = 0, z = -5) {
    const panner = this.ctx.createPanner();
    
    // HRTF for realistic 3D audio
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 100;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;
    panner.coneOuterGain = 0;

    // Set position
    if (panner.positionX) {
      panner.positionX.value = x;
      panner.positionY.value = y;
      panner.positionZ.value = z;
    } else {
      panner.setPosition(x, y, z);
    }

    return panner;
  },

  // Load audio buffer
  async loadBuffer(url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.ctx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn(`Failed to load audio: ${url}`);
      return null;
    }
  },

  // Play spatial 3D sound
  async play3D(url, options = {}) {
    if (!this.ctx || !this.isEnabled || this.isMuted) return null;
    
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const {
      x = 0,
      y = 0, 
      z = -5,
      volume = 0.5,
      loop = false,
      reverb = 0.3,
      animate = null // {duration, toX, toY, toZ}
    } = options;

    // Create source
    const source = this.ctx.createBufferSource();
    const buffer = await this.loadBuffer(url);
    if (!buffer) return null;
    
    source.buffer = buffer;
    source.loop = loop;

    // Gain node
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;

    // 3D panner
    const panner = this.create3DPanner(x, y, z);

    // Dry/wet mix for reverb
    const dryGain = this.ctx.createGain();
    const wetGain = this.ctx.createGain();
    dryGain.gain.value = 1 - reverb;
    wetGain.gain.value = reverb;

    // Connect: source -> gain -> panner -> dry/wet -> output
    source.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(dryGain);
    panner.connect(wetGain);
    dryGain.connect(this.compressor);
    wetGain.connect(this.reverb);

    // Animate position if specified
    if (animate) {
      this.animatePanner(panner, animate);
    }

    source.start();

    const id = Date.now().toString();
    this.sources.set(id, { source, gainNode, panner });

    source.onended = () => {
      this.sources.delete(id);
    };

    return id;
  },

  // Animate panner position
  animatePanner(panner, {duration = 2000, toX = 0, toY = 0, toZ = 0}) {
    const startX = panner.positionX?.value || 0;
    const startY = panner.positionY?.value || 0;
    const startZ = panner.positionZ?.value || 0;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutCubic(progress);

      if (panner.positionX) {
        panner.positionX.value = startX + (toX - startX) * eased;
        panner.positionY.value = startY + (toY - startY) * eased;
        panner.positionZ.value = startZ + (toZ - startZ) * eased;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  // Play UI sound (simple stereo)
  async playUI(type, pan = 0) {
    if (!this.ctx || !this.isEnabled || this.isMuted) return;
    
    const url = this.library.ui[type];
    if (!url) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const buffer = await this.loadBuffer(url);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.4;

    const stereoPanner = this.ctx.createStereoPanner();
    stereoPanner.pan.value = pan;

    source.connect(gainNode);
    gainNode.connect(stereoPanner);
    stereoPanner.connect(this.masterGain);

    source.start();
  },

  // Play ambient loop
  async playAmbient(type = 'gallery') {
    if (!this.ctx || !this.isEnabled) return;

    // Stop existing ambient
    this.stopAmbient();

    const url = this.library.ambient[type];
    if (!url) return;

    const id = await this.play3D(url, {
      x: 0, y: 0, z: 0,
      volume: 0.15,
      loop: true,
      reverb: 0.5
    });

    this.ambientId = id;
  },

  stopAmbient() {
    if (this.ambientId && this.sources.has(this.ambientId)) {
      const { source } = this.sources.get(this.ambientId);
      source.stop();
      this.sources.delete(this.ambientId);
    }
  },

  // Artwork reveal with spatial positioning
  playArtworkReveal(artworkElement) {
    if (!artworkElement) return;
    
    const rect = artworkElement.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth * 4 - 2;
    const y = (rect.top + rect.height / 2) / window.innerHeight * -2 + 1;
    
    this.play3D(this.library.spatial.artwork, {
      x, y, z: -3,
      volume: 0.3,
      reverb: 0.4
    });
  },

  // MICA shimmer effect with orbiting sound
  playMicaShimmer() {
    this.play3D(this.library.spatial.mica, {
      x: -2, y: 0, z: -4,
      volume: 0.25,
      reverb: 0.6,
      animate: {
        duration: 3000,
        toX: 2, toY: 0, toZ: -4
      }
    });
  },

  // Create floating audio UI
  createUI() {
    const ui = document.createElement('div');
    ui.className = 'audio-controls';
    ui.innerHTML = `
      <button class="audio-btn audio-btn--toggle" id="audio-toggle" title="Toggle Audio">
        <span class="audio-icon">🔊</span>
      </button>
      <div class="audio-indicator" id="audio-indicator"></div>
    `;

    document.body.appendChild(ui);

    // Toggle handler
    document.getElementById('audio-toggle').addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.updateUI();
    });

    this.updateUI();
  },

  updateUI() {
    const icon = document.querySelector('.audio-icon');
    const indicator = document.getElementById('audio-indicator');
    
    if (icon) {
      icon.textContent = this.isMuted ? '🔇' : '🔊';
    }
    
    if (indicator) {
      indicator.className = `audio-indicator ${this.isMuted ? '' : 'audio-indicator--active'}`;
    }
  },

  // Toggle audio
  toggle() {
    this.isMuted = !this.isMuted;
    this.updateUI();
  },

  // Set master volume
  setVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }
};

// Auto-initialize on first user interaction
document.addEventListener('click', async function initAudio() {
  await ImmersiveAudio.init();
  document.removeEventListener('click', initAudio);
}, { once: true });

// Expose globally
window.ImmersiveAudio = ImmersiveAudio;
