/* ═══════════════════════════════════════════════════
   Master Chain — Procesamiento profesional de señal
   Compresor → EQ paramétrico → Limiter → IR Convolution
   Dynamic Spectral EQ (Soothe2 clone) + Spectral Analysis
   
   NIVEL DIOS DSP — Lo que usan iZotope, FabFilter, LANDR
   pero gratis, en el navegador
   ═══════════════════════════════════════════════════ */

export class MasterChain {
  constructor(audioCtx) {
    this.ctx = audioCtx;
    this.input = this.ctx.createGain();
    this.output = this.ctx.createGain();
    this.enabled = false;

    // Cadena: Input → Compressor → ParaEQ → Convolver → Limiter → Output
    this._initCompressor();
    this._initParametricEQ();
    this._initConvolver();
    this._initLimiter();
    this._initSpectralAnalysis();

    // Conectar cadena
    this._connectChain();
  }

  // ─── COMPRESSOR ─────────────────────────────
  // Emulación de compresor de bus estilo SSL G
  _initCompressor() {
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 6;
    this.compressor.ratio.value = 3;
    this.compressor.attack.value = 0.003;    // 3ms — rápido para transientes
    this.compressor.release.value = 0.15;    // 150ms — musical
    
    this.compressorMakeup = this.ctx.createGain();
    this.compressorMakeup.gain.value = 1.2;  // Makeup gain automático

    this.compState = {
      threshold: -18,
      knee: 6,
      ratio: 3,
      attack: 0.003,
      release: 0.15,
      makeupGain: 1.2,
      enabled: true,
    };
  }

  setCompressorParams(params) {
    const t = this.ctx.currentTime;
    if (params.threshold !== undefined) {
      this.compressor.threshold.setTargetAtTime(params.threshold, t, 0.02);
      this.compState.threshold = params.threshold;
    }
    if (params.knee !== undefined) {
      this.compressor.knee.setTargetAtTime(params.knee, t, 0.02);
      this.compState.knee = params.knee;
    }
    if (params.ratio !== undefined) {
      this.compressor.ratio.setTargetAtTime(params.ratio, t, 0.02);
      this.compState.ratio = params.ratio;
    }
    if (params.attack !== undefined) {
      this.compressor.attack.setTargetAtTime(params.attack, t, 0.02);
      this.compState.attack = params.attack;
    }
    if (params.release !== undefined) {
      this.compressor.release.setTargetAtTime(params.release, t, 0.02);
      this.compState.release = params.release;
    }
    if (params.makeupGain !== undefined) {
      this.compressorMakeup.gain.setTargetAtTime(params.makeupGain, t, 0.02);
      this.compState.makeupGain = params.makeupGain;
    }
  }

  getCompressorReduction() {
    return this.compressor.reduction; // dB de compresión aplicada
  }

  // ─── PARAMETRIC EQ (8 bandas) ───────────────
  // EQ paramétrico de estudio: HPF, LowShelf, 4x Peaking, HighShelf, LPF
  _initParametricEQ() {
    this.eqBands = [];

    const bandDefs = [
      { type: 'highpass',   freq: 30,    q: 0.707, gain: 0 },  // Sub rumble filter
      { type: 'lowshelf',   freq: 80,    q: 0.707, gain: 0 },  // Bass shelf
      { type: 'peaking',    freq: 250,   q: 1.0,   gain: 0 },  // Low-mid
      { type: 'peaking',    freq: 800,   q: 1.0,   gain: 0 },  // Mid
      { type: 'peaking',    freq: 2500,  q: 1.0,   gain: 0 },  // Presence
      { type: 'peaking',    freq: 6300,  q: 1.0,   gain: 0 },  // Brilliance
      { type: 'highshelf',  freq: 10000, q: 0.707, gain: 0 },  // Air shelf
      { type: 'lowpass',    freq: 18000, q: 0.707, gain: 0 },  // Anti-alias
    ];

    for (const def of bandDefs) {
      const band = this.ctx.createBiquadFilter();
      band.type = def.type;
      band.frequency.value = def.freq;
      band.Q.value = def.q;
      if (def.type === 'peaking' || def.type === 'lowshelf' || def.type === 'highshelf') {
        band.gain.value = def.gain;
      }
      this.eqBands.push({ node: band, ...def });
    }
  }

  setEQBand(index, params) {
    const band = this.eqBands[index];
    if (!band) return;
    const t = this.ctx.currentTime;

    if (params.freq !== undefined) {
      band.node.frequency.setTargetAtTime(params.freq, t, 0.02);
      band.freq = params.freq;
    }
    if (params.q !== undefined) {
      band.node.Q.setTargetAtTime(params.q, t, 0.02);
      band.q = params.q;
    }
    if (params.gain !== undefined && band.node.gain) {
      band.node.gain.setTargetAtTime(params.gain, t, 0.02);
      band.gain = params.gain;
    }
    if (params.type !== undefined) {
      band.node.type = params.type;
      band.type = params.type;
    }
  }

  getEQState() {
    return this.eqBands.map(b => ({
      type: b.type,
      freq: b.freq,
      q: b.q,
      gain: b.gain,
    }));
  }

  // ─── CONVOLUTION IR LOADER ──────────────────
  // Clonar hardware analógico: Studer, Neve, SSL via Impulse Response
  _initConvolver() {
    this.convolver = this.ctx.createConvolver();
    this.convolverWet = this.ctx.createGain();
    this.convolverDry = this.ctx.createGain();
    this.convolverWet.gain.value = 0;    // Off por defecto
    this.convolverDry.gain.value = 1;
    this.irLoaded = false;
    this.irName = null;
  }

  // Cargar un IR desde archivo (el usuario sube un .wav de una máquina analógica)
  async loadImpulseResponse(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const irBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.convolver.buffer = irBuffer;
      this.irLoaded = true;
      this.irName = file.name.replace(/\.[^/.]+$/, '');
      return {
        name: this.irName,
        duration: irBuffer.duration,
        channels: irBuffer.numberOfChannels,
        sampleRate: irBuffer.sampleRate,
      };
    } catch (err) {
      console.error('Error cargando IR:', err);
      throw new Error(`IR inválido: ${err.message}`);
    }
  }

  // Generar un IR sintético de room/tape
  async generateSyntheticIR(type = 'tape', decay = 1.5) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * decay);
    const buffer = this.ctx.createBuffer(2, length, rate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);

      switch (type) {
        case 'tape': {
          // Emulación de saturación de cinta: armónicos pares + roll-off HF
          for (let i = 0; i < length; i++) {
            const t = i / rate;
            const noise = (Math.random() * 2 - 1);
            const envelope = Math.exp(-t * 3 / decay);
            
            // Armónicos de cinta (2do y 3er armónico añadidos)
            const harmonics = Math.sin(2 * Math.PI * 60 * t) * 0.02 +
                            Math.sin(2 * Math.PI * 120 * t) * 0.01;
            
            // Roll-off natural de alta frecuencia (simulando la respuesta de cinta)
            const hfRolloff = Math.exp(-t * 8);
            data[i] = (noise * envelope + harmonics * hfRolloff) * 0.5;
          }
          break;
        }
        case 'room': {
          // Room reverb con reflexiones tempranas
          for (let i = 0; i < length; i++) {
            const t = i / rate;
            const noise = (Math.random() * 2 - 1);
            const envelope = Math.exp(-t * 2 / decay);
            
            // Reflexiones tempranas (primeros 50ms)
            const earlyRef = t < 0.05 ? Math.sin(t * 800) * (1 - t * 20) : 0;
            
            // Difusión con decorrelación estéreo
            const diffusion = ch === 0 ? 1 : -0.7;
            data[i] = (noise * envelope * diffusion + earlyRef * 0.3) * 0.3;
          }
          break;
        }
        case 'plate': {
          // Placa metálica — reverb denso y brillante
          for (let i = 0; i < length; i++) {
            const t = i / rate;
            const noise = (Math.random() * 2 - 1);
            const envelope = Math.pow(1 - t / decay, 1.5);
            
            // Resonancias de placa
            const resonance = Math.sin(2 * Math.PI * 2400 * t) * 0.005 * envelope +
                            Math.sin(2 * Math.PI * 4800 * t) * 0.003 * envelope;
            
            data[i] = (noise * envelope + resonance) * 0.25;
          }
          break;
        }
        case 'console': {
          // Consola analógica SSL/Neve — color sutil
          for (let i = 0; i < length; i++) {
            const t = i / rate;
            const noise = (Math.random() * 2 - 1);
            // Decaimiento muy rápido — solo añade "color"
            const envelope = Math.exp(-t * 20);
            
            // Distorsión armónica suave (saturación de transformadores)
            const harmonic2 = Math.sin(2 * Math.PI * 100 * t) * 0.015;
            const harmonic3 = Math.sin(2 * Math.PI * 150 * t) * 0.008;
            
            data[i] = (noise * envelope * 0.1 + (harmonic2 + harmonic3) * envelope) * 0.5;
          }
          break;
        }
        default:
          for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / length * decay);
          }
      }
    }

    this.convolver.buffer = buffer;
    this.irLoaded = true;
    this.irName = `Synthetic ${type}`;
    return { name: this.irName, type, decay, duration: decay };
  }

  setConvolverWet(value) {
    this.convolverWet.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
    this.convolverDry.gain.setTargetAtTime(1 - value * 0.7, this.ctx.currentTime, 0.02);
  }

  // ─── LIMITER ────────────────────────────────
  // Brickwall limiter — nunca saturar, nunca clipear
  _initLimiter() {
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -1;      // Ceiling -1 dBFS
    this.limiter.knee.value = 0;            // Brickwall — sin knee
    this.limiter.ratio.value = 20;          // Ratio extremo
    this.limiter.attack.value = 0.001;      // 1ms — ultra rápido
    this.limiter.release.value = 0.05;      // 50ms — rápido release

    this.limiterState = {
      ceiling: -1,
      enabled: true,
    };
  }

  setLimiterCeiling(dB) {
    this.limiter.threshold.setTargetAtTime(dB, this.ctx.currentTime, 0.01);
    this.limiterState.ceiling = dB;
  }

  getLimiterReduction() {
    return this.limiter.reduction;
  }

  // ─── SPECTRAL ANALYSIS ──────────────────────
  // Análisis espectral avanzado: centroide, rolloff, RMS, crest factor
  _initSpectralAnalysis() {
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0.8;
    this._freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this._timeData = new Float32Array(this.analyser.fftSize);
  }

  getSpectralAnalysis() {
    this.analyser.getByteFrequencyData(this._freqData);
    this.analyser.getFloatTimeDomainData(this._timeData);

    const freq = this._freqData;
    const time = this._timeData;
    const binCount = this.analyser.frequencyBinCount;
    const sampleRate = this.ctx.sampleRate;

    // ─── RMS (Root Mean Square) — volumen percibido
    let sumSquares = 0;
    for (let i = 0; i < time.length; i++) {
      sumSquares += time[i] * time[i];
    }
    const rms = Math.sqrt(sumSquares / time.length);
    const rmsDb = 20 * Math.log10(Math.max(rms, 1e-10));

    // ─── Peak level
    let peak = 0;
    for (let i = 0; i < time.length; i++) {
      const abs = Math.abs(time[i]);
      if (abs > peak) peak = abs;
    }
    const peakDb = 20 * Math.log10(Math.max(peak, 1e-10));

    // ─── Crest Factor — ratio peak:RMS (indica "punch" de los transientes)
    const crestFactor = peak / Math.max(rms, 1e-10);
    const crestDb = 20 * Math.log10(Math.max(crestFactor, 1e-10));

    // ─── Spectral Centroid — "brillo" perceptual
    let weightedSum = 0;
    let totalEnergy = 0;
    for (let i = 0; i < binCount; i++) {
      const magnitude = freq[i];
      const frequency = (i * sampleRate) / (binCount * 2);
      weightedSum += frequency * magnitude;
      totalEnergy += magnitude;
    }
    const centroid = totalEnergy > 0 ? weightedSum / totalEnergy : 0;

    // ─── Spectral Rolloff — frecuencia donde está el 85% de la energía
    const rolloffThreshold = totalEnergy * 0.85;
    let cumulativeEnergy = 0;
    let rolloff = 0;
    for (let i = 0; i < binCount; i++) {
      cumulativeEnergy += freq[i];
      if (cumulativeEnergy >= rolloffThreshold) {
        rolloff = (i * sampleRate) / (binCount * 2);
        break;
      }
    }

    // ─── Spectral Flatness — noise vs tonal (1 = puro ruido, 0 = tono puro)
    let geometricMean = 0;
    let arithmeticMean = 0;
    let validBins = 0;
    for (let i = 1; i < binCount; i++) {
      if (freq[i] > 0) {
        geometricMean += Math.log(freq[i]);
        arithmeticMean += freq[i];
        validBins++;
      }
    }
    const flatness = validBins > 0
      ? Math.exp(geometricMean / validBins) / (arithmeticMean / validBins)
      : 0;

    // ─── LUFS estimado (simplificado — promedio RMS ponderado)
    const lufsEstimate = rmsDb - 0.691; // Approximación K-weighting

    return {
      rms, rmsDb: Math.round(rmsDb * 10) / 10,
      peak, peakDb: Math.round(peakDb * 10) / 10,
      crestFactor: Math.round(crestFactor * 10) / 10,
      crestDb: Math.round(crestDb * 10) / 10,
      centroid: Math.round(centroid),
      rolloff: Math.round(rolloff),
      flatness: Math.round(flatness * 1000) / 1000,
      lufsEstimate: Math.round(lufsEstimate * 10) / 10,
      frequencyData: freq,
    };
  }

  // ─── DYNAMIC SPECTRAL EQ (Soothe2 Clone) ──
  // Atenuación quirúrgica de resonancias en tiempo real
  // Usa un banco de filtros notch que se activan solo cuando una frecuencia
  // supera un umbral dinámico relativo a la media espectral
  initDynamicSpectralEQ(options = {}) {
    const {
      bandCount = 16,         // Número de bandas de análisis
      threshold = 3.0,        // Cuántas veces la media antes de atenuar
      attenuation = 0.5,      // Factor de atenuación (0.5 = -6dB)
      attackMs = 5,           // Velocidad de ataque
      releaseMs = 50,         // Velocidad de release
    } = options;

    this.dynEQ = {
      enabled: false,
      bandCount,
      threshold,
      attenuation,
      attack: attackMs / 1000,
      release: releaseMs / 1000,
      bands: [],
      // Running averages de energía por banda
      avgEnergy: new Float32Array(bandCount),
      currentGains: new Float32Array(bandCount).fill(1),
    };

    // Crear bandas de filtros notch
    const nyquist = this.ctx.sampleRate / 2;
    for (let i = 0; i < bandCount; i++) {
      // Distribución logarítmica de frecuencias (100Hz - 16kHz)
      const freq = 100 * Math.pow(16000 / 100, i / (bandCount - 1));
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = Math.min(freq, nyquist * 0.95);
      filter.Q.value = 2.5;  // Q moderado — no demasiado estrecho
      filter.gain.value = 0; // Neutro por defecto

      this.dynEQ.bands.push({
        filter,
        freq,
        currentGain: 0,
      });
    }

    return this.dynEQ;
  }

  // Procesar un frame del Dynamic Spectral EQ
  // Llamar esto en el animation loop para actualizar las bandas
  processDynamicSpectralEQ() {
    if (!this.dynEQ?.enabled) return;

    this.analyser.getByteFrequencyData(this._freqData);
    const data = this._freqData;
    const binCount = this.analyser.frequencyBinCount;
    const sampleRate = this.ctx.sampleRate;
    const { bands, bandCount, threshold, attenuation, avgEnergy, currentGains, attack, release } = this.dynEQ;
    const t = this.ctx.currentTime;

    for (let b = 0; b < bandCount; b++) {
      const band = bands[b];

      // Encontrar energía en la banda de frecuencia correspondiente
      const binIndex = Math.round(band.freq * binCount * 2 / sampleRate);
      const startBin = Math.max(0, binIndex - 2);
      const endBin = Math.min(binCount - 1, binIndex + 2);

      let bandEnergy = 0;
      for (let i = startBin; i <= endBin; i++) {
        bandEnergy += data[i];
      }
      bandEnergy /= (endBin - startBin + 1);

      // Actualizar media móvil exponencial
      const alpha = 0.05; // Factor de suavizado
      avgEnergy[b] = avgEnergy[b] * (1 - alpha) + bandEnergy * alpha;

      // ¿Supera el umbral? → Atenuar
      const ratio = avgEnergy[b] > 0 ? bandEnergy / avgEnergy[b] : 0;
      let targetGain = 0;

      if (ratio > threshold) {
        // Resonancia detectada — calcular atenuación proporcional
        const excess = ratio - threshold;
        targetGain = -(excess * 3 * (1 - attenuation)); // dB de atenuación
        targetGain = Math.max(targetGain, -12); // No atenuar más de 12 dB
      }

      // Smooth hacia target con attack/release
      const currentGain = currentGains[b];
      const timeConstant = targetGain < currentGain ? attack : release;
      band.filter.gain.setTargetAtTime(targetGain, t, timeConstant);
      currentGains[b] = targetGain;
    }
  }

  enableDynamicSpectralEQ(enable) {
    if (!this.dynEQ) this.initDynamicSpectralEQ();
    this.dynEQ.enabled = enable;

    if (enable) {
      // Insertar bandas en la cadena antes del limiter
      this._reconnectWithDynEQ();
    } else {
      // Resetear todas las bandas
      for (const band of this.dynEQ.bands) {
        band.filter.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
    }
  }

  _reconnectWithDynEQ() {
    // Las bandas del dynamic EQ se insertan entre el EQ paramétrico y el convolver
    // Esto se maneja en _connectChain() cuando se reconstruye
    this._connectChain();
  }

  // ─── CHAIN CONNECTION ──────────────────────
  _connectChain() {
    // Desconectar todo primero
    try {
      this.input.disconnect();
      for (const band of this.eqBands) band.node.disconnect();
      this.compressor.disconnect();
      this.compressorMakeup.disconnect();
      this.convolver.disconnect();
      this.convolverWet.disconnect();
      this.convolverDry.disconnect();
      this.limiter.disconnect();
      this.analyser.disconnect();
      if (this.dynEQ) {
        for (const band of this.dynEQ.bands) band.filter.disconnect();
      }
    } catch (e) { /* OK si no conectado */ }

    // Input → Compressor → Makeup → EQ Bands (en serie)
    this.input.connect(this.compressor);
    this.compressor.connect(this.compressorMakeup);

    let lastNode = this.compressorMakeup;

    // EQ paramétrico en serie
    for (const band of this.eqBands) {
      lastNode.connect(band.node);
      lastNode = band.node;
    }

    // Dynamic Spectral EQ (si activo)
    if (this.dynEQ?.enabled) {
      for (const band of this.dynEQ.bands) {
        lastNode.connect(band.filter);
        lastNode = band.filter;
      }
    }

    // Convolver (parallel wet/dry)
    if (this.irLoaded) {
      lastNode.connect(this.convolver);
      lastNode.connect(this.convolverDry);
      this.convolver.connect(this.convolverWet);
      this.convolverWet.connect(this.limiter);
      this.convolverDry.connect(this.limiter);
    } else {
      lastNode.connect(this.limiter);
    }

    // Limiter → Analyser → Output
    this.limiter.connect(this.analyser);
    this.analyser.connect(this.output);
  }

  // ─── CONNECT TO AUDIO GRAPH ─────────────────
  connect(sourceNode, destNode) {
    sourceNode.connect(this.input);
    this.output.connect(destNode);
    this.enabled = true;
  }

  disconnect() {
    try {
      this.input.disconnect();
      this.output.disconnect();
    } catch (e) { /* OK */ }
    this.enabled = false;
  }

  // ─── SERIALIZE STATE ────────────────────────
  getState() {
    return {
      compressor: { ...this.compState },
      eq: this.getEQState(),
      convolver: {
        irName: this.irName,
        irLoaded: this.irLoaded,
        wet: this.convolverWet.gain.value,
      },
      limiter: { ...this.limiterState },
      dynamicEQ: this.dynEQ ? {
        enabled: this.dynEQ.enabled,
        threshold: this.dynEQ.threshold,
        attenuation: this.dynEQ.attenuation,
        bandCount: this.dynEQ.bandCount,
      } : null,
    };
  }
}
