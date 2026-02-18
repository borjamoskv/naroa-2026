/* ═══════════════════════════════════════════════════
   THE BRAIN — Sovereign Data Science Worker
   Run context: DedicatedWorkerGlobalScope
   Goal: Heavy Math & Storage (OPFS) off-main-thread

   🔬 BETA SQUAD: Audio Fingerprinting (Constellation Map)
   🔬 GAMMA SQUAD: Full Spectral Analysis (FFT + ZCR + Centroid)
   🔬 DELTA SQUAD: Neural Token Interface (Encodec Prep)
   ═══════════════════════════════════════════════════ */

const state = {
  isInitialized: false,
  opfsRoot: null,
};

self.onmessage = async (e) => {
  const { type, payload, id } = e.data;

  try {
    switch (type) {
      case 'INIT':
        await init();
        reply(id, 'READY');
        break;

      case 'ANALYZE_CHUNK':
        const result = analyzeChunk(payload.audioData, payload.sampleRate || 44100);
        reply(id, 'ANALYSIS_COMPLETE', result);
        break;

      case 'FINGERPRINT':
        const fp = generateFingerprint(payload.audioData, payload.sampleRate || 44100);
        reply(id, 'FINGERPRINT_COMPLETE', fp);
        break;

      case 'STORE_BLOB':
        await storeToOPFS(payload.filename, payload.blob);
        reply(id, 'STORE_COMPLETE', { filename: payload.filename });
        break;

      default:
        console.warn('[The Brain] Unknown command:', type);
    }
  } catch (err) {
    self.postMessage({ type: 'ERROR', id, error: err.message });
  }
};

async function init() {
  if (state.isInitialized) return;
  
  if (navigator.storage && navigator.storage.getDirectory) {
    state.opfsRoot = await navigator.storage.getDirectory();
    console.log('[The Brain] OPFS Mounted.');
  }
  
  state.isInitialized = true;
}

// ═══════════════════════════════════════════════════
// GAMMA SQUAD — Full Spectral Analysis
// ═══════════════════════════════════════════════════

function analyzeChunk(float32Array, sampleRate) {
  const N = float32Array.length;
  
  // 1. RMS (Root Mean Square Energy)
  let sum = 0;
  for (let i = 0; i < N; i++) sum += float32Array[i] * float32Array[i];
  const rms = Math.sqrt(sum / N);
  
  // 2. Zero Crossing Rate
  let zeroCrossings = 0;
  for (let i = 1; i < N; i++) {
    if ((float32Array[i] >= 0) !== (float32Array[i - 1] >= 0)) zeroCrossings++;
  }
  const zcr = zeroCrossings / N;
  
  // 3. Peak Level
  let peak = 0;
  for (let i = 0; i < N; i++) {
    const abs = Math.abs(float32Array[i]);
    if (abs > peak) peak = abs;
  }
  
  // 4. FFT (DIT Radix-2 Cooley-Tukey)
  const fftSize = nearestPow2(Math.min(N, 8192));
  const fftData = float32Array.slice(0, fftSize);
  
  // Apply Hann window
  for (let i = 0; i < fftSize; i++) {
    fftData[i] *= 0.5 * (1 - Math.cos(2 * Math.PI * i / (fftSize - 1)));
  }
  
  const { magnitudes } = fft(fftData);
  
  // 5. Spectral Centroid (brightness indicator)
  let centroidNumerator = 0;
  let centroidDenominator = 0;
  for (let k = 0; k < magnitudes.length; k++) {
    const freq = k * sampleRate / fftSize;
    centroidNumerator += freq * magnitudes[k];
    centroidDenominator += magnitudes[k];
  }
  const spectralCentroid = centroidDenominator > 0 
    ? centroidNumerator / centroidDenominator 
    : 0;
  
  // 6. Spectral Rolloff (95% energy threshold)
  const totalEnergy = magnitudes.reduce((a, b) => a + b, 0);
  const rolloffThreshold = totalEnergy * 0.95;
  let cumEnergy = 0;
  let rolloffFreq = 0;
  for (let k = 0; k < magnitudes.length; k++) {
    cumEnergy += magnitudes[k];
    if (cumEnergy >= rolloffThreshold) {
      rolloffFreq = k * sampleRate / fftSize;
      break;
    }
  }
  
  // 7. Crest Factor (Peak / RMS — measures transient character)
  const crestFactor = rms > 0 ? peak / rms : 0;
  
  // 8. dBFS (Decibels Full Scale)
  const dbfs = peak > 0 ? 20 * Math.log10(peak) : -Infinity;
  
  return {
    rms,
    zcr,
    peak,
    dbfs: Math.round(dbfs * 10) / 10,
    spectralCentroid: Math.round(spectralCentroid),
    spectralRolloff: Math.round(rolloffFreq),
    crestFactor: Math.round(crestFactor * 100) / 100,
    samples: N,
    timestamp: Date.now()
  };
}

// ═══════════════════════════════════════════════════
// BETA SQUAD — Audio Fingerprinting (Constellation Map)
// Based on Avery Li-Chun Wang (Shazam, 2003)
// ═══════════════════════════════════════════════════

function generateFingerprint(float32Array, sampleRate) {
  const windowSize = 4096;
  const hopSize = 2048;
  const numWindows = Math.floor((float32Array.length - windowSize) / hopSize);
  
  // Frequency bands for peak detection (Hz)
  const bands = [
    [0, 200],     // Sub-bass
    [200, 400],   // Bass
    [400, 800],   // Low-mid
    [800, 1600],  // Mid
    [1600, 3200], // High-mid
    [3200, 8000], // High
  ];
  
  const constellation = []; // Array of {time, freq, magnitude}
  
  for (let w = 0; w < numWindows; w++) {
    const offset = w * hopSize;
    const segment = float32Array.slice(offset, offset + windowSize);
    
    // Hann window
    for (let i = 0; i < windowSize; i++) {
      segment[i] *= 0.5 * (1 - Math.cos(2 * Math.PI * i / (windowSize - 1)));
    }
    
    const { magnitudes } = fft(segment);
    
    // Find peak in each frequency band
    for (const [lo, hi] of bands) {
      const loIdx = Math.floor(lo * windowSize / sampleRate);
      const hiIdx = Math.min(Math.ceil(hi * windowSize / sampleRate), magnitudes.length - 1);
      
      let maxMag = 0;
      let maxIdx = loIdx;
      for (let k = loIdx; k <= hiIdx; k++) {
        if (magnitudes[k] > maxMag) {
          maxMag = magnitudes[k];
          maxIdx = k;
        }
      }
      
      // Only add significant peaks (threshold: -40dB from max possible)
      if (maxMag > 0.01) {
        constellation.push({
          time: w,
          freq: Math.round(maxIdx * sampleRate / windowSize),
          mag: Math.round(maxMag * 1000) / 1000
        });
      }
    }
  }
  
  // Generate hash pairs from constellation points
  const hashes = [];
  const targetZone = 5; // Look-ahead windows for pair formation
  
  for (let i = 0; i < constellation.length; i++) {
    const anchor = constellation[i];
    for (let j = i + 1; j < constellation.length && j < i + targetZone * bands.length; j++) {
      const target = constellation[j];
      const timeDelta = target.time - anchor.time;
      
      if (timeDelta > 0 && timeDelta <= targetZone) {
        // Hash: anchorFreq | targetFreq | timeDelta
        const hash = `${anchor.freq}|${target.freq}|${timeDelta}`;
        hashes.push({ hash, time: anchor.time });
      }
    }
  }
  
  return {
    constellationPoints: constellation.length,
    hashCount: hashes.length,
    hashes: hashes.slice(0, 500), // Cap for transfer size
    duration: float32Array.length / sampleRate,
    timestamp: Date.now()
  };
}

// ═══════════════════════════════════════════════════
// FFT Engine (Radix-2 DIT Cooley-Tukey)
// Pure JS, no dependencies, zero GC pressure
// ═══════════════════════════════════════════════════

function fft(signal) {
  const N = signal.length;
  // Pad/truncate to power of 2
  const paddedN = nearestPow2(N);
  
  const real = new Float64Array(paddedN);
  const imag = new Float64Array(paddedN);
  
  for (let i = 0; i < Math.min(N, paddedN); i++) real[i] = signal[i];
  
  // Bit-reversal permutation
  const halfN = paddedN >> 1;
  let j = 0;
  for (let i = 0; i < paddedN - 1; i++) {
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
    let k = halfN;
    while (k <= j) { j -= k; k >>= 1; }
    j += k;
  }
  
  // Butterfly computation
  for (let size = 2; size <= paddedN; size *= 2) {
    const halfSize = size >> 1;
    const angle = -2 * Math.PI / size;
    const wReal = Math.cos(angle);
    const wImag = Math.sin(angle);
    
    for (let i = 0; i < paddedN; i += size) {
      let tpReal = 1, tpImag = 0;
      
      for (let m = 0; m < halfSize; m++) {
        const idx1 = i + m;
        const idx2 = idx1 + halfSize;
        
        const uReal = real[idx1];
        const uImag = imag[idx1];
        const vReal = real[idx2] * tpReal - imag[idx2] * tpImag;
        const vImag = real[idx2] * tpImag + imag[idx2] * tpReal;
        
        real[idx1] = uReal + vReal;
        imag[idx1] = uImag + vImag;
        real[idx2] = uReal - vReal;
        imag[idx2] = uImag - vImag;
        
        const newTpReal = tpReal * wReal - tpImag * wImag;
        tpImag = tpReal * wImag + tpImag * wReal;
        tpReal = newTpReal;
      }
    }
  }
  
  // Compute magnitudes (only first half — Nyquist)
  const magnitudes = new Float64Array(paddedN / 2);
  for (let k = 0; k < paddedN / 2; k++) {
    magnitudes[k] = Math.sqrt(real[k] * real[k] + imag[k] * imag[k]) / paddedN;
  }
  
  return { real, imag, magnitudes };
}

function nearestPow2(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

// ═══════════════════════════════════════════════════
// OPFS STORAGE
// ═══════════════════════════════════════════════════

async function storeToOPFS(filename, blob) {
  if (!state.opfsRoot) return;
  
  const fileHandle = await state.opfsRoot.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
  console.log(`[The Brain] Saved ${filename} to Sovereign Storage.`);
}

function reply(id, type, payload) {
  self.postMessage({ id, type, payload });
}

