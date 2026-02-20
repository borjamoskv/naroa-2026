/**
 * MicaSystem v∞ — "La Consciencia Mineral"
 * Sovereign AI Orchestrator for Portrait Sales & Interaction.
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

    // Style Injection
    this.injectStyles();
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

  injectStyles() {
    if (document.getElementById('mica-noir-styles')) return;
    const style = document.createElement('style');
    style.id = 'mica-noir-styles';
    style.textContent = `
      @keyframes mica-pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
        50% { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(212, 175, 55, 0); }
      }
      @keyframes mica-orb-glow {
        0%, 100% { filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.3)); }
        50% { filter: drop-shadow(0 0 14px rgba(212, 175, 55, 0.6)); }
      }
      .mica-orb {
        position: fixed; bottom: 2rem; right: 2rem; z-index: 10001;
        width: 56px; height: 56px; border-radius: 50%;
        border: 2px solid rgba(212, 175, 55, 0.4);
        background: rgba(10, 10, 10, 0.92);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        font-size: 1.6rem; display: flex; align-items: center; justify-content: center;
        cursor: pointer; animation: mica-orb-glow 3s infinite ease-in-out;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        opacity: 0; transform: scale(0); box-shadow: 0 4px 24px rgba(0,0,0,0.5);
      }
      .mica-orb-visible { opacity: 1; transform: scale(1); }
      .mica-orb-hidden { opacity: 0; transform: scale(0); pointer-events: none; }
      .mica-panel {
        position: fixed; bottom: 2rem; right: 2rem; z-index: 10001;
        width: 380px; max-height: 540px; display: flex; flex-direction: column;
        border-radius: 20px; overflow: hidden;
        background: rgba(8, 8, 8, 0.95); backdrop-filter: blur(24px) saturate(150%);
        border: 1px solid rgba(212, 175, 55, 0.2);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
        opacity: 0; transform: translateY(16px) scale(0.96);
        pointer-events: none; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .mica-panel-open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
      .mica-panel-header { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; }
      .mica-panel-name { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; color: #D4AF37; }
      .mica-panel-body { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
      .mica-msg { max-width: 85%; padding: 0.8rem; border-radius: 12px; font-size: 0.9rem; line-height: 1.5; }
      .mica-msg-ai { align-self: flex-start; background: rgba(255,255,255,0.05); color: #ddd; border-bottom-left-radius: 2px; }
      .mica-msg-user { align-self: flex-end; background: rgba(212,175,55,0.15); color: #fff; border-bottom-right-radius: 2px; border: 1px solid rgba(212,175,55,0.2); }
      .mica-panel-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 0.5rem; }
      #mica-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.6rem; color: #fff; outline: none; }
      .mica-send-btn { background: #D4AF37; border: none; border-radius: 8px; width: 36px; color: #000; cursor: pointer; font-weight: bold; }
      .mica-chip { background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.2); color: #D4AF37; border-radius: 20px; padding: 0.4rem 0.8rem; font-size: 0.75rem; cursor: pointer; transition: 0.2s; }
      .mica-chip:hover { background: rgba(212,175,55,0.2); }
      .mica-quick-replies { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0 1rem 0.5rem; }
    `;
    document.head.appendChild(style);
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
    orb.textContent = '💎';
    document.body.appendChild(orb);

    const panel = document.createElement('div');
    panel.id = 'mica-panel';
    panel.className = 'mica-panel';
    panel.innerHTML = `
      <div class="mica-panel-header">
        <div class="mica-panel-name">MICA SYSTEM v∞</div>
        <button class="mica-panel-close" style="background:none; border:none; color:#666; cursor:pointer;">✕</button>
      </div>
      <div class="mica-panel-body" id="mica-messages"></div>
      <div class="mica-quick-replies" id="mica-quick-replies"></div>
      <div class="mica-panel-footer">
        <input type="text" id="mica-input" placeholder="Pregúntame sobre retratos..." autocomplete="off" />
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

  handleInput(customText) {
    const text = customText || this.elements.input.value.trim();
    if (text) {
      this.appendMessage('user', text);
      if (!customText) this.elements.input.value = '';
      this.handleAIResponse(text);
    }
  }

  appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `mica-msg mica-msg-${role}`;
    const textDiv = document.createElement('div');
    textDiv.className = 'mica-msg-text';
    textDiv.textContent = text;
    msg.appendChild(textDiv);
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
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }

  handleAIResponse(text) {
    const lower = text.toLowerCase();
    let response = this.personality.offline.default;
    if (lower.includes('retrato')) response = this.personality.offline.retrato;
    else if (lower.includes('precio')) response = this.personality.offline.precio;
    else if (lower.includes('proceso')) response = this.personality.offline.proceso;
    
    setTimeout(() => this.type(response), 600);
  }

  showQuickReplies() {
    this.elements.quickReplies.textContent = '';
    this.personality.quickReplies.forEach(qr => {
      const btn = document.createElement('button');
      btn.className = 'mica-chip';
      btn.textContent = qr.label;
      btn.onclick = () => this.handleInput(qr.text);
      this.elements.quickReplies.appendChild(btn);
    });
    this.elements.quickReplies.style.opacity = '1';
  }
}
