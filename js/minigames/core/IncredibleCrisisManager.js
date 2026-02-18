import { PelaPatatas, TetrisSardinas, RhythmCarcajada, CarreraAbsurda, EquilibrioLata, RecogeLagrimas, MaquillajeExtremo, HuyeDelDragon, BaileSincronizado, DarLaLata } from '../games/Volume1.js';
import { EscapeCaja, CarreraTiempo, CopiaReflejo, VueloAmor, BrillaMas, PiroposExtremos, LanzaMonedas, ContagiaSonrisa, ConquistaMundo, Amor4D, NoTeDuermasAbuelo } from '../games/Volume2.js';

/**
 * MANAGER DE LA IMPRESIONANTE CRISIS DE MICA
 * Orquesta la secuencia de 21 minijuegos absurdos.
 */
export class IncredibleCrisisManager {
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
    if (!container) return;
    
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
      btn.addEventListener('click', () => this.iniciarJuego(Number.parseInt(btn.dataset.index)));
    });

    const playAllBtn = document.querySelector('.play-all-btn');
    if (playAllBtn) {
      playAllBtn.addEventListener('click', () => this.modoHistoria());
    }
  }

  iniciarJuego(indice) {
    if (indice < 0 || indice >= this.juegos.length) return;
    
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
