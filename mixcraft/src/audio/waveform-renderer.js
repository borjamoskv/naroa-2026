/* ═══════════════════════════════════════════════════
   Waveform Renderer — Canvas de alta resolución
   Peaks coloreadas, cursor, zoom
   ═══════════════════════════════════════════════════ */

export class WaveformRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.waveformData = null;
    this.playProgress = 0; // 0-1

    // Opciones
    this.colors = {
      wave: options.waveColor || '#CCFF00',
      wavePlayed: options.wavePlayedColor || 'rgba(204, 255, 0, 0.4)',
      bg: options.bgColor || '#0A0A0A',
      cursor: options.cursorColor || '#CCFF00',
      center: options.centerColor || 'rgba(255,255,255,0.05)',
    };

    this._resize();
    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(canvas);
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.render();
  }

  setWaveformData(data) {
    this.waveformData = data;
    this.render();
  }

  setProgress(progress) {
    this.playProgress = Math.max(0, Math.min(1, progress));
    this.render();
  }

  render() {
    const { ctx, width, height, waveformData, playProgress, colors } = this;

    // Clear
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    if (!waveformData || waveformData.length === 0) {
      // Empty state — línea central
      ctx.strokeStyle = colors.center;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const centerY = height / 2;
    const barWidth = width / waveformData.length;
    const playX = playProgress * width;

    // Línea central
    ctx.strokeStyle = colors.center;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Dibujar peaks
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth;
      const amplitude = waveformData[i] * centerY * 0.9;

      // Color basado en posición vs cursor
      if (x < playX) {
        ctx.fillStyle = colors.wavePlayed;
      } else {
        ctx.fillStyle = colors.wave;
      }

      // Barra superior e inferior (mirror)
      const bw = Math.max(1, barWidth - 0.5);
      ctx.fillRect(x, centerY - amplitude, bw, amplitude);
      ctx.fillRect(x, centerY, bw, amplitude * 0.6);
    }

    // Cursor de reproducción
    if (playProgress > 0 && playProgress < 1) {
      ctx.strokeStyle = colors.cursor;
      ctx.lineWidth = 2;
      ctx.shadowColor = colors.cursor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Obtener posición temporal del click
  getTimeFromClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return x / this.width; // 0-1 progress
  }

  destroy() {
    this._resizeObserver?.disconnect();
  }
}
