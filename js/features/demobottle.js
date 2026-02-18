/**
 * DemoBottle v1.0 — Motor Opaco de Pitching
 * 
 * Genera presentaciones "ciegas" de obra artística.
 * Todo client-side. La selección se serializa en URL params (base64).
 * 
 * @module demobottle
 */

// ═══════════════════════════════════════════
// UTILIDADES CRIPTO
// ═══════════════════════════════════════════

function generateOpaqueId(title) {
  let hash = 0;
  const str = title + Date.now().toString(36);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'DB-' + Math.abs(hash).toString(16).toUpperCase().slice(0, 4).padEnd(4, '0');
}

function generateStableId(title) {
  let hash = 5381;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) + hash) + title.charCodeAt(i);
    hash |= 0;
  }
  return 'DB-' + Math.abs(hash).toString(16).toUpperCase().slice(0, 4).padEnd(4, '0');
}

// ═══════════════════════════════════════════
// SERIALIZACIÓN URL
// ═══════════════════════════════════════════

function encodeBottle(data) {
  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json)));
}

function decodeBottle(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════

export class DemoBottle {
  constructor(containerEl) {
    this.container = containerEl;
    this.catalog = [];
    this.config = null;
    this.selected = new Set();
    this.activePreset = 'galeria';
    this.visibleFields = new Set();
    this.note = '';
    this.searchQuery = '';
    
    this._init();
  }

  async _init() {
    // Verificar si estamos en modo viewer (URL con ?bottle=)
    const params = new URLSearchParams(window.location.search);
    const bottleParam = params.get('bottle');

    if (bottleParam) {
      await this._loadConfig();
      this._renderViewer(bottleParam);
      return;
    }

    // Modo constructor
    await Promise.all([this._loadCatalog(), this._loadConfig()]);
    this._applyPreset(this.activePreset);
    this._renderConstructor();
  }

  async _loadCatalog() {
    try {
      const res = await fetch('/data/works-complete-catalog.json');
      const data = await res.json();
      this.catalog = (data.works || []).map((w, i) => ({
        id: i,
        titulo: w.titulo,
        serie: w.serie_o_categoria || '',
        tecnica: w.tecnica || '',
        ano: w.ano || null,
        imagen: this._resolveImage(w.titulo),
        opaqueId: generateStableId(w.titulo),
      }));
    } catch (err) {
      console.error('[DemoBottle] Error cargando catálogo:', err);
      this.catalog = [];
    }
  }

  async _loadConfig() {
    try {
      const res = await fetch('/data/demobottle-config.json');
      this.config = await res.json();
    } catch {
      // Fallback por defecto
      this.config = {
        presets: {
          blind: {
            label: 'Evaluación Ciega',
            icon: '🫣',
            visible_fields: ['image', 'opaque_id'],
          },
        },
        branding: { footer_text: 'Generado con DemoBottle' },
      };
    }
  }

  _resolveImage(titulo) {
    // Intenta generar slug de imagen basándose en el título
    const slug = titulo
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Intentar múltiples extensiones
    return `/images/${slug}.webp`;
  }

  _applyPreset(presetKey) {
    this.activePreset = presetKey;
    const preset = this.config?.presets?.[presetKey];
    if (preset) {
      this.visibleFields = new Set(preset.visible_fields);
      this.note = '';
    }
  }

  // ═══════════════════════════════════════════
  // RENDERIZADO — CONSTRUCTOR
  // ═══════════════════════════════════════════

  _renderConstructor() {
    this.container.innerHTML = `
      <header class="db-header">
        <h1 class="db-header__title">DemoBottle</h1>
        <p class="db-header__subtitle">Modelo opaco de pitching — evaluación por mérito</p>
      </header>

      <div class="db-constructor">
        <div class="db-catalog">
          <div class="db-search">
            <input 
              type="text" 
              class="db-search__input" 
              placeholder="Buscar obra por título, serie o técnica..." 
              id="db-search"
              aria-label="Buscar obras en el catálogo"
            />
          </div>
          <div class="db-catalog__grid" id="db-grid"></div>
        </div>

        <aside class="db-controls">
          <div>
            <h3 class="db-controls__section-title">Destinatario</h3>
            <div class="db-presets" id="db-presets"></div>
          </div>

          <div>
            <h3 class="db-controls__section-title">Campos visibles</h3>
            <div id="db-fields"></div>
          </div>

          <div>
            <h3 class="db-controls__section-title">Nota de presentación</h3>
            <textarea 
              class="db-note-input" 
              id="db-note" 
              placeholder="${this._getNotePlaceholder()}"
              aria-label="Nota de presentación para el destinatario"
            ></textarea>
          </div>

          <p class="db-counter">
            <span class="db-counter__number" id="db-count">0</span> obras seleccionadas
          </p>

          <button class="db-generate-btn" id="db-generate" disabled>
            Generar DemoBottle
          </button>
        </aside>
      </div>
    `;

    this._renderCatalogGrid();
    this._renderPresets();
    this._renderFieldToggles();
    this._bindEvents();
  }

  _renderCatalogGrid() {
    const grid = this.container.querySelector('#db-grid');
    const filtered = this.searchQuery
      ? this.catalog.filter(w =>
          w.titulo.toLowerCase().includes(this.searchQuery) ||
          w.serie.toLowerCase().includes(this.searchQuery) ||
          w.tecnica.toLowerCase().includes(this.searchQuery)
        )
      : this.catalog;

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="db-empty">
          <div class="db-empty__icon">🍾</div>
          <p class="db-empty__text">No se encontraron obras. Ajusta tu búsqueda.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(w => `
      <div class="db-card ${this.selected.has(w.id) ? 'db-card--selected' : ''}" 
           data-id="${w.id}" 
           role="button" 
           tabindex="0"
           aria-pressed="${this.selected.has(w.id)}"
           aria-label="Seleccionar obra: ${w.titulo}">
        <img 
          class="db-card__img" 
          src="${w.imagen}" 
          alt="${w.titulo}" 
          loading="lazy"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23111%22 width=%221%22 height=%221%22/><text x=%22.5%22 y=%22.55%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%22.15%22>🖼</text></svg>'"
        />
        <div class="db-card__title">${w.titulo}</div>
      </div>
    `).join('');
  }

  _renderPresets() {
    const container = this.container.querySelector('#db-presets');
    const presets = this.config?.presets || {};

    container.innerHTML = Object.entries(presets).map(([key, preset]) => `
      <button 
        class="db-preset-btn ${key === this.activePreset ? 'db-preset-btn--active' : ''}" 
        data-preset="${key}"
        aria-pressed="${key === this.activePreset}"
      >
        ${preset.icon} ${preset.label}
      </button>
    `).join('');
  }

  _renderFieldToggles() {
    const container = this.container.querySelector('#db-fields');
    const configurable = this.config?.opacity_model?.configurable || ['title', 'technique', 'year', 'series'];
    const labels = this.config?.field_labels || {};

    container.innerHTML = configurable.map(field => `
      <div class="db-field-toggle">
        <span class="db-field-toggle__label">${labels[field] || field}</span>
        <label class="db-switch">
          <input type="checkbox" data-field="${field}" ${this.visibleFields.has(field) ? 'checked' : ''} />
          <span class="db-switch__track"></span>
        </label>
      </div>
    `).join('');
  }

  _getNotePlaceholder() {
    const preset = this.config?.presets?.[this.activePreset];
    return preset?.note_placeholder || 'Escribe una nota de presentación...';
  }

  _bindEvents() {
    const grid = this.container.querySelector('#db-grid');
    const searchInput = this.container.querySelector('#db-search');
    const presetsEl = this.container.querySelector('#db-presets');
    const fieldsEl = this.container.querySelector('#db-fields');
    const generateBtn = this.container.querySelector('#db-generate');
    const noteInput = this.container.querySelector('#db-note');

    // Selección de obras
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.db-card');
      if (!card) return;
      const id = parseInt(card.dataset.id, 10);
      this._toggleSelection(id);
    });

    // Teclado en tarjetas
    grid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.db-card');
        if (card) {
          e.preventDefault();
          const id = parseInt(card.dataset.id, 10);
          this._toggleSelection(id);
        }
      }
    });

    // Búsqueda
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this._renderCatalogGrid();
      this._rebindGridEvents();
    });

    // Presets
    presetsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.db-preset-btn');
      if (!btn) return;
      this._applyPreset(btn.dataset.preset);
      this._renderPresets();
      this._renderFieldToggles();
      this._rebindFieldEvents();
      noteInput.placeholder = this._getNotePlaceholder();
    });

    // Fields toggles
    this._rebindFieldEvents();

    // Nota
    noteInput.addEventListener('input', (e) => {
      this.note = e.target.value;
    });

    // Generar
    generateBtn.addEventListener('click', () => {
      this._generateBottle();
    });
  }

  _rebindGridEvents() {
    const grid = this.container.querySelector('#db-grid');
    // Los eventos se manejan por delegación, no necesita re-bind
  }

  _rebindFieldEvents() {
    const fieldsEl = this.container.querySelector('#db-fields');
    fieldsEl.addEventListener('change', (e) => {
      const input = e.target;
      if (!input.dataset.field) return;
      if (input.checked) {
        this.visibleFields.add(input.dataset.field);
      } else {
        this.visibleFields.delete(input.dataset.field);
      }
    });
  }

  _toggleSelection(id) {
    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else {
      this.selected.add(id);
    }
    this._renderCatalogGrid();
    this._updateCounter();
  }

  _updateCounter() {
    const countEl = this.container.querySelector('#db-count');
    const generateBtn = this.container.querySelector('#db-generate');
    countEl.textContent = this.selected.size;
    generateBtn.disabled = this.selected.size === 0;
  }

  // ═══════════════════════════════════════════
  // GENERACIÓN DE BOTTLE
  // ═══════════════════════════════════════════

  _generateBottle() {
    const selectedWorks = this.catalog.filter(w => this.selected.has(w.id));

    const bottleData = {
      v: 1,
      preset: this.activePreset,
      fields: [...this.visibleFields],
      note: this.note || null,
      works: selectedWorks.map(w => ({
        oid: w.opaqueId,
        t: this.visibleFields.has('title') ? w.titulo : null,
        tc: this.visibleFields.has('technique') ? w.tecnica : null,
        y: this.visibleFields.has('year') ? w.ano : null,
        s: this.visibleFields.has('series') ? w.serie : null,
        img: w.imagen,
      })),
    };

    const encoded = encodeBottle(bottleData);
    const viewerUrl = `${window.location.origin}${window.location.pathname}?bottle=${encoded}`;

    this._showPreview(bottleData, viewerUrl);
  }

  // ═══════════════════════════════════════════
  // PREVIEW MODAL
  // ═══════════════════════════════════════════

  _showPreview(bottleData, viewerUrl) {
    const overlay = document.createElement('div');
    overlay.className = 'db-preview-overlay';
    overlay.innerHTML = `
      <div class="db-preview-toolbar">
        <span style="color: var(--white-muted, #a3a3a3); font-size: 0.875rem;">
          Vista previa — así lo verá el destinatario
        </span>
        <div class="db-preview-toolbar__actions">
          <button class="db-toolbar-btn" id="db-copy-link" title="Copiar enlace">
            📋 Copiar enlace
          </button>
          <button class="db-toolbar-btn" id="db-print" title="Exportar PDF">
            🖨 Exportar PDF
          </button>
          <button class="db-toolbar-btn db-toolbar-btn--primary" id="db-close-preview">
            ✕ Cerrar
          </button>
        </div>
      </div>
      <div class="db-viewer" id="db-preview-content">
        ${this._renderViewerContent(bottleData)}
      </div>
    `;

    document.body.appendChild(overlay);

    // Eventos
    overlay.querySelector('#db-close-preview').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.querySelector('#db-copy-link').addEventListener('click', () => {
      navigator.clipboard.writeText(viewerUrl).then(() => {
        const btn = overlay.querySelector('#db-copy-link');
        btn.textContent = '✅ Copiado';
        setTimeout(() => { btn.textContent = '📋 Copiar enlace'; }, 2000);
      });
    });

    overlay.querySelector('#db-print').addEventListener('click', () => {
      window.print();
    });

    // ESC para cerrar
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // ═══════════════════════════════════════════
  // RENDERIZADO — VIEWER
  // ═══════════════════════════════════════════

  _renderViewer(encodedData) {
    const data = decodeBottle(encodedData);

    if (!data) {
      this.container.innerHTML = `
        <div class="db-app">
          <div class="db-empty" style="min-height: 100vh">
            <div class="db-empty__icon">🍾</div>
            <p class="db-empty__text">Este enlace DemoBottle no es válido o ha expirado.</p>
          </div>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="db-viewer">
        ${this._renderViewerContent(data)}
      </div>
    `;
  }

  _renderViewerContent(data) {
    const noteHtml = data.note 
      ? `<div class="db-viewer__note">${this._escapeHtml(data.note)}</div>` 
      : '';

    const worksHtml = (data.works || []).map(w => `
      <article class="db-viewer-card">
        <img 
          class="db-viewer-card__img" 
          src="${w.img}" 
          alt="${w.t || 'Obra'}" 
          loading="lazy"
          onerror="this.style.background='#111'; this.style.minHeight='200px';"
        />
        <div class="db-viewer-card__body">
          <div class="db-viewer-card__id">${w.oid}</div>
          ${w.t ? `<h3 class="db-viewer-card__title">${this._escapeHtml(w.t)}</h3>` : ''}
          <div class="db-viewer-card__meta">
            ${w.tc ? `<span>${this._escapeHtml(w.tc)}</span>` : ''}
            ${w.y ? `<span>${w.y}</span>` : ''}
            ${w.s ? `<span>${this._escapeHtml(w.s)}</span>` : ''}
          </div>
        </div>
      </article>
    `).join('');

    const footerText = this.config?.branding?.footer_text || 'Generado con DemoBottle — Evaluación por mérito';

    return `
      <header class="db-viewer__header">
        <div class="db-viewer__logo">DemoBottle</div>
        <p class="db-viewer__tagline">Evaluación por mérito · ${data.works?.length || 0} obra${(data.works?.length || 0) !== 1 ? 's' : ''}</p>
      </header>
      ${noteHtml}
      <div class="db-viewer__grid">
        ${worksHtml}
      </div>
      <footer class="db-viewer__footer">
        <p class="db-viewer__footer-text">${footerText}</p>
      </footer>
    `;
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
