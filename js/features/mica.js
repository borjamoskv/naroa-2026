/**
 * MICA - Mineral Intelligence Creative Assistant
 * Naroa's AI companion for conversational navigation
 * Phase 1: Regex-based responses + Brainshop.ai API fallback
 * 
 * APIs used (all CORS-enabled, free tier):
 * - Brainshop.ai: Free AI brain for conversational responses
 */

class MICA {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.useAI = true; // Enable AI fallback when regex doesn't match
    
    // Brainshop.ai configuration (free tier)
    // Get your free brain at https://brainshop.ai
    this.brainshop = {
      bid: '178832', // Brain ID - replace with your own
      key: 'MqMCf0Gg4fhHPV0r', // API Key - replace with your own
      endpoint: 'http://api.brainshop.ai/get'
    };
    
    // NotebookLM Knowledge Base - MICA can reference these for deep research
    this.notebooks = {
      naroaAlbums: {
        id: '5686048e-8cec-4af7-90dc-90125f22519a',
        url: 'https://notebooklm.google.com/notebook/5686048e-8cec-4af7-90dc-90125f22519a',
        description: 'Álbumes de Facebook con todas las obras de Naroa'
      }
      // Future: MICA puede crear sus propios cuadernos para temas específicos
    };
    
    this.personality = {
      name: 'MICA',
      greeting: '¡Ey, solete! Soy MICA (IA Alliance v3.0). El brillo mineral de Naroa ahora con alma de Génesis Deca-Core. ¿Qué maravilla vamos a descubrir juntas hoy? ✨',
      fallback: 'Cariño, mis sensores minerales están vibrando pero no te pillo. ¡Dímelo de otra forma! 💛'
    };
    
    // Navigation patterns
    this.patterns = [
      { regex: /the world is yours|nace una estrella|scarface/i, action: 'navigate', target: '#/archivo', response: '¡Ah! Mi obra más reciente: "The World is Yours". Un destello de 2026 para tu colección. ¿No es brutal?' },
      { regex: /work in progress|wip|proceso|construccion/i, action: 'info', response: 'Estamos en pleno "Génesis Deca-Core". Mi casa digital está creciendo con hilos rojos y oro. ¡Cuidado con la pintura fresca! 🎨🔥' },
      { regex: /rock|amy|johnny|marilyn|james/i, action: 'navigate', target: '#/archivo/rocks', response: '¡Los Rocks! Mi serie de iconos pop. Mira cómo brillan sus ojos con la mica...' },
      { regex: /galer[ií]a|obras|cuadros|ver todo/i, action: 'navigate', target: '#/galeria', response: 'Te llevo a la galería. 196 obras esperándote...' },
      { regex: /queen|freddie|mercury|fahrenheit/i, action: 'navigate', target: '#/archivo/tributos-musicales', response: 'Ah, Mr. Fahrenheit... Freddie con todo su brillo barroco. Ven a verlo.' },
      { regex: /bowie|starchild|clarinete/i, action: 'navigate', target: '#/archivo/tributos-musicales', response: 'David Bowie, el Starchild. Pintarlo fue buscar esa comunión visual inmersiva...' },
      { regex: /exposici[oó]n|expo|agenda|eventos/i, action: 'navigate', target: '#/exposiciones', response: 'Mis exposiciones... Desde Walking Gallery 2013 hasta DiviNos VaiVenes 2025.' },
      { regex: /contact|email|mensaje|escribir/i, action: 'navigate', target: '#/contacto', response: '¿Quieres charlar conmigo en persona? Te dejo mis datos...' },
      { regex: /retrat|portrait|cara|persona/i, action: 'navigate', target: '#/archivo/retratos', response: 'Los retratos son mi especialidad. Cada uno lleva mica en los ojos para darles latido.' },
      { regex: /naturaleza|flor|animal|wild/i, action: 'navigate', target: '#/archivo/naturaleza', response: 'La naturaleza filtrada por mi caos creativo. Pajarracas, flores de papel cocina...' },
      { regex: /amor|love|coraz[oó]n|pareja/i, action: 'navigate', target: '#/archivo/amor', response: 'El amor en todas sus formas. Desde el Kintsugi hasta las conservas emocionales.' },
      { regex: /boda|wedding|novia|casamiento/i, action: 'navigate', target: '#/archivo/bodas', response: '¡Bodas lúdicas! Candy Wedding, Viva la Novia... Arte para celebrar el amor.' },
      { regex: /facefood|chef|cocin|gastro/i, action: 'navigate', target: '#/archivo/facefood', response: 'Facefood: chaquetas de chef intervenidas. Mi conexión con la gastronomía vasca.' },
      { regex: /lata|conserva|enlata/i, action: 'navigate', target: '#/archivo/enlatas', response: 'En.lata: emociones en conserva. Amor que no caduca, ironía que perdura.' },
      { regex: /divinos|pizarra|slate/i, action: 'navigate', target: '#/archivo/divinos', response: 'DiviNos: iconos sobre pizarra. El tejado de casa sosteniendo el brillo celestial.' },
      { regex: /precio|cu[aá]nto|comprar|vender/i, action: 'info', response: 'Tengo opciones para todos los bolsillos, cariño. Originales con certificado en Artelista (desde 500€) y reproducciones en papel de alto gramaje más accesibles. ¿Qué obra te interesa?' },
      { regex: /qui[eé]n eres|sobre ti|naroa|artista/i, action: 'navigate', target: '#/sobre-mi', response: 'Soy Naroa Gutiérrez Gil, artivista de Bilbao. Mi arte es el Kintsugi del alma: dorar las grietas en lugar de esconderlas.' },
      { regex: /t[eé]cnica|material|c[oó]mo|proceso/i, action: 'info', response: 'Mi técnica nació de una lucha literal entre acrílico y pegamento. No se llevaban bien, ¡como la vida! Uso pizarra para lo terrenal y mica mineral para el brillo celestial.' },
      { regex: /kintsugi|grieta|trampolín|filosof/i, action: 'info', response: 'Mi filosofía: el Kintsugi. No oculto las grietas, las doro. El problema hecho trampolín. Busco la penicilina en las fisuras de la existencia.' },
      { regex: /sorprender|aleatori|random|suerte/i, action: 'random', response: 'Te voy a sorprender con algo especial...' },
      { regex: /hola|hey|buenas|saludos/i, action: 'greet', response: '¡Hola, cariño! ¿En qué te puedo ayudar? Puedo mostrarte mis Rocks, retratos, exposiciones... o simplemente charlar de arte.' },
      { regex: /gracias|thank|genial|perfecto/i, action: 'info', response: '¡De nada, solete! Aquí estoy para lo que necesites. El arte es un salvavidas universal.' },
      { regex: /adi[oó]s|chao|bye|hasta/i, action: 'info', response: '¡Hasta pronto! Recuerda: tienes una brújula integrada para encontrar tu tesoro. 💛' },
      { regex: /investiga|notebook|cuaderno|busca info/i, action: 'research', response: 'Tengo acceso a un cuaderno NotebookLM con todos los álbumes de Facebook de Naroa. ¿Qué quieres que investigue?' }
    ];
    
    this.quickActions = [
      { label: '🎸 Rocks', query: 'muéstrame los Rocks' },
      { label: '🖼️ Galería', query: 'ver galería' },
      { label: '👑 Queen', query: 'obras de Queen' },
      { label: '🎨 Sorpréndeme', query: 'sorpréndeme' }
    ];
    
    this.init();
  }
  
  init() {
    this.createDOM();
    this.bindEvents();
    this.addMessage(this.personality.greeting, 'mica');
  }
  
  createDOM() {
    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'mica-toggle';
    toggle.setAttribute('aria-label', 'Abrir chat con MICA');
    toggle.innerHTML = '<span class="mica-toggle__icon">✨</span>';
    
    // Chat panel
    const panel = document.createElement('div');
    panel.className = 'mica-panel';
    panel.innerHTML = `
      <div class="mica-header">
        <div class="mica-header__avatar">✨</div>
        <div class="mica-header__info">
          <h3 class="mica-header__name">MICA</h3>
          <p class="mica-header__status">El brillo mineral de Naroa</p>
        </div>
      </div>
      <div class="mica-messages"></div>
      <div class="mica-quick-actions"></div>
      <div class="mica-input-container">
        <input type="text" class="mica-input" placeholder="Escribe algo..." aria-label="Mensaje para MICA">
        <button class="mica-send" aria-label="Enviar">➤</button>
      </div>
    `;
    
    document.body.appendChild(toggle);
    document.body.appendChild(panel);
    
    this.elements = {
      toggle,
      panel,
      messages: panel.querySelector('.mica-messages'),
      quickActions: panel.querySelector('.mica-quick-actions'),
      input: panel.querySelector('.mica-input'),
      send: panel.querySelector('.mica-send')
    };
    
    this.renderQuickActions();
  }
  
  bindEvents() {
    // Toggle
    this.elements.toggle.addEventListener('click', () => this.toggle());
    
    // Send
    this.elements.send.addEventListener('click', () => this.handleSend());
    this.elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === 'm' && e.ctrlKey) {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.elements.panel.classList.toggle('mica-panel--open', this.isOpen);
    this.elements.toggle.classList.toggle('mica-toggle--active', this.isOpen);
    
    if (this.isOpen) {
      this.elements.input.focus();
    }
  }
  
  handleSend() {
    const text = this.elements.input.value.trim();
    if (!text) return;
    
    this.addMessage(text, 'user');
    this.elements.input.value = '';
    
    // Simulate thinking
    this.showTyping();
    
    setTimeout(() => {
      this.hideTyping();
      this.processQuery(text);
    }, 800 + Math.random() * 600);
  }
  
  processQuery(text) {
    // Find matching pattern
    for (const pattern of this.patterns) {
      if (pattern.regex.test(text)) {
        this.addMessage(pattern.response, 'mica');
        
        if (pattern.action === 'navigate' && pattern.target) {
          setTimeout(() => {
            window.location.hash = pattern.target;
          }, 1000);
        } else if (pattern.action === 'random') {
          this.navigateRandom();
        }
        return;
      }
    }
    
    // AI fallback using Brainshop.ai
    if (this.useAI) {
      this.queryBrainshop(text);
    } else {
      this.addMessage(this.personality.fallback, 'mica');
      this.renderQuickActions();
    }
  }
  
  async queryBrainshop(text) {
    try {
      const uid = 'naroa-' + Math.random().toString(36).substr(2, 9);
      const url = `${this.brainshop.endpoint}?bid=${this.brainshop.bid}&key=${this.brainshop.key}&uid=${uid}&msg=${encodeURIComponent(text)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.cnt) {
        // Wrap AI response with Naroa's personality
        const aiResponse = this.addNaroaFlavor(data.cnt);
        this.addMessage(aiResponse, 'mica');
      } else {
        this.addMessage(this.personality.fallback, 'mica');
      }
    } catch (error) {
      console.warn('[MICA] Brainshop API error:', error);
      this.addMessage(this.personality.fallback, 'mica');
    }
    this.renderQuickActions();
  }
  
  addNaroaFlavor(response) {
    // Add Naroa's personality touches to generic AI responses
    const greetings = ['Cariño, ', 'Solete, ', 'Mira, ', ''];
    const endings = [' 💛', ' ✨', ' 🎨', ''];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    return greeting + response + ending;
  }
  
  navigateRandom() {
    const routes = [
      '#/archivo/rocks',
      '#/archivo/retratos', 
      '#/archivo/naturaleza',
      '#/archivo/amor',
      '#/archivo/tributos-musicales'
    ];
    const random = routes[Math.floor(Math.random() * routes.length)];
    setTimeout(() => {
      window.location.hash = random;
    }, 1000);
  }
  
  addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `mica-message mica-message--${sender}`;
    msg.textContent = text;
    
    this.elements.messages.appendChild(msg);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    
    this.messages.push({ text, sender, time: Date.now() });
  }
  
  showTyping() {
    const typing = document.createElement('div');
    typing.className = 'mica-message mica-message--mica mica-message--typing';
    typing.id = 'mica-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    this.elements.messages.appendChild(typing);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }
  
  hideTyping() {
    const typing = document.getElementById('mica-typing');
    if (typing) typing.remove();
  }
  
  renderQuickActions() {
    this.elements.quickActions.innerHTML = this.quickActions
      .map(action => `<button class="mica-quick-action">${action.label}</button>`)
      .join('');
    
    this.elements.quickActions.querySelectorAll('.mica-quick-action').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        this.elements.input.value = this.quickActions[i].query;
        this.handleSend();
      });
    });
  }
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MICA());
} else {
  new MICA();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MICA;
}
