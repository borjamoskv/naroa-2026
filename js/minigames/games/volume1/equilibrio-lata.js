import { MicaMinigame } from '../../core/MicaMinigame.js';

export class EquilibrioLata extends MicaMinigame {
  constructor() {
    super({
      id: 'equilibrio-lata',
      titulo: 'EQUILIBRIO EN LATA',
      obra: 'Hammock in Tin',
      duracion: 45,
      frases: ["¡Inclínate a la izquierda!", "¡UN PÁJARO!", "¡Equilibrio ZEN!", "¡Te caes!"]
    });
    this.objetivoMax = 45;
    this.balance = 0;
    this.viento = 0;
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.activo) return;
      if (e.key === 'ArrowLeft') this.balance -= 10;
      if (e.key === 'ArrowRight') this.balance += 10;
    });
  }

  start() {
    setInterval(() => { if (this.activo) { this.viento = (Math.random() - 0.5) * 4; if (Math.random() > 0.8) this.micaFraseAleatoria(); } }, 2000);
    super.start();
  }

  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);
    this.balance += this.viento;
    if (Math.abs(this.balance) > 100) { this.fallo(); this.balance = Math.sign(this.balance) * 50; }
    ctx.fillStyle = '#E0F7FA'; ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#C0C0C0'; ctx.fillRect(300, 400, 200, 100);
    ctx.save();
    ctx.translate(400, 350);
    ctx.rotate(this.balance * Math.PI / 180 / 3);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(-100, -10, 200, 20);
    ctx.font = '40px sans-serif'; ctx.fillText('😌', -20, 0);
    ctx.restore();
    ctx.fillStyle = Math.abs(this.balance) > 70 ? '#FF0000' : '#4CAF50';
    ctx.fillRect(350 + this.balance * 0.5, 550, 100, 20);
    this.puntuacion = this.duracion - this.tiempoRestante;
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center';
    ctx.fillText(`Tiempo en equilibrio: ${this.puntuacion}s`, 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}
