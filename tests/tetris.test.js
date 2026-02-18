// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Mock Audio globally BEFORE import
// Force fallback by removing Audio
delete global.Audio;
delete window.Audio;

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
    // We need to mock the canvas element since the constructor might try to getContext?
    // Checking the constructor... it calls super.
    // Super constructor usually finds 'game-container' or creates canvas.
    // Let's rely on JSDOM to provide document.createElement('canvas').
    
    // However, MicaMinigame base class is not exported well or might have DOM dependencies.
    // Let's assume for now we can instantiate it or we need to mock global document methods more if it fails.
    
    // WORKAROUND: The file import might fail if MicaMinigame is not defined or imported.
    // It extends MicaMinigame. We need to make sure MicaMinigame is available.
    // The provided file content didn't show MicaMinigame definition, it likely assumes it's global or imported earlier.
    // Step 280 showed `class TetrisSardinas extends MicaMinigame`.
    // We need to see where MicaMinigame is defined. It wasn't in the grep for TODOs.
    // It's likely at the top of incredible-crisis-games.js.
  });

  // Since we are importing the file, and the file has `class TetrisSardinas extends MicaMinigame`,
  // valid JS requires MicaMinigame to be defined in that scope.
  // If it's defined in the same file but not exported, the import might work if it's top-level.
  // Let's assume it works for now.

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

  it('should detect valid moves', () => {
    game = new TetrisSardinas();
    game.nuevaLata();
    
    // Force a specific shape for deterministic testing: 1x1 block
    game.sardinaActual.forma = [[1]];
    game.sardinaActual.x = 0;
    game.sardinaActual.y = 0;
    
    // Move within bounds
    expect(game.isValidMove(1, 0, game.sardinaActual.forma)).toBe(true);
    
    // Move out of bounds (left)
    expect(game.isValidMove(-1, 0, game.sardinaActual.forma)).toBe(false);
    
    // Move out of bounds (right)
    expect(game.isValidMove(8, 0, game.sardinaActual.forma)).toBe(false); // Width is 8, index 8 is out
    
    // Move out of bounds (down)
    expect(game.isValidMove(0, 4, game.sardinaActual.forma)).toBe(false); // Height is 4
  });

  it('should lock sardine on drop', () => {
    game = new TetrisSardinas();
    game.nuevaLata();
    
    // Mock checkLines and gameOver to verify calls
    game.checkLines = vi.fn();
    game.gameOver = vi.fn();
    game.nuevaSardina = vi.fn(); // Prevent spawning new one for this test
    
    // 1x1 block at top
    game.sardinaActual = {
      forma: [[1]],
      x: 0,
      y: 0
    };
    
    // Drop
    game.soltarSardina();
    
    // Should be at bottom (y=3 because height is 4)
    expect(game.sardinaActual.y).toBe(3);
    
    // Should be locked in lataActual
    expect(game.lataActual[3][0]).toBe(1);
    
    // Should call checkLines
    expect(game.checkLines).toHaveBeenCalled();
  });
});
