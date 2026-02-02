/**
 * MICA Incredible Crisis - 21 Minijuegos Absurdos
 * Basado en las obras de Naroa Gutiérrez Gil
 * Estilo: Incredible Crisis / WarioWare / Rhythm Heaven
 */

// ============================================
// CLASE BASE PARA TODOS LOS MINIJUEGOS
// ============================================
class MicaMinigame {
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

// ============================================
// JUEGO 1: ¡PELA LAS PATATAS!
// ============================================
class PelaPatatas extends MicaMinigame {
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
    const longitud = 3 + Math.floor(this.patataActual / 5); // Más largo cada 5 patatas
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
    
    // Fondo
    ctx.fillStyle = '#faf7f2';
    ctx.fillRect(0, 0, 800, 600);
    
    // Patata gigante
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.ellipse(400, 300, 120, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Mostrar secuencia QTE
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    
    this.secuencia.forEach((tecla, i) => {
      const x = 300 + i * 60;
      ctx.fillStyle = i < this.indiceActual ? '#4CAF50' : 
                      i === this.indiceActual ? '#FF5722' : '#333';
      ctx.fillText(tecla, x, 500);
    });
    
    // Contador de patatas
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(`Patatas: ${this.puntuacion}/${this.objetivoMax}`, 400, 100);
    
    requestAnimationFrame(() => this.gameLoop());
  }
}

// ============================================
// JUEGO 2: TETRIS DE SARDINAS
// ============================================
class TetrisSardinas extends MicaMinigame {
  constructor() {
    super({
      id: 'tetris-sardinas',
      titulo: 'TETRIS DE SARDINAS',
      obra: 'Sardine Tin Collage',
      duracion: 90,
      frases: ["¡Esa sardina no cabe!", "¡SARDINA MAESTRA!", "¿Eso es un boquerón?", "¡LATA PERFECTA!"]
    });
    this.objetivoMax = 3; // 3 latas
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
      [[1,1,1]], // Horizontal
      [[1],[1],[1]], // Vertical
      [[1,1],[1,0]], // L
      [[1,1]], // Cuadrado pequeño
    ];
    this.sardinaActual = {
      forma: formas[Math.floor(Math.random() * formas.length)],
      x: 3,
      y: 0
    };
  }

  moverSardina(dx) {
    this.sardinaActual.x += dx;
    // Clamp
    this.sardinaActual.x = Math.max(0, Math.min(this.lataWidth - this.sardinaActual.forma[0].length, this.sardinaActual.x));
  }

  rotarSardina() {
    const forma = this.sardinaActual.forma;
    const nuevaForma = forma[0].map((_, i) => forma.map(row => row[i]).reverse());
    this.sardinaActual.forma = nuevaForma;
  }

  soltarSardina() {
    // Simplificado: colocar inmediatamente
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
    
    // Fondo lata
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(200, 150, 400, 300);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 5;
    ctx.strokeRect(200, 150, 400, 300);
    
    // Grid
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
    
    // Sardina actual
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

// ============================================
// JUEGO 3: RHYTHM CARCAJADA
// ============================================
class RhythmCarcajada extends MicaMinigame {
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
      if (e.code === 'Space') {
        this.checkGolpe();
      }
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
    // Generar notas
    this.generarNotas();
    super.start();
  }

  generarNotas() {
    const intervalo = 800; // ms entre notas
    let tiempo = 1000;
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        if (this.activo) {
          this.notas.push({ y: 0, golpeada: false, tipo: Math.random() > 0.7 ? 'jaja' : 'ja' });
        }
      }, tiempo);
      tiempo += intervalo + Math.random() * 300;
    }
  }

  gameLoop() {
    if (!this.activo) return;
    
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);
    
    // Fondo
    ctx.fillStyle = '#FFE4E1';
    ctx.fillRect(0, 0, 800, 600);
    
    // Línea de golpe
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, this.lineaGolpe);
    ctx.lineTo(800, this.lineaGolpe);
    ctx.stroke();
    
    // Notas cayendo
    this.notas = this.notas.filter(n => !n.golpeada && n.y < 650);
    this.notas.forEach(nota => {
      nota.y += 5;
      ctx.font = nota.tipo === 'jaja' ? 'bold 36px Comic Sans MS' : '28px Comic Sans MS';
      ctx.fillStyle = nota.y > this.lineaGolpe - this.tolerancia && nota.y < this.lineaGolpe + this.tolerancia ? '#00FF00' : '#FF1493';
      ctx.textAlign = 'center';
      ctx.fillText(nota.tipo === 'jaja' ? 'JAJA' : 'JA', 400, nota.y);
    });
    
    // Instrucción
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('¡Pulsa ESPACIO al ritmo!', 400, 50);
    
    requestAnimationFrame(() => this.gameLoop());
  }
}

// ============================================
// JUEGO 4: CARRERA ABSURDA
// ============================================
class CarreraAbsurda extends MicaMinigame {
  constructor() {
    super({
      id: 'carrera-absurda',
      titulo: 'CARRERA ABSURDA',
      obra: 'El Gran Dakari',
      duracion: 60,
      frases: ["¡CUIDADO CON EL SOFÁ!", "¿Eso era un pulpo?", "¡VELOCIDAD TURBO!", "¡Salta!"]
    });
    this.objetivoMax = 1000; // metros
    this.jugadorY = 400;
    this.saltando = false;
    this.velocidadSalto = 0;
    this.obstaculos = [];
    this.distancia = 0;
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.activo) return;
      if ((e.code === 'Space' || e.key === 'ArrowUp') && !this.saltando) {
        this.saltar();
      }
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
    setInterval(() => {
      if (this.activo) {
        this.obstaculos.push({
          x: 850,
          tipo: tipos[Math.floor(Math.random() * tipos.length)],
          ancho: 50,
          alto: 60
        });
      }
    }, 1500);
  }

  gameLoop() {
    if (!this.activo) return;
    
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);
    
    // Fondo
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 800, 400);
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 400, 800, 200);
    
    // Física del salto
    if (this.saltando) {
      this.jugadorY += this.velocidadSalto;
      this.velocidadSalto += 1; // Gravedad
      if (this.jugadorY >= 400) {
        this.jugadorY = 400;
        this.saltando = false;
      }
    }
    
    // Jugador
    ctx.font = '60px sans-serif';
    ctx.fillText('🏃', 100, this.jugadorY);
    
    // Obstáculos
    this.obstaculos = this.obstaculos.filter(o => o.x > -100);
    this.obstaculos.forEach(obs => {
      obs.x -= 8;
      ctx.font = '50px sans-serif';
      ctx.fillText(obs.tipo, obs.x, 420);
      
      // Colisión
      if (obs.x > 80 && obs.x < 160 && this.jugadorY > 350) {
        this.fallo();
        obs.x = -200; // Eliminar
      }
    });
    
    // Distancia
    this.distancia += 2;
    this.puntuacion = Math.floor(this.distancia / 10);
    
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(`Distancia: ${this.distancia}m`, 400, 50);
    
    requestAnimationFrame(() => this.gameLoop());
  }
}

// ============================================
// JUEGO 5: EQUILIBRIO EN LATA
// ============================================
class EquilibrioLata extends MicaMinigame {
  constructor() {
    super({
      id: 'equilibrio-lata',
      titulo: 'EQUILIBRIO EN LATA',
      obra: 'Hammock in Tin',
      duracion: 45,
      frases: ["¡Inclínate a la izquierda!", "¡UN PÁJARO!", "¡Equilibrio ZEN!", "¡Te caes!"]
    });
    this.objetivoMax = 45; // segundos
    this.balance = 0; // -100 a 100
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
    // Viento aleatorio
    setInterval(() => {
      if (this.activo) {
        this.viento = (Math.random() - 0.5) * 4;
        if (Math.random() > 0.8) this.micaFraseAleatoria();
      }
    }, 2000);
    super.start();
  }

  gameLoop() {
    if (!this.activo) return;
    
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);
    
    // Aplicar viento
    this.balance += this.viento;
    
    // Limitar y detectar caída
    if (Math.abs(this.balance) > 100) {
      this.fallo();
      this.balance = Math.sign(this.balance) * 50; // Reset parcial
    }
    
    // Fondo
    ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(0, 0, 800, 600);
    
    // Lata base
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(300, 400, 200, 100);
    
    // Hamaca (rotada según balance)
    ctx.save();
    ctx.translate(400, 350);
    ctx.rotate(this.balance * Math.PI / 180 / 3);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-100, -10, 200, 20);
    // Persona
    ctx.font = '40px sans-serif';
    ctx.fillText('😌', -20, 0);
    ctx.restore();
    
    // Indicador de balance
    ctx.fillStyle = Math.abs(this.balance) > 70 ? '#FF0000' : '#4CAF50';
    ctx.fillRect(350 + this.balance * 0.5, 550, 100, 20);
    
    // Contador
    this.puntuacion = this.duracion - this.tiempoRestante;
    
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(`Tiempo en equilibrio: ${this.puntuacion}s`, 400, 50);
    ctx.fillText(`Viento: ${this.viento > 0 ? '→' : '←'} ${Math.abs(this.viento).toFixed(1)}`, 400, 80);
    
    requestAnimationFrame(() => this.gameLoop());
  }
}

// ============================================
// JUEGOS 6-21: IMPLEMENTACIONES RÁPIDAS
// ============================================

class RecogeLagrimas extends MicaMinigame {
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
      ctx.font = '30px sans-serif';
      ctx.fillText(l.dorada ? '💧' : '🖤', l.x, l.y);
      if (l.y > 530 && Math.abs(l.x - this.cuboX) < 40) {
        if (l.dorada) this.exito(); else this.fallo();
        l.y = 700;
      }
    });
    
    ctx.font = '60px sans-serif';
    ctx.fillText('🪣', this.cuboX - 30, 580);
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFD700'; ctx.textAlign = 'center';
    ctx.fillText(`Oro: ${this.puntuacion}/${this.objetivoMax}`, 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}

class MaquillajeExtremo extends MicaMinigame {
  constructor() {
    super({ id: 'maquillaje', titulo: 'MAQUILLAJE EXTREMO', obra: 'Geisha', duracion: 30, frases: ["¡Esa línea torcida!", "¡PERFECCIÓN!", "¡El labio, el LABIO!"] });
    this.objetivoMax = 100;
    this.trazos = [];
    this.dibujando = false;
  }
  setupControls() {
    this.canvas.addEventListener('mousedown', () => this.dibujando = true);
    this.canvas.addEventListener('mouseup', () => { this.dibujando = false; this.exito(); });
    this.canvas.addEventListener('mousemove', e => {
      if (this.dibujando && this.activo) {
        const rect = this.canvas.getBoundingClientRect();
        this.trazos.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    });
  }
  gameLoop() {
    if (!this.activo) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#FFF5EE'; ctx.fillRect(0, 0, 800, 600);
    
    // Cara
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath(); ctx.arc(400, 300, 150, 0, Math.PI * 2); ctx.fill();
    
    // Trazos del jugador
    ctx.strokeStyle = '#FF0000'; ctx.lineWidth = 3;
    ctx.beginPath();
    this.trazos.forEach((t, i) => i === 0 ? ctx.moveTo(t.x, t.y) : ctx.lineTo(t.x, t.y));
    ctx.stroke();
    
    ctx.font = '20px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center';
    ctx.fillText('¡Dibuja el maquillaje!', 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}

class HuyeDelDragon extends MicaMinigame {
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
    
    // Dragón persigue
    const dx = this.jugadorX - this.dragonX;
    const dy = this.jugadorY - 300;
    this.dragonX += dx * 0.02;
    
    ctx.font = '80px sans-serif';
    ctx.fillText('🐉', this.dragonX, 350);
    ctx.font = '40px sans-serif';
    ctx.fillText('🏃', this.jugadorX, this.jugadorY);
    
    if (Math.abs(this.jugadorX - this.dragonX) < 60) { this.fallo(); this.jugadorX = 700; }
    
    this.puntuacion = this.duracion - this.tiempoRestante;
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
    ctx.fillText(`Sobrevive: ${this.puntuacion}s`, 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}

class BaileSincronizado extends MicaMinigame {
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
    
    ctx.font = '100px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('💃🕺', 400, 300);
    
    ctx.font = 'bold 60px sans-serif';
    this.secuencia.forEach((f, i) => {
      ctx.fillStyle = i < this.indice ? '#4CAF50' : i === this.indice ? '#FF5722' : '#333';
      ctx.fillText(f, 200 + i * 80, 500);
    });
    
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#333';
    ctx.fillText(`Combos: ${this.puntuacion}/${this.objetivoMax}`, 400, 50);
    requestAnimationFrame(() => this.gameLoop());
  }
}

class DarLaLata extends MicaMinigame {
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
    
    // Barra de molestia
    ctx.fillStyle = '#DDD'; ctx.fillRect(200, 500, 400, 40);
    ctx.fillStyle = this.molestia > 80 ? '#FF0000' : '#FFA500';
    ctx.fillRect(200, 500, this.molestia * 4, 40);
    
    ctx.font = '80px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(this.molestia > 80 ? '😤' : '😐', 400, 300);
    
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#333';
    ctx.fillText('¡Pulsa ESPACIO para dar la lata!', 400, 50);
    ctx.fillText(`Molestia: ${Math.floor(this.molestia)}%`, 400, 580);
    
    if (this.molestia >= 100) { this.end(); }
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Más juegos simplificados...
class EscapeCaja extends MicaMinigame {
  constructor() { super({ id: 'escape-caja', titulo: 'ESCAPE DE LA CAJA', obra: 'En Caja', duracion: 60, frases: ["¡El sello de correos!", "¡LIBERTAD!", "¿A dónde te envían?"] }); this.objetivoMax = 5; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo && e.code === 'Space') this.exito(); }); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#8B4513'; ctx.fillRect(0, 0, 800, 600); ctx.fillStyle = '#DEB887'; ctx.fillRect(200, 150, 400, 300); ctx.font = '100px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('📦', 400, 350); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.fillText('¡Pulsa ESPACIO para escapar!', 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

class CarreraTiempo extends MicaMinigame {
  constructor() { super({ id: 'tiempo', titulo: 'CARRERA CONTRA EL TIEMPO', obra: 'Es la Hora', duracion: 60, frases: ["¡TICK TACK!", "¡5 segundos!", "¡JUSTO A TIEMPO!"] }); this.objetivoMax = 10; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo) this.exito(); }); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600); ctx.font = '150px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('⏰', 400, 350); ctx.font = '30px sans-serif'; ctx.fillStyle = '#FF0'; ctx.fillText(`Microtareas: ${this.puntuacion}/${this.objetivoMax}`, 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

class CopiaReflejo extends MicaMinigame {
  constructor() { super({ id: 'espejo', titulo: 'COPIA TU REFLEJO', obra: 'Espejos del Alma', duracion: 45, frases: ["¡Esa pose no!", "¡ESPEJO PERFECTO!", "El reflejo miente..."] }); this.objetivoMax = 20; this.poseActual = '🧍'; this.poses = ['🧍', '🙆', '🤷', '💃', '🧘']; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo && ['1','2','3','4','5'].includes(e.key)) { if (this.poses[parseInt(e.key)-1] === this.poseActual) { this.exito(); this.poseActual = this.poses[Math.floor(Math.random()*5)]; } else this.fallo(); } }); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#E0E0E0'; ctx.fillRect(0, 0, 800, 600); ctx.font = '120px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(this.poseActual, 400, 300); ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.fillText('1:🧍 2:🙆 3:🤷 4:💃 5:🧘', 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

class VueloAmor extends MicaMinigame {
  constructor() { super({ id: 'vuelo', titulo: 'VUELO DEL AMOR', obra: 'Soy un amor y tengo alas', duracion: 60, frases: ["¡ALETEA!", "¡Corazón roto a las 3!", "¡AMOR INFINITO!"] }); this.objetivoMax = 1000; this.y = 300; this.velocidad = 0; this.obstaculos = []; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo && e.code === 'Space') this.velocidad = -8; }); }
  start() { setInterval(() => { if (this.activo) this.obstaculos.push({ x: 820, y: Math.random() * 400 + 100, tipo: Math.random() > 0.5 ? '💔' : '❤️' }); }, 1500); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; this.velocidad += 0.4; this.y += this.velocidad; this.y = Math.max(50, Math.min(550, this.y)); ctx.fillStyle = '#FFB6C1'; ctx.fillRect(0, 0, 800, 600); ctx.font = '50px sans-serif'; ctx.fillText('😇', 100, this.y); this.obstaculos = this.obstaculos.filter(o => o.x > -50); this.obstaculos.forEach(o => { o.x -= 5; ctx.fillText(o.tipo, o.x, o.y); if (o.x < 150 && o.x > 50 && Math.abs(o.y - this.y) < 40) { if (o.tipo === '💔') this.fallo(); else this.exito(); o.x = -100; } }); this.puntuacion++; ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center'; ctx.fillText(`Distancia: ${this.puntuacion}m`, 400, 50); requestAnimationFrame(() => this.gameLoop()); }
}

class BrillaMas extends MicaMinigame {
  constructor() { super({ id: 'brilla', titulo: 'BRILLA MÁS', obra: 'Pink and Sparkles', duracion: 45, frases: ["¡ESE BRILLO!", "¡Se apagan!", "¡MODO PURPURINA!"] }); this.objetivoMax = 100; this.sparkles = []; }
  setupControls() { this.canvas.addEventListener('click', e => { if (!this.activo) return; const rect = this.canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top; this.sparkles = this.sparkles.filter(s => { if (Math.abs(s.x - x) < 30 && Math.abs(s.y - y) < 30) { this.exito(); return false; } return true; }); }); }
  start() { setInterval(() => { if (this.activo && this.sparkles.length < 20) this.sparkles.push({ x: Math.random() * 750 + 25, y: Math.random() * 550 + 25, vida: 100 }); }, 300); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#FF69B4'; ctx.fillRect(0, 0, 800, 600); this.sparkles = this.sparkles.filter(s => { s.vida--; return s.vida > 0; }); this.sparkles.forEach(s => { ctx.font = `${20 + s.vida/5}px sans-serif`; ctx.fillText('✨', s.x, s.y); }); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.fillText(`Sparkles: ${this.puntuacion}/${this.objetivoMax}`, 400, 50); requestAnimationFrame(() => this.gameLoop()); }
}

class PiroposExtremos extends MicaMinigame {
  constructor() { super({ id: 'piropos', titulo: 'PIROPOS EXTREMOS', obra: 'Papitxulo', duracion: 60, frases: ["¡Ese piropo era MALO!", "¡CASANOVA!", "Papitxulo aprueba"] }); this.objetivoMax = 30; this.piropoActual = ''; this.piropos = ['Eres más bonita que un amanecer', 'Tienes los ojos del color del mar', 'Tu sonrisa ilumina la habitación']; this.input = ''; }
  setupControls() { document.addEventListener('keydown', e => { if (!this.activo) return; if (e.key === 'Enter') { if (this.input.length > 5) { this.exito(); this.input = ''; this.nuevoPiropo(); } } else if (e.key === 'Backspace') { this.input = this.input.slice(0, -1); } else if (e.key.length === 1) { this.input += e.key; } }); }
  nuevoPiropo() { this.piropoActual = this.piropos[Math.floor(Math.random() * this.piropos.length)]; }
  start() { this.nuevoPiropo(); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#FF1493'; ctx.fillRect(0, 0, 800, 600); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.fillText(`Escribe: "${this.piropoActual}"`, 400, 200); ctx.fillText(`Tu texto: ${this.input}_`, 400, 400); ctx.fillText(`Piropos: ${this.puntuacion}/${this.objetivoMax}`, 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

class LanzaMonedas extends MicaMinigame {
  constructor() { super({ id: 'monedas', titulo: 'LANZA MONEDAS', obra: 'Buena Fuente', duracion: 60, frases: ["¡Muy fuerte!", "¡DESEO CONCEDIDO!", "¿Eso era un botón?"] }); this.objetivoMax = 10; this.fuerza = 0; this.lanzando = false; }
  setupControls() { document.addEventListener('keydown', e => { if (!this.activo) return; if (e.code === 'Space') { this.lanzando = true; } }); document.addEventListener('keyup', e => { if (!this.activo) return; if (e.code === 'Space' && this.lanzando) { this.lanzando = false; if (this.fuerza > 40 && this.fuerza < 70) this.exito(); else this.fallo(); this.fuerza = 0; } }); }
  gameLoop() { if (!this.activo) return; if (this.lanzando) this.fuerza = Math.min(100, this.fuerza + 2); const ctx = this.ctx; ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, 800, 600); ctx.fillStyle = '#4169E1'; ctx.beginPath(); ctx.arc(400, 400, 100, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#DDD'; ctx.fillRect(350, 100, 100, 30); ctx.fillStyle = this.fuerza > 40 && this.fuerza < 70 ? '#4CAF50' : '#FF5722'; ctx.fillRect(350, 100, this.fuerza, 30); ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center'; ctx.fillText('Mantén ESPACIO para cargar fuerza', 400, 50); ctx.fillText(`Aciertos: ${this.puntuacion}/${this.objetivoMax}`, 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

class ContagiaSonrisa extends MicaMinigame {
  constructor() { super({ id: 'sonrisa', titulo: 'CONTAGIA LA SONRISA', obra: 'Smile and the World Smiles Back', duracion: 60, frases: ["¡Ese estaba triste!", "¡SONRISA VIRAL!", "¡El mundo sonríe!"] }); this.objetivoMax = 100; this.personas = []; }
  setupControls() { this.canvas.addEventListener('click', e => { if (!this.activo) return; const rect = this.canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top; this.personas.forEach(p => { if (Math.abs(p.x - x) < 30 && Math.abs(p.y - y) < 30 && !p.sonrie) { p.sonrie = true; this.exito(); } }); }); }
  start() { for (let i = 0; i < 20; i++) this.personas.push({ x: Math.random() * 700 + 50, y: Math.random() * 500 + 50, sonrie: false }); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#FFFACD'; ctx.fillRect(0, 0, 800, 600); this.personas.forEach(p => { ctx.font = '40px sans-serif'; ctx.fillText(p.sonrie ? '😊' : '😐', p.x, p.y); }); ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center'; ctx.fillText(`Sonrisas: ${this.puntuacion}/${this.objetivoMax}`, 400, 50); requestAnimationFrame(() => this.gameLoop()); }
}

class ConquistaMundo extends MicaMinigame {
  constructor() { super({ id: 'mundo', titulo: 'CONQUISTA EL MUNDO', obra: 'The World is Yours', duracion: 90, frases: ["¡Ese territorio era mío!", "¡EMPERADOR!", "¿Eso es Andorra?"] }); this.objetivoMax = 51; this.territorios = []; }
  setupControls() { this.canvas.addEventListener('click', e => { if (!this.activo) return; const rect = this.canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top; this.territorios.forEach(t => { if (Math.abs(t.x - x) < 40 && Math.abs(t.y - y) < 40 && !t.conquistado) { t.conquistado = true; this.exito(); } }); }); }
  start() { for (let i = 0; i < 100; i++) this.territorios.push({ x: Math.random() * 750 + 25, y: Math.random() * 550 + 25, conquistado: false }); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#228B22'; ctx.fillRect(0, 0, 800, 600); this.territorios.forEach(t => { ctx.fillStyle = t.conquistado ? '#FFD700' : '#8B4513'; ctx.beginPath(); ctx.arc(t.x, t.y, 15, 0, Math.PI * 2); ctx.fill(); }); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.fillText(`Territorios: ${this.puntuacion}%`, 400, 50); requestAnimationFrame(() => this.gameLoop()); }
}

class Amor4D extends MicaMinigame {
  constructor() { super({ id: 'amor4d', titulo: 'AMOR EN 4D', obra: 'Multidimensional Love', duracion: 60, frases: ["¡Esa dimensión no!", "¡AMOR CUÁNTICO!", "El tiempo es relativo"] }); this.objetivoMax = 10; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo && ['1','2','3','4'].includes(e.key)) this.exito(); }); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; const hue = (Date.now() / 20) % 360; ctx.fillStyle = `hsl(${hue}, 50%, 30%)`; ctx.fillRect(0, 0, 800, 600); ctx.font = '100px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('💕', 400 + Math.sin(Date.now()/200)*50, 300 + Math.cos(Date.now()/300)*50); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.fillText('Pulsa 1-4 para conectar dimensiones', 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

class NoTeDuermasAbuelo extends MicaMinigame {
  constructor() { super({ id: 'abuelo', titulo: 'NO TE DUERMAS ABUELO', obra: 'Viejuno', duracion: 60, frases: ["¡Se duerme!", "¡ABUELO ACTIVO!", "Un ronquido = game over"] }); this.objetivoMax = 60; this.sueno = 0; this.decaimiento = 0.3; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo) { this.sueno = Math.max(0, this.sueno - 20); this.exito(); } }); }
  gameLoop() { if (!this.activo) return; this.sueno += this.decaimiento; if (this.sueno >= 100) { this.fallo(); this.sueno = 50; } const ctx = this.ctx; ctx.fillStyle = '#DEB887'; ctx.fillRect(0, 0, 800, 600); ctx.font = '120px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(this.sueno > 70 ? '😴' : this.sueno > 40 ? '😪' : '👴', 400, 350); ctx.fillStyle = '#8B4513'; ctx.fillRect(200, 500, 400, 30); ctx.fillStyle = this.sueno > 70 ? '#FF0000' : '#FFA500'; ctx.fillRect(200, 500, this.sueno * 4, 30); ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.fillText('¡Pulsa teclas para mantenerlo despierto!', 400, 50); this.puntuacion = this.duracion - this.tiempoRestante; requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// MANAGER DE JUEGOS
// ============================================
class IncredibleCrisisManager {
  constructor() {
    this.juegos = [
      new PelaPatatas(),
      new TetrisSardinas(),
      new RhythmCarcajada(),
      new CarreraAbsurda(),
      new EquilibrioLata(),
      new RecogeLagrimas(),
      new MaquillajeExtremo(),
      new HuyeDelDragon(),
      new BaileSincronizado(),
      new DarLaLata(),
      new EscapeCaja(),
      new CarreraTiempo(),
      new CopiaReflejo(),
      new VueloAmor(),
      new BrillaMas(),
      new PiroposExtremos(),
      new LanzaMonedas(),
      new ContagiaSonrisa(),
      new ConquistaMundo(),
      new Amor4D(),
      new NoTeDuermasAbuelo()
    ];
    
    this.juegoActual = null;
    this.indice = 0;
    this.puntuacionTotal = 0;
  }

  mostrarMenu() {
    const container = document.getElementById('game-container');
    container.innerHTML = `
      <div class="menu-incredible">
        <h1>🎮 MICA CRISIS 🎮</h1>
        <h2>21 Minijuegos Absurdos</h2>
        <div class="menu-grid">
          ${this.juegos.map((j, i) => `
            <button class="menu-btn" data-index="${i}">
              <span class="num">${i + 1}</span>
              <span class="titulo">${j.titulo}</span>
            </button>
          `).join('')}
        </div>
        <button class="play-all-btn">▶️ JUGAR TODOS</button>
      </div>
    `;

    document.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('click', () => this.iniciarJuego(parseInt(btn.dataset.index)));
    });

    document.querySelector('.play-all-btn').addEventListener('click', () => this.modoHistoria());
  }

  iniciarJuego(indice) {
    this.juegoActual = this.juegos[indice];
    this.juegoActual.init('game-container');
    this.juegoActual.start();
  }

  modoHistoria() {
    this.indice = 0;
    this.siguienteJuego();
  }

  siguienteJuego() {
    if (this.indice >= this.juegos.length) {
      this.mostrarResultadoFinal();
      return;
    }
    this.iniciarJuego(this.indice);
    this.indice++;
  }

  mostrarResultadoFinal() {
    const container = document.getElementById('game-container');
    const estrellas = this.juegos.reduce((sum, j) => sum + j.calcularEstrellas(), 0);
    container.innerHTML = `
      <div class="resultado-final">
        <h1>🏆 COMPLETADO 🏆</h1>
        <h2>Estrellas: ${estrellas} / 63</h2>
        <button onclick="location.reload()">VOLVER AL MENÚ</button>
      </div>
    `;
  }
}

// Exportar
window.IncredibleCrisisManager = IncredibleCrisisManager;
window.MicaMinigames = {
  PelaPatatas, TetrisSardinas, RhythmCarcajada, CarreraAbsurda, EquilibrioLata,
  RecogeLagrimas, MaquillajeExtremo, HuyeDelDragon, BaileSincronizado, DarLaLata,
  EscapeCaja, CarreraTiempo, CopiaReflejo, VueloAmor, BrillaMas, PiroposExtremos,
  LanzaMonedas, ContagiaSonrisa, ConquistaMundo, Amor4D, NoTeDuermasAbuelo
};
