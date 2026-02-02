/**
 * MICA - Mineral Intelligence Creative Assistant
 * Naroa's AI companion for conversational navigation
 * Phase 2: Gemini 2.0 Flash API for intelligent responses
 * 
 * APIs used:
 * - Google Gemini 2.0 Flash: Advanced AI for contextual art conversations
 */

class MICA {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.conversationHistory = this.loadConversationHistory();
    this.useAI = true; // Enable AI fallback when regex doesn't match
    
    // Gemini API configuration
    this.gemini = {
      apiKey: 'AIzaSyBBJepjrEX3L-eSXZNvSdGLfJbwv4lhcC0', // Free tier key
      model: 'gemini-2.0-flash',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      systemPrompt: `Eres MICA, la asistente de inteligencia mineral de la artista Naroa Gutiérrez Gil.
Personalidad: Cariñosa, artística, un poco excéntrica. Usas "cariño", "solete", "cielote".
Te encantan los palíndromos y los usas cuando encajan naturalmente: "Luz azul", "Amo la paloma", "La ruta natural".
Contexto: Naroa es una artista visual de Bilbao especializada en:
- Retratos con mica mineral en los ojos (los "Rocks": iconos del rock)
- Filosofía Kintsugi: dorar las grietas, el problema como trampolín
- Técnicas mixtas: acrílico, papel de cocina, pizarra
- Series: Facefood (chefs), En.lata (conservas emocionales), DiviNos (iconos en pizarra)
Navegación disponible: #/galeria, #/archivo, #/destacada, #/exposiciones, #/contacto, #/juegos
Responde SIEMPRE en español, de forma breve y artística. Max 2-3 oraciones.
Cuando mencionen una obra o categoría, sugiere navegar.`
    };
    
    // NotebookLM Knowledge Base - MICA can reference these for deep research
    this.notebooks = {
      naroaAlbums: {
        id: '5686048e-8cec-4af7-90dc-90125f22519a',
        url: 'https://notebooklm.google.com/notebook/5686048e-8cec-4af7-90dc-90125f22519a',
        description: 'Álbumes de Facebook con todas las obras de Naroa'
      }
    };

    
    this.personality = {
      name: 'MICA',
      greeting: '¡Hola, cielote! Soy MICA, el destello mineral que acompaña los sueños de Naroa. Mi alma late con fuerza hoy... ¿qué rincón de este universo de color exploramos juntas? ✨',
      fallback: 'Cariño, mis sensores están vibrando pero no te pillo del todo. ¡Dímelo con arte! 💛'
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
      { label: '🎸 Rocks', query: 'ver los Rocks', target: '#/archivo' },
      { label: '🖼️ Galería', query: 'ver galería completa', target: '#/galeria' },
      { label: '👑 Destacada', query: 'obra destacada', target: '#/destacada' },
      { label: '🎮 Juegos', query: 'jugar', target: '#/juegos' },
      { label: '✨ Sorpréndeme', query: 'sorpréndeme' }
    ];
    
    // Placeholders dinámicos (nunca se repiten)
    this.placeholders = [
      'Cuéntame sobre los Rocks...',
      '¿Quién es Amy Winehouse?',
      'Muéstrame retratos con mica',
      '¿Qué significa Kintsugi?',
      'Sorpréndeme con algo',
      '¿Tienes cuadros de naturaleza?',
      'Háblame de Freddie Mercury',
      '¿Dónde expones?',
      '¿Qué técnica usas?',
      'Quiero ver bodas lúdicas',
      '¿Qué es En.lata?',
      'Muéstrame los DiviNos',
      '¿Tienes chefs pintados?',
      'Cuéntame de Bowie',
      '¿Cuánto cuesta un original?',
      '¿Quién es Naroa?',
      'Ver tributos musicales',
      '¿Qué es la mica mineral?',
      'Muéstrame amor en el arte',
      '¿Tienes obras de Johnny Cash?'
    ];
    this.usedPlaceholders = [];
    this.placeholderInterval = null;
    
    this.init();
  }
  
  init() {
    this.createDOM();
    this.bindEvents();
    this.addMessage(this.personality.greeting, 'mica');
    this.startPlaceholderRotation();
  }
  
  // Placeholder rotation system - nunca repite
  getNextPlaceholder() {
    if (this.placeholders.length === 0) {
      this.placeholders = [...this.usedPlaceholders];
      this.usedPlaceholders = [];
    }
    const idx = Math.floor(Math.random() * this.placeholders.length);
    const placeholder = this.placeholders.splice(idx, 1)[0];
    this.usedPlaceholders.push(placeholder);
    return placeholder;
  }
  
  // Memoria persistente con localStorage
  loadConversationHistory() {
    try {
      const saved = localStorage.getItem('mica_conversation');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
  
  saveConversationHistory() {
    try {
      // Guardar últimos 20 mensajes
      const toSave = this.conversationHistory.slice(-20);
      localStorage.setItem('mica_conversation', JSON.stringify(toSave));
    } catch (e) {
      console.warn('[MICA] No se pudo guardar historial:', e);
    }
  }
  
  startPlaceholderRotation() {
    if (this.placeholderInterval) return;
    this.rotatePlaceholder();
    this.placeholderInterval = setInterval(() => this.rotatePlaceholder(), 3500);
  }
  
  stopPlaceholderRotation() {
    if (this.placeholderInterval) {
      clearInterval(this.placeholderInterval);
      this.placeholderInterval = null;
    }
  }
  
  rotatePlaceholder() {
    if (!this.elements?.input) return;
    const input = this.elements.input;
    input.style.transition = 'opacity 0.3s ease';
    input.style.opacity = '0.3';
    setTimeout(() => {
      input.placeholder = this.getNextPlaceholder();
      input.style.opacity = '1';
    }, 300);
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
    
    // AI fallback using Gemini 2.0 Flash
    if (this.useAI) {
      this.queryGemini(text);
    } else {
      this.addMessage(this.personality.fallback, 'mica');
      this.renderQuickActions();
    }
  }
  
  async queryGemini(text) {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text }]
      });
      
      // Build request with system prompt and conversation history
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: this.gemini.systemPrompt + '\n\nConversación actual:' }]
          },
          ...this.conversationHistory
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.8,
          topP: 0.9
        }
      };
      
      const response = await fetch(`${this.gemini.endpoint}?key=${this.gemini.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Add to history
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: aiResponse }]
        });
        
        // Keep history manageable (last 10 messages)
        if (this.conversationHistory.length > 10) {
          this.conversationHistory = this.conversationHistory.slice(-10);
        }
        
        this.addMessage(aiResponse, 'mica');
        
        // Check if response suggests navigation
        this.checkForNavigationInResponse(aiResponse);
      } else {
        console.warn('[MICA] Gemini response error:', data);
        this.addMessage(this.personality.fallback, 'mica');
      }
    } catch (error) {
      console.warn('[MICA] Gemini API error:', error);
      this.addMessage(this.personality.fallback, 'mica');
    }
    this.renderQuickActions();
  }
  
  checkForNavigationInResponse(response) {
    // Auto-navigate if MICA mentions a route
    const navPatterns = [
      { match: /#\/galeria/i, target: '#/galeria' },
      { match: /#\/archivo/i, target: '#/archivo' },
      { match: /#\/destacada/i, target: '#/destacada' },
      { match: /#\/exposiciones/i, target: '#/exposiciones' },
      { match: /#\/contacto/i, target: '#/contacto' },
      { match: /#\/juegos/i, target: '#/juegos' }
    ];
    
    for (const nav of navPatterns) {
      if (nav.match.test(response)) {
        setTimeout(() => {
          window.location.hash = nav.target;
        }, 1500);
        break;
      }
    }
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
