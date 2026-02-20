import { MicaMinigame } from '../../core/MicaMinigame.js';

export class HuyeDelDragon extends MicaMinigame {
  constructor() {
    super({ id: 'dragon', titulo: 'HUYE DEL DRAGÓN', obra: 'Monster Dragon', duracion: 60, frases: ["¡ESTÁ DETRÁS DE TI!", "¡Casi te come!", "¡SALTO ÉPICO!"] });
    this.objetivoMax = 60;
    this.jugadorX = 700; this.jugadorY = 300;
    this.dragonX = 50;
  }
  setupControls() {
    document.addEventListener('keydown', e => {
      if (!this.activo) return;
      const speed = 20;
      if (e.key === 'ArrowUp') this.jugadorY -= speed;
      if (e.key === 'ArrowDown') this.jugadorY += speed;
      if (e.key === 'ArrowLeft') this.jugadorX -= speed;
      if (e.key === 'ArrowRight') this.jugadorX += speed;
    });
  }
  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#2C1810'; ctx.fillRect(0, 0, 800, 600);
    const dx = this.jugadorX - this.dragonX;
    this.dragonX += dx * 0.02;
    ctx.font = '80px sans-serif'; ctx.fillText('🐉', this.dragonX, 350);
    ctx.font = '40px sans-serif'; ctx.fillText('🏃', this.jugadorX, this.jugadorY);
    if (Math.abs(this.jugadorX - this.dragonX) < 60) { this.fallo(); this.jugadorX = 700; }
    this.puntuacion = this.duracion - this.tiempoRestante;
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
    ctx.fillText(`Sobrevive: ${this.puntuacion}s`, 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}
