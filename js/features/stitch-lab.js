/**
 * Stitch Lab — Hidden AI UI Generator
 * Triggered by 5 rapid clicks on the footer "NGG" logo
 * Uses StitchService to generate UI from text prompts
 * @version 1.0.0
 */

import stitchService from '../services/stitch-service.js';

(function initStitchLab() {
  const CLICK_THRESHOLD = 5;
  const CLICK_WINDOW_MS = 2000;
  let clickTimestamps = [];
  let labActive = false;

  document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.footer__logo');
    if (!logo) return;

    logo.addEventListener('click', (e) => {
      const now = Date.now();
      clickTimestamps.push(now);

      // Keep only clicks within the time window
      clickTimestamps = clickTimestamps.filter(t => now - t < CLICK_WINDOW_MS);

      if (clickTimestamps.length >= CLICK_THRESHOLD) {
        clickTimestamps = [];
        e.preventDefault();
        openStitchLab();
      }
    });
  });

  async function openStitchLab() {
    if (labActive) return;
    labActive = true;

    // Initialize service if not yet done
    if (!stitchService.initialized) {
      await stitchService.init();
    }

    const status = stitchService.initialized
      ? '🟢 API conectada'
      : '🟡 Modo mock (sin API key)';

    const prompt = window.prompt(
      `✨ STITCH LAB — Generador de UI con IA\n${status}\n\nDescribe la interfaz que quieres generar:`
    );

    if (!prompt || !prompt.trim()) {
      labActive = false;
      return;
    }

    console.log(`🧵 Stitch Lab: Generating UI for "${prompt}"...`);

    try {
      const result = await stitchService.generateUI(prompt.trim(), {
        style: 'modern-dark',
        colorScheme: {
          background: '#0a0a0a',
          accent: '#39ff14',
          cta: '#d4af37',
          text: '#fefefe'
        }
      });

      console.log('🧵 Stitch Lab Result:', result);

      if (result.mock) {
        showToast('🧵 Stitch Lab (mock): Resultado en consola', 'info');
      } else {
        showToast('✅ UI generada con Stitch API', 'success');
      }
    } catch (err) {
      console.error('🧵 Stitch Lab Error:', err);
      showToast('❌ Error generando UI', 'error');
    } finally {
      labActive = false;
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#fff',
      zIndex: '99999',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      background: type === 'success'
        ? 'rgba(57,255,20,0.15)'
        : type === 'error'
          ? 'rgba(255,50,50,0.15)'
          : 'rgba(255,255,255,0.08)',
      opacity: '0',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
})();
