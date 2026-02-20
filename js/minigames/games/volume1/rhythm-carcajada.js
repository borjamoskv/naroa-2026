import { MicaMinigame } from '../../core/MicaMinigame.js';

export class RhythmCarcajada extends MicaMinigame {
  constructor() {
    super({
      id: 'rhythm-carcajada',
      titulo: 'RHYTHM CARCAJADA',
      obra: 'Me parto de risa',
      duracion: 60,
      frases: ["JAJAJA ¡ESO!", "¡Te has desincronizado!", "¡COMBO DE RISA x10!", "¡La risa es contagiosa!"]
    });
    this.objetivoMax = 50;
    this.notas = [];
    this.lineaGolpe = 550;
    this.tolerancia = 30;
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.activo) return;
      if (e.code === 'Space') this.checkGolpe();
    });
  }

  checkGolpe() {
    const notaCercana = this.notas.find(n => Math.abs(n.y - this.lineaGolpe) < this.tolerancia);
    if (notaCercana) {
      notaCercana.golpeada = true;
      this.exito();
    } else {
      this.fallo();
    }
  }

  start() {
    this.generarNotas();
    super.start();
  }

  generarNotas() {
    const intervalo = 800;
    let tiempo = 1000;
    for (let i = 0; i < 60; i++) {
        setTimeout(() => { if (this.activo) this.notas.push({ y: 0, golpeada: false, tipo: Math.random() > 0.7 ? 'jaja' : 'ja' }); }, tiempo);
        tiempo += intervalo + Math.random() * 300;
    }
  }

  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillStyle = '#FFE4E1';
    ctx.fillRect(0, 0, 800, 600);
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, this.lineaGolpe);
    ctx.lineTo(800, this.lineaGolpe);
    ctx.stroke();
    this.notas = this.notas.filter(n => !n.golpeada && n.y < 650);
    this.notas.forEach(nota => {
      nota.y += 5;
      ctx.font = nota.tipo === 'jaja' ? 'bold 36px Comic Sans MS' : '28px Comic Sans MS';
      ctx.fillStyle = nota.y > this.lineaGolpe - this.tolerancia && nota.y < this.lineaGolpe + this.tolerancia ? '#00FF00' : '#FF1493';
      ctx.textAlign = 'center';
      ctx.fillText(nota.tipo === 'jaja' ? 'JAJA' : 'JA', 400, nota.y);
    });
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('¡Pulsa ESPACIO al ritmo!', 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}
