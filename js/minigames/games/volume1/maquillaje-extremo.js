import { MicaMinigame } from '../../core/MicaMinigame.js';

export class MaquillajeExtremo extends MicaMinigame {
  constructor() {
    super({ id: 'maquillaje', titulo: 'MAQUILLAJE EXTREMO', obra: 'Geisha', duracion: 30, frases: ["¡Esa línea torcida!", "¡PERFECCIÓN!", "¡El labio, el LABIO!"] });
    this.objetivoMax = 100;
    this.trazos = [];
    this.dibujando = false;
  }
  setupControls() {
    this.canvas.addEventListener('mousedown', () => this.dibujando = true);
    this.canvas.addEventListener('mouseup', () => { this.dibujando = false; this.exito(); });
    this.canvas.addEventListener('mousemove', e => {
      if (this.dibujando && this.activo) {
        const rect = this.canvas.getBoundingClientRect();
        this.trazos.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    });
  }
  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#FFF5EE'; ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#FFDAB9'; ctx.beginPath(); ctx.arc(400, 300, 150, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FF0000'; ctx.lineWidth = 3; ctx.beginPath();
    this.trazos.forEach((t, i) => i === 0 ? ctx.moveTo(t.x, t.y) : ctx.lineTo(t.x, t.y));
    ctx.stroke();
    ctx.font = '20px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center';
    ctx.fillText('¡Dibuja el maquillaje!', 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}
