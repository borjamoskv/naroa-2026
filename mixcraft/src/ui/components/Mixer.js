/* ═══════════════════════════════════════════════════
   Mixer Component — The Console
   Channel Strips, Master Chain UI, Metering
   ═══════════════════════════════════════════════════ */

export class Mixer {
  constructor(app) {
    this.app = app;
    this.masterChain = app.audioEngine.masterChain;
    this.dom = {};
  }

  init() {
    this._setupMasterChainUI();
    this._setupCrossfader();
  }

  _setupMasterChainUI() {
    const mc = document.getElementById('master-channel');
    if (!mc) return;

    // Compressor Controls
    this._bindKnob('#mc-comp-thresh', (v) => this.masterChain?.setCompressorParams({ threshold: parseFloat(v) }));
    this._bindKnob('#mc-comp-ratio', (v) => this.masterChain?.setCompressorParams({ ratio: parseFloat(v) }));
    
    // EQ Controls (Mid/High/Air)
    // Assuming UI has these specific IDs
    // We might need to generate them dynamically in Phase 2 for full "God Mode"
  }

  _setupCrossfader() {
    const cf = document.getElementById('crossfader');
    if (cf) {
      cf.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.app.audioEngine.setCrossfade(val);
      });
    }
  }

  _bindKnob(selector, callback) {
    const el = document.querySelector(selector);
    if (!el) return;
    
    el.addEventListener('input', (e) => {
      callback(e.target.value);
      // Update adjacent label value if exists
      const label = el.parentElement.querySelector('.knob-val');
      if (label) label.textContent = e.target.value;
    });
  }

  update(analysisData) {
    if (!analysisData) return;
    
    // Update Master Meters
    const { rmsDb, peakDb, lufsEstimate } = analysisData;
    
    this._updateMeter('master-l', rmsDb, peakDb); 
    this._updateMeter('master-r', rmsDb, peakDb); // Duplicate for mono analysis for now
    
    // Update LUFS display
    const lufsDisplay = document.getElementById('mc-lufs-val');
    if (lufsDisplay) lufsDisplay.textContent = lufsEstimate.toFixed(1);
    
    // Update Compression Reduction Meter
    // Requires getting reduction value from compressor node (if supported by browser)
    // const reduction = this.masterChain?.getCompressorReduction() || 0;
    // this._updateReductionMeter(reduction);
  }

  _updateMeter(id, rmsDb, peakDb) {
    // Map db -60 to 0 to 0-100%
    // Simple mapping for visual
    const meter = document.getElementById(id);
    if (!meter) return;
    
    const fill = meter.querySelector('.meter-fill');
    if (fill) {
      const db = Math.max(-60, rmsDb);
      const pct = ((db + 60) / 60) * 100;
      fill.style.height = `${pct}%`;
      
      // Color logic could be here or CSS
    }
  }
}
