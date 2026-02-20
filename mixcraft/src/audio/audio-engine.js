/* ═══════════════════════════════════════════════════
   Audio Engine — Core Web Audio API
   BPM detection, key detection, decode, playback
   ═══════════════════════════════════════════════════ */

// Camelot Wheel — compatibilidad armónica
const CAMELOT_WHEEL = {
  'C':  { major: '8B',  minor: '5A'  },
  'C#': { major: '3B',  minor: '12A' },
  'Db': { major: '3B',  minor: '12A' },
  'D':  { major: '10B', minor: '7A'  },
  'D#': { major: '5B',  minor: '2A'  },
  'Eb': { major: '5B',  minor: '2A'  },
  'E':  { major: '12B', minor: '9A'  },
  'F':  { major: '7B',  minor: '4A'  },
  'F#': { major: '2B',  minor: '11A' },
  'Gb': { major: '2B',  minor: '11A' },
  'G':  { major: '9B',  minor: '6A'  },
  'G#': { major: '4B',  minor: '1A'  },
  'Ab': { major: '4B',  minor: '1A'  },
  'A':  { major: '11B', minor: '8A'  },
  'A#': { major: '6B',  minor: '3A'  },
  'Bb': { major: '6B',  minor: '3A'  },
  'B':  { major: '1B',  minor: '10A' },
};

// Notas cromáticas para detección de key
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Perfiles armónicos (Krumhansl-Schmuckler)
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.decks = { A: null, B: null };
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseOffset = 0;
  }

  // Inicializar AudioContext (requiere interacción de usuario)
  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master chain
    // Master chain nodes
    this.masterGain = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.85;

    // Load Sovereign Processor (The Metal)
    try {
      // Path assumes serving from root. Adjust if needed.
      await this.ctx.audioWorklet.addModule('./mixcraft/src/audio/processor.worklet.js');
      this.sovereignProcessor = new AudioWorkletNode(this.ctx, 'sovereign-processor');
      Logger.debug('🤘 The Metal (AudioWorklet) is active.');
      
      // Route: MasterGain -> SovereignProcessor -> Analyser -> Destination
      this.masterGain.connect(this.sovereignProcessor);
      this.sovereignProcessor.connect(this.analyser);
    } catch (err) {
      console.error('Failed to load AudioWorklet. Fallback to standard chain.', err);
      // Fallback Route: MasterGain -> Analyser
      this.masterGain.connect(this.analyser);
    }

    this.analyser.connect(this.ctx.destination);

    // Inicializar decks
    this.decks.A = this._createDeck('A');
    this.decks.B = this._createDeck('B');
  }

  _createDeck(id) {
    return {
      id,
      buffer: null,
      source: null,
      gainNode: this.ctx.createGain(),
      eqHi: this._createEQ(3200, 'highshelf'),
      eqMid: this._createEQ(1000, 'peaking'),
      eqLo: this._createEQ(320, 'lowshelf'),
      analyser: this._createDeckAnalyser(),
      bpm: 0,
      key: '',
      camelot: '',
      duration: 0,
      name: '',
      isLoaded: false,
      waveformData: null,
    };
  }

  _createEQ(freq, type) {
    const eq = this.ctx.createBiquadFilter();
    eq.type = type;
    eq.frequency.value = freq;
    eq.gain.value = 0;
    if (type === 'peaking') eq.Q.value = 1.0;
    return eq;
  }

  _createDeckAnalyser() {
    const a = this.ctx.createAnalyser();
    a.fftSize = 256;
    a.smoothingTimeConstant = 0.8;
    return a;
  }

  // Cargar archivo de audio en un deck
  async loadTrack(deckId, file) {
    await this.init();
    const deck = this.decks[deckId];

    const arrayBuffer = await file.arrayBuffer();
    deck.buffer = await this.ctx.decodeAudioData(arrayBuffer);
    deck.duration = deck.buffer.duration;
    deck.name = file.name.replace(/\.[^/.]+$/, '');
    deck.isLoaded = true;

    // Extraer waveform
    deck.waveformData = this._extractWaveform(deck.buffer);

    // Detectar BPM
    deck.bpm = this._detectBPM(deck.buffer);

    // Detectar Key
    const keyResult = this._detectKey(deck.buffer);
    deck.key = keyResult.key;
    deck.camelot = keyResult.camelot;

    return deck;
  }

  // Extraer datos de waveform para renderizar
  _extractWaveform(buffer, samples = 1000) {
    const channel = buffer.getChannelData(0);
    const blockSize = Math.floor(channel.length / samples);
    const peaks = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      let max = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j++) {
        const abs = Math.abs(channel[start + j]);
        if (abs > max) max = abs;
      }
      peaks[i] = max;
    }
    return peaks;
  }

  // Detección de BPM — onset detection con autocorrelación
  _detectBPM(buffer) {
    const channel = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;

    // Downsample para eficiencia
    const downFactor = 4;
    const downLength = Math.floor(channel.length / downFactor);
    const downsampled = new Float32Array(downLength);
    for (let i = 0; i < downLength; i++) {
      downsampled[i] = Math.abs(channel[i * downFactor]);
    }

    // Onset detection — energía por ventana
    const windowSize = Math.floor(sampleRate / downFactor * 0.02); // 20ms
    const onsets = [];
    for (let i = windowSize; i < downsampled.length; i += windowSize) {
      let energy = 0;
      let prevEnergy = 0;
      for (let j = 0; j < windowSize; j++) {
        energy += downsampled[i + j] ** 2;
        prevEnergy += downsampled[i - windowSize + j] ** 2;
      }
      onsets.push(Math.max(0, energy - prevEnergy));
    }

    // Autocorrelación en rango BPM 60-200
    const effectiveRate = sampleRate / downFactor / windowSize;
    const minLag = Math.floor(effectiveRate * 60 / 200);
    const maxLag = Math.floor(effectiveRate * 60 / 60);

    let bestCorr = 0;
    let bestLag = minLag;

    for (let lag = minLag; lag <= Math.min(maxLag, onsets.length / 2); lag++) {
      let corr = 0;
      const normalizer = onsets.length - lag;
      for (let i = 0; i < normalizer; i++) {
        corr += onsets[i] * onsets[i + lag];
      }
      corr /= normalizer;
      if (corr > bestCorr) {
        bestCorr = corr;
        bestLag = lag;
      }
    }

    const bpm = (effectiveRate * 60) / bestLag;
    // Normalizar a rango razonable
    let normalizedBpm = bpm;
    while (normalizedBpm < 70) normalizedBpm *= 2;
    while (normalizedBpm > 180) normalizedBpm /= 2;

    return Math.round(normalizedBpm * 10) / 10;
  }

  // Detección de tonalidad — Krumhansl-Schmuckler
  _detectKey(buffer) {
    const channel = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;

    // FFT manual (usar ventana central del track)
    const centerStart = Math.floor(channel.length * 0.25);
    const fftSize = 8192;
    const segment = channel.slice(centerStart, centerStart + fftSize);

    // Chroma vector — energía por nota
    const chroma = new Float32Array(12);

    // Simplified chroma extraction usando bin frequencies
    for (let bin = 1; bin < fftSize / 2; bin++) {
      const freq = bin * sampleRate / fftSize;
      if (freq < 50 || freq > 5000) continue;

      // Qué nota cromática es esta frecuencia
      const noteNum = 12 * Math.log2(freq / 440) + 69;
      const noteIndex = ((Math.round(noteNum) % 12) + 12) % 12;

      // Energía del bin
      const energy = segment[bin] ** 2;
      chroma[noteIndex] += Math.abs(energy);
    }

    // Normalizar chroma
    const maxChroma = Math.max(...chroma);
    if (maxChroma > 0) {
      for (let i = 0; i < 12; i++) chroma[i] /= maxChroma;
    }

    // Correlacionar con perfiles de major y minor
    let bestKey = 'C';
    let bestMode = 'major';
    let bestCorr = -Infinity;

    for (let shift = 0; shift < 12; shift++) {
      // Rotar chroma
      let corrMajor = 0, corrMinor = 0;
      for (let i = 0; i < 12; i++) {
        const idx = (i + shift) % 12;
        corrMajor += chroma[idx] * MAJOR_PROFILE[i];
        corrMinor += chroma[idx] * MINOR_PROFILE[i];
      }

      if (corrMajor > bestCorr) {
        bestCorr = corrMajor;
        bestKey = NOTE_NAMES[shift];
        bestMode = 'major';
      }
      if (corrMinor > bestCorr) {
        bestCorr = corrMinor;
        bestKey = NOTE_NAMES[shift];
        bestMode = 'minor';
      }
    }

    const camelotInfo = CAMELOT_WHEEL[bestKey];
    const camelot = camelotInfo ? camelotInfo[bestMode] : '?';

    return {
      key: `${bestKey}${bestMode === 'minor' ? 'm' : ''}`,
      camelot,
      mode: bestMode,
    };
  }

  // Conectar deck a master output
  _connectDeck(deck) {
    if (deck.source) {
      try { deck.source.stop(); } catch (e) { /* ya parado */ }
    }

    deck.source = this.ctx.createBufferSource();
    deck.source.buffer = deck.buffer;

    // Chain: source → EQ Hi → EQ Mid → EQ Lo → Gain → Analyser → Master
    deck.source.connect(deck.eqHi);
    deck.eqHi.connect(deck.eqMid);
    deck.eqMid.connect(deck.eqLo);
    deck.eqLo.connect(deck.gainNode);
    deck.gainNode.connect(deck.analyser);
    deck.analyser.connect(this.masterGain);
  }

  // Reproducir ambos decks
  play() {
    if (this.isPlaying) return;
    if (!this.ctx) return;

    this.isPlaying = true;

    for (const id of ['A', 'B']) {
      const deck = this.decks[id];
      if (!deck.isLoaded) continue;

      this._connectDeck(deck);
      deck.source.start(0, this.pauseOffset);
    }

    this.startTime = this.ctx.currentTime - this.pauseOffset;
  }

  // Pausar
  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.pauseOffset = this.ctx.currentTime - this.startTime;

    for (const id of ['A', 'B']) {
      const deck = this.decks[id];
      if (deck.source) {
        try { deck.source.stop(); } catch (e) { /* ok */ }
      }
    }
  }

  // Stop (reset al inicio)
  stop() {
    this.pause();
    this.pauseOffset = 0;
    this.startTime = 0;
  }

  // Seek a posición
  seek(time) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();
    this.pauseOffset = time;
    if (wasPlaying) this.play();
  }

  // Obtener tiempo actual de playback
  getCurrentTime() {
    if (!this.ctx) return 0;
    if (this.isPlaying) {
      return this.ctx.currentTime - this.startTime;
    }
    return this.pauseOffset;
  }

  // Duración máxima entre los dos decks
  getTotalDuration() {
    let maxDur = 0;
    for (const id of ['A', 'B']) {
      if (this.decks[id].isLoaded) {
        maxDur = Math.max(maxDur, this.decks[id].duration);
      }
    }
    return maxDur;
  }

  // Ajustar volumen de un deck
  setDeckVolume(deckId, value) {
    const deck = this.decks[deckId];
    if (deck) deck.gainNode.gain.value = value;
  }

  // Ajustar EQ
  setDeckEQ(deckId, band, value) {
    const deck = this.decks[deckId];
    if (!deck) return;
    const eqMap = { hi: deck.eqHi, mid: deck.eqMid, lo: deck.eqLo };
    if (eqMap[band]) eqMap[band].gain.value = value;
  }

  // Crossfader - distribución de volumen entre decks
  setCrossfade(value) {
    // value: 0 = full A, 0.5 = center, 1 = full B
    const volA = Math.cos(value * Math.PI / 2);
    const volB = Math.sin(value * Math.PI / 2);
    this.decks.A.gainNode.gain.value = volA;
    this.decks.B.gainNode.gain.value = volB;
  }

  // Obtener datos del analyser para visualización
  getAnalyserData() {
    if (!this.analyser) return null;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getAnalyserTimeData() {
    if (!this.analyser) return null;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  // Verificar compatibilidad armónica entre dos camelot keys
  static getHarmonicScore(camelot1, camelot2) {
    if (!camelot1 || !camelot2) return 0;

    const num1 = parseInt(camelot1);
    const letter1 = camelot1.slice(-1);
    const num2 = parseInt(camelot2);
    const letter2 = camelot2.slice(-1);

    // Misma key = perfect match
    if (camelot1 === camelot2) return 100;

    // Mismo número, diferente letra (A/B) = compatible
    if (num1 === num2) return 90;

    // +1 o -1 con misma letra = compatible
    const diff = Math.abs(num1 - num2);
    if (letter1 === letter2 && (diff === 1 || diff === 11)) return 80;

    // +2 o -2 = semi-compatible
    if (letter1 === letter2 && (diff === 2 || diff === 10)) return 60;

    return Math.max(0, 50 - diff * 8);
  }
}
