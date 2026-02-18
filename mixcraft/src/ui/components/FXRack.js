/* ═══════════════════════════════════════════════════
   FXRack Component — Effect Units
   Drag & Drop Slots, Parameter Visualization
   ═══════════════════════════════════════════════════ */

export class FXRack {
  constructor(app) {
    this.app = app;
    this.fxEngine = app.audioEngine.fxEngine; // Access via audio engine
  }

  init() {
    this._setupControls();
  }

  _setupControls() {
    // Reverb
    this._bindFXControl('reverb-wet', (v) => this.fxEngine.setReverbWet(v));
    this._bindFXControl('reverb-decay', (v) => this.fxEngine.setReverbDecay(v));

    // Delay
    this._bindFXControl('delay-time', (v) => this.fxEngine.setDelayTime(v));
    this._bindFXControl('delay-feedback', (v) => this.fxEngine.setDelayFeedback(v));
    this._bindFXControl('delay-wet', (v) => this.fxEngine.setDelayWet(v));

    // Filter
    this._bindFXControl('filter-freq', (v) => this.fxEngine.setFilterFreq(v));
    this._bindFXControl('filter-res', (v) => this.fxEngine.setFilterResonance(v));

    // Distortion
    this._bindFXControl('dist-drive', (v) => this.fxEngine.setDistortionDrive(v));
    this._bindFXControl('dist-mix', (v) => this.fxEngine.setDistortionMix(v));

    // Power Toggles
    document.querySelectorAll('.fx-power').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.fx;
        const isActive = e.target.classList.contains('on');
        
        if (isActive) {
          e.target.classList.remove('on');
          // Logic to bypass FX in engine
          if (type === 'filter') this.fxEngine.toggleFilter(false);
          // For wet/dry effects, usually setting wet to 0 effectively bypasses, 
          // but a true bypass might be needed in AudioEngine
        } else {
          e.target.classList.add('on');
          if (type === 'filter') this.fxEngine.toggleFilter(true);
        }
      });
    });
  }

  _bindFXControl(idSuffix, callback) {
    const el = document.getElementById(`fx-${idSuffix}`);
    if (!el) return;
    
    el.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      callback(val);
      
      // Visual update for value label
      const label = el.parentElement.querySelector('.knob-val');
      if (label) label.textContent = val.toFixed(2);
    });
  }
}
