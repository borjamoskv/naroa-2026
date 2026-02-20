import { MicaMinigame } from '../../core/MicaMinigame.js';

export class TetrisSardinas extends MicaMinigame {
  constructor() {
    super({
      id: 'tetris-sardinas',
      titulo: 'TETRIS DE SARDINAS',
      obra: 'Sardine Tin Collage',
      duracion: 90,
      frases: ["¡Esa sardina no cabe!", "¡SARDINA MAESTRA!", "¿Eso es un boquerón?", "¡LATA PERFECTA!"]
    });
    this.objetivoMax = 3;
    this.lataActual = [];
    this.sardinaActual = null;
    this.lataWidth = 8;
    this.lataHeight = 4;
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.activo || !this.sardinaActual) return;
      switch(e.key) {
        case 'ArrowLeft': this.moverSardina(-1); break;
        case 'ArrowRight': this.moverSardina(1); break;
        case 'ArrowDown': this.soltarSardina(); break;
        case 'ArrowUp': this.rotarSardina(); break;
      }
    });
  }

  nuevaLata() {
    this.lataActual = Array(this.lataHeight).fill().map(() => Array(this.lataWidth).fill(0));
    this.nuevaSardina();
  }

  nuevaSardina() {
    const formas = [
      [[1,1,1]], [[1],[1],[1]], [[1,1],[1,0]], [[1,1]]
    ];
    this.sardinaActual = {
      forma: formas[Math.floor(Math.random() * formas.length)],
      x: 3,
      y: 0
    };
  }

  moverSardina(dx) {
    this.sardinaActual.x += dx;
    this.sardinaActual.x = Math.max(0, Math.min(this.lataWidth - this.sardinaActual.forma[0].length, this.sardinaActual.x));
  }

  rotarSardina() {
    const forma = this.sardinaActual.forma;
    const nuevaForma = forma[0].map((_, i) => forma.map(row => row[i]).reverse());
    this.sardinaActual.forma = nuevaForma;
  }

  soltarSardina() {
    this.exito();
    this.nuevaSardina();
  }

  start() {
    this.nuevaLata();
    super.start();
  }

  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(200, 150, 400, 300);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 5;
    ctx.strokeRect(200, 150, 400, 300);
    const cellW = 400 / this.lataWidth;
    const cellH = 300 / this.lataHeight;
    for (let y = 0; y < this.lataHeight; y++) {
      for (let x = 0; x < this.lataWidth; x++) {
        if (this.lataActual[y][x]) {
          ctx.fillStyle = '#6B8E23';
          ctx.fillRect(200 + x * cellW, 150 + y * cellH, cellW - 2, cellH - 2);
        }
      }
    }
    if (this.sardinaActual) {
      ctx.fillStyle = '#4682B4';
      this.sardinaActual.forma.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell) {
            ctx.fillRect(
                200 + (this.sardinaActual.x + dx) * cellW,
                150 + (this.sardinaActual.y + dy) * cellH,
                cellW - 2, cellH - 2
            );
          }
        });
      });
    }
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(`Latas: ${this.puntuacion}/${this.objetivoMax}`, 400, 100);
    requestAnimationFrame(() => this.gameLoop());
  }
}
