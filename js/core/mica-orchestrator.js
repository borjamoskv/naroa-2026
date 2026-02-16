/**
 * MicaSystem v∞ — "La Consciencia Mineral"
 * Clase gestionada para la interacción con el usuario y ventas de retratos.
 */
export class MicaSystem {
  constructor() {
    this.config = {
      typingSpeed: 22,
      apiEndpoint: '/api/chat',
      greetingDelay: 3000,
      maxHistory: 20,
    };

    this.state = {
      isTyping: false,
      conversationHistory: [],
      isOpen: false,
      mood: 'ENERGETIC',
      interactionCount: 0,
    };

    this.personality = {
      greetings: {
        ENERGETIC: '⚡ ¡Bienvenido! Soy MICA, tu asesora personal de retratos. Naroa transforma rostros en arte: acrílico, mica mineral y alma pura. ¿Quieres un retrato único?',
        PLAYFUL:   '🎭 ¿Y si tu rostro fuera arte? Soy MICA. Naroa pinta retratos que capturan lo invisible. Cuéntame qué imaginas.',
        TIRED:     '🌙 La galería descansa, pero yo no. Si buscas un retrato con alma — un regalo irrepetible — estás en el lugar correcto.',
        GRUMPY:    '🪨 Son horas extrañas, pero el arte no duerme. ¿Buscas un retrato? Pregúntame mientras estas piedras aún vibran.',
      },
      quickReplies: [
        { label: '🎨 Quiero un retrato', text: 'Quiero encargar un retrato personalizado' },
        { label: '💰 ¿Cuánto cuesta?', text: '¿Cuánto cuesta un retrato por encargo?' },
        { label: '🖼 Ver ejemplos', text: 'Muéstrame ejemplos de retratos de Naroa' },
        { label: '⏱ ¿Cómo funciona?', text: '¿Cómo es el proceso para encargar un retrato?' },
      ],
      offline: {
        retrato: '🎨 Los retratos de Naroa son "kintsugi vital". Captura tu esencia con acrílico y mica mineral. ¿Quieres saber precios?',
        precio: '💰 Los retratos varían según formato: Medio ($800), Grande ($2,500), Coleccionista ($10,000+). 🔗 ¿Vamos a contacto?',
        proceso: '⏱ Proceso: 1. Conversar, 2. Estilo, 3. Boceto, 4. Creación, 5. Entrega. ¿Empezamos?',
        default: 'Mis cristales vibran extraño... ¿Te cuento sobre los retratos por encargo? 🎨',
      }
    };

    this.init();
  }

  init() {
    this.calculateMood();
    this.setupUI();
    this.setupEventListeners();
    
    setTimeout(() => document.getElementById('mica-orb')?.classList.add('mica-orb-visible'), 1500);
    setTimeout(() => {
      this.open();
      this.type(this.personality.greetings[this.state.mood]);
      this.showQuickReplies();
    }, this.config.greetingDelay);
  }

  calculateMood() {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 13) this.state.mood = 'ENERGETIC';
    else if (hour >= 13 && hour < 20) this.state.mood = 'PLAYFUL';
    else if (hour >= 20 || hour < 2) this.state.mood = 'TIRED';
    else this.state.mood = 'GRUMPY';
  }

  setupUI() {
    const orb = document.createElement('button');
    orb.id = 'mica-orb';
    orb.className = 'mica-orb';
    orb.innerHTML = '💎';
    document.body.appendChild(orb);

    const panel = document.createElement('div');
    panel.id = 'mica-panel';
    panel.className = 'mica-panel';
    panel.innerHTML = `
      <div class="mica-panel-header">
        <div class="mica-panel-identity">
          <span class="mica-panel-avatar">💎</span>
          <div>
            <span class="mica-panel-name">MICA</span>
            <span class="mica-panel-status"><span class="mica-status-dot"></span>Online</span>
          </div>
        </div>
        <button class="mica-panel-close">✕</button>
      </div>
      <div class="mica-panel-body" id="mica-messages"></div>
      <div class="mica-quick-replies" id="mica-quick-replies"></div>
      <div class="mica-panel-footer">
        <input type="text" id="mica-input" placeholder="Pregúntame..." autocomplete="off" />
        <button id="mica-send" class="mica-send-btn">➤</button>
      </div>`;
    document.body.appendChild(panel);

    this.elements = {
      orb, panel, input: panel.querySelector('#mica-input'),
      messages: panel.querySelector('#mica-messages'),
      quickReplies: panel.querySelector('#mica-quick-replies')
    };
  }

  setupEventListeners() {
    this.elements.orb.addEventListener('click', () => this.open());
    this.elements.panel.querySelector('.mica-panel-close').addEventListener('click', () => this.close());
    this.elements.panel.querySelector('#mica-send').addEventListener('click', () => this.handleInput());
    this.elements.input.addEventListener('keydown', (e) => e.key === 'Enter' && this.handleInput());
  }

  open() {
    this.state.isOpen = true;
    this.elements.panel.classList.add('mica-panel-open');
    this.elements.orb.classList.add('mica-orb-hidden');
    this.elements.input.focus();
  }

  close() {
    this.state.isOpen = false;
    this.elements.panel.classList.remove('mica-panel-open');
    this.elements.orb.classList.remove('mica-orb-hidden');
  }

  handleInput() {
    const text = this.elements.input.value.trim();
    if (text) {
      this.appendMessage('user', text);
      this.elements.input.value = '';
      this.handleAIResponse(text);
    }
  }

  appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `mica-msg mica-msg-${role}`;
    msg.innerHTML = `<div class="mica-msg-text">${text}</div>`;
    this.elements.messages.appendChild(msg);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    return msg;
  }

  async type(text) {
    const msg = this.appendMessage('ai', '');
    const textEl = msg.querySelector('.mica-msg-text');
    for (let i = 0; i < text.length; i++) {
      textEl.textContent += text[i];
      await new Promise(r => setTimeout(r, this.config.typingSpeed));
    }
  }

  handleAIResponse(text) {
    const lower = text.toLowerCase();
    let response = this.personality.offline.default;
    if (lower.includes('retrato')) response = this.personality.offline.retrato;
    else if (lower.includes('precio')) response = this.personality.offline.precio;
    this.type(response);
  }

  showQuickReplies() {
    this.elements.quickReplies.innerHTML = '';
    this.personality.quickReplies.forEach(qr => {
      const btn = document.createElement('button');
      btn.className = 'mica-chip';
      btn.textContent = qr.label;
      btn.onclick = () => this.handleInput(qr.text); // Note: Fix internal call
      this.elements.quickReplies.appendChild(btn);
    });
    this.elements.quickReplies.classList.add('mica-chips-visible');
  }
}
