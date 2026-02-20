/**
 * Soul Console - Integrates NotebookLM 'Persona' Database into the UI
 * Reads from data/ia-soul-persona.json
 */
class SoulConsole {
  constructor() {
    this.dataSource = 'data/ia-soul-persona.json';
    this.data = null;
    this.isActive = false;
    this.init();
  }

  async init() {
    // Inject Toggle Button
    if (!document.querySelector('.soul-toggle')) {
      const btn = document.createElement('button');
      btn.className = 'soul-toggle';
      btn.innerHTML = '🧬'; // DNA/Soul icon
      btn.title = 'Open Soul Console (NotebookLM)';
      btn.onclick = () => this.toggle();
      document.body.appendChild(btn);
    }

    // Inject Panel
    if (!document.querySelector('.soul-panel')) {
      const panel = document.createElement('div');
      panel.className = 'soul-panel';
      panel.innerHTML = `
        <header class="soul-header">
          <span class="soul-title">Soul <span>Console</span></span>
          <button class="soul-close" onclick="document.querySelector('.soul-panel').classList.remove('active')">×</button>
        </header>
        <div class="soul-content" id="soul-content">
          <div class="soul-loading">Initializing Neural Link...</div>
        </div>
      `;
      document.body.appendChild(panel);
    }

    // Load Data
    try {
      const response = await fetch(this.dataSource);
      this.data = await response.json();
      this.render();
      
      // Check for access rights (URL param or secret code)
      this.setupAccessControl();
      
    } catch (e) {
      Logger.error('Soul Link Failed:', e);
      document.getElementById('soul-content').innerHTML = `<div class="error">Connection Lost: ${e.message}</div>`;
    }
  }

  setupAccessControl() {
    // 1. URL Parameter: ?soul=1
    const params = new URLSearchParams(window.location.search);
    if (params.has('soul')) {
      this.revealAccess();
    }

    // 2. Secret Code: Type 'soul'
    let buffer = '';
    const secret = 'soul';
    window.addEventListener('keydown', (e) => {
      // Ignore if typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      buffer += e.key.toLowerCase();
      if (buffer.length > 20) buffer = buffer.slice(-10); // Keep buffer small
      
      if (buffer.endsWith(secret)) {
        this.revealAccess();
        buffer = ''; // Reset
      }
    });
  }

  revealAccess() {
    const btn = document.querySelector('.soul-toggle');
    if (btn && btn.style.display !== 'flex') {
      btn.style.display = 'flex';
      btn.animate([
        { transform: 'scale(0) rotate(-180deg)', opacity: 0 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      });
      // Sound effect if available
      if (window.AudioSynth) window.AudioSynth.playTone?.(440, 'sine', 0.1);
    }
  }

  toggle() {
    const panel = document.querySelector('.soul-panel');
    panel.classList.toggle('active');
    this.isActive = panel.classList.contains('active');
  }

  render() {
    const container = document.getElementById('soul-content');
    if (!this.data) return;

    const { identity, mission, manifesto, voice, alchemy } = this.data;

    let html = '';

    // 1. Identity Matrix
    html += `
      <section class="soul-section">
        <h3>Identity Matrix</h3>
        <div class="soul-data-row">
          <span class="soul-key">Role:</span>
          <span class="soul-value">${identity.role}</span>
        </div>
        <div class="soul-data-row">
          <span class="soul-key">Essence:</span>
          <span class="soul-value">"${identity.essence}"</span>
        </div>
        <div class="soul-tag-cloud">
          ${identity.personas.map(p => `<span class="soul-tag">${p}</span>`).join('')}
        </div>
      </section>
    `;

    // 2. Manifesto Pillars (Cards)
    html += `<section class="soul-section"><h3>Core Manifesto</h3>`;
    Object.values(manifesto).forEach(pillar => {
      html += `
        <div class="soul-philosophy-card">
          <span class="soul-philosophy-title">${pillar.name}</span>
          <span class="soul-philosophy-text">${pillar.essence || pillar.belief || pillar.invitation}</span>
        </div>
      `;
    });
    html += `</section>`;

    // 3. Alchemy (Materials)
    html += `<section class="soul-section"><h3>Material Alchemy</h3>`;
    html += `<div class="soul-tag-cloud">`;
    Object.entries(alchemy).forEach(([key, value]) => {
      html += `<span class="soul-tag" title="${value.symbolism}">${key.replace('_', ' ')}</span>`;
    });
    html += `</div></section>`;

    // 4. System Prompt Preview (The "Brain")
    html += `
      <section class="soul-section">
        <h3>System Prompt (NotebookLM)</h3>
        <div class="soul-response-preview">
          ${this.data.system_prompt_template.replace(/\n/g, '<br>')}
        </div>
      </section>
    `;

    container.innerHTML = html;
  }
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  new SoulConsole();
});
