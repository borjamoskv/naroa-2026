/* ═══════════════════════════════════════════════════
   THE METAL — Sovereign Audio Processor
   Run context: AudioWorkletGlobalScope
   Garbage Collection: ZERO allowed in process()
   
   🛡️ ALPHA SQUAD: LSB Steganography Engine
   ═══════════════════════════════════════════════════ */

class SovereignProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.frameCount = 0;
    
    // ── LSB Steganography State ──
    this._lsbMode = 0;        // 0: Off, 1: Inject, 2: Extract
    this._injectBuffer = [];  // Queue of bytes to inject
    this._extractBuffer = []; // Extracted bits accumulator
    this._bitIndex = 0;       // Current bit position in inject/extract
    this._currentByte = 0;    // Current byte being assembled (extract)
    this._bitsCollected = 0;  // Bits collected for current byte
    
    // ── MessagePort Communication ──
    // AudioWorkletNode can send us data via port (non-blocking)
    this.port.onmessage = (e) => {
      const { type, data } = e.data;
      switch (type) {
        case 'SET_LSB_MODE':
          this._lsbMode = data.mode; // 0, 1, or 2
          this._bitIndex = 0;
          this._bitsCollected = 0;
          this._currentByte = 0;
          break;
          
        case 'INJECT_DATA':
          // data.bytes = Uint8Array of bytes to hide in audio
          this._injectBuffer = Array.from(data.bytes);
          this._bitIndex = 0;
          break;
          
        case 'EXTRACT_START':
          this._extractBuffer = [];
          this._bitIndex = 0;
          this._bitsCollected = 0;
          this._currentByte = 0;
          break;
          
        case 'EXTRACT_STOP':
          // Send extracted data back via port
          this.port.postMessage({
            type: 'EXTRACTED_DATA',
            data: { bytes: new Uint8Array(this._extractBuffer) }
          });
          this._lsbMode = 0;
          break;
      }
    };
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'gain',
        defaultValue: 1.0,
        minValue: 0.0,
        maxValue: 1.0,
        automationRate: 'a-rate'
      }
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const gainParam = parameters.gain;
    
    if (!input || !input.length) return true;

    for (let channel = 0; channel < input.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      
      const gainIsConstant = gainParam.length === 1;
      const constantGain = gainIsConstant ? gainParam[0] : 0;

      for (let i = 0; i < inputChannel.length; i++) {
        const gain = gainIsConstant ? constantGain : gainParam[i];
        let sample = inputChannel[i] * gain;

        // ── LSB STEGANOGRAPHY ──
        if (this._lsbMode === 1 && channel === 0) {
          // INJECT MODE — Hide data in LSB of PCM samples
          sample = this._injectLSB(sample);
        } else if (this._lsbMode === 2 && channel === 0) {
          // EXTRACT MODE — Read hidden data from LSB
          this._extractLSB(sample);
        }

        outputChannel[i] = sample;
      }
    }

    this.frameCount++;
    return true;
  }

  // ── LSB Injection (Hide 1 bit per sample in channel 0) ──
  _injectLSB(sample) {
    if (this._injectBuffer.length === 0) return sample;
    
    // Get current byte and bit position
    const byteIndex = Math.floor(this._bitIndex / 8);
    if (byteIndex >= this._injectBuffer.length) return sample; // Done injecting
    
    const bitPos = 7 - (this._bitIndex % 8); // MSB first
    const byte = this._injectBuffer[byteIndex];
    const bit = (byte >> bitPos) & 1;
    
    // Convert float [-1, 1] to 16-bit integer space
    const intSample = Math.round(sample * 32767);
    
    // Clear LSB and set our bit
    const modified = (intSample & ~1) | bit;
    
    // Convert back to float
    const result = modified / 32767;
    
    this._bitIndex++;
    
    // Notify progress every 1024 bits (128 bytes)
    if (this._bitIndex % 1024 === 0) {
      this.port.postMessage({
        type: 'INJECT_PROGRESS',
        data: {
          bytesInjected: Math.floor(this._bitIndex / 8),
          totalBytes: this._injectBuffer.length
        }
      });
    }
    
    // Check if done
    if (byteIndex >= this._injectBuffer.length - 1 && bitPos === 0) {
      this.port.postMessage({ type: 'INJECT_COMPLETE' });
      this._lsbMode = 0;
    }
    
    return result;
  }

  // ── LSB Extraction (Read 1 bit per sample from channel 0) ──
  _extractLSB(sample) {
    // Convert float to 16-bit integer space
    const intSample = Math.round(sample * 32767);
    
    // Read LSB
    const bit = intSample & 1;
    
    // Assemble byte (MSB first)
    this._currentByte = (this._currentByte << 1) | bit;
    this._bitsCollected++;
    
    if (this._bitsCollected === 8) {
      this._extractBuffer.push(this._currentByte);
      this._currentByte = 0;
      this._bitsCollected = 0;
    }
  }
}

registerProcessor('sovereign-processor', SovereignProcessor);

