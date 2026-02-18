import { IncredibleCrisisManager } from './core/IncredibleCrisisManager.js';
import { MicaMinigame } from './core/MicaMinigame.js';
import * as Vol1 from './games/Volume1.js';
import * as Vol2 from './games/Volume2.js';

// Exponer al scope global para compatibilidad con mica-crisis.html
// y para debugging en consola consola.
globalThis.IncredibleCrisisManager = IncredibleCrisisManager;
globalThis.MicaMinigame = MicaMinigame;

// Exponer todos los juegos en un objeto global (Legacy Support)
globalThis.MicaMinigames = {
  ...Vol1,
  ...Vol2
};

console.log('🎮 Mica Crisis: Módulos cargados correctamente [Sovereign Architecture]');
