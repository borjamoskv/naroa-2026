import { MicaMinigame } from '../../core/MicaMinigame.js';

export class BaileSincronizado extends MicaMinigame {
  constructor() {
    super({ id: 'baile', titulo: 'BAILE SINCRONIZADO', obra: 'The Golden Couple', duracion: 60, frases: ["¡Ese paso no!", "¡QUÍMICA PERFECTA!", "¡Gira, GIRA!"] });
    this.objetivoMax = 20;
    this.secuencia = [];
    this.indice = 0;
    this.flechas = ['↑', '↓', '←', '→'];
    this.keyMap = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
  }
  setupControls() {
    document.addEventListener('keydown', e => {
      if (!this.activo) return;
      const flecha = this.keyMap[e.key];
      if (flecha === this.secuencia[this.indice]) { this.indice++; if (this.indice >= this.secuencia.length) { this.exito(); this.nuevaSecuencia(); } }
      else { this.fallo(); this.indice = 0; }
    });
  }
  nuevaSecuencia() {
    this.secuencia = [];
    const len = 3 + Math.floor(this.puntuacion / 5);
    for (let i = 0; i < len; i++) this.secuencia.push(this.flechas[Math.floor(Math.random() * 4)]);
    this.indice = 0;
  }
  start() { this.nuevaSecuencia(); super.start(); }
  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#FFD700'; ctx.fillRect(0, 0, 800, 600);
    ctx.font = '100px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('💃🕺', 400, 300);
    ctx.font = 'bold 60px sans-serif';
    this.secuencia.forEach((f, i) => {
      ctx.fillStyle = i < this.indice ? '#4CAF50' : i === this.indice ? '#FF5722' : '#333';
      ctx.fillText(f, 200 + i * 80, 500);
    });
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.fillText(`Combos: ${this.puntuacion}/${this.objetivoMax}`, 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}
