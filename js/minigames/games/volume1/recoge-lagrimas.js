import { MicaMinigame } from '../../core/MicaMinigame.js';

export class RecogeLagrimas extends MicaMinigame {
  constructor() {
    super({ id: 'lagrimas-oro', titulo: 'RECOGE LAS LÁGRIMAS', obra: 'Lágrimas de Oro', duracion: 45, frases: ["¡ORO PURO!", "¡Esa era negra!", "¡LÁGRIMA LEGENDARIA!"] });
    this.objetivoMax = 50;
    this.lagrimas = [];
    this.cuboX = 400;
  }
  setupControls() {
    document.addEventListener('keydown', e => {
      if (!this.activo) return;
      if (e.key === 'ArrowLeft') this.cuboX -= 30;
      if (e.key === 'ArrowRight') this.cuboX += 30;
      this.cuboX = Math.max(50, Math.min(750, this.cuboX));
    });
  }
  start() {
    setInterval(() => { if (this.activo) this.lagrimas.push({ x: Math.random() * 700 + 50, y: 0, dorada: Math.random() > 0.2 }); }, 500);
    super.start();
  }
  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 800, 600);
    this.lagrimas = this.lagrimas.filter(l => l.y < 650);
    this.lagrimas.forEach(l => {
      l.y += 6;
      ctx.font = '30px sans-serif'; ctx.fillText(l.dorada ? '💧' : '🖤', l.x, l.y);
      if (l.y > 530 && Math.abs(l.x - this.cuboX) < 40) {
        if (l.dorada) this.exito(); else this.fallo();
        l.y = 700;
      }
    });
    ctx.font = '60px sans-serif'; ctx.fillText('🪣', this.cuboX - 30, 580);
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFD700'; ctx.textAlign = 'center';
    ctx.fillText(`Oro: ${this.puntuacion}/${this.objetivoMax}`, 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}
