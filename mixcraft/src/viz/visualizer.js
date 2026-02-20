/* ═══════════════════════════════════════════════════
   Visualizer v2 — Circular Audio Reactive GOD MODE
   Canvas 2D con partículas, spectrum bars, osciloscopio,
   glow reactivo, y trail effect
   ═══════════════════════════════════════════════════ */

export class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.worker = null;
    this.animFrame = null;
    this.getFreqData = null;
    this.getTimeData = null;
    
    // Initialize Worker if supported
    if (canvas.transferControlToOffscreen) {
      this._initWorker();
    } else {
      console.error('[The Eye] OffscreenCanvas not supported. Visuals disabled.');
    }

    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(canvas.parentElement || document.body);
  }

  _initWorker() {
    try {
      // Create OffscreenCanvas
      const offscreen = this.canvas.transferControlToOffscreen();
      
      // Spawn Worker
      this.worker = new Worker(new URL('../workers/viz.worker.js', import.meta.url));
      
      // Send Init message
      this.worker.postMessage({
        type: 'INIT',
        payload: {
          canvas: offscreen,
          width: this.canvas.clientWidth,
          height: this.canvas.clientHeight,
        }
      }, [offscreen]); // Transfer ownership

      Logger.debug('[The Eye] Visual Worker Online.');
    } catch (err) {
      console.error('[The Eye] Worker Init Failed:', err);
    }
  }

  _resize() {
    if (!this.worker) return;
    
    // Notify worker of new size
    // Note: We cannot resize the canvas DOM element directly if transferred?
    // Actually, we can style it, but the internal buffer size is managed by the worker via the offscreen canvas.
    // But we can't set width/height on the DOM element anymore?
    // "Placeholder canvas" width/height attributes are disconnected from the offscreen one?
    // Actually typically you wait for resize, get clientWidth/Height, and send to worker.
    
    this.worker.postMessage({
      type: 'RESIZE',
      payload: {
        width: this.canvas.clientWidth * (window.devicePixelRatio || 1),
        height: this.canvas.clientHeight * (window.devicePixelRatio || 1)
      }
    });
  }

  start(getFreqData, getTimeData) {
    this.getFreqData = getFreqData;
    this.getTimeData = getTimeData;
    
    if (this.worker && !this.animFrame) {
      this.worker.postMessage({ type: 'START' });
      this._animateProxy();
    }
  }

  stop() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    if (this.worker) {
      this.worker.postMessage({ type: 'STOP' });
    }
  }

  _animateProxy() {
    // 1. Get Data from Main Thread Audio Engine
    const freqData = this.getFreqData?.();
    const timeData = this.getTimeData?.();

    if (freqData && timeData && this.worker) {
      // 2. Send to Worker
      // Optimization: Could use SharedArrayBuffer, but structured clone of Uint8Array is fast enough for now.
      this.worker.postMessage({
        type: 'DATA',
        payload: {
          freq: freqData,
          time: timeData
        }
      });
    }

    // Loop
    this.animFrame = requestAnimationFrame(() => this._animateProxy());
  }
}
