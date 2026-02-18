/* ═══════════════════════════════════════════════════
   DATA HUD — Sovereign Data Science Visualization
   Displays Neural Tokens (Delta) and Fingerprints (Beta).
   Estética: Industrial Noir (Console/Terminal style).
   ═══════════════════════════════════════════════════ */

import { state, EVENTS } from '../state/state-manager.js';
import '../style/components/data-hud.css';

export class DataHUD {
  element = null;
  tokenDisplay = null;
  fingerprintDisplay = null;
  stegoToggle = null;
  spectralReadout = null;
  statusBadge = null;

  constructor() {
    this._init();
    this._setupListeners();
  }

  _init() {
    this.element = document.createElement('div');
    this.element.className = 'sovereign-hud';
    this.element.innerHTML = `
      <div class="hud-header">
        <span class="hud-title">/// SOVEREIGN DATA STREAM</span>
        <span class="hud-status" id="hud-status">STANDBY</span>
      </div>

      <div class="hud-section">
        <div class="hud-label">NEURAL TOKENS [DELTA]</div>
        <div class="neural-grid" id="neural-grid"></div>
      </div>

      <div class="hud-section">
        <div class="hud-label">FINGERPRINT [BETA]</div>
        <div class="fp-stream" id="fp-stream">
          <div class="fp-idle">AWAITING SIGNAL...</div>
        </div>
      </div>

      <div class="hud-section">
        <div class="hud-label">SPECTRAL [GAMMA]</div>
        <div class="spectral-readout" id="spectral-readout">—</div>
      </div>

      <div class="hud-section hud-controls">
        <label class="stego-toggle">
          <input type="checkbox" id="stego-switch" />
          <span class="stego-label">SECRET MODE (LSB)</span>
        </label>
      </div>
    `;

    // Guardar refs
    this.tokenDisplay = this.element.querySelector('#neural-grid');
    this.fingerprintDisplay = this.element.querySelector('#fp-stream');
    this.spectralReadout = this.element.querySelector('#spectral-readout');
    this.statusBadge = this.element.querySelector('#hud-status');
    this.stegoToggle = this.element.querySelector('#stego-switch');

    // Stego toggle event
    this.stegoToggle.addEventListener('change', (e) => {
      state.emit(EVENTS.AUDIO.STEGO_MODE, { active: e.target.checked });
    });

    // Insertar en DOM
    const container = document.getElementById('mixcraft-app');
    if (container) container.appendChild(this.element);
  }

  _setupListeners() {
    // Cuando se carga un track, The Brain dispara datos
    state.on(EVENTS.TRACK.LOADED, (payload) => {
      this._setOnline();
      if (payload?.analysis) this.updateSpectral(payload.analysis);
    });

    // Escuchar datos de Fingerprint y Tokens si app.js los emite
    state.on('DATA:FINGERPRINT', (fp) => this.updateFingerprint(fp));
    state.on('DATA:TOKENS', (tok) => this.updateTokens(tok));
  }

  _setOnline() {
    this.statusBadge.textContent = 'ONLINE';
    this.statusBadge.classList.add('active');
    this._simulateTokenScan();
  }

  updateTokens(data) {
    if (!data?.tokens) return;
    this.tokenDisplay.innerHTML = '';
    const slice = data.tokens.slice(0, 64);
    slice.forEach(t => {
      const cell = document.createElement('div');
      cell.className = 'token-cell';
      const intensity = Math.min(t / 1024, 1);
      cell.style.backgroundColor = `rgba(204, 255, 0, ${0.1 + intensity * 0.9})`;
      this.tokenDisplay.appendChild(cell);
    });
  }

  updateFingerprint(fp) {
    if (!fp) return;
    this.fingerprintDisplay.innerHTML = `
      <div class="fp-stat"><span>POINTS</span><span class="val">${fp.constellationPoints ?? 0}</span></div>
      <div class="fp-stat"><span>HASHES</span><span class="val">${fp.hashCount ?? 0}</span></div>
      <div class="fp-hash">SIG: ${this._shortHash()}</div>
    `;
  }

  updateSpectral(analysis) {
    if (!analysis) return;
    const rms = analysis.rms?.toFixed(4) ?? '—';
    const zcr = analysis.zeroCrossingRate?.toFixed(2) ?? '—';
    const centroid = analysis.spectralCentroid?.toFixed(0) ?? '—';
    this.spectralReadout.innerHTML = `
      <span>RMS: ${rms}</span> · <span>ZCR: ${zcr}</span> · <span>F₀: ${centroid}Hz</span>
    `;
  }

  _simulateTokenScan() {
    this.tokenDisplay.innerHTML = '';
    for (let i = 0; i < 64; i++) {
      const cell = document.createElement('div');
      cell.className = 'token-cell scanning';
      cell.style.animationDelay = `${i * 15}ms`;
      this.tokenDisplay.appendChild(cell);
    }
  }

  _shortHash() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
