/**
 * Game Asset Manager - Carga Progresiva por Fases para los 21 Juegos
 */

class GameAssetManager {
  constructor(gameId) {
    this.gameId = gameId;
    this.loaded = 0;
    this.total = 0;
    this.assets = {};
    this.priorityQueue = [];
  }

  async loadPhase(phase) {
    const assets = this.getAssetsForPhase(phase);
    const currentMood = window.MICA?.currentMood || 'NEUTRAL';
    const quality = currentMood === 'TIRED' ? 'low' : 'high';
    
    const promises = assets.map(asset => 
      window.MediaEngine?.loadImage(asset, { 
        gameId: this.gameId, 
        quality,
        emotional: phase === 'polish'
      }) || Promise.resolve(asset)
    );
    
    const results = await Promise.all(promises);
    
    assets.forEach((asset, i) => {
      const key = asset.split('/').pop().replace(/\.\w+$/, '');
      this.assets[key] = results[i];
    });
    
    return results;
  }

  getAssetsForPhase(phase) {
    const gameAssets = {
      'espejo-digital': {
        critical: ['/images/optimized/espejos-del-alma.webp'],
        gameplay: ['/images/ui/mirror-frame.webp', '/images/ui/emotion-meter.webp'],
        polish: ['/images/effects/sparkle.webp', '/images/effects/reflection.webp']
      },
      'termometro-alma': {
        critical: ['/images/optimized/lagrimas-de-oro.webp'],
        gameplay: ['/images/ui/thermometer.webp', '/images/ui/scale.webp'],
        polish: ['/images/effects/particles.webp']
      },
      'caminata-zen': {
        critical: ['/images/optimized/denbora-nora-zoaz.webp'],
        gameplay: ['/images/ui/path.webp', '/images/ui/footsteps.webp'],
        polish: ['/images/effects/zen-particles.webp']
      },
      'sinapsis-viva': {
        critical: ['/images/optimized/multidimensional-love.webp'],
        gameplay: ['/images/ui/neurons.webp', '/images/ui/connections.webp'],
        polish: ['/images/effects/synapse.webp']
      },
      'alquimia-emocional': {
        critical: ['/images/optimized/la-pensadora.webp'],
        gameplay: ['/images/ui/potions.webp', '/images/ui/cauldron.webp'],
        polish: ['/images/effects/magic.webp']
      },
      'flow-state': {
        critical: ['/images/optimized/james-rocks-hq-3.webp'],
        gameplay: ['/images/ui/timer.webp', '/images/ui/focus-ring.webp'],
        polish: ['/images/effects/flow-aura.webp']
      },
      'sombra-digital': {
        critical: ['/images/optimized/baroque-farrokh.webp'],
        gameplay: ['/images/ui/shadow-frame.webp', '/images/ui/mirror-dark.webp'],
        polish: ['/images/effects/dark-particles.webp']
      },
      'tribu-digital': {
        critical: ['/images/optimized/walking-gallery-plumas.webp'],
        gameplay: ['/images/ui/tribe-icons.webp', '/images/ui/campfire.webp'],
        polish: ['/images/effects/tribe-glow.webp']
      },
      'legado-cosmico': {
        critical: ['/images/optimized/the-world-is-yours.webp'],
        gameplay: ['/images/ui/star-map.webp', '/images/ui/constellation.webp'],
        polish: ['/images/effects/cosmic-dust.webp']
      },
      'mandala-existencia': {
        critical: ['/images/optimized/the-golden-couple-and-balloons.webp'],
        gameplay: ['/images/ui/mandala-base.webp', '/images/ui/segments.webp'],
        polish: ['/images/effects/mandala-glow.webp']
      },
      'mentoria-inversa': {
        critical: ['/images/optimized/smile-world-smiles-back.webp'],
        gameplay: ['/images/ui/mentor-badge.webp', '/images/ui/crown.webp'],
        polish: ['/images/effects/graduation.webp']
      }
    };
    
    return gameAssets[this.gameId]?.[phase] || [];
  }

  getAsset(key) {
    return this.assets[key];
  }

  preloadAll() {
    return Promise.all([
      this.loadPhase('critical'),
      this.loadPhase('gameplay'),
      this.loadPhase('polish')
    ]);
  }
}

// Export
if (typeof window !== 'undefined') window.GameAssetManager = GameAssetManager;
export default GameAssetManager;
