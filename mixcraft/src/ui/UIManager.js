/* ═══════════════════════════════════════════════════
   UIManager v1.5 — Sovereign Interface Orchestrator
   Central command for EuskAI Mixer DOM & Visuals
   Reactive to State Events (Decoupled)
   ═══════════════════════════════════════════════════ */

import { Transport } from './components/Transport.js';
import { Mixer } from './components/Mixer.js';
import { FXRack } from './components/FXRack.js';
import { DataHUD } from './DataHUD.js';
import { state, EVENTS } from '../state/state-manager.js';

export class UIManager {
  constructor(app) {
    this.app = app;
    this.audio = app.audioEngine;
    this.components = {};
    
    // Core references
    this.dom = {
      header: document.getElementById('app-header'),
      main: document.getElementById('app-main'),
      loading: document.getElementById('loading-screen'),
    };
  }

  async init() {
    Logger.debug('[UIManager] Initializing Sovereign Interface...');
    
    // 1. Initialize Components
    this.components.transport = new Transport(this.app);
    this.components.mixer = new Mixer(this.app);
    this.components.fxRack = new FXRack(this.app);
    this.components.dataHud = new DataHUD();

    // 2. Setup Global Listeners
    this._setupGlobalKeys();
    this._setupDragDrop();
    this._setupStateListeners(); // NEw State Subscription

    // 3. Initialize Sub-components
    await this.components.transport.init();
    await this.components.mixer.init();
    await this.components.fxRack.init();

    // 4. Initial Render
    this.update();
    
    Logger.debug('[UIManager] Interface Ready.');
  }

  // ─── STATE REACTIVITY ────────────────────────────────
  _setupStateListeners() {
      // Loading Screen
      state.on(EVENTS.UI.LOADING, (isLoading) => {
          this.toggleLoading(isLoading);
      });

      // Errors
      state.on(EVENTS.AUDIO.ERROR, (error) => {
          console.error('🔴 [UI] Error Notification:', error);
          // IMPLEMENTED: Toast notification system placeholder via Logger
          import('../../../js/core/logger.js').then(m => m.Logger.info(`Toast: ${error.message}`)).catch(() => {});
          this._showToast(`Error: ${error.message || 'Unknown error'}`, 'error');
      });
      
      // Playback State (Optional: Components handle this too, but UI manager can coordinate)
      state.on(EVENTS.PLAYBACK.START, () => {
          document.body.classList.add('is-playing');
      });
      state.on(EVENTS.PLAYBACK.STOP, () => {
          document.body.classList.remove('is-playing');
      });
  }

  // Called 60fps from App animation loop
  update(analysisData) {
    // Delegate updates to components
    if (this.components.transport) this.components.transport.update();
    if (this.components.mixer) this.components.mixer.update(analysisData);
    // FX Rack might need updates if we visualize parameters
  }

  // ─── UTILS ───────────────────────────────────────────
  
  _setupGlobalKeys() {
    document.addEventListener('keydown', (e) => {
      // Global shortcuts (Space for play/pause handling is in Transport)
      if (e.code === 'Escape') this.toggleShortcutsModal();
    });
  }

  _setupDragDrop() {
    // Global file drop for deck loading
    const dropOverlay = document.getElementById('drop-overlay');
    
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropOverlay.classList.remove('hidden');
    });

    document.addEventListener('dragleave', (e) => {
      if (e.target === dropOverlay) {
        dropOverlay.classList.add('hidden');
      }
    });

    document.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropOverlay.classList.add('hidden');
      
      const files = Array.from(e.dataTransfer.files).filter(f => 
        f.type.startsWith('audio/')
      );

      if (files.length > 0) {
        // Load first file to active or empty deck
        // Logic handled by App or delegated here?
        this.app.handleFileDrop(files);
      }
    });
  }

  toggleLoading(show) {
    if (show) {
      if (this.dom.loading) {
          this.dom.loading.classList.remove('loaded');
          this.dom.loading.style.visibility = 'visible';
      }
    } else {
      if (this.dom.loading) {
          this.dom.loading.classList.add('loaded');
          setTimeout(() => {
            if (this.dom.loading) this.dom.loading.style.visibility = 'hidden';
          }, 800);
      }
    }
  }
}
