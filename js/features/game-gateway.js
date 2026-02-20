/**
 * Game Gateway — Proxy Entry Point
 * Palette: gold (#d4af37), red (#ff003c), black
 */

import { gameGateway } from './game-gateway-new.js';

// Auto-init for backward compatibility
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => gameGateway.init());
} else {
    gameGateway.init();
}

window.GameGateway = gameGateway;
