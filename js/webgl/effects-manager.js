/**
 * WebGL Effects Manager para Naroa Gallery
 * Orquesta todos los efectos WebGL de forma modular
 */

import { ParallaxDepthShader } from './parallax-depth.js';
import { LiquidTransition } from './liquid-transition.js';
import { NoiseBackground } from './noise-background.js';
import { FilmGrainEffect } from './film-grain.js';

export class WebGLEffectsManager {
  constructor() {
    this.effects = {
      parallax: null,
      liquid: null,
      noise: null,
      grain: null
    };
    
    this.enabled = {
      parallax: true,
      liquid: true,
      noise: false,  // DESACTIVADO - causa parpadeo
      grain: false  // Desactivado - causa parpadeo
    };
    
    this.canvas = null;
    this.initialized = false;
  }

  /**
   * Inicializa todos los efectos WebGL
   * @param {HTMLCanvasElement} canvas - Canvas principal
   * @param {Object} options - Configuración inicial
   */
  async init(canvas, options = {}) {
    if (!canvas || this.initialized) return;
    
    this.canvas = canvas;
    
    // Inicializar efectos habilitados
    if (this.enabled.parallax) {
      this.effects.parallax = new ParallaxDepthShader();
      await this.effects.parallax.init(canvas);
    }
    
    if (this.enabled.liquid) {
      this.effects.liquid = new LiquidTransition();
      await this.effects.liquid.init(canvas);
    }
    
    if (this.enabled.noise) {
      this.effects.noise = new NoiseBackground();
      const colorA = options.noiseColorA || [0.1, 0.1, 0.15]; // Dark
      const colorB = options.noiseColorB || [0.2, 0.15, 0.2];  // Subtle purple
      await this.effects.noise.init(canvas, colorA, colorB);
    }
    
    if (this.enabled.grain) {
      this.effects.grain = new FilmGrainEffect();
      await this.effects.grain.init(canvas);
    }
    
    this.initialized = true;
    this.startAnimationLoop();
  }

  /**
   * Loop de animación principal
   */
  startAnimationLoop() {
    let lastTime = performance.now();
    
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Update all active effects
      if (this.effects.parallax) this.effects.parallax.update(deltaTime);
      if (this.effects.liquid) this.effects.liquid.update();
      if (this.effects.noise) this.effects.noise.update();
      if (this.effects.grain) this.effects.grain.update();
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Activa transición líquida entre imágenes
   */
  async transitionImage(fromImage, toImage, duration = 1500) {
    if (this.effects.liquid) {
      return this.effects.liquid.transition(fromImage, toImage, duration);
    }
  }

  /**
   * Actualiza profundidad de parallax para una capa
   */
  setParallaxDepth(layer, depth) {
    if (this.effects.parallax) {
      this.effects.parallax.setDepth(layer, depth);
    }
  }

  /**
   * Ajusta intensidad del grain
   */
  setGrainIntensity(intensity) {
    if (this.effects.grain) {
      this.effects.grain.setIntensity(intensity);
    }
  }

  /**
   * Cambia colores del fondo de ruido
   */
  setNoiseColors(colorA, colorB) {
    if (this.effects.noise) {
      this.effects.noise.setColors(colorA, colorB);
    }
  }

  /**
   * Habilita/deshabilita efectos individuales
   */
  toggleEffect(effectName, enabled) {
    this.enabled[effectName] = enabled;
  }

  /**
   * Cleanup de recursos WebGL
   */
  dispose() {
    Object.values(this.effects).forEach(effect => {
      if (effect && effect.dispose) effect.dispose();
    });
    this.initialized = false;
  }
}

// Export singleton
export const webglEffects = new WebGLEffectsManager();
