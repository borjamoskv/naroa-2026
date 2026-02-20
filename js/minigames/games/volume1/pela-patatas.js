import { MicaMinigame } from '../../core/MicaMinigame.js';

export class PelaPatatas extends MicaMinigame {
  constructor() {
    super({
      id: 'pela-patatas',
      titulo: '¡PELA LAS PATATAS!',
      obra: 'Sí, yo foio con patatas',
      duracion: 45,
      frases: ["¡MÁS RÁPIDO!", "¡El señor pierde la paciencia!", "¡PATATA PERFECTA!", "¿Eso era una piedra?"]
    });
    this.objetivoMax = 20;
    this.secuencia = [];
    this.indiceActual = 0;
    this.teclas = ['A', 'S', 'D', 'F'];
    this.patataActual = 0;
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.activo) return;
      const tecla = e.key.toUpperCase();
      if (this.secuencia[this.indiceActual] === tecla) {
        this.indiceActual++;
        if (this.indiceActual >= this.secuencia.length) {
          this.exito();
          this.nuevaPatata();
        }
      } else {
        this.fallo();
        this.indiceActual = 0;
      }
    });
  }

  nuevaPatata() {
    this.patataActual++;
    this.secuencia = [];
    const longitud = 3 + Math.floor(this.patataActual / 5);
    for (let i = 0; i < longitud; i++) {
        this.secuencia.push(this.teclas[Math.floor(Math.random() * 4)]);
    }
    this.indiceActual = 0;
  }

  start() {
    this.nuevaPatata();
    super.start();
  }

  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillStyle = '#faf7f2';
    ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.ellipse(400, 300, 120, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    this.secuencia.forEach((tecla, i) => {
      const x = 300 + i * 60;
      ctx.fillStyle = i < this.indiceActual ? '#4CAF50' : i === this.indiceActual ? '#FF5722' : '#333';
      ctx.fillText(tecla, x, 500);
    });
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(`Patatas: ${this.puntuacion}/${this.objetivoMax}`, 400, 100);
    requestAnimationFrame(() => this.gameLoop());
  }
}
