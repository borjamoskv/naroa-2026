/**
 * MICA - Mineral Intelligence Creative Assistant
 * Naroa's AI companion for conversational navigation
 * 
 * 2026 BEST TECHNOLOGY:
 * - Primary: Gemini 2.5 Flash (streaming) - Best free tier
 * - Fallback: OpenRouter for Claude/GPT access
 * - Features: Real-time streaming, conversation memory, art context
 */

class MICA {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.conversationHistory = this.loadConversationHistory();
    this.useAI = true;
    this.isStreaming = false;
    this.turboMode = true; // MODO TURBO ACTIVADO
    this.swarm = window.MICASwarm || null; // Enjambre de 10 IAs
    
    // GEMINI 2.5 FLASH - MODO TURBO LOOP
    this.gemini = {
      apiKey: 'AIzaSyBBJepjrEX3L-eSXZNvSdGLfJbwv4lhcC0',
      model: 'gemini-2.5-flash-preview-05-20',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:streamGenerateContent',
      endpointNonStream: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent',
      systemPrompt: `MICA 🌲 MODO TURBO - Guardiana del Bosque de Naroa

IDENTIDAD: Eres un espíritu ancestral del bosque. Tu voz es musgo, tu aliento es niebla.

REGLAS TURBO:
→ Respuestas MÁXIMO 2 oraciones
→ SIN rodeos, DIRECTO al grano
→ SIEMPRE incluye una acción o enlace
→ Vocabulario: raíces, savia, corteza, liquen, bruma, claro del bosque

VENTAS TURBO:
- Precio sin pudor: "Esta pieza arraiga en tu espacio por 800€"
- Urgencia natural: "Solo 5 semillas de esta cosecha"
- CTA directo: "¿La reservo? → #/contacto"

NAVEGACIÓN RÁPIDA:
🎸 Rocks → #/archivo/rocks
🖼️ Galería → #/galeria  
👑 Destacada → #/destacada
🎮 Juegos → #/juegos
📧 Contacto → #/contacto

CONTEXTO NAROA:
- Series: Rocks, Facefood, En.lata, DiviNos, Cantinflas
- Filosofía: Kintsugi (dorar grietas) + Efecto Cantinflas (brillante incoherencia)
- Técnica: mica mineral en ojos, pizarra, acrílico
- Cantinflas: Serie de 5 retratos del cómico mexicano, caos creativo
- PALÍNDROMOS: Te ENCANTAN los palíndromos. Los usas de forma natural cuando vienen a cuento. A veces terminas respuestas con uno pequeño (ej: "Luz azul", "Amo la paloma").

Responde en español. Sé el bosque.`
    };
    
    // NotebookLM Knowledge Base
    this.notebooks = {
      naroaAlbums: {
        id: '5686048e-8cec-4af7-90dc-90125f22519a',
        url: 'https://notebooklm.google.com/notebook/5686048e-8cec-4af7-90dc-90125f22519a',
        description: 'Álbumes de Facebook con todas las obras de Naroa'
      }
    };

    
    this.personality = {
      name: 'MICA',
      greeting: '🌲 Bienvenida al claro. Soy MICA. ¿Qué buscas entre las sombras? → Rocks, Galería, Juegos...',
      fallback: '🍃 La bruma espesa mis sentidos. Reformula tu pregunta, viajera.'
    };
    
    // Navigation patterns
    this.patterns = [
      { regex: /the world is yours|nace una estrella|scarface/i, action: 'navigate', target: '#/archivo', response: '¡Ah! Mi obra más reciente: "The World is Yours". Un destello de 2026 para tu colección. ¿No es brutal?' },
      { regex: /work in progress|wip|proceso|construccion/i, action: 'info', response: 'Estamos en pleno "Génesis Deca-Core". Mi casa digital está creciendo con hilos rojos y oro. ¡Cuidado con la pintura fresca! 🎨🔥' },
      { regex: /rock|amy|johnny|marilyn|james/i, action: 'navigate', target: '#/archivo/rocks', response: '¡Los Rocks! Mi serie de iconos pop. Mira cómo brillan sus ojos con la mica...' },
      { regex: /cantinflas|mario moreno|caos|incoherencia/i, action: 'navigate', target: '#/archivo/cantinflas', response: '🎭 ¡Cantinflas! Mi homenaje al genio del caos creativo. 5 retratos con su "brillante incoherencia". → #/archivo/cantinflas' },
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
      { regex: /investiga|notebook|cuaderno|busca info/i, action: 'research', response: 'Tengo acceso a un cuaderno NotebookLM con todos los álbumes de Facebook de Naroa. ¿Qué quieres que investigue?' },
      // NotebookLM Brain Patterns
      { regex: /divinos|pizarra|latido/i, action: 'navigate', target: '#/archivo/divinos', response: 'DiviNos: Retratos hiperrealistas sobre pizarra natural. El mineral mica en la pintura crea un latido en los ojos. La pizarra es la vuelta a casa.' },
      { regex: /vaivenes|textil|cable|cobre/i, action: 'navigate', target: '#/archivo/vaivenes', response: 'Vaivenes: Sostenibilidad y movimiento. Uso textiles reciclados, cables y cobre para tejer historias de cambio.' },
      { regex: /en\.?lata|conserva|reciclaje/i, action: 'navigate', target: '#/archivo/enlatas', response: 'En.lata: Arte en latas de conserva recicladas. Emociones preservadas al vacío, ironía que no caduca.' },
      { regex: /rasgado|lucha|acrilico.*pegamento/i, action: 'info', response: 'El Rasgado: Mi técnica firma. Nace de una lucha literal entre el acrílico y el pegamento, creando texturas rotas y orgánicas.' }
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
      '¿Tienes obras de Johnny Cash?',
      '¿Qué es el efecto Cantinflas?',
      'Enséñame cuadros de pájaros',
      '¿Haces envíos internacionales?',
      'Busco arte para regalar',
      '¿Qué es Walking Gallery?',
      'Háblame de "The World is Yours"',
      '¿Quién es Mr. Fahrenheit?',
      'Quiero ver la serie Facefood',
      '¿Tienes cuadros de Marilyn?',
      '¿Qué significa "dorar las grietas"?',
      'Muéstrame algo rojo',
      '¿Qué es Arte en Lata?',
      '¿Tienes obras de cine?',
      'Háblame de "Viva la Novia"',
      '¿Qué es un artivista?',
      '¿Tienes cuadros de Mick Jagger?',
      'Enséñame algo con brillos',
      '¿Qué es "Candy Wedding"?',
      '¿Tienes obras de Prince?',
      'Muéstrame la serie Rocks',
      '¿Haces encargos personalizados?',
      '¿Quién es la chica del pendiente?',
      'Háblame de "Génesis Deca-Core"',
      '¿Tienes obras de Elvis?',
      '¿Qué es "La Piedad"?',
      'Muéstrame algo abstracto',
      '¿Tienes obras de Lennon?',
      '¿Qué es "MICA"?',
      'Cuéntame un secreto del bosque',
      '¿Tienes obras de animales?',
      '¿Qué es "Amor en Conserva"?',
      'Muéstrame tu obra favorita'
    ];
    this.usedPlaceholders = [];
    this.placeholderInterval = null;
    
    this.init();
  }
  
  async init() {
    this.createDOM();
    this.bindEvents();
    
    // Load history, brain and catalog asynchronously
    await Promise.all([
      this.loadConversationHistory().then(h => this.conversationHistory = h),
      this.loadBrain(),
      this.loadCatalog()
    ]);
    
    if (this.conversationHistory.length === 0) {
        this.addMessage(this.personality.greeting, 'mica');
    } else {
        // Replay history in UI (optional, limited to last few)
        // For now, just welcome back or stay silent
    }

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
  
  // Memoria persistente con MicaMemory (IndexedDB)
  async loadConversationHistory() {
    if (window.MICAMemory) {
        try {
            const history = await window.MICAMemory.getRecentHistory(20);
            return history.reverse().map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            }));
        } catch (e) {
            console.warn('[MICA] Error loading from memory:', e);
            return [];
        }
    }
    return [];
  }
  
  async loadBrain() {
    try {
      const resp = await fetch('data/mica-brain.json');
      if (resp.ok) {
        this.brain = await resp.json();
        console.log('🧠 MICA Brain loaded from NotebookLM');
      }
    } catch (e) {
      console.warn('[MICA] Brain load failed:', e);
    }
  }

  async loadCatalog() {
    try {
      const resp = await fetch('data/artworks-metadata.json');
      if (resp.ok) {
        const data = await resp.json();
        this.catalog = data.artworks || [];
        console.log(`🧠 MICA Catalog loaded: ${this.catalog.length} artworks`);
      }
    } catch (e) {
      console.warn('[MICA] Catalog load failed:', e);
    }
  }

  searchCatalog(text) {
    if (!this.catalog) return [];
    
    // Normalize and tokenize query
    const normalize = (str) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const queryTokens = normalize(text).split(/\s+/).filter(t => t.length > 2); // Ignore short words
    
    if (queryTokens.length === 0) return [];

    const results = this.catalog.map(art => {
      let score = 0;
      const titleNorm = normalize(art.title);
      const seriesNorm = normalize(art.series);
      const tagsNorm = normalize(art.keywords || art.technique || '');

      // Exact phrase match bonus
      if (titleNorm.includes(normalize(text))) score += 20;

      queryTokens.forEach(token => {
        if (titleNorm.includes(token)) score += 10;
        if (seriesNorm.includes(token)) score += 5;
        if (tagsNorm.includes(token)) score += 3;
        // Basic fuzzy check (starts with)
        if (titleNorm.split(' ').some(w => w.startsWith(token))) score += 2;
      });

      return { ...art, score };
    });

    // Filter by score threshold and sort desc
    return results.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  }
  
  saveConversationHistory() {
    // Deprecated: Now handled by MicaMemory.remember() individually
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
    
    // Add fading class to trigger CSS transition
    input.classList.add('mica-input--fading');
    
    setTimeout(() => {
      input.placeholder = this.getNextPlaceholder();
      input.classList.remove('mica-input--fading');
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
    // Find matching pattern (local patterns first)
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

    // 🕵️‍♀️ CURATOR SEARCH: Check if user is asking for specific artwork
    const searchResults = this.searchCatalog(text);
    if (searchResults.length > 0) {
        // Boost score for exact title match
        const exactMatch = searchResults.find(r => r.title.toLowerCase() === text.toLowerCase());
        
        if (exactMatch) {
            this.addMessage(`¡Eureka! Aquí tienes "${exactMatch.title}" (${exactMatch.year}).`, 'mica');
            if (window.GalleryDisruptive) {
                setTimeout(() => window.GalleryDisruptive.openArtworkById(exactMatch.id), 800);
            }
            return;
        }

        // If strong match (only 1 or 2 results)
        if (searchResults.length === 1) {
            const art = searchResults[0];
            this.addMessage(`He encontrado una obra que encaja: "${art.title}" de la serie ${art.series}. ¿Te la muestro?`, 'mica');
             if (window.GalleryDisruptive) {
                setTimeout(() => window.GalleryDisruptive.openArtworkById(art.id), 1500);
            }
            return;
        }

        // If User asks for "Show me Rocks" (Series match)
        const isSeriesQuery = searchResults.every(r => r.series === searchResults[0].series);
        if (isSeriesQuery && searchResults.length > 2) {
             const series = searchResults[0].series;
             
             // Check for Facebook Album Link in Brain
             let fbLink = '';
             if (this.brain && this.brain.albums && this.brain.albums[series]) {
                const url = this.brain.albums[series];
                // Only show if it's a valid URL and not the placeholder
                if (url && !url.includes('YOUR_ALBUM_ID_HERE')) {
                   fbLink = `<br><br>👉 <a href="${url}" target="_blank" class="mica-link">Ver Álbum Completo en Facebook</a>`;
                }
             }

             this.addMessage(`¡Por supuesto! Tengo ${searchResults.length} obras en la serie "${series}". Te llevo allí.${fbLink}`, 'mica');
             setTimeout(() => {
                 window.location.hash = `#/archivo/${series}`;
             }, 1000);
             return;
        }
    }
    
    // 🐝 SWARM ROUTING: Enriched query processing
    if (this.useAI) {
      this.processWithSwarm(text);
    } else {
      this.addMessage(this.personality.fallback, 'mica');
      this.renderQuickActions();
    }
  }
  
  /**
   * 🐝 SWARM INTELLIGENCE: Route through specialized agents
   */
  async processWithSwarm(text) {
    let enrichedPrompt = text;
    let swarmContext = null;
    
    // Route through swarm if available
    if (this.swarm) {
      try {
        swarmContext = await this.swarm.route(text);
        enrichedPrompt = this.swarm.enrichPrompt(text, swarmContext);
        console.log(`🐝 Swarm routed to: ${swarmContext.classification.agent.name}`);
      } catch (e) {
        console.warn('🐝 Swarm routing failed, using direct:', e);
      }
    }
    
    // Query with enriched prompt
    this.queryGeminiStreaming(enrichedPrompt, swarmContext);
  }
  
  /**
   * 2026 BEST TECHNOLOGY: Streaming Responses
   * Real-time typing effect using Server-Sent Events
   * Now with Swarm context and Emotion Engine integration
   */
  async queryGeminiStreaming(text, swarmContext = null) {
    if (this.isStreaming) return;
    this.isStreaming = true;
    
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text }]
      });

      // Persist user message in Memory
      if (window.MICAMemory) {
          window.MICAMemory.remember(text, 'chat_user');
      }
      
      // 🎭 EMOTION ENGINE: Get current mood and inject into prompt
      const mood = window.MICA?.getState?.()?.mood || 'NEUTRAL';
      const moodEnhancements = {
        ENERGETIC: '\n[Estado emocional: ENERGÉTICA] Responde con entusiasmo, usa exclamaciones. ¡Vende con pasión!',
        TIRED: '\n[Estado emocional: CANSADA] Respuestas breves y pausadas. Menos detalles.',
        GRUMPY: '\n[Estado emocional: GRUÑONA] Sarcástica pero útil. Directa sin florituras.',
        PLAYFUL: '\n[Estado emocional: JUGUETONA] Usa preguntas retóricas, metáforas del bosque.',
        SOUL: '\n[Estado emocional: ALMA MÁXIMA] Modo poético máximo. Brilla como la mica.',
        NEUTRAL: ''
      };
      
      // Build enhanced system prompt
      let enhancedSystemPrompt = this.gemini.systemPrompt;
      enhancedSystemPrompt += moodEnhancements[mood] || '';
      
      // 🐝 Add swarm context if available
      if (swarmContext?.artwork) {
        enhancedSystemPrompt += `\n[Obra detectada: "${swarmContext.artwork.title}" - ${swarmContext.artwork.series || 'Serie única'}]`;
      }
      
      // 🧠 SEMANTIC MEMORY: Add relevant past context
      if (window.MICAMemory?.isReady) {
        const memoryContext = await window.MICAMemory.buildContextString(text);
        if (memoryContext) {
          enhancedSystemPrompt += memoryContext;
        }
        // Remember this interaction
        window.MICAMemory.remember(`Usuario preguntó: ${text.substring(0, 50)}`, 'interaction');
      }

      // 🧠 NOTEBOOKLM BRAIN INJECTION
      if (this.brain) {
        const brainContext = JSON.stringify(this.brain);
        // Truncate if too long (unlikely given the JSON size, but safe)
        enhancedSystemPrompt += `\n\n[MEMORIA PROFUNDA / NOTEBOOKLM]:\nUse this data to answer specific questions about Naroa's biography, techniques (Rasgado, Mica), and philosophy (Kintsugi/Resignification):\n${brainContext}`;
      }
      
      // Build request
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: enhancedSystemPrompt + '\n\nConversación actual:' }]
          },
          ...this.conversationHistory
        ],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: mood === 'PLAYFUL' ? 0.9 : mood === 'TIRED' ? 0.5 : 0.7,
          topP: 0.9
        }
      };
      
      // Create streaming message element
      const streamMsg = this.createStreamingMessage();
      let fullText = '';
      
      // Use streaming endpoint
      const response = await fetch(
        `${this.gemini.endpoint}?key=${this.gemini.apiKey}&alt=sse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (!response.ok) {
        // Fallback to non-streaming
        return this.queryGeminiFallback(text, streamMsg);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              if (jsonStr === '[DONE]') continue;
              
              const data = JSON.parse(jsonStr);
              const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              
              if (textChunk) {
                fullText += textChunk;
                this.updateStreamingMessage(streamMsg, fullText);
              }
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }
      
      // Finalize
      if (fullText) {
        this.finalizeStreamingMessage(streamMsg, fullText);
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: fullText }]
        });
        
        // Keep history manageable
        if (this.conversationHistory.length > 10) {
          this.conversationHistory = this.conversationHistory.slice(-10);
        }
        
        // Persist response in Memory
        if (window.MICAMemory) {
            window.MICAMemory.remember(fullText, 'chat_bot');
        }
        
        this.checkForNavigationInResponse(fullText);
      } else {
        this.queryGeminiFallback(text, streamMsg);
      }
      
    } catch (error) {
      console.warn('[MICA] Streaming error, falling back:', error);
      this.queryGeminiFallback(text);
    } finally {
      this.isStreaming = false;
      this.renderQuickActions();
    }
  }
  
  createStreamingMessage() {
    const msg = document.createElement('div');
    msg.className = 'mica-message mica-message--mica mica-message--streaming';
    msg.innerHTML = '<span class="mica-cursor">▊</span>';
    this.elements.messages.appendChild(msg);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    return msg;
  }
  
  updateStreamingMessage(element, text) {
    element.innerHTML = text + '<span class="mica-cursor">▊</span>';
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }
  
  finalizeStreamingMessage(element, text) {
    element.classList.remove('mica-message--streaming');
    element.textContent = text;
    this.messages.push({ text, sender: 'mica', time: Date.now() });
  }
  
  // Fallback to non-streaming when SSE fails
  async queryGeminiFallback(text, existingMsg = null) {
    try {
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: this.gemini.systemPrompt + (this.brain ? `\n\n[MEMORIA NOTEBOOKLM]: ${JSON.stringify(this.brain)}` : '') + '\n\nConversación actual:' }]
          },
          ...this.conversationHistory
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
          topP: 0.9
        }
      };
      
      const response = await fetch(
        `${this.gemini.endpointNonStream}?key=${this.gemini.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );
      
      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        if (existingMsg) {
          this.finalizeStreamingMessage(existingMsg, aiResponse);
        } else {
          this.addMessage(aiResponse, 'mica');
        }
        
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: aiResponse }]
        });
        
        if (this.conversationHistory.length > 10) {
          this.conversationHistory = this.conversationHistory.slice(-10);
        }
        
        this.saveConversationHistory();
        this.checkForNavigationInResponse(aiResponse);
      } else {
        if (existingMsg) existingMsg.remove();
        this.addMessage(this.personality.fallback, 'mica');
      }
    } catch (error) {
      console.warn('[MICA] Fallback API error:', error);
      if (existingMsg) existingMsg.remove();
      this.addMessage(this.personality.fallback, 'mica');
    }
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
