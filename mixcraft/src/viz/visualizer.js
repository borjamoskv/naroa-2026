/* ═══════════════════════════════════════════════════
   Visualizer v2 — Circular Audio Reactive GOD MODE
   Canvas 2D con partículas, spectrum bars, osciloscopio,
   glow reactivo, y trail effect
   ═══════════════════════════════════════════════════ */

export class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animFrame = null;
    this.getFreqData = null;
    this.getTimeData = null;
    this.particles = [];
    this.time = 0;

    this._resize();
    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(canvas);
  }

  _resize() {
    const size = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.width = size;
    this.height = size;
    this.ctx.scale(dpr, dpr);
  }

  start(getFreqData, getTimeData) {
    this.getFreqData = getFreqData;
    this.getTimeData = getTimeData;
    if (this.animFrame) return;
    this._animate();
  }

  stop() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  _animate() {
    const freqData = this.getFreqData?.();
    const timeData = this.getTimeData?.();
    this._draw(freqData, timeData);
    this.animFrame = requestAnimationFrame(() => this._animate());
  }

  _draw(freqData, timeData) {
    const { ctx, width, height } = this;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.32;

    this.time += 0.016;

    // Trail effect — semi-transparente
    ctx.fillStyle = 'rgba(5, 5, 7, 0.15)';
    ctx.fillRect(0, 0, width, height);

    if (!freqData || !timeData) {
      // Estado idle — pulso de respiración
      this._drawIdlePulse(centerX, centerY, radius);
      return;
    }

    // Calcular energía promedio
    let avgEnergy = 0;
    let bassEnergy = 0;
    for (let i = 0; i < freqData.length; i++) {
      avgEnergy += freqData[i];
      if (i < freqData.length * 0.1) bassEnergy += freqData[i];
    }
    avgEnergy /= freqData.length * 255;
    bassEnergy /= (freqData.length * 0.1) * 255;

    // ─── 1. GLOW DE FONDO ─────────────────
    const glowRadius = radius * (1.2 + avgEnergy * 0.8);
    const gradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.1,
      centerX, centerY, glowRadius
    );
    gradient.addColorStop(0, `rgba(204, 255, 0, ${avgEnergy * 0.2})`);
    gradient.addColorStop(0.4, `rgba(123, 47, 255, ${avgEnergy * 0.12})`);
    gradient.addColorStop(0.7, `rgba(0, 229, 255, ${avgEnergy * 0.05})`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // ─── 2. ANILLO EXTERIOR ───────────────
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(204, 255, 0, ${0.08 + avgEnergy * 0.15})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // ─── 3. BARRAS CIRCULARES ─────────────
    const bars = 48;
    const step = Math.floor(freqData.length / bars);
    const angleStep = (Math.PI * 2) / bars;

    for (let i = 0; i < bars; i++) {
      const value = freqData[i * step] / 255;
      const barLength = value * radius * 0.65;
      const angle = i * angleStep - Math.PI / 2;

      const x1 = centerX + Math.cos(angle) * (radius * 0.4);
      const y1 = centerY + Math.sin(angle) * (radius * 0.4);
      const x2 = centerX + Math.cos(angle) * (radius * 0.4 + barLength);
      const y2 = centerY + Math.sin(angle) * (radius * 0.4 + barLength);

      // Color por frecuencia: verde → violeta → cyan
      const hue = 65 + (i / bars) * 240;
      const lightness = 45 + value * 35;
      const alpha = 0.3 + value * 0.7;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${hue}, 90%, ${lightness}%, ${alpha})`;
      ctx.lineWidth = 2 + value * 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow en las puntas de alta energía
      if (value > 0.7) {
        ctx.beginPath();
        ctx.arc(x2, y2, 2 + value * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${(value - 0.7) * 3})`;
        ctx.fill();
      }
    }

    // ─── 4. OSCILOSCOPIO INTERIOR ─────────
    ctx.beginPath();
    const oscRadius = radius * 0.35;
    for (let i = 0; i < timeData.length; i++) {
      const value = (timeData[i] / 128) - 1;
      const angle = (i / timeData.length) * Math.PI * 2 - Math.PI / 2;
      const r = oscRadius + value * oscRadius * 0.4;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(0, 229, 255, ${0.3 + avgEnergy * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fill interior sutil
    ctx.fillStyle = `rgba(0, 229, 255, ${avgEnergy * 0.03})`;
    ctx.fill();

    // ─── 5. RESPIRACIÓN CENTRAL ───────────
    const breathRadius = radius * 0.08 * (1 + Math.sin(this.time * 2) * 0.3 + bassEnergy * 0.5);
    const centerGrad = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, breathRadius
    );
    centerGrad.addColorStop(0, `rgba(204, 255, 0, ${0.5 + bassEnergy * 0.5})`);
    centerGrad.addColorStop(0.5, `rgba(123, 47, 255, ${0.2 + bassEnergy * 0.3})`);
    centerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, breathRadius, 0, Math.PI * 2);
    ctx.fill();

    // ─── 6. PARTÍCULAS ────────────────────
    this._updateParticles(centerX, centerY, radius, bassEnergy);
    this._drawParticles();
  }

  _drawIdlePulse(cx, cy, r) {
    const { ctx } = this;
    const pulse = 0.5 + Math.sin(this.time * 1.5) * 0.3;

    // Anillo pulsante
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(204, 255, 0, ${0.1 + pulse * 0.1})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Centro
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.15);
    grad.addColorStop(0, `rgba(204, 255, 0, ${0.15 + pulse * 0.1})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  _updateParticles(cx, cy, r, energy) {
    // Generar nuevas partículas basadas en energía
    if (energy > 0.5 && Math.random() < energy * 0.5) {
      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        x: cx + Math.cos(angle) * r * 0.4,
        y: cy + Math.sin(angle) * r * 0.4,
        vx: Math.cos(angle) * (1 + energy * 3),
        vy: Math.sin(angle) * (1 + energy * 3),
        life: 1,
        decay: 0.01 + Math.random() * 0.02,
        size: 1 + Math.random() * 2,
        hue: 65 + Math.random() * 200,
      });
    }

    // Actualizar
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.vx *= 0.98;
      p.vy *= 0.98;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Limitar partículas
    if (this.particles.length > 80) {
      this.particles.splice(0, this.particles.length - 80);
    }
  }

  _drawParticles() {
    const { ctx } = this;
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.life * 0.7})`;
      ctx.fill();
    }
  }
}
