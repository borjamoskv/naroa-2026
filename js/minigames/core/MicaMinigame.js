/**
 * CLASE BASE PARA TODOS LOS MINIJUEGOS
 * Estilo: Incredible Crisis / WarioWare / Rhythm Heaven
 */
export class MicaMinigame {
  constructor(config) {
    this.id = config.id;
    this.titulo = config.titulo;
    this.obra = config.obra;
    this.duracion = config.duracion || 60;
    this.puntuacion = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.activo = false;
    this.timer = null;
    this.tiempoRestante = this.duracion;
    
    // MICA frases
    this.frases = config.frases || [];
    this.indiceFrase = 0;
    
    // Audio
    this.sonidos = {
      exito: new Audio('/sounds/success.mp3'),
      fallo: new Audio('/sounds/fail.mp3'),
      combo: new Audio('/sounds/combo.mp3'),
      alarma: new Audio('/sounds/alarm.mp3')
    };
    
    // Canvas
    this.canvas = null;
    this.ctx = null;
  }

  init(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="minigame-wrapper" id="game-${this.id}">
        <div class="minigame-header">
          <h2 class="minigame-titulo">${this.titulo}</h2>
          <div class="minigame-stats">
            <span class="timer">⏱️ ${this.duracion}s</span>
            <span class="score">🏆 0</span>
            <span class="combo">🔥 x0</span>
          </div>
        </div>
        <canvas id="canvas-${this.id}" width="800" height="600"></canvas>
        <div class="mica-bubble" id="mica-${this.id}"></div>
        <div class="controls-hint"></div>
      </div>
    `;
    
    this.canvas = document.getElementById(`canvas-${this.id}`);
    this.ctx = this.canvas.getContext('2d');
    this.micaBubble = document.getElementById(`mica-${this.id}`);
    
    this.setupControls();
  }

  start() {
    this.activo = true;
    this.micaHabla("¡COMIENZA!");
    
    this.timer = setInterval(() => {
      this.tiempoRestante--;
      this.updateUI();
      
      if (this.tiempoRestante <= 10) {
        this.sonidos.alarma.play();
      }
      
      if (this.tiempoRestante <= 0) {
        this.end();
      }
    }, 1000);
    
    this.gameLoop();
  }

  end() {
    this.activo = false;
    clearInterval(this.timer);
    
    const estrellas = this.calcularEstrellas();
    this.micaHabla(estrellas === 3 ? "¡PERFECTO! ⭐⭐⭐" : 
                   estrellas === 2 ? "¡Bien hecho! ⭐⭐" : 
                   estrellas === 1 ? "Puedes mejorar ⭐" : "¡Inténtalo de nuevo!");
    
    this.mostrarResultado(estrellas);
  }

  calcularEstrellas() {
    const porcentaje = this.puntuacion / this.objetivoMax;
    if (porcentaje >= 0.9) return 3;
    if (porcentaje >= 0.6) return 2;
    if (porcentaje >= 0.3) return 1;
    return 0;
  }

  micaHabla(texto) {
    this.micaBubble.textContent = texto;
    this.micaBubble.classList.add('visible');
    setTimeout(() => this.micaBubble.classList.remove('visible'), 2000);
  }

  micaFraseAleatoria() {
    if (this.frases.length === 0) return;
    const frase = this.frases[Math.floor(Math.random() * this.frases.length)];
    this.micaHabla(frase);
  }

  exito() {
    this.puntuacion++;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.sonidos.exito.play();
    if (this.combo % 5 === 0) {
      this.sonidos.combo.play();
      this.micaFraseAleatoria();
    }
    this.updateUI();
  }

  fallo() {
    this.combo = 0;
    this.sonidos.fallo.play();
    this.updateUI();
  }

  updateUI() {
    document.querySelector(`#game-${this.id} .timer`).textContent = `⏱️ ${this.tiempoRestante}s`;
    document.querySelector(`#game-${this.id} .score`).textContent = `🏆 ${this.puntuacion}`;
    document.querySelector(`#game-${this.id} .combo`).textContent = `🔥 x${this.combo}`;
  }

  gameLoop() { /* Override en cada juego */ }
  setupControls() { /* Override en cada juego */ }
  mostrarResultado(estrellas) { /* Override o default */ }
}
