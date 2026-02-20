import { MicaMinigame } from '../../core/MicaMinigame.js';

export class CarreraAbsurda extends MicaMinigame {
  constructor() {
    super({
      id: 'carrera-absurda',
      titulo: 'CARRERA ABSURDA',
      obra: 'El Gran Dakari',
      duracion: 60,
      frases: ["¡CUIDADO CON EL SOFÁ!", "¿Eso era un pulpo?", "¡VELOCIDAD TURBO!", "¡Salta!"]
    });
    this.objetivoMax = 1000;
    this.jugadorY = 400;
    this.saltando = false;
    this.velocidadSalto = 0;
    this.obstaculos = [];
    this.distancia = 0;
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.activo) return;
      if ((e.code === 'Space' || e.key === 'ArrowUp') && !this.saltando) this.saltar();
    });
  }

  saltar() {
    this.saltando = true;
    this.velocidadSalto = -15;
  }

  start() {
    this.generarObstaculos();
    super.start();
  }

  generarObstaculos() {
    const tipos = ['🛋️', '🐙', '🍉', '🎸', '🦩', '🎪'];
    setInterval(() => { if (this.activo) this.obstaculos.push({ x: 850, tipo: tipos[Math.floor(Math.random() * tipos.length)], ancho: 50, alto: 60 }); }, 1500);
  }

  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, 800, 400);
    ctx.fillStyle = '#90EE90'; ctx.fillRect(0, 400, 800, 200);
    if (this.saltando) {
      this.jugadorY += this.velocidadSalto;
      this.velocidadSalto += 1;
      if (this.jugadorY >= 400) { this.jugadorY = 400; this.saltando = false; }
    }
    ctx.font = '60px sans-serif'; ctx.fillText('🏃', 100, this.jugadorY);
    this.obstaculos = this.obstaculos.filter(o => o.x > -100);
    this.obstaculos.forEach(obs => {
      obs.x -= 8;
      ctx.font = '50px sans-serif'; ctx.fillText(obs.tipo, obs.x, 420);
      if (obs.x > 80 && obs.x < 160 && this.jugadorY > 350) { this.fallo(); obs.x = -200; }
    });
    this.distancia += 2;
    this.puntuacion = Math.floor(this.distancia / 10);
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center';
    ctx.fillText(`Distancia: ${this.distancia}m`, 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}
