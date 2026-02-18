/* ═══════════════════════════════════════════════════
   EUSKAI MIXER — Sovereign Orchestrator
   Core Logic (Audio, State) only. UI delegated.
   ═══════════════════════════════════════════════════ */

import { AudioEngine } from './audio/audio-engine.js';
import { WaveformRenderer } from './audio/waveform-renderer.js';
import { FXEngine } from './fx/fx-engine.js';
import { MasterChain } from './audio/master-chain.js';
import { Timeline } from './timeline/timeline.js';
import { Visualizer } from './viz/visualizer.js';
import { Exporter } from './export/exporter.js';
import { UIManager } from './ui/UIManager.js';

// ─── BUILT-IN SAMPLE DRUMS ───────────────────────
// (Kept here for now, could be moved to src/audio/sample-engine.js)
class SamplePadEngine {
  constructor(audioCtx, destination) {
    this.ctx = audioCtx;
    this.dest = destination;
    this.samples = {};
  }
  generateDrumSamples() {
    this.samples = {
      1: () => this._kick(),
      2: () => this._snare(),
      3: () => this._hihat(),
      4: () => this._clap(),
      5: () => this._tom(),
      6: () => this._ride(),
      7: () => this._fx1(),
      8: () => this._fx2(),
    };
  }
  trigger(padId) { if (this.samples[padId]) this.samples[padId](); }
  
  // Synthesis methods (Compact for brevity in this refactor)
  _kick() { this._tone(150, 0.01, 0.5); }
  _tom() { this._tone(200, 50, 0.3); }
  _fx1() { this._tone(4000, 100, 0.3, 'sawtooth'); }
  _fx2() { this._tone(200, 2000, 0.5, 'sine', 'linear'); }
  
  _tone(freqStart, freqEnd, dur, type='sine', ramp='exponential') {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    if (ramp === 'exponential') osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + dur);
    else osc.frequency.linearRampToValueAtTime(freqEnd, this.ctx.currentTime + dur);
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(gain); gain.connect(this.dest);
    osc.start(); osc.stop(this.ctx.currentTime + dur);
  }

  _snare() { this._noise(0.2, 1000, 'highpass'); this._tone(200, 0.01, 0.1, 'triangle'); }
  _hihat() { this._noise(0.05, 7000, 'highpass'); }
  _ride() { this._noise(0.4, 10000, 'bandpass'); }
  
  _noise(dur, freq, type) {
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noise.buffer = buf;
    const fil = this.ctx.createBiquadFilter(); fil.type = type; fil.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    noise.connect(fil); fil.connect(gain); gain.connect(this.dest);
    noise.start();
  }
  
  _clap() {
     // Multi-burst
     for(let i=0; i<3; i++) {
         setTimeout(() => this._noise(0.02, 2500, 'bandpass'), i*10);
     }
  }
}

// ─── SPECTRUM ANALYZER (Visual Helper) ────────────────────────────
class SpectrumAnalyzer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._resizeObserver = new ResizeObserver(() => this._resize());
    if(canvas) this._resizeObserver.observe(canvas);
  }
  _resize() {
    if(!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }
  draw(frequencyData) {
    if (!this.canvas || !frequencyData) return;
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);
    const barCount = Math.min(frequencyData.length, 64); // Reduced for cleaner look
    const barWidth = width / barCount;
    for (let i = 0; i < barCount; i++) {
        const val = frequencyData[i] / 255;
        const h = val * height;
        ctx.fillStyle = `hsla(${120 + i*2}, 100%, 50%, 0.8)`; // Cyber Lime gradient
        ctx.fillRect(i * barWidth, height - h, barWidth - 2, h);
    }
  }
}

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════
class MixcraftApp {
  constructor() {
    // 1. Core Engine
    this.audioEngine = new AudioEngine();
    
    // 2. State
    this.isInitialized = false;
    this.isPlaying = false;
    this.nextDeck = 'A';
    this.hotCues = { A: {}, B: {} };
    
    // 3. Components (Lazy Init)
    this.ui = new UIManager(this);
    this.exporter = new Exporter();
    
    // 4. Visuals
    this.visualizer = null;
    this.spectrum = null;
    this.waveforms = { A: null, B: null };
    
    // 5. FX & Tools
    this.fxEngine = null; // Init after AudioContext
    this.masterChain = null;
    this.samplePads = null;
    this.timeline = null;

    // Boot
    this._boot();
  }

  async _boot() {
    console.log('[EuskAI mixer] Booting...');
    
    // Initialize UI first (it handles DOM event binding)
    await this.ui.init();
    
    // Setup Visualizers that need DOM
    this._setupVisualizers();
    
    // Setup Drag & Drop Handlers (via UIManager or internal helper)
    // The UIManager handles the global drop zone, but we need to handle specific logic

    // Start Loop
    this._startAnimationLoop();
    
    // Load Demo Tracks (Robe Remix Stems)
    await this._loadDemoTracks();

    // Done
    this.ui.toggleLoading(false);
    
    console.log(
      '%c◈ EUSKAI MIXER V1 ◈ %cLiquid Glass Engine Ready',
      'color: #CCFF00; font-weight: bold; font-size: 16px; background: #000; padding: 4px;',
      'color: #7B2FFF; background: #000; padding: 4px;'
    );
  }

  async _loadDemoTracks() {
    console.log('[Demo] Loading Robe Remix Stems...');
    // Simulating file load from path - in a real browser app this requires
    // fetching the file as a Blob/File object.
    const demoTracks = [
      { id: 'A', path: '/sound_design/robe_remix/loop_riser.wav', name: 'Robe Riser (Loop)' },
      { id: 'B', path: '/sound_design/robe_remix/memory_glitch.wav', name: 'Memory Glitch' }
    ];

    for (const track of demoTracks) {
      try {
        const response = await fetch(track.path);
        if (!response.ok) throw new Error(`Failed to fetch ${track.path}`);
        const blob = await response.blob();
        const file = new File([blob], track.name, { type: 'audio/wav' });
        await this.loadTrack(track.id, file);
      } catch (err) {
        console.warn(`[Demo] Could not load track ${track.name}:`, err);
      }
    }
  }

  // ─── INITIALIZATION ─────────────────────────────────
  async _ensureAudio() {
    if (!this.isInitialized) {
      await this.audioEngine.init();
      const ctx = this.audioEngine.ctx;
      
      // Initialize sub-engines that need Context
      this.fxEngine = new FXEngine(ctx);
      this.audioEngine.fxEngine = this.fxEngine; // Link back if needed
      
      this.masterChain = new MasterChain(ctx);
      this.audioEngine.masterChain = this.masterChain;
      
      this.samplePads = new SamplePadEngine(ctx, this.audioEngine.masterGain);
      this.samplePads.generateDrumSamples();
      
      // Wire Master Chain: MasterGain -> MasterChain -> Destination
      this.audioEngine.masterGain.disconnect();
      this.audioEngine.masterGain.connect(this.masterChain.input);
      this.masterChain.output.connect(ctx.destination);
      
      this.isInitialized = true;
    }
  }

  _setupVisualizers() {
    // Waveforms
    const wavA = document.getElementById('waveform-a');
    const wavB = document.getElementById('waveform-b');
    if(wavA) this.waveforms.A = new WaveformRenderer(wavA, { waveColor: '#CCFF00' });
    if(wavB) this.waveforms.B = new WaveformRenderer(wavB, { waveColor: '#7B2FFF' });

    // Main Viz
    const vizCanvas = document.getElementById('visualizer-canvas');
    if(vizCanvas) this.visualizer = new Visualizer(vizCanvas);
    
    // Spectrum
    const specCanvas = document.getElementById('spectrum-canvas');
    if(specCanvas) this.spectrum = new SpectrumAnalyzer(specCanvas);
    
    // Timeline
     const tlContainer = document.getElementById('timeline-container');
     const tlRuler = document.getElementById('timeline-ruler');
     if (tlContainer) this.timeline = new Timeline(tlContainer, tlRuler);
  }

  // ─── TRANSPORT LOGIC ────────────────────────────────
  async togglePlayback() {
    await this._ensureAudio();
    
    if (this.audioEngine.isPlaying) {
      this.audioEngine.pause();
      this.visualizer?.stop();
    } else {
      this.audioEngine.play();
      this.visualizer?.start();
    }
    // UIManager updates UI based on engine state in update loop
  }

  async toggleRecording() {
    // Basic implementation for now
    console.log('[App] Recording toggle requested');
  }

  // ─── FILE HANDLING ──────────────────────────────────
  async handleFileDrop(files) {
    // Logic called by UIManager
    for (const file of files) {
       await this.loadTrack(this.nextDeck, file);
       this.nextDeck = this.nextDeck === 'A' ? 'B' : 'A';
    }
  }

  async loadTrack(deckId, file) {
    await this._ensureAudio();
    try {
      // Clean this up: UIManager should show "Loading..."
      // For now, accessed via DOM directly or events? 
      // Ideally App emits events, but direct DOM access for MVP is faster.
      const deck = await this.audioEngine.loadTrack(deckId, file);
      
      // Update Waveform
      this.waveforms[deckId]?.setWaveformData(deck.waveformData);
      
      // Add to Timeline
      this.timeline?.addTrack(deck);
      
      // Notification
      console.log(`Loaded ${deck.name} to Deck ${deckId}`);
      
    } catch (err) {
      console.error(err);
    }
  }

  // ─── LOOP ───────────────────────────────────────────
  _startAnimationLoop() {
    const loop = () => {
      // 1. Get audio data
      let freqData = null;
      let timeData = null;
      let analysis = null;

      if (this.isInitialized && this.audioEngine.isPlaying) {
         freqData = this.audioEngine.getAnalyserData();
         timeData = this.audioEngine.getAnalyserTimeData();
         analysis = this.masterChain?.getAnalysis(); // RMS, LUFS
      }
      
      // 2. Update Visuals
      if (this.visualizer && this.audioEngine.isPlaying) {
         this.visualizer.draw(freqData, timeData);
      }
      if (this.spectrum) {
         this.spectrum.draw(freqData);
      }
      
      // 3. Update UI (Meters, Playhead, Time)
      this.ui.update(analysis);
      
      requestAnimationFrame(loop);
    };
    loop();
  }
}

// Start
window.mixcraft = new MixcraftApp();
