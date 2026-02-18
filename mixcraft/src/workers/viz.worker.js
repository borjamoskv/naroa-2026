/* ═══════════════════════════════════════════════════
   THE EYE — Sovereign Visual Worker
   Run context: DedicatedWorkerGlobalScope
   Goal: 60FPS Fluid Rendering on OffscreenCanvas

   🎨 EPSILON SQUAD: Particle System + Glitch FX
   ═══════════════════════════════════════════════════ */

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let isRunning = false;
let currentFreq = null;
let currentTime = null;
let frameCount = 0;

// ── Industrial Noir Palette ──
const THEME = {
  void: '#0A0A0A',
  lime: '#CCFF00',
  violet: '#7B2FFF',
  white: '#FFFFFF',
  gold: '#D4AF37',
  yinmn: '#2E5090',
};

// ── Particle System ──
const MAX_PARTICLES = 120;
const particles = [];

class Particle {
  constructor(x, y, energy) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * energy * 3;
    this.vy = -Math.random() * energy * 4;
    this.life = 1.0;
    this.decay = 0.01 + Math.random() * 0.03;
    this.size = 1 + Math.random() * 3;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // Gravity
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.globalAlpha = this.life * 0.7;
    ctx.fillStyle = THEME.lime;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1.0;
  }
}

// ── Glitch State ──
const glitch = {
  active: false,
  timer: 0,
  intensity: 0,
};

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      initCanvas(payload.canvas, payload.width, payload.height);
      break;
      
    case 'RESIZE':
      width = payload.width;
      height = payload.height;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
      break;
      
    case 'DATA':
      currentFreq = payload.freq;
      currentTime = payload.time;
      break;
      
    case 'START':
      if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(loop);
      }
      break;
      
    case 'STOP':
      isRunning = false;
      break;
  }
};

function initCanvas(offscreenCanvas, w, h) {
  canvas = offscreenCanvas;
  ctx = canvas.getContext('2d', { alpha: false });
  width = w;
  height = h;
  canvas.width = width;
  canvas.height = height;
}

function loop() {
  if (!isRunning) return;
  frameCount++;
  render();
  requestAnimationFrame(loop);
}

function render() {
  if (!ctx || !currentFreq) return;

  // ── 1. Fade (Trails) ──
  ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
  ctx.fillRect(0, 0, width, height);

  // ── 2. Calculate Energy ──
  let totalEnergy = 0;
  for (let idx = 0; idx < currentFreq.length; idx++) totalEnergy += currentFreq[idx];
  const avgEnergy = totalEnergy / currentFreq.length / 255;

  // ── 3. Glitch Detection ──
  if (avgEnergy > 0.6 && Math.random() > 0.7) {
    glitch.active = true;
    glitch.timer = 3 + Math.floor(Math.random() * 5);
    glitch.intensity = avgEnergy;
  }
  if (glitch.timer > 0) glitch.timer--;
  else glitch.active = false;

  // ── 4. Waveform (Time Domain) — Sovereign Line ──
  ctx.lineWidth = 2;
  ctx.strokeStyle = glitch.active ? THEME.lime : THEME.violet;
  ctx.beginPath();

  const sliceWidth = width / currentTime.length;
  let xPos = 0;

  for (let idx = 0; idx < currentTime.length; idx++) {
    const val = currentTime[idx] / 128.0;
    let yPos = (val * height) / 2;

    // Glitch offset
    if (glitch.active && Math.random() > 0.9) {
      yPos += (Math.random() - 0.5) * 20 * glitch.intensity;
    }

    if (idx === 0) ctx.moveTo(xPos, yPos);
    else ctx.lineTo(xPos, yPos);

    xPos += sliceWidth;
  }
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // ── 5. Spectrum (Frequency Domain) — Mirror + Glow ──
  const barWidth = (width / currentFreq.length) * 2.5;
  let barX = 0;

  for (let idx = 0; idx < currentFreq.length; idx++) {
    const barHeight = (currentFreq[idx] / 255) * (height / 2);
    
    // Industrial Noir gradient: YInMn → Violet → Lime (by frequency)
    const ratio = idx / currentFreq.length;
    const hue = 240 - ratio * 180; // Blue → Green
    const lightness = 30 + (currentFreq[idx] / 255) * 40;
    
    // Top half
    ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, 0.85)`;
    ctx.fillRect(barX, height / 2 - barHeight, barWidth, barHeight);
    
    // Mirror (dimmer)
    ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, 0.15)`;
    ctx.fillRect(barX, height / 2, barWidth, barHeight * 0.6);

    // Spawn particles at peaks
    if (barHeight > height * 0.3 && particles.length < MAX_PARTICLES && Math.random() > 0.7) {
      particles.push(new Particle(
        barX + barWidth / 2,
        height / 2 - barHeight,
        barHeight / height
      ));
    }

    barX += barWidth + 1;
  }

  // ── 6. Particles ──
  for (let idx = particles.length - 1; idx >= 0; idx--) {
    particles[idx].update();
    particles[idx].draw(ctx);
    if (particles[idx].life <= 0) particles.splice(idx, 1);
  }

  // ── 7. Glitch Scanlines ──
  if (glitch.active) {
    ctx.fillStyle = `rgba(204, 255, 0, 0.03)`;
    for (let sl = 0; sl < height; sl += 3) {
      ctx.fillRect(0, sl, width, 1);
    }
    // Random displacement block
    if (Math.random() > 0.5) {
      const sliceY = Math.floor(Math.random() * height);
      const sliceH = 5 + Math.floor(Math.random() * 20);
      const offset = Math.floor((Math.random() - 0.5) * 30);
      const imgData = ctx.getImageData(0, sliceY, width, sliceH);
      ctx.putImageData(imgData, offset, sliceY);
    }
  }

  // ── 8. Center Pulse (Energy Indicator) ──
  if (avgEnergy > 0.1) {
    const radius = avgEnergy * 40;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(204, 255, 0, ${avgEnergy * 0.5})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

