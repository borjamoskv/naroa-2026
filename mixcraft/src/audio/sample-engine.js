/* ═══════════════════════════════════════════════════
   SamplePadEngine — Built-in Drum Synthesis
   Sovereign percussive synthesis module.
   ═══════════════════════════════════════════════════ */

export class SamplePadEngine {
  constructor(audioCtx, destination) {
    this.ctx = audioCtx;
    this.dest = destination;
    this.samples = {};
    this.generateDrumSamples();
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

  trigger(padId) { 
    if (this.samples[padId]) this.samples[padId](); 
  }
  
  // Synthesis methods
  _kick() { this._tone(150, 0.01, 0.5); }
  _tom() { this._tone(200, 50, 0.3); }
  _fx1() { this._tone(4000, 100, 0.3, 'sawtooth'); }
  _fx2() { this._tone(200, 2000, 0.5, 'sine', 'linear'); }
  
  _tone(freqStart, freqEnd, dur, type='sine', ramp='exponential') {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    if (ramp === 'exponential') {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + dur);
    } else {
      osc.frequency.linearRampToValueAtTime(freqEnd, this.ctx.currentTime + dur);
    }
    
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    
    osc.connect(gain); 
    gain.connect(this.dest);
    
    osc.start(); 
    osc.stop(this.ctx.currentTime + dur);
  }

  _snare() { 
    this._noise(0.2, 1000, 'highpass'); 
    this._tone(200, 0.01, 0.1, 'triangle'); 
  }
  
  _hihat() { 
    this._noise(0.05, 7000, 'highpass'); 
  }
  
  _ride() { 
    this._noise(0.4, 10000, 'bandpass'); 
  }
  
  _noise(dur, freq, type) {
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    
    noise.buffer = buf;
    
    const fil = this.ctx.createBiquadFilter(); 
    fil.type = type; 
    fil.frequency.value = freq;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    
    noise.connect(fil); 
    fil.connect(gain); 
    gain.connect(this.dest);
    
    noise.start();
  }
  
  _clap() {
     // Multi-burst
     for(let i=0; i<3; i++) {
         setTimeout(() => this._noise(0.02, 2500, 'bandpass'), i*10);
     }
  }
}
