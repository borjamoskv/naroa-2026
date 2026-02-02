/**
 * SYNTHESIZED AUDIO GENERATOR
 * Creates all audio programmatically using Web Audio API
 * No external audio files needed!
 */

const AudioSynth = {
  ctx: null,

  init(audioContext) {
    this.ctx = audioContext;
  },

  // Generate UI hover sound - soft click
  uiHover() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  },

  // Generate UI click sound
  uiClick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },

  // Success sound - ascending arpeggio
  success() {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = this.ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  },

  // Game move sound
  gameMove() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },

  // Game win fanfare
  gameWin() {
    if (!this.ctx) return;
    const melody = [
      { freq: 523.25, start: 0, dur: 0.15 },     // C5
      { freq: 587.33, start: 0.15, dur: 0.15 },  // D5
      { freq: 659.25, start: 0.3, dur: 0.15 },   // E5
      { freq: 783.99, start: 0.45, dur: 0.3 },   // G5
      { freq: 1046.50, start: 0.75, dur: 0.5 }   // C6
    ];
    
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = note.freq;
      
      const startTime = this.ctx.currentTime + note.start;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.setValueAtTime(0.2, startTime + note.dur - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + note.dur);
    });
  },

  // MICA shimmer - ethereal pad sound
  micaShimmer(panner) {
    if (!this.ctx) return;
    
    const frequencies = [220, 330, 440, 550, 660];
    const duration = 3;
    
    frequencies.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      // Add slight detune for richness
      osc.detune.value = (Math.random() - 0.5) * 10;
      
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 1;
      
      // Swell envelope
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime + duration - 1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(filter);
      filter.connect(gain);
      
      if (panner) {
        gain.connect(panner);
      } else {
        gain.connect(this.ctx.destination);
      }
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    });
  },

  // Artwork reveal - gentle chime
  artworkReveal(panner) {
    if (!this.ctx) return;
    
    const notes = [880, 1318.51, 1760]; // A5, E6, A6
    
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = this.ctx.currentTime + i * 0.05;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08 / (i + 1), startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
      
      osc.connect(gain);
      
      if (panner) {
        gain.connect(panner);
      } else {
        gain.connect(this.ctx.destination);
      }
      
      osc.start(startTime);
      osc.stop(startTime + 0.8);
    });
  },

  // Ambient gallery drone (continuous)
  createAmbientDrone() {
    if (!this.ctx) return null;
    
    const masterGain = this.ctx.createGain();
    masterGain.gain.value = 0.02;
    
    // Create multiple drone oscillators
    const drones = [55, 110, 165, 220].map(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      // LFO for subtle movement
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.1 + Math.random() * 0.1;
      lfoGain.gain.value = freq * 0.01;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      
      gain.gain.value = 0.5;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      return { osc, lfo, gain };
    });
    
    masterGain.connect(this.ctx.destination);
    
    return {
      start() {
        drones.forEach(d => d.osc.start());
      },
      stop() {
        drones.forEach(d => {
          d.osc.stop();
          d.lfo.stop();
        });
      },
      setVolume(v) {
        masterGain.gain.value = v;
      }
    };
  },

  // Transition whoosh
  transition() {
    if (!this.ctx) return;
    
    const noise = this.ctx.createBufferSource();
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    noise.buffer = noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(100, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.2);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);
    filter.Q.value = 2;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start();
  },

  // High score celebration
  highScore() {
    if (!this.ctx) return;
    
    // Ascending celebratory notes
    const notes = [
      { freq: 392, time: 0 },    // G4
      { freq: 523.25, time: 0.1 }, // C5
      { freq: 659.25, time: 0.2 }, // E5
      { freq: 783.99, time: 0.3 }, // G5
      { freq: 1046.50, time: 0.5 }, // C6
      { freq: 1318.51, time: 0.7 }  // E6
    ];
    
    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = note.freq;
      
      const t = this.ctx.currentTime + note.time;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }
};

// Expose globally
window.AudioSynth = AudioSynth;
