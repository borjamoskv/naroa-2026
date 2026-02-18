/* ═══════════════════════════════════════════════════
   THE BRAIN INTERFACE — Data Engine
   Wrapper for threaded data science operations.
   Supports: Analysis, Fingerprinting, Storage (OPFS).
   ═══════════════════════════════════════════════════ */

export class DataEngine {
  constructor() {
    this.worker = new Worker(new URL('../workers/data-science.worker.js', import.meta.url));
    this.requests = new Map();
    this.requestId = 0;

    this.worker.onmessage = (e) => {
      const { id, type, payload, error } = e.data;
      if (this.requests.has(id)) {
        const { resolve, reject } = this.requests.get(id);
        if (error) reject(new Error(error));
        else resolve(payload);
        this.requests.delete(id);
      }
    };

    this.send('INIT');
  }

  send(type, payload = {}, transfer = []) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      this.requests.set(id, { resolve, reject });
      this.worker.postMessage({ id, type, payload }, transfer);
    });
  }

  /**
   * Análisis espectral completo: RMS, ZCR, Peak, dBFS, Centroid, Rolloff, Crest Factor.
   * Ejecutado off-thread en The Brain.
   */
  async analyzeAudio(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    const result = await this.send('ANALYZE_CHUNK', {
      audioData: channelData,
      sampleRate
    });
    return result;
  }

  /**
   * Audio Fingerprinting: Constellation Map + Hash Pairs (Shazam-style).
   * Ejecutado off-thread en The Brain.
   */
  async fingerprint(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    const result = await this.send('FINGERPRINT', {
      audioData: channelData,
      sampleRate
    });
    return result;
  }

  /**
   * Almacena un blob en OPFS (Origin Private File System).
   */
  async store(filename, blob) {
    return this.send('STORE_BLOB', { filename, blob });
  }
}

