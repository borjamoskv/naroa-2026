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

  // Generate UI hover sound - soft warm bubble
  uiHover() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  },

  // Generate UI click sound - woodblock tap
  uiClick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
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

  // Ambient gallery drone (warm, soft, vibrating — alive)
  createAmbientDrone() {
    if (!this.ctx) return null;
    
    const masterGain = this.ctx.createGain();
    masterGain.gain.value = 0.025;
    
    // Master lowpass — everything warm and muffled
    const masterFilter = this.ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.value = 350;
    masterFilter.Q.value = 0.7;
    
    // Warm chord: spread A Major voicing
    const voices = [
      { freq: 55.00,  type: 'sine',     vol: 0.30 },  // A1 sub-bass
      { freq: 110.00, type: 'sine',     vol: 0.50 },  // A2 warm root
      { freq: 164.81, type: 'triangle', vol: 0.25 },  // E3 soft fifth
      { freq: 220.00, type: 'sine',     vol: 0.35 },  // A3 octave body
      { freq: 277.18, type: 'triangle', vol: 0.15 },  // C#4 gentle third
    ];
    
    const drones = voices.map(v => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = v.type;
      osc.frequency.value = v.freq;
      gain.gain.value = v.vol;
      
      // Ultra-slow organic frequency drift
      const lfoFreq = this.ctx.createOscillator();
      const lfoFreqGain = this.ctx.createGain();
      lfoFreq.frequency.value = 0.02 + Math.random() * 0.03;
      lfoFreqGain.gain.value = 1.5;
      lfoFreq.connect(lfoFreqGain);
      lfoFreqGain.connect(osc.frequency);
      lfoFreq.start();
      
      // Breathing tremolo
      const lfoAmp = this.ctx.createOscillator();
      const lfoAmpGain = this.ctx.createGain();
      lfoAmp.frequency.value = 0.08 + Math.random() * 0.06;
      lfoAmpGain.gain.value = 0.15;
      lfoAmp.connect(lfoAmpGain);
      lfoAmpGain.connect(gain.gain);
      lfoAmp.start();
      
      osc.connect(gain);
      gain.connect(masterFilter);
      
      return { osc, lfoFreq, lfoAmp };
    });
    
    // Spatial delay for depth
    const delay = this.ctx.createDelay(1.0);
    const delayGain = this.ctx.createGain();
    const feedback = this.ctx.createGain();
    delay.delayTime.value = 0.4;
    delayGain.gain.value = 0.12;
    feedback.gain.value = 0.2;
    
    masterFilter.connect(masterGain);
    masterFilter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(masterGain);
    
    masterGain.connect(this.ctx.destination);
    
    return {
      start() {
        drones.forEach(d => d.osc.start());
      },
      stop() {
        drones.forEach(d => {
          d.osc.stop();
          d.lfoFreq.stop();
          d.lfoAmp.stop();
        });
      },
      setVolume(v) {
        masterGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 1);
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
  },

  // ==========================================
  // NAROA-SPECIFIC SOUNDS (from 026 standalone)
  // ==========================================

  // Viento de Sopela - Coastal breeze ambient
  createSopelaWind() {
    if (!this.ctx) return null;
    
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const windNode = this.ctx.createBufferSource();
    windNode.buffer = buffer;
    windNode.loop = true;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.08;
    
    windNode.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.ctx.destination);
    
    return {
      start: () => windNode.start(),
      stop: () => windNode.stop(),
      setVolume: (v) => { windGain.gain.value = v; },
      node: windNode
    };
  },

  // Latido 026 - Heartbeat rhythm (lub-dub)
  heartbeat026() {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // LUB
    const lub = this.ctx.createOscillator();
    lub.type = 'sine';
    lub.frequency.setValueAtTime(60, now);
    lub.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    const lubGain = this.ctx.createGain();
    lubGain.gain.setValueAtTime(0.4, now);
    lubGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    lub.connect(lubGain);
    lubGain.connect(this.ctx.destination);
    lub.start(now);
    lub.stop(now + 0.2);
    
    // DUB
    const dub = this.ctx.createOscillator();
    dub.type = 'sine';
    dub.frequency.setValueAtTime(80, now + 0.25);
    dub.frequency.exponentialRampToValueAtTime(40, now + 0.35);
    
    const dubGain = this.ctx.createGain();
    dubGain.gain.setValueAtTime(0.3, now + 0.25);
    dubGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    dub.connect(dubGain);
    dubGain.connect(this.ctx.destination);
    dub.start(now + 0.25);
    dub.stop(now + 0.5);
  },

  // Paper Crumple - Tissukaldeko material sound
  paperCrumple(x, y, panner) {
    if (!this.ctx) return;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800 + Math.random() * 1000;
    filter.Q.value = 1;
    
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.1));
    }
    noise.buffer = buffer;
    
    noise.connect(filter);
    filter.connect(gain);
    
    if (panner) {
      gain.connect(panner);
      panner.connect(this.ctx.destination);
    } else {
      gain.connect(this.ctx.destination);
    }
    
    noise.start();
  },

  // Tear/Rip - Acrílico vs Pegamento (material struggle)
  tear(panner) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.2);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.2);
    
    osc.connect(filter);
    filter.connect(gain);
    
    if (panner) {
      gain.connect(panner);
      panner.connect(this.ctx.destination);
    } else {
      gain.connect(this.ctx.destination);
    }
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  },

  // Jackpot 026 - Victory golden chord
  jackpot() {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // D major 7 chord (golden, triumphant)
    const frequencies = [293.66, 369.99, 440.00, 554.37]; // D4, F#4, A4, C#5
    
    frequencies.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 2);
    });
  },

  // Terminal click - Mechanical keyboard
  terminalClick(panner) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 800;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    
    if (panner) {
      gain.connect(panner);
      panner.connect(this.ctx.destination);
    } else {
      gain.connect(this.ctx.destination);
    }
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
};

// Expose globally
window.AudioSynth = AudioSynth;

