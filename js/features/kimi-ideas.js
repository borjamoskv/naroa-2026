/**
 * Kimi Ideas — Feature #10: Modo Coleccionista (Collector Mode)
 * Toggles body.collector class to reveal technical specs on artwork cards
 * and stabilize breathing price animations.
 * 
 * @module features/kimi-ideas
 * @version 1.0.0
 */
(function () {
  'use strict';

  // ─── Create toggle button ───────────────────────────────
  function createCollectorToggle() {
    // Avoid duplicates
    if (document.querySelector('.collector-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'collector-toggle';
    btn.setAttribute('aria-label', 'Activar modo coleccionista');
    btn.setAttribute('title', 'Modo Coleccionista — muestra fichas técnicas');
    btn.innerHTML = `
      <span class="collector-toggle__icon">🔍</span>
      <span>COLLECTOR</span>
    `;

    // Restore saved preference
    const saved = localStorage.getItem('naroa-collector-mode');
    if (saved === 'on') {
      document.body.classList.add('collector');
      btn.setAttribute('aria-pressed', 'true');
    }

    btn.addEventListener('click', () => {
      const isActive = document.body.classList.toggle('collector');
      btn.setAttribute('aria-pressed', String(isActive));
      localStorage.setItem('naroa-collector-mode', isActive ? 'on' : 'off');

      // Inject tech specs into visible artwork cards if not already present
      if (isActive) injectTechSpecs();
    });

    document.body.appendChild(btn);

    // If was saved as active, also inject specs
    if (saved === 'on') {
      // Wait for gallery to render
      setTimeout(injectTechSpecs, 1500);
    }
  }

  // ─── Inject tech-specs into gallery cards ───────────────
  function injectTechSpecs() {
    const cards = document.querySelectorAll('.stitch-card, .rock-panel');

    cards.forEach(card => {
      // Skip if already has specs
      if (card.querySelector('.tech-specs')) return;

      // Extract data from existing card content
      const title = card.querySelector('.stitch-title, .rock-panel__name');
      const technique = card.querySelector('.stitch-subtitle span, .rock-panel__technique');
      const yearBadge = card.querySelector('.stitch-badge');
      const category = card.dataset.category || '';

      if (!title) return;

      const specs = document.createElement('div');
      specs.className = 'tech-specs';

      // Build spec lines from available data
      const lines = [];
      if (technique?.textContent) lines.push(`Técnica: ${technique.textContent.trim()}`);
      if (yearBadge?.textContent) lines.push(`Año: ${yearBadge.textContent.trim()}`);
      if (category) lines.push(`Serie: ${formatCategory(category)}`);
      lines.push(`Soporte: Original único`);

      specs.innerHTML = lines.join('<br>');

      // Insert after the content block
      const contentBlock = card.querySelector('.stitch-content, .rock-panel__info');
      if (contentBlock) {
        contentBlock.appendChild(specs);
      }
    });

    // Also inject into rock panels
    document.querySelectorAll('.rock-panel').forEach(panel => {
      if (panel.querySelector('.tech-specs')) return;

      const name = panel.querySelector('.rock-panel__name')?.textContent || '';
      const technique = panel.querySelector('.rock-panel__technique')?.textContent || '';

      const specs = document.createElement('div');
      specs.className = 'tech-specs';
      specs.innerHTML = [
        `Técnica: ${technique}`,
        `Serie: Rocks (Pizarra Natural)`,
        `Período: 2023–2025`,
        `Soporte: Pizarra natural`
      ].join('<br>');

      panel.querySelector('.rock-panel__info')?.appendChild(specs);
    });
  }

  // ─── Format category ID to readable name ────────────────
  function formatCategory(cat) {
    const names = {
      'rocks': 'Rocks',
      'tributos-musicales': 'Tributos Musicales',
      'espejos-del-alma': 'Espejos del Alma',
      'enlatas': 'En.lata.das',
      'golden': 'Golden Series',
      'retratos': 'Retratos',
      'naturaleza': 'Naturaleza',
      'amor': 'Amor'
    };
    return names[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // ─── Observe gallery for new cards (dynamic loading) ────
  function observeGallery() {
    const grid = document.getElementById('archivo-grid');
    if (!grid) return;

    const observer = new MutationObserver(() => {
      if (document.body.classList.contains('collector')) {
        injectTechSpecs();
      }
    });

    observer.observe(grid, { childList: true });
  }

  // ─── Init ───────────────────────────────────────────────
  function init() {
    createCollectorToggle();
    observeGallery();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
