/**
 * NAROA 2026 - Vite Entry Point
 * Consolidated imports for optimized bundling
 * 
 * IA Alliance: Este archivo fue preparado por Antigravity (Arquitecto)
 * Kimi debe convertir los scripts síncronos en imports ES modules
 */

// =============================================================================
// CORE (Critical Path - Load First)
// =============================================================================
import './js/core/router.js';
import './js/core/ranking-system.js';
import './js/core/app.js';
import './js/core/soty-effects.js';
import './js/core/arcade-leaderboard.js';

// =============================================================================
// FEATURES (Gallery, Lightbox, etc.)
// =============================================================================
import './js/features/gallery.js';
import './js/features/lightbox.js';
import './js/features/blog-engine.js';
import './js/features/mica.js';
import './js/features/gallery-disruptive.js';
import './js/features/scroll-to-top.js';
import './js/features/video-showcase.js';
import './js/features/intro.js';

// =============================================================================
// EFFECTS (WOW Effects - SOTY 2026)
// =============================================================================
import './js/effects/kinetic-text.js';
import './js/effects/magnetic-button.js';
import './js/effects/reveal-observer.js';
import './js/effects/cursor-trail.js';
import './js/effects/eyes-follow.js';
import './js/effects/clima-palette.js';
import './js/effects/wave-background.js';
import './js/effects/organic-particles.js';
import './js/effects/palindrome-hero.js';

// =============================================================================
// AUDIO ENGINE (Immersive 3D Spatial Audio)
// =============================================================================
import './js/audio/audio-synth.js';
import './js/audio/immersive-audio.js';
import './js/audio/audio-hooks.js';
import './js/audio/audio-visual-sync.js';

// =============================================================================
// GAMES (Deferred - Lazy loaded when needed)
// =============================================================================
// TODO: Kimi - Convert these to dynamic imports for code splitting
// Example: const OcaGame = () => import('./js/features/oca-game.js');
import './js/features/oca-game.js';
import './js/features/tetris-game.js';
import './js/features/memory-game.js';
import './js/features/puzzle-game.js';
import './js/features/snake-game.js';
import './js/features/breakout-game.js';
import './js/features/whack-game.js';
import './js/features/simon-game.js';
import './js/features/quiz-game.js';
import './js/features/catch-game.js';
import './js/features/collage-game.js';
import './js/features/reinas-game.js';
import './js/features/mica-game.js';
import './js/features/kintsugi-game.js';
import './js/features/pong-game.js';
import './js/features/reaction-game.js';
import './js/features/typing-game.js';
import './js/features/chess-game.js';
import './js/features/checkers-game.js';
import './js/features/connect4-game.js';
import './js/features/reversi-game.js';

// =============================================================================
// UTILITIES & MISC
// =============================================================================
import './js/mica-cursor.js';
import './js/spotify-rotator.js';
import './js/naroa-cursor-variants.js';

// =============================================================================
// CSS (Vite will bundle automatically)
// =============================================================================
import './css/reset.css';
import './css/variables.css';
import './css/naroa-palette.css';
import './css/typography-2026.css';
import './css/base.css';
import './css/layout.css';
import './css/components.css';
import './css/gallery.css';
import './css/animations.css';
import './css/soty-effects.css';
import './css/mica.css';
import './css/wow-effects.css';
import './css/oca-game.css';
import './css/tetris-game.css';
import './css/games-hub.css';
import './css/arcade-leaderboard.css';
import './css/about-contact.css';
import './css/audio-controls.css';
import './css/audio-reactive.css';
import './css/gallery-disruptive.css';
import './css/scroll-to-top.css';
import './css/video-showcase.css';

// Init cursor variant on load
document.addEventListener('DOMContentLoaded', () => {
  if (window.NaroaCursors) {
    window.NaroaCursors.setVariant('gallery_spotlight');
  }
});

console.log('🎨 Naroa 2026 - Vite Bundle Loaded');
