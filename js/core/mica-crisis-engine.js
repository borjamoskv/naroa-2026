/**
 * MICA CRISIS ENGINE - Entry Point
 * Refactored for modularity.
 */

import { MicaCrisisEngine } from './mica/engine.js';

export const micaCrisis = new MicaCrisisEngine();
micaCrisis.init();

// Maintain global exposure if needed by legacy parts
window.micaCrisis = micaCrisis;
