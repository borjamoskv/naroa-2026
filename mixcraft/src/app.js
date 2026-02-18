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
import { SamplePadEngine } from './audio/sample-engine.js';
import { DataEngine } from './data/data-engine.js'; // The Brain
import { state, EVENTS } from './state/state-manager.js';

// SamplePadEngine extracted to src/audio/sample-engine.js

import { SpectrumAnalyzer } from './viz/spectrum-analyzer.js';

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════
class MixcraftApp {
  constructor() {
    // 1. Core Engine
    this.audioEngine = new AudioEngine();
    this.dataEngine = new DataEngine(); // The Brain (Sovereign Data Science)
    
    // 2. State
    this.isInitialized = false;
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
    // this.ui.toggleLoading(false); // DEPRECATED: Direct UI call
    state.emit(EVENTS.UI.LOADING, false);
    
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
        state.emit(EVENTS.AUDIO.ERROR, { message: `Failed to load demo track ${track.name}`, error: err });
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
      // generateDrumSamples is called in constructor now
      
      // Wire Master Chain: MasterGain -> MasterChain -> Destination
      this.audioEngine.masterGain.disconnect();
      this.audioEngine.masterGain.connect(this.masterChain.input);
      this.masterChain.output.connect(ctx.destination);
      
      this.isInitialized = true;
      state.emit(EVENTS.APP.READY);
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
      state.emit(EVENTS.PLAYBACK.STOP);
    } else {
      this.audioEngine.play();
      this.visualizer?.start(
        () => this.audioEngine.getAnalyserData(),
        () => this.audioEngine.getAnalyserTimeData()
      );
      state.emit(EVENTS.PLAYBACK.START);
    }
    // UIManager interactions handled via events in UIManager.js
  }

  async toggleRecording() {
    // Basic implementation for now
    console.log('[App] Recording toggle requested');
  }

  // ─── FILE HANDLING ──────────────────────────────────
  async handleFileDrop(files) {
    // Logic called by UIManager (will need refactor to event based later)
    for (const file of files) {
       await this.loadTrack(this.nextDeck, file);
       this.nextDeck = this.nextDeck === 'A' ? 'B' : 'A';
    }
  }

  async loadTrack(deckId, file) {
    state.emit(EVENTS.AUDIO.LOAD_START, { deckId });
    await this._ensureAudio();
    try {
      const deck = await this.audioEngine.loadTrack(deckId, file);
      
      // Update Waveform
      this.waveforms[deckId]?.setWaveformData(deck.waveformData);
      
      // Add to Timeline
      this.timeline?.addTrack(deck);
      
      // Emit Success Event
      state.emit(EVENTS.AUDIO.LOAD_COMPLETE, { 
          deckId, 
          deck: { 
              name: deck.name, 
              duration: deck.duration, 
              bpm: deck.bpm,
              key: deck.key,
              camelot: deck.camelot
          } 
      });
      
      // Sovereign Analysis (The Brain) — off-thread spectral analysis
      if (deck.buffer) {
        this.dataEngine.analyzeAudio(deck.buffer).then(analysis => {
           state.emit(EVENTS.TRACK.LOADED, { deckId, analysis });
        });
      }
      
    } catch (err) {
      console.error(err);
      state.emit(EVENTS.AUDIO.ERROR, { message: `Failed to load track`, error: err });
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
      // Visualizer is now running in a Worker (The Eye). No main thread draw call needed.
      if (this.spectrum) {
         this.spectrum.draw(freqData);
      }
      
      // 3. Emit VIZ Data for decoupled components
      if (this.audioEngine.isPlaying) {
          state.emit(EVENTS.VIZ.DATA, {
              freqData,
              timeData,
              analysis
          });
      }
      
      // 4. Update UI (Legacy direct coupling - to be refactored)
      this.ui.update(analysis);
      
      requestAnimationFrame(loop);
    };
    loop();
  }
}

// Start
window.mixcraft = new MixcraftApp();
