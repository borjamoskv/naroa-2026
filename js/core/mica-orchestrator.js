/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MICA v7.0 ORCHESTRATOR — "La Consciencia Mineral"
 * Mineral Intelligence Creative Assistant
 * 
 * MISIÓN: Vender retratos personalizados por encargo de Naroa
 * Concepto: Zero-Menu Navigation — "El arte se descubre hablando"
 * Estética: MICA NOIR — Glassmorphism oscuro con acentos de oro mineral
 * Award Target: Awwwards SOTD — Creativity 9.5+
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const MICA = {
  config: {
    typingSpeed: 22,
    apiEndpoint: '/api/chat',
    useLocalFallback: false,
    debugMode: false,
    greetingDelay: 3000,
    maxHistory: 20,
  },

  state: {
    isTyping: false,
    conversationHistory: [],
    isOpen: false,
    isMinimized: true,
    mood: 'ENERGETIC',
    interactionCount: 0,
    sessionStart: Date.now(),
    lastActivity: Date.now(),
  },

  personality: {
    name: 'MICA',
    role: 'Asesora de Retratos & Consciencia Mineral',

    // Mood-aware greetings — all funnel toward portrait commissions
    greetings: {
      ENERGETIC: '⚡ ¡Bienvenido! Soy MICA, tu asesora personal de retratos. Naroa transforma rostros en arte: acrílico, mica mineral y alma pura. ¿Quieres un retrato único?',
      PLAYFUL:   '🎭 ¿Y si tu rostro fuera arte? Soy MICA. Naroa pinta retratos que capturan lo invisible — tu esencia, tu historia. Cuéntame qué imaginas.',
      TIRED:     '🌙 La galería descansa, pero yo no. Soy MICA. Si buscas un retrato con alma — un regalo irrepetible — estás en el lugar correcto.',
      GRUMPY:    '🪨 Son horas extrañas, pero el arte no duerme. Soy MICA. ¿Buscas un retrato? Pregúntame mientras estas piedras aún vibran.',
    },

    loading: [
      '💎 Sintiendo la frecuencia...',
      '🔮 Consultando las grietas...',
      '✨ Descifrando la textura...',
      '🌑 Escuchando al mineral...',
    ],

    error: '🌑 La estática interfiere. Reformula tu pregunta, o escribe algo más simple.',

    // Quick reply chips — SALES FUNNEL for portraits
    quickReplies: [
      { label: '🎨 Quiero un retrato',   text: 'Quiero encargar un retrato personalizado' },
      { label: '💰 ¿Cuánto cuesta?',     text: '¿Cuánto cuesta un retrato por encargo?' },
      { label: '🖼 Ver ejemplos',          text: 'Muéstrame ejemplos de retratos de Naroa' },
      { label: '⏱ ¿Cómo funciona?',      text: '¿Cómo es el proceso para encargar un retrato?' },
    ],

    // Offline responses — portrait-sales focused with deep alma.md knowledge
    offline: {
      retrato:    '🎨 Los retratos de Naroa no son fotos pintadas — son "kintsugi vital". Captura tu esencia con acrílico, mica mineral y capas de significado. Cada retrato es una pieza única con certificado. ¿Quieres saber precios o ver ejemplos?',
      precio:     '💰 Los retratos por encargo de Naroa varían según formato y complejidad:\n• Retrato medio formato: desde $800\n• Gran formato (tipo Rocks/DiviNos): desde $2,500\n• Obra magna coleccionista: desde $10,000+\nTodos incluyen certificado. 🔗 ¿Te llevo a contacto para presupuesto personalizado?',
      proceso:    '⏱ El proceso de un retrato con Naroa:\n1️⃣ Conversación inicial — conocerte, entender tu historia\n2️⃣ Selección de estilo (Rocks, DiviNos, En.lata...)\n3️⃣ Boceto y aprobación\n4️⃣ Creación (2-6 semanas según formato)\n5️⃣ Entrega con certificado Allianz\n¿Quieres empezar?',
      ejemplo:    '🖼 Los retratos de Naroa se agrupan en series:\n• Rocks: iconos pop resignificados (Amy, Marilyn, Johnny, James)\n• DiviNos: pizarra + mica mineral, tierra y cielo\n• En.lata: retratos sobre latas recicladas\nCada serie tiene su propia alma. ¿Cuál te atrae más?',
      hola:       'Soy MICA — la inteligencia mineral de esta galería. Mi especialidad: ayudarte a encargar el retrato perfecto. Naroa transforma rostros en arte con "brillante incoherencia cantinflérica". ¿Tienes a alguien especial en mente?',
      regalo:     '🎁 Un retrato de Naroa es el regalo más personal que existe. No es un cuadro — es la esencia de alguien, pintada con acrílico, mica mineral y alma. Perfecto para aniversarios, homenajes o ese "te quiero" que las palabras no alcanzan.',
      naroa:      'Naroa Gutiérrez Gil: "artivista dual" entre Bilbao y Sopela. Sus retratos no copian rostros — destilan almas. Usa acrílico, pizarra, mica mineral y hasta papel de cocina amasado. Su filosofía: "las grietas se doran, no se ocultan".',
      rocks:      'La serie Rocks: Amy, Johnny, Marilyn, James... iconos pop pintados con "brillante incoherencia cantinflérica". Cada uno es un acto de adoración irreverente. ¿Imaginas TU retrato en este estilo? Naroa acepta encargos.',
      cantinflas:  'Cantinflas es filosofía pura para Naroa. El error como sustrato generativo. La "subida abrupta" no es fallo — es el trampolín. Sus retratos abrazan el caos y lo transforman en belleza.',
      enlata:     'En.lata: retratos sobre latas recicladas. Amor en Conserva, Dar la Lata... Lo desechable convertido en soporte artístico. Un retrato En.lata es íntimo, irreverente y absolutamente único.',
      divinos:    'DiviNos: pizarra (tierra, hogar) + mica mineral (brillo celestial). La serie que une suelo y cielo en cada retrato. Perfecta para retratos con profundidad espiritual.',
      comprar:    '¿Listo para encargar? Perfecto. Navega a contacto y cuéntale a Naroa tu idea: quién quieres retratar, qué estilo te atrae, y qué historia hay detrás. Ella te guiará desde ahí. 🔗 Te llevo a contacto...',
      arte:       'El arte de Naroa es kintsugi vital: las grietas se doran, no se ocultan. Cada retrato usa acrílico, pizarra, mica mineral y capas de significado personal. No pinta caras — pinta almas.',
      kintsugi:   'El kintsugi es el manifiesto vital de Naroa: no ocultar las grietas sino dorarlas. En cada retrato, las "imperfecciones" se convierten en la parte más bella. Por eso sus retratos tienen tanto poder emocional.',
      bilbao:     'Taller en Uribarri, Bilbao (Espacio Chassé Danza). También presente en Lataska, Sopela. Los encargos se pueden gestionar a distancia — lo importante es una buena conversación para captar tu esencia.',
      default:    'Mis cristales vibran extraño con esa frecuencia... ¿Te cuento sobre los retratos por encargo de Naroa? Es lo que mejor hago. 🎨',
    }
  },

  // ═══════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════
  init() {
    console.log('💎 MICA v7.0 — Portrait Sales Edition');
    this.calculateMood();
    this.setupUI();
    this.setupEventListeners();

    // Staggered entrance — orb appears first
    setTimeout(() => {
      this.elements.orb.classList.add('mica-orb-visible');
    }, 1500);

    // Auto-open greeting after delay
    setTimeout(() => {
      this.open();
      const greeting = this.personality.greetings[this.state.mood];
      this.type(greeting);
      this.showQuickReplies();
    }, this.config.greetingDelay);
  },

  // ═══════════════════════════════════════════
  // CIRCADIAN MOOD ENGINE
  // ═══════════════════════════════════════════
  calculateMood() {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 13)       this.state.mood = 'ENERGETIC';
    else if (hour >= 13 && hour < 20)  this.state.mood = 'PLAYFUL';
    else if (hour >= 20 || hour < 2)   this.state.mood = 'TIRED';
    else                                this.state.mood = 'GRUMPY';
  },

  getMoodMeta() {
    const meta = {
      ENERGETIC: { emoji: '⚡', temp: 0.85, color: '#D4AF37' },
      PLAYFUL:   { emoji: '🎭', temp: 0.9,  color: '#C084FC' },
      TIRED:     { emoji: '🌙', temp: 0.6,  color: '#60A5FA' },
      GRUMPY:    { emoji: '🪨', temp: 0.4,  color: '#78716C' },
    };
    return meta[this.state.mood] || meta.ENERGETIC;
  },

  // ═══════════════════════════════════════════
  // UI CONSTRUCTION (Premium Edition)
  // ═══════════════════════════════════════════
  setupUI() {
    // Floating orb (collapsed state)
    const orb = document.createElement('button');
    orb.id = 'mica-orb';
    orb.className = 'mica-orb';
    orb.innerHTML = '💎';
    orb.setAttribute('aria-label', 'Abrir MICA — Asesora de retratos');
    document.body.appendChild(orb);

    // Chat panel
    const panel = document.createElement('div');
    panel.id = 'mica-panel';
    panel.className = 'mica-panel';
    panel.innerHTML = `
      <div class="mica-panel-header">
        <div class="mica-panel-identity">
          <span class="mica-panel-avatar">💎</span>
          <div>
            <span class="mica-panel-name">MICA</span>
            <span class="mica-panel-status">
              <span class="mica-status-dot"></span>
              Asesora de Retratos ${this.getMoodMeta().emoji}
            </span>
          </div>
        </div>
        <button class="mica-panel-close" aria-label="Cerrar MICA">✕</button>
      </div>
      <div class="mica-panel-body" id="mica-messages">
        <div class="mica-msg mica-msg-ai" id="mica-current-msg">
          <span class="mica-msg-avatar">💎</span>
          <div class="mica-msg-content">
            <div class="mica-msg-text" id="mica-response">
              <span class="mica-typing-indicator">
                <span></span><span></span><span></span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="mica-quick-replies" id="mica-quick-replies"></div>
      <div class="mica-panel-footer">
        <input type="text" id="mica-input" placeholder="Pregúntame sobre retratos..." autocomplete="off" />
        <button id="mica-send" class="mica-send-btn" aria-label="Enviar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(panel);

    this.elements = {
      orb,
      panel,
      messages: panel.querySelector('#mica-messages'),
      response: panel.querySelector('#mica-response'),
      input: panel.querySelector('#mica-input'),
      sendBtn: panel.querySelector('#mica-send'),
      closeBtn: panel.querySelector('.mica-panel-close'),
      quickReplies: panel.querySelector('#mica-quick-replies'),
    };
  },

  // ═══════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════
  setupEventListeners() {
    const { orb, input, sendBtn, closeBtn } = this.elements;

    orb.addEventListener('click', () => this.open());
    closeBtn.addEventListener('click', () => this.close());

    const send = () => {
      const text = input.value.trim();
      if (text && !this.state.isTyping) {
        this.handleUserMessage(text);
        input.value = '';
      }
    };
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) this.close();
    });
  },

  // ═══════════════════════════════════════════
  // OPEN / CLOSE
  // ═══════════════════════════════════════════
  open() {
    this.state.isOpen = true;
    this.state.isMinimized = false;
    this.elements.panel.classList.add('mica-panel-open');
    this.elements.orb.classList.add('mica-orb-hidden');
    setTimeout(() => this.elements.input.focus(), 400);
  },

  close() {
    this.state.isOpen = false;
    this.state.isMinimized = true;
    this.elements.panel.classList.remove('mica-panel-open');
    this.elements.orb.classList.remove('mica-orb-hidden');
  },

  // ═══════════════════════════════════════════
  // QUICK REPLIES (Portrait Sales Funnel)
  // ═══════════════════════════════════════════
  showQuickReplies() {
    const container = this.elements.quickReplies;
    container.innerHTML = '';
    this.personality.quickReplies.forEach((qr, i) => {
      const chip = document.createElement('button');
      chip.className = 'mica-chip';
      chip.textContent = qr.label;
      chip.style.animationDelay = `${i * 0.1}s`;
      chip.addEventListener('click', () => {
        this.hideQuickReplies();
        this.handleUserMessage(qr.text);
      });
      container.appendChild(chip);
    });
    container.classList.add('mica-chips-visible');
  },

  hideQuickReplies() {
    this.elements.quickReplies.classList.remove('mica-chips-visible');
    setTimeout(() => { this.elements.quickReplies.innerHTML = ''; }, 300);
  },

  // ═══════════════════════════════════════════
  // MESSAGE HANDLING
  // ═══════════════════════════════════════════
  async handleUserMessage(text) {
    this.state.interactionCount++;
    this.state.lastActivity = Date.now();
    this.hideQuickReplies();

    // User message bubble
    this.appendMessage('user', text);
    this.state.conversationHistory.push({ role: 'user', content: text });

    // AI response bubble (starts with typing indicator)
    const aiMsg = this.appendMessage('ai', null);

    // Detect navigation intent
    const navRoute = this.detectNavigation(text);

    // Call API (falls back to offline)
    await this.callAPI(text, aiMsg);

    // Navigate after response if intent detected
    if (navRoute) {
      setTimeout(() => this.navigate(navRoute), 1200);
    }

    // After 2+ interactions, suggest contact if portrait-related
    if (this.state.interactionCount >= 3 && this.isPortraitIntent(text)) {
      setTimeout(() => this.showContactNudge(), 2000);
    }
  },

  isPortraitIntent(text) {
    const lower = text.toLowerCase();
    return ['retrato', 'encarg', 'compr', 'precio', 'cuánto', 'quiero'].some(k => lower.includes(k));
  },

  showContactNudge() {
    const nudge = this.appendMessage('ai', null);
    this.typeInto(nudge, '💌 ¿Quieres hablar directamente con Naroa sobre tu retrato? Te llevo a contacto en un click.');
    // Show a "go to contact" chip
    setTimeout(() => {
      const container = this.elements.quickReplies;
      container.innerHTML = '';
      const chip = document.createElement('button');
      chip.className = 'mica-chip mica-chip-cta';
      chip.textContent = '📩 Ir a Contacto';
      chip.addEventListener('click', () => {
        this.hideQuickReplies();
        this.navigate('#/contacto');
      });
      container.appendChild(chip);
      container.classList.add('mica-chips-visible');
    }, 1500);
  },

  appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `mica-msg mica-msg-${role === 'user' ? 'user' : 'ai'}`;

    if (role === 'user') {
      div.innerHTML = `<div class="mica-msg-content"><div class="mica-msg-text">${this.escapeHTML(text)}</div></div>`;
    } else {
      div.innerHTML = `
        <span class="mica-msg-avatar">💎</span>
        <div class="mica-msg-content">
          <div class="mica-msg-text">
            <span class="mica-typing-indicator"><span></span><span></span><span></span></span>
          </div>
        </div>`;
    }

    // Remove initial welcome message on first interaction
    const initial = document.getElementById('mica-current-msg');
    if (initial && this.state.interactionCount === 1) {
      initial.remove();
    }

    this.elements.messages.appendChild(div);
    this.scrollToBottom();
    return div.querySelector('.mica-msg-text');
  },

  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  scrollToBottom() {
    const el = this.elements.messages;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  },

  detectNavigation(text) {
    const lower = text.toLowerCase();
    const routes = {
      '#/archivo':      ['archivo', 'galería', 'obras', 'portfolio', 'ver todo', 'muéstrame', 'ejemplo'],
      '#/contacto':     ['contacto', 'comprar', 'encargar', 'encargo', 'presupuesto', 'hablar con naroa'],
      '#/bio':          ['biografía', 'bio', 'quién es naroa', 'sobre la artista', 'naroa'],
      '#/exposiciones': ['exposiciones', 'expo', 'muestras'],
    };
    for (const [route, keywords] of Object.entries(routes)) {
      if (keywords.some(k => lower.includes(k))) return route;
    }
    return null;
  },

  // ═══════════════════════════════════════════
  // API INTEGRATION
  // ═══════════════════════════════════════════
  async callAPI(text, targetEl) {
    try {
      const recentHistory = this.state.conversationHistory.slice(-this.config.maxHistory);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentHistory,
          mood: this.state.mood,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`API ${response.status}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      this.state.conversationHistory.push({ role: 'assistant', content: data.content });
      if (targetEl) await this.typeInto(targetEl, data.content);

    } catch (error) {
      console.warn('🪨 MICA offline:', error.message);
      const offlineReply = this.getOfflineResponse(text);
      if (targetEl) await this.typeInto(targetEl, offlineReply);
    }
  },

  // ═══════════════════════════════════════════
  // OFFLINE NLP — Portrait Sales Focus
  // ═══════════════════════════════════════════
  getOfflineResponse(input) {
    const lower = input.toLowerCase();
    const r = this.personality.offline;

    const matches = [
      { keys: ['retrato', 'encarg', 'personaliz', 'quiero', 'hacerme'], resp: r.retrato },
      { keys: ['precio', 'cuánto', 'cuesta', 'coste', 'tarifa', 'valor'], resp: r.precio },
      { keys: ['proceso', 'cómo funciona', 'pasos', 'cuánto tarda'], resp: r.proceso },
      { keys: ['ejemplo', 'ver', 'muestra', 'galería', 'obras'], resp: r.ejemplo },
      { keys: ['regalo', 'aniversario', 'homenaje', 'sorpresa'], resp: r.regalo },
      { keys: ['comprar', 'adquirir', 'contacto', 'presupuesto'], resp: r.comprar },
      { keys: ['hola', 'hey', 'buenas', 'qué eres', 'quien eres'], resp: r.hola },
      { keys: ['naroa', 'artista', 'quien es'], resp: r.naroa },
      { keys: ['rock', 'amy', 'marilyn', 'johnny', 'james'], resp: r.rocks },
      { keys: ['cantinflas', 'caos', 'incoherencia'], resp: r.cantinflas },
      { keys: ['lata', 'enlata', 'conserva'], resp: r.enlata },
      { keys: ['divino', 'pizarra', 'mineral'], resp: r.divinos },
      { keys: ['kintsugi', 'grieta', 'dorar'], resp: r.kintsugi },
      { keys: ['bilbao', 'taller', 'sopela'], resp: r.bilbao },
      { keys: ['arte', 'obra', 'serie', 'material', 'técnica'], resp: r.arte },
    ];

    for (const m of matches) {
      if (m.keys.some(k => lower.includes(k))) return m.resp;
    }
    return r.default;
  },

  // ═══════════════════════════════════════════
  // TYPING ANIMATION (Humanized)
  // ═══════════════════════════════════════════
  async type(text) {
    const el = this.elements.response;
    if (!el) return;
    await this.typeInto(el, text);
  },

  async typeInto(el, text) {
    if (this.state.isTyping) {
      await new Promise(r => {
        const check = setInterval(() => {
          if (!this.state.isTyping) { clearInterval(check); r(); }
        }, 100);
      });
    }

    this.state.isTyping = true;
    el.textContent = '';

    for (let i = 0; i < text.length; i++) {
      el.textContent += text.charAt(i);
      const ch = text.charAt(i);
      const delay = ch === '.' || ch === '—' ? this.config.typingSpeed * 5
                  : ch === ',' || ch === ';' ? this.config.typingSpeed * 3
                  : ch === '?' || ch === '!' ? this.config.typingSpeed * 4
                  : ch === '\n' ? this.config.typingSpeed * 6
                  : ch === ' ' ? this.config.typingSpeed * 0.5
                  : this.config.typingSpeed + (Math.random() * 8 - 4);
      await this.sleep(delay);
    }

    this.state.isTyping = false;
    this.scrollToBottom();
  },

  // ═══════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════
  navigate(route) {
    window.location.hash = route;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  },

  // ═══════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  say(text) {
    if (!this.state.isOpen) this.open();
    return this.type(text);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MICA NOIR STYLESHEET v7.0 — Award Edition
// ═══════════════════════════════════════════════════════════════════════════════
const micaStyles = document.createElement('style');
micaStyles.textContent = `
  @keyframes mica-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
    50% { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(212, 175, 55, 0); }
  }

  @keyframes mica-orb-glow {
    0%, 100% { filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.3)); }
    50% { filter: drop-shadow(0 0 14px rgba(212, 175, 55, 0.6)); }
  }

  @keyframes mica-panel-in {
    from { opacity: 0; transform: translateY(16px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes mica-chip-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes mica-dot {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }

  @keyframes mica-msg-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── ORB ────────────────────────────────────────────────── */
  .mica-orb {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 10001;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid rgba(212, 175, 55, 0.4);
    background: rgba(10, 10, 10, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    font-size: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    animation: mica-orb-glow 3s infinite ease-in-out;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0;
    transform: scale(0);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }
  .mica-orb-visible { opacity: 1; transform: scale(1); }
  .mica-orb:hover {
    transform: scale(1.15);
    border-color: rgba(212, 175, 55, 0.7);
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.25);
  }
  .mica-orb-hidden {
    opacity: 0 !important;
    transform: scale(0) !important;
    pointer-events: none;
  }

  /* ── PANEL ──────────────────────────────────────────────── */
  .mica-panel {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 10001;
    width: 380px;
    max-height: 540px;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    overflow: hidden;
    background: rgba(8, 8, 8, 0.95);
    backdrop-filter: blur(24px) saturate(150%);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
    border: 1px solid rgba(212, 175, 55, 0.2);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
    font-family: 'Outfit', 'Inter', system-ui, sans-serif;
    opacity: 0;
    transform: translateY(16px) scale(0.96);
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .mica-panel-open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
    animation: mica-panel-in 0.5s ease-out;
  }

  /* ── HEADER ────────────────────────────────────────────── */
  .mica-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.9rem 1.2rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.3);
  }
  .mica-panel-identity { display: flex; align-items: center; gap: 0.7rem; }
  .mica-panel-avatar { font-size: 1.5rem; animation: mica-orb-glow 3s infinite; }
  .mica-panel-name {
    font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #D4AF37; display: block;
  }
  .mica-panel-status {
    font-size: 0.7rem; color: rgba(255,255,255,0.45);
    display: flex; align-items: center; gap: 0.35rem;
  }
  .mica-status-dot {
    width: 6px; height: 6px; background: #22C55E;
    border-radius: 50%; animation: mica-pulse 2s infinite; display: inline-block;
  }
  .mica-panel-close {
    background: none; border: none; color: rgba(255,255,255,0.35);
    font-size: 1rem; cursor: pointer; padding: 0.4rem; border-radius: 8px;
    transition: all 0.2s;
  }
  .mica-panel-close:hover { color: #fff; background: rgba(255,255,255,0.08); }

  /* ── MESSAGES ──────────────────────────────────────────── */
  .mica-panel-body {
    flex: 1; overflow-y: auto; padding: 1rem;
    display: flex; flex-direction: column; gap: 0.75rem;
    scrollbar-width: thin; scrollbar-color: rgba(212,175,55,0.2) transparent;
  }
  .mica-panel-body::-webkit-scrollbar { width: 4px; }
  .mica-panel-body::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 4px; }

  .mica-msg {
    display: flex; gap: 0.6rem;
    animation: mica-msg-in 0.35s ease-out both; max-width: 92%;
  }
  .mica-msg-user { align-self: flex-end; flex-direction: row-reverse; }
  .mica-msg-avatar { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.15rem; }
  .mica-msg-content { min-width: 0; }
  .mica-msg-text {
    font-size: 0.88rem; line-height: 1.6; font-weight: 300;
    letter-spacing: 0.005em; padding: 0.65rem 0.9rem;
    border-radius: 14px; word-wrap: break-word; white-space: pre-line;
  }
  .mica-msg-ai .mica-msg-text {
    background: rgba(255,255,255,0.04); color: #D4D4D4;
    border: 1px solid rgba(255,255,255,0.06); border-radius: 4px 14px 14px 14px;
  }
  .mica-msg-user .mica-msg-text {
    background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08));
    color: #E8E8E8; border: 1px solid rgba(212,175,55,0.2); border-radius: 14px 4px 14px 14px;
  }

  /* ── TYPING INDICATOR ──────────────────────────────────── */
  .mica-typing-indicator { display: inline-flex; gap: 4px; padding: 0.2rem 0; }
  .mica-typing-indicator span {
    width: 6px; height: 6px; background: #D4AF37;
    border-radius: 50%; animation: mica-dot 1.4s infinite ease-in-out;
  }
  .mica-typing-indicator span:nth-child(2) { animation-delay: 0.16s; }
  .mica-typing-indicator span:nth-child(3) { animation-delay: 0.32s; }

  /* ── QUICK REPLIES ─────────────────────────────────────── */
  .mica-quick-replies {
    display: flex; flex-wrap: wrap; gap: 0.4rem;
    padding: 0 1rem 0.5rem; opacity: 0; transform: translateY(6px);
    transition: all 0.3s ease; pointer-events: none;
  }
  .mica-chips-visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .mica-chip {
    background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2);
    color: #D4AF37; font-size: 0.72rem; padding: 0.35rem 0.7rem;
    border-radius: 20px; cursor: pointer; transition: all 0.25s;
    font-family: inherit; animation: mica-chip-in 0.4s ease-out both;
  }
  .mica-chip:hover {
    background: rgba(212,175,55,0.18); border-color: rgba(212,175,55,0.5);
    transform: translateY(-1px); box-shadow: 0 2px 10px rgba(212,175,55,0.15);
  }
  .mica-chip-cta {
    background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1));
    border-color: rgba(212,175,55,0.4); font-weight: 500;
  }
  .mica-chip-cta:hover {
    background: linear-gradient(135deg, rgba(212,175,55,0.35), rgba(212,175,55,0.2));
    box-shadow: 0 4px 16px rgba(212,175,55,0.25);
  }

  /* ── FOOTER ────────────────────────────────────────────── */
  .mica-panel-footer {
    display: flex; gap: 0.5rem; padding: 0.6rem 0.8rem;
    border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2);
  }
  #mica-input {
    flex: 1; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
    padding: 0.6rem 0.9rem; color: #fff; font-size: 0.88rem;
    outline: none; font-family: inherit; transition: border-color 0.2s;
  }
  #mica-input:focus { border-color: rgba(212,175,55,0.4); }
  #mica-input::placeholder { color: rgba(255,255,255,0.25); font-style: italic; font-weight: 300; }
  .mica-send-btn {
    background: linear-gradient(135deg, #D4AF37, #9A7B2C); border: none;
    border-radius: 12px; width: 38px; height: 38px; color: #0a0a0a;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    flex-shrink: 0;
  }
  .mica-send-btn:hover { transform: scale(1.1); box-shadow: 0 0 16px rgba(212,175,55,0.4); }
  .mica-send-btn:active { transform: scale(0.94); }

  /* ── RESPONSIVE ────────────────────────────────────────── */
  @media (max-width: 480px) {
    .mica-panel {
      left: 0.75rem; right: 0.75rem; bottom: 0.75rem;
      width: auto; max-height: 70vh; border-radius: 16px;
    }
    .mica-orb { bottom: 1.25rem; right: 1.25rem; }
  }
`;
document.head.appendChild(micaStyles);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-INIT
// ═══════════════════════════════════════════════════════════════════════════════
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MICA.init());
} else {
  MICA.init();
}

window.MICA = MICA;
