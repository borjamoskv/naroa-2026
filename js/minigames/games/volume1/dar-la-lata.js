import { MicaMinigame } from '../../core/MicaMinigame.js';

export class DarLaLata extends MicaMinigame {
  constructor() {
    super({ id: 'lata', titulo: '¡DAR LA LATA!', obra: 'Dar la Lata', duracion: 30, frases: ["¡MÁS LATA!", "¡Te están ignorando!", "¡NIVEL MOLESTIA: MÁXIMO!"] });
    this.objetivoMax = 100;
    this.molestia = 0;
    this.decaimiento = 0.5;
  }
  setupControls() {
    document.addEventListener('keydown', e => {
      if (!this.activo) return;
      if (e.code === 'Space') { this.molestia += 5; this.exito(); }
    });
  }
  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    this.molestia = Math.max(0, this.molestia - this.decaimiento);
    ctx.fillStyle = '#F5F5DC'; ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#DDD'; ctx.fillRect(200, 500, 400, 40);
    ctx.fillStyle = this.molestia > 80 ? '#FF0000' : '#FFA500';
    ctx.fillRect(200, 500, this.molestia * 4, 40);
    ctx.font = '80px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(this.molestia > 80 ? '😤' : '😐', 400, 300);
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.fillText('¡Pulsa ESPACIO para dar la lata!', 400, 50);
    ctx.fillText(`Molestia: ${Math.floor(this.molestia)}%`, 400, 580);
    if (this.molestia >= 100) { this.end(); }
    requestAnimationFrame(() => this.gameLoop());
  }
}
