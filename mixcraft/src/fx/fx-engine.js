/* ═══════════════════════════════════════════════════
   FX Engine v2 — Cadena de efectos GOD MODE
   Reverb, Delay, Filter, Distortion/Crush, Phaser
   ═══════════════════════════════════════════════════ */

export class FXEngine {
  constructor(audioCtx) {
    this.ctx = audioCtx;
    this.effects = {};
    this.input = this.ctx.createGain();
    this.output = this.ctx.createGain();
    this.dry = this.ctx.createGain();
    this.dry.gain.value = 1;

    this._initReverb();
    this._initDelay();
    this._initFilter();
    this._initDistortion();
    this._initPhaser();

    // Dry path
    this.input.connect(this.dry);
    this.dry.connect(this.output);
  }

  // ─── REVERB (ConvolverNode) ─────────────────
  _initReverb() {
    const reverb = {
      convolver: this.ctx.createConvolver(),
      wet: this.ctx.createGain(),
      decay: 2,
      wetValue: 0,
    };

    reverb.wet.gain.value = 0;
    this.input.connect(reverb.convolver);
    reverb.convolver.connect(reverb.wet);
    reverb.wet.connect(this.output);

    // Generar impulse response sintético
    this._generateIR(reverb.decay).then(buffer => {
      reverb.convolver.buffer = buffer;
    });

    this.effects.reverb = reverb;
  }

  async _generateIR(decay) {
    const rate = this.ctx.sampleRate;
    const length = rate * Math.min(decay, 8);
    const buffer = this.ctx.createBuffer(2, length, rate);

    for (let ch = 0; ch < 2; ch++) {
      const channel = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        // Ruido blanco con decaimiento exponencial + difusión estéreo
        const diffusion = ch === 0 ? 1 : -1;
        channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay) * (1 + diffusion * 0.1 * Math.random());
      }
    }
    return buffer;
  }

  setReverbWet(value) {
    this.effects.reverb.wet.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
    this.effects.reverb.wetValue = value;
  }

  async setReverbDecay(value) {
    this.effects.reverb.decay = value;
    const buffer = await this._generateIR(value);
    this.effects.reverb.convolver.buffer = buffer;
  }

  // ─── DELAY ──────────────────────────────────
  _initDelay() {
    const delay = {
      node: this.ctx.createDelay(5),
      feedback: this.ctx.createGain(),
      wet: this.ctx.createGain(),
      hp: this.ctx.createBiquadFilter(), // High-pass en el feedback loop para que no se acumule mud
      feedbackValue: 0.4,
      timeValue: 0.3,
      wetValue: 0,
    };

    delay.node.delayTime.value = 0.3;
    delay.feedback.gain.value = 0.4;
    delay.wet.gain.value = 0;
    delay.hp.type = 'highpass';
    delay.hp.frequency.value = 200;

    this.input.connect(delay.node);
    delay.node.connect(delay.hp);
    delay.hp.connect(delay.feedback);
    delay.feedback.connect(delay.node);
    delay.node.connect(delay.wet);
    delay.wet.connect(this.output);

    this.effects.delay = delay;
  }

  setDelayTime(value) {
    this.effects.delay.node.delayTime.setTargetAtTime(value, this.ctx.currentTime, 0.02);
    this.effects.delay.timeValue = value;
  }

  setDelayFeedback(value) {
    this.effects.delay.feedback.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
    this.effects.delay.feedbackValue = value;
  }

  setDelayWet(value) {
    this.effects.delay.wet.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
    this.effects.delay.wetValue = value;
  }

  // ─── FILTER ─────────────────────────────────
  _initFilter() {
    const filter = {
      node: this.ctx.createBiquadFilter(),
      active: false,
    };

    filter.node.type = 'lowpass';
    filter.node.frequency.value = 1000;
    filter.node.Q.value = 1;

    this.effects.filter = filter;
  }

  setFilterType(type) {
    this.effects.filter.node.type = type;
  }

  setFilterFreq(value) {
    this.effects.filter.node.frequency.setTargetAtTime(value, this.ctx.currentTime, 0.02);
  }

  setFilterResonance(value) {
    this.effects.filter.node.Q.setTargetAtTime(value, this.ctx.currentTime, 0.02);
  }

  toggleFilter(active) {
    const filter = this.effects.filter;
    if (active && !filter.active) {
      this.input.disconnect(this.dry);
      this.input.connect(filter.node);
      filter.node.connect(this.dry);
      filter.active = true;
    } else if (!active && filter.active) {
      this.input.disconnect(filter.node);
      filter.node.disconnect(this.dry);
      this.input.connect(this.dry);
      filter.active = false;
    }
  }

  // ─── DISTORTION / BITCRUSHER ────────────────
  _initDistortion() {
    const dist = {
      shaper: this.ctx.createWaveShaper(),
      wet: this.ctx.createGain(),
      preGain: this.ctx.createGain(),
      postGain: this.ctx.createGain(),
      drive: 0,
      wetValue: 0,
    };

    dist.wet.gain.value = 0;
    dist.preGain.gain.value = 1;
    dist.postGain.gain.value = 0.5;
    dist.shaper.curve = this._makeDistortionCurve(0);
    dist.shaper.oversample = '4x';

    this.input.connect(dist.preGain);
    dist.preGain.connect(dist.shaper);
    dist.shaper.connect(dist.postGain);
    dist.postGain.connect(dist.wet);
    dist.wet.connect(this.output);

    this.effects.distortion = dist;
  }

  _makeDistortionCurve(amount) {
    const n = 44100;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;

    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      if (amount === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
      }
    }
    return curve;
  }

  setDistortionDrive(value) {
    this.effects.distortion.drive = value;
    this.effects.distortion.shaper.curve = this._makeDistortionCurve(value);
    this.effects.distortion.preGain.gain.setTargetAtTime(1 + value * 0.3, this.ctx.currentTime, 0.02);
  }

  setDistortionMix(value) {
    this.effects.distortion.wet.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
    this.effects.distortion.wetValue = value;
  }

  // ─── PHASER ─────────────────────────────────
  _initPhaser() {
    // 4-stage allpass phaser con LFO
    const phaser = {
      stages: [],
      lfo: this.ctx.createOscillator(),
      lfoGain: this.ctx.createGain(),
      wet: this.ctx.createGain(),
      feedback: this.ctx.createGain(),
      rate: 1,
      depth: 0.5,
      wetValue: 0,
    };

    phaser.wet.gain.value = 0;
    phaser.feedback.gain.value = 0.3;
    phaser.lfo.type = 'sine';
    phaser.lfo.frequency.value = 1;
    phaser.lfoGain.gain.value = 1500;

    // 4 etapas de allpass filters
    let prevNode = this.input;
    for (let i = 0; i < 4; i++) {
      const ap = this.ctx.createBiquadFilter();
      ap.type = 'allpass';
      ap.frequency.value = 1000 + i * 500;
      ap.Q.value = 0.5;
      prevNode.connect(ap);
      phaser.lfo.connect(phaser.lfoGain);
      phaser.lfoGain.connect(ap.frequency);
      phaser.stages.push(ap);
      prevNode = ap;
    }

    // Última etapa → feedback → primera etapa
    prevNode.connect(phaser.feedback);
    phaser.feedback.connect(phaser.stages[0]);
    prevNode.connect(phaser.wet);
    phaser.wet.connect(this.output);

    phaser.lfo.start();

    this.effects.phaser = phaser;
  }

  setPhaserRate(value) {
    this.effects.phaser.lfo.frequency.setTargetAtTime(value, this.ctx.currentTime, 0.02);
    this.effects.phaser.rate = value;
  }

  setPhaserDepth(value) {
    this.effects.phaser.lfoGain.gain.setTargetAtTime(value * 3000, this.ctx.currentTime, 0.02);
    this.effects.phaser.depth = value;
  }

  setPhaserWet(value) {
    this.effects.phaser.wet.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
    this.effects.phaser.wetValue = value;
  }

  // ─── CONNECT / DISCONNECT ──────────────────
  connect(sourceNode, destNode) {
    sourceNode.connect(this.input);
    this.output.connect(destNode);
  }

  disconnect() {
    try {
      this.input.disconnect();
      this.output.disconnect();
    } catch (e) { /* ya desconectado */ }
  }

  // Obtener todos los valores actuales (para serialización)
  getState() {
    return {
      reverb: { wet: this.effects.reverb.wetValue, decay: this.effects.reverb.decay },
      delay: { time: this.effects.delay.timeValue, feedback: this.effects.delay.feedbackValue, wet: this.effects.delay.wetValue },
      distortion: { drive: this.effects.distortion.drive, mix: this.effects.distortion.wetValue },
      phaser: { rate: this.effects.phaser.rate, depth: this.effects.phaser.depth, wet: this.effects.phaser.wetValue },
    };
  }
}
