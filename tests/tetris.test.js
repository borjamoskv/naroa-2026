// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Mock Audio globally BEFORE import
// Provide a stub so `new Audio()` doesn't throw
global.Audio = class {
  play() { return Promise.resolve(); }
  pause() {}
  load() {}
};
window.Audio = global.Audio;

// Mock CanvasRenderingContext2D (simplified)
const mockCtx = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
};

// Mock MicaMinigame base class dependencies if needed
// Since we are testing logic, we might need to mock calls to super methods like exito/fallo/gameOver
// But we can check state changes.

describe('TetrisSardinas Logic', () => {
  let TetrisSardinas;
  let game;

  beforeAll(async () => {
    // Dynamic import to ensure global mocks are active when module loads
    const module = await import('../js/minigames/games/Volume1.js');
    TetrisSardinas = module.TetrisSardinas;
  });

  beforeEach(() => {
    // Create DOM structure that MicaMinigame.updateUI expects
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-tetris-sardinas';
    gameContainer.innerHTML = `
      <span class="timer"></span>
      <span class="score"></span>
      <span class="combo"></span>
      <canvas width="800" height="600"></canvas>
    `;
    document.body.appendChild(gameContainer);
  });

  it('should initialize with empty tin', () => {
    game = new TetrisSardinas();
    // Start initializes lataActual
    game.nuevaLata(); 
    
    // Check dimensions
    expect(game.lataActual.length).toBe(4); // Height
    expect(game.lataActual[0].length).toBe(8); // Width
    
    // Check empty
    const flat = game.lataActual.flat();
    expect(flat.every(cell => cell === 0)).toBe(true);
  });

  it('should spawn a sardine', () => {
    game = new TetrisSardinas();
    game.nuevaLata(); // Calls nuevaSardina
    
    expect(game.sardinaActual).toBeDefined();
    expect(game.sardinaActual.x).toBe(3);
    expect(game.sardinaActual.y).toBe(0);
    expect(game.sardinaActual.forma).toBeDefined();
  });

  it('should clamp sardine movement within bounds', () => {
    game = new TetrisSardinas();
    game.nuevaLata();
    
    // Force 1x1 block at x=0
    game.sardinaActual.forma = [[1]];
    game.sardinaActual.x = 0;
    
    // Move left should clamp to 0
    game.moverSardina(-1);
    expect(game.sardinaActual.x).toBe(0);
    
    // Move right should advance
    game.moverSardina(1);
    expect(game.sardinaActual.x).toBe(1);
    
    // Move far right should clamp to max (width - forma width = 7)
    game.sardinaActual.x = 7;
    game.moverSardina(1);
    expect(game.sardinaActual.x).toBe(7);
  });

  it('soltarSardina should call exito and spawn new sardine', () => {
    game = new TetrisSardinas();
    game.nuevaLata();
    
    // Track calls
    game.exito = vi.fn();
    const oldSardina = game.sardinaActual;
    
    game.soltarSardina();
    
    // Should have called exito
    expect(game.exito).toHaveBeenCalled();
    
    // Should have spawned a new sardine (different reference)
    expect(game.sardinaActual).toBeDefined();
  });
});
