/* ═══════════════════════════════════════════════════
   Timeline — Editor visual de tracks con regiones
   Drag & drop, zoom, playhead, automix ordering
   ═══════════════════════════════════════════════════ */

import { AudioEngine } from '../audio/audio-engine.js';

export class Timeline {
  constructor(container, rulerCanvas) {
    this.container = container;
    this.tracksEl = container.querySelector('#timeline-tracks') || container;
    this.rulerCanvas = rulerCanvas;
    this.rulerCtx = rulerCanvas?.getContext('2d');
    this.playheadEl = container.querySelector('#timeline-playhead');

    this.tracks = [];
    this.zoom = 1; // pixels per second
    this.pxPerSecond = 80;
    this.scrollLeft = 0;
    this.trackHeight = 64;
    this.labelWidth = 120;

    this._setupRuler();
  }

  // Añadir un track al timeline
  addTrack(track) {
    const trackData = {
      id: track.name || `Track ${this.tracks.length + 1}`,
      name: track.name,
      duration: track.duration,
      bpm: track.bpm,
      key: track.key,
      camelot: track.camelot,
      waveformData: track.waveformData,
      startTime: this._getNextStartTime(),
      color: this.tracks.length % 2 === 0 ? '#CCFF00' : '#6600FF',
    };

    this.tracks.push(trackData);
    this._renderTrack(trackData, this.tracks.length - 1);
    this._updateRuler();
    return trackData;
  }

  _getNextStartTime() {
    if (this.tracks.length === 0) return 0;
    const lastTrack = this.tracks[this.tracks.length - 1];
    // Overlap de 15 segundos por defecto para crossfade
    return Math.max(0, lastTrack.startTime + lastTrack.duration - 15);
  }

  _renderTrack(track, index) {
    const effectivePxPerSec = this.pxPerSecond * this.zoom;
    const trackEl = document.createElement('div');
    trackEl.className = 'timeline-track';
    trackEl.dataset.index = index;

    // Label
    const label = document.createElement('div');
    label.className = 'timeline-track-label';
    label.innerHTML = `
      <span style="color: ${track.color}; font-weight: 700;">●</span>
      <span>${track.name || `Track ${index + 1}`}</span>
    `;

    // Contenido
    const content = document.createElement('div');
    content.className = 'timeline-track-content';

    // Región del track
    const region = document.createElement('div');
    region.className = 'timeline-region';
    region.style.left = `${track.startTime * effectivePxPerSec}px`;
    region.style.width = `${track.duration * effectivePxPerSec}px`;
    region.style.borderColor = track.color;
    region.style.background = `linear-gradient(180deg, ${track.color}15 0%, #1E1E1E 100%)`;

    // Nombre de la región
    const regionName = document.createElement('div');
    regionName.className = 'region-name';
    regionName.textContent = track.name;
    regionName.style.color = track.color;

    // Mini waveform en la región
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = Math.max(1, Math.floor(track.duration * effectivePxPerSec));
    miniCanvas.height = 40;
    this._drawMiniWaveform(miniCanvas, track.waveformData, track.color);

    region.appendChild(regionName);
    region.appendChild(miniCanvas);
    content.appendChild(region);

    // Drag & drop para reordenar
    this._makeDraggable(region, track, effectivePxPerSec);

    trackEl.appendChild(label);
    trackEl.appendChild(content);
    this.tracksEl.appendChild(trackEl);

    // Actualizar ancho total del timeline
    this._updateTotalWidth();
  }

  _drawMiniWaveform(canvas, data, color) {
    if (!data) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color + '60';

    const step = data.length / width;
    for (let x = 0; x < width; x++) {
      const idx = Math.floor(x * step);
      const amplitude = (data[idx] || 0) * centerY * 0.85;
      ctx.fillRect(x, centerY - amplitude, 1, amplitude * 2);
    }
  }

  _makeDraggable(element, track, pxPerSec) {
    let isDragging = false;
    let startX = 0;
    let originalLeft = 0;

    element.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      originalLeft = parseFloat(element.style.left) || 0;
      element.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const newLeft = Math.max(0, originalLeft + dx);
      element.style.left = `${newLeft}px`;
      track.startTime = newLeft / pxPerSec;
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      element.style.cursor = 'grab';
    });
  }

  // Actualizar ancho total basado en contenido
  _updateTotalWidth() {
    const effectivePxPerSec = this.pxPerSecond * this.zoom;
    let maxEnd = 0;
    for (const track of this.tracks) {
      const end = (track.startTime + track.duration) * effectivePxPerSec;
      if (end > maxEnd) maxEnd = end;
    }
    this.tracksEl.style.width = `${this.labelWidth + maxEnd + 200}px`;
  }

  // ─── RULER ──────────────────────────────────
  _setupRuler() {
    if (!this.rulerCanvas) return;
    const resizeObserver = new ResizeObserver(() => this._updateRuler());
    resizeObserver.observe(this.rulerCanvas.parentElement || this.rulerCanvas);
  }

  _updateRuler() {
    if (!this.rulerCanvas || !this.rulerCtx) return;

    const effectivePxPerSec = this.pxPerSecond * this.zoom;
    const totalWidth = this.tracksEl?.offsetWidth || 2000;

    const dpr = window.devicePixelRatio || 1;
    this.rulerCanvas.width = totalWidth * dpr;
    this.rulerCanvas.height = 24 * dpr;
    this.rulerCanvas.style.width = `${totalWidth}px`;
    this.rulerCtx.scale(dpr, dpr);

    const ctx = this.rulerCtx;
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, totalWidth, 24);

    // Marcas de tiempo
    const interval = this.zoom < 0.5 ? 10 : this.zoom < 1 ? 5 : this.zoom < 2 ? 2 : 1;

    ctx.fillStyle = '#666';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (let sec = 0; sec < totalWidth / effectivePxPerSec; sec += interval) {
      const x = this.labelWidth + sec * effectivePxPerSec;

      // Marca principal
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 16);
      ctx.lineTo(x, 24);
      ctx.stroke();

      // Tiempo
      const min = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      ctx.fillText(`${min}:${s.toString().padStart(2, '0')}`, x, 12);
    }
  }

  // ─── ZOOM ───────────────────────────────────
  setZoom(level) {
    this.zoom = Math.max(0.1, Math.min(4, level));
    this._rerender();
    return this.zoom;
  }

  zoomIn() { return this.setZoom(this.zoom * 1.25); }
  zoomOut() { return this.setZoom(this.zoom / 1.25); }

  _rerender() {
    this.tracksEl.innerHTML = '';
    this.tracks.forEach((track, i) => this._renderTrack(track, i));
    this._updateRuler();
  }

  // ─── PLAYHEAD ───────────────────────────────
  updatePlayhead(currentTime) {
    if (!this.playheadEl) return;
    const effectivePxPerSec = this.pxPerSecond * this.zoom;
    const x = this.labelWidth + currentTime * effectivePxPerSec;
    this.playheadEl.style.left = `${x}px`;
  }

  // ─── AUTOMIX ────────────────────────────────
  automix() {
    if (this.tracks.length < 2) return this.tracks;

    // Ordenar por compatibilidad armónica + BPM proximity
    const sorted = [this.tracks[0]];
    const remaining = [...this.tracks.slice(1)];

    while (remaining.length > 0) {
      const last = sorted[sorted.length - 1];
      let bestIdx = 0;
      let bestScore = -1;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];

        // Score armónico (Camelot Wheel)
        const harmonicScore = AudioEngine.getHarmonicScore(last.camelot, candidate.camelot);

        // Score BPM (menor diferencia = mejor)
        const bpmDiff = Math.abs(last.bpm - candidate.bpm);
        const bpmScore = Math.max(0, 100 - bpmDiff * 5);

        // Score combinado
        const totalScore = harmonicScore * 0.6 + bpmScore * 0.4;

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestIdx = i;
        }
      }

      sorted.push(remaining.splice(bestIdx, 1)[0]);
    }

    // Recalcular start times
    sorted.forEach((track, i) => {
      if (i === 0) {
        track.startTime = 0;
      } else {
        const prev = sorted[i - 1];
        track.startTime = prev.startTime + prev.duration - 15;
      }
    });

    this.tracks = sorted;
    this._rerender();
    return this.tracks;
  }

  // Obtener duración total del mix
  getTotalDuration() {
    if (this.tracks.length === 0) return 0;
    let maxEnd = 0;
    for (const track of this.tracks) {
      const end = track.startTime + track.duration;
      if (end > maxEnd) maxEnd = end;
    }
    return maxEnd;
  }

  // Obtener tracklist formateada
  getTrackList() {
    return this.tracks.map((track, i) => {
      const min = Math.floor(track.startTime / 60);
      const sec = Math.floor(track.startTime % 60);
      return `${i + 1}. [${min}:${sec.toString().padStart(2, '0')}] ${track.name} (${track.bpm} BPM, ${track.key})`;
    }).join('\n');
  }
}
