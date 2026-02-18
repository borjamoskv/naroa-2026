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
    // Dynamic binding for sovereign control
    this._bindKnob('#mc-eq-low', (v) => this.masterChain?.setEQParams({ low: parseFloat(v) }));
    this._bindKnob('#mc-eq-mid', (v) => this.masterChain?.setEQParams({ mid: parseFloat(v) }));
    this._bindKnob('#mc-eq-high', (v) => this.masterChain?.setEQParams({ high: parseFloat(v) }));
    
    // Gain Makeup
    this._bindKnob('#mc-gain', (v) => this.masterChain?.setGain(parseFloat(v)));
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
    
    // Update Compression Reduction Meter (Simulated for visuals if node doesn't support reduction property)
    // In a real sovereign audio engine, we'd use an AudioWorklet to measure reduction.
    // For now, we simulate visual feedback based on threshold breach.
    const reduction = this._simulateReduction(rmsDb);
    this._updateReductionMeter(reduction);
  }

  _simulateReduction(rmsDb) {
    // Simple visual simulation: if RMS > Threshold, show reduction
    if (!this.masterChain || !this.masterChain.compressor) return 0;
    const thresh = this.masterChain.compressor.threshold.value;
    const ratio = this.masterChain.compressor.ratio.value;
    
    if (rmsDb > thresh) {
       const over = rmsDb - thresh;
       return over * (1 - 1/ratio); // Approx reduction in dB
    }
    return 0;
  }

  _updateReductionMeter(reductionDb) {
    const meter = document.getElementById('mc-comp-reduction');
    if (!meter) return;
    const fill = meter.querySelector('.meter-fill');
    if (fill) {
       // Reduction is usually 0 to -20dB. Visual scale 0-100%
       const height = Math.min(100, (reductionDb / 20) * 100);
       fill.style.height = `${height}%`;
       fill.style.opacity = height > 0 ? 1 : 0.2;
    }
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
