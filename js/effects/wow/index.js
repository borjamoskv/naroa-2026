/**
 * ═══════════════════════════════════════════════════════════════
 * 10 WOW EFFECTS — ORQUESTADOR MODULAR
 * Lazy, respectful, progressive initialization.
 * ═══════════════════════════════════════════════════════════════
 */

import { BreathSync } from './breath-sync.js';
import { ChromaticAberration } from './chromatic-aberration.js';
import { AmbientLightBleed } from './ambient-light.js';
import { TextErosion } from './text-erosion.js';
import { PersistenceOfVision } from './persistence-of-vision.js';
import { PetrichorMood } from './petrichor-mood.js';
import { SerendipityEngine } from './serendipity-engine.js';
import { OrganicMorphism } from './organic-morphism.js';
import { DepthOfField } from './depth-of-field.js';
import { TemporalShift } from './temporal-shift.js';

function initAll() {
  // Immediate (no DOM dependency)
  TemporalShift.init();
  BreathSync.init();

  // After first paint
  requestAnimationFrame(() => {
    TextErosion.init();
    ChromaticAberration.init();
    OrganicMorphism.init();
    DepthOfField.init();
    AmbientLightBleed.init();
    PersistenceOfVision.init();
  });

  // Async APIs (non-blocking)
  PetrichorMood.init();
  SerendipityEngine.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

// Export for MICA integration
window.WOW10Stars = {
  BreathSync, ChromaticAberration, AmbientLightBleed, TextErosion,
  PersistenceOfVision, PetrichorMood, SerendipityEngine, OrganicMorphism,
  DepthOfField, TemporalShift
};

export {
  BreathSync, ChromaticAberration, AmbientLightBleed, TextErosion,
  PersistenceOfVision, PetrichorMood, SerendipityEngine, OrganicMorphism,
  DepthOfField, TemporalShift
};
