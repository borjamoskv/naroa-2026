/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🐝 MICA SWARM ORCHESTRATOR v1.0
 * Flujo Glorioso: 10 IAs Especializadas
 * 
 * Arquitectura de enjambre para potenciar MICA con inteligencia distribuida
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class MICASwarmOrchestrator {
  constructor() {
    // 10 Agentes especializados del Flujo Glorioso
    this.agents = {
      // Fase 1: Investigación
      knowledge: {
        name: 'NotebookLM',
        emoji: '📚',
        triggers: ['catálogo', 'obras', 'serie', 'técnica', 'filosofía', 'kintsugi'],
        priority: 1
      },
      realtime: {
        name: 'Perplexity',
        emoji: '🔍',
        triggers: ['actualmente', 'ahora', 'hoy', '2026', 'próxima expo'],
        priority: 2
      },
      
      // Fase 2: Arquitectura
      architect: {
        name: 'Antigravity',
        emoji: '🏛️',
        triggers: [], // Orquestador central - siempre activo
        priority: 0
      },
      reasoning: {
        name: 'Claude Opus',
        emoji: '🧠',
        triggers: ['por qué', 'significa', 'filosofía', 'profundo', 'análisis'],
        priority: 3
      },
      
      // Fase 3: Ejecución
      turbo: {
        name: 'Gemini Flash',
        emoji: '⚡',
        triggers: [], // Default para respuestas rápidas
        priority: 10
      },
      coder: {
        name: 'Kimi K2.5',
        emoji: '💻',
        triggers: ['código', 'shader', 'webgl', 'css', 'javascript'],
        priority: 4
      },
      
      // Fase 4: Visual
      imagery: {
        name: 'DALL-E',
        emoji: '🎨',
        triggers: ['muéstrame', 'visualiza', 'imagina', 'concepto'],
        priority: 5
      },
      video: {
        name: 'Veo 3.1',
        emoji: '🎬',
        triggers: ['video', 'animación', 'loop', 'transición'],
        priority: 6
      },
      
      // Fase 5: Publicación
      verifier: {
        name: 'Browser',
        emoji: '🌐',
        triggers: ['navegar', 'ver', 'comprobar', 'screenshot'],
        priority: 7
      },
      
      // Sales Agent (siempre activo para conversión)
      sales: {
        name: 'SalesAgent',
        emoji: '💰',
        triggers: ['precio', 'comprar', 'cuánto', 'original', 'vender', 'reservar'],
        priority: 1
      }
    };
    
    // NotebookLM Knowledge Base ID
    this.notebookId = '5686048e-8cec-4af7-90dc-90125f22519a';
    
    // Contexto de conversación para memoria
    this.context = {
      lastAgent: null,
      entities: new Set(),
      turnCount: 0
    };
    
    // Catálogo de obras para búsqueda directa
    this.artworkIndex = null;
    this.loadArtworkIndex();
  }
  
  /**
   * Cargar índice de obras para búsqueda rápida
   */
  async loadArtworkIndex() {
    try {
      const response = await fetch('/data/artworks-metadata.json');
      if (response.ok) {
        const data = await response.json();
        this.artworkIndex = data.artworks || data;
        console.log(`🐝 Swarm: Loaded ${this.artworkIndex.length} artworks`);
      }
    } catch (e) {
      console.warn('🐝 Swarm: Could not load artwork index');
    }
  }
  
  /**
   * Clasificar intención del usuario
   * @param {string} query - Pregunta del usuario
   * @returns {object} - Agente recomendado + metadatos
   */
  classify(query) {
    const queryLower = query.toLowerCase();
    const matches = [];
    
    // Buscar matches con triggers de cada agente
    for (const [agentId, agent] of Object.entries(this.agents)) {
      for (const trigger of agent.triggers) {
        if (queryLower.includes(trigger)) {
          matches.push({
            agentId,
            agent,
            trigger,
            confidence: this.calculateConfidence(queryLower, trigger)
          });
        }
      }
    }
    
    // Ordenar por confianza y prioridad
    matches.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return a.agent.priority - b.agent.priority;
    });
    
    // Retornar mejor match o turbo (default)
    if (matches.length > 0) {
      return matches[0];
    }
    
    // Default: Gemini Flash (turbo mode)
    return {
      agentId: 'turbo',
      agent: this.agents.turbo,
      trigger: 'default',
      confidence: 0.5
    };
  }
  
  /**
   * Calcular confianza del match
   */
  calculateConfidence(query, trigger) {
    // Más largo el trigger, más específico y mayor confianza
    const lengthScore = trigger.length / 20;
    
    // Posición en la query (inicio = más relevante)
    const position = query.indexOf(trigger);
    const positionScore = 1 - (position / query.length);
    
    return (lengthScore + positionScore) / 2;
  }
  
  /**
   * Buscar obra específica en el catálogo
   * @param {string} query - Nombre o descripción de la obra
   * @returns {object|null} - Obra encontrada o null
   */
  searchArtwork(query) {
    if (!this.artworkIndex) return null;
    
    const queryLower = query.toLowerCase();
    
    // Búsqueda exacta primero
    let match = this.artworkIndex.find(art => 
      art.title?.toLowerCase() === queryLower ||
      art.id?.toLowerCase() === queryLower
    );
    
    if (match) return match;
    
    // Búsqueda parcial
    match = this.artworkIndex.find(art => 
      art.title?.toLowerCase().includes(queryLower) ||
      art.description?.toLowerCase().includes(queryLower) ||
      art.tags?.some(tag => tag.toLowerCase().includes(queryLower))
    );
    
    return match;
  }
  
  /**
   * Routing principal del enjambre
   * @param {string} query - Pregunta del usuario
   * @returns {object} - Respuesta estructurada
   */
  async route(query) {
    this.context.turnCount++;
    
    // 1. Clasificar intención
    const classification = this.classify(query);
    console.log(`🐝 Swarm: Routed to ${classification.agent.emoji} ${classification.agent.name}`);
    
    // 2. Buscar obra específica (siempre)
    const artworkMatch = this.searchArtwork(query);
    
    // 3. Construir contexto enriquecido
    const enrichedContext = {
      classification,
      artwork: artworkMatch,
      history: this.context,
      timestamp: Date.now()
    };
    
    // 4. Actualizar contexto
    this.context.lastAgent = classification.agentId;
    if (artworkMatch) {
      this.context.entities.add(artworkMatch.id);
    }
    
    return enrichedContext;
  }
  
  /**
   * Generar prompt enriquecido para el agente seleccionado
   * @param {string} baseQuery - Query original
   * @param {object} context - Contexto del routing
   * @returns {string} - Prompt enriquecido
   */
  enrichPrompt(baseQuery, context) {
    let enrichment = '';
    
    // Si hay una obra específica encontrada
    if (context.artwork) {
      enrichment += `\n[OBRA DETECTADA]: "${context.artwork.title}"
- Serie: ${context.artwork.series || 'N/A'}
- Técnica: ${context.artwork.technique || 'Mixta'}
- Precio: ${context.artwork.price || 'Consultar'}
- Ruta: #/archivo/${context.artwork.id}
`;
    }
    
    // Si es un agente de ventas
    if (context.classification.agentId === 'sales') {
      enrichment += `\n[MODO VENTA TURBO]: Respuesta máximo 2 frases con CTA directo.`;
    }
    
    // Si es razonamiento profundo
    if (context.classification.agentId === 'reasoning') {
      enrichment += `\n[MODO ANÁLISIS]: Proporciona contexto filosófico y artístico.`;
    }
    
    return baseQuery + enrichment;
  }
  
  /**
   * Obtener sugerencias de navegación basadas en contexto
   * @param {object} context - Contexto actual
   * @returns {array} - Sugerencias de navegación
   */
  getNavigationSuggestions(context) {
    const suggestions = [];
    
    if (context.artwork) {
      suggestions.push({
        label: `Ver "${context.artwork.title}"`,
        target: `#/archivo/${context.artwork.id}`
      });
    }
    
    // Sugerencias por agente
    switch (context.classification.agentId) {
      case 'sales':
        suggestions.push({ label: '📧 Contactar', target: '#/contacto' });
        break;
      case 'knowledge':
        suggestions.push({ label: '🖼️ Ver galería', target: '#/galeria' });
        break;
    }
    
    return suggestions;
  }
}

// Singleton para uso global
window.MICASwarm = new MICASwarmOrchestrator();

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MICASwarmOrchestrator;
}
