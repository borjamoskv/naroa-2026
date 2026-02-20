/**
 * MICA NAROA PERSONALITY ENGINE
 * Sistema híbrido: Templates neuronales + Hugging Face API
 * Respuestas <100ms con personalidad artística de Naroa
 */

class MicaNaroaPersonality {
  constructor() {
    // Corpus de entrenamiento few-shot (embeddings de estilo)
    this.styleCorpus = {
      aesthetic: ['tritono', 'equilibrio', 'textura', 'espacio negativo', 'composición', 'ritmo visual'],
      process: ['intuición guiada', 'error controlado', 'iteración orgánica', 'juego serio'],
      emotionalMarkers: {
        approval: ['Tiene potencial', 'Esa combinación respira', 'Buen ojo'],
        doubt: ['Quizás necesite más aire', '¿Y si lo dejamos reposar?', 'Demasiado forzado'],
        inspiration: ['Me recuerda a...', 'Esto pide un collage', 'La tensión es interesante']
      }
    };

    // Configuración por mood (afecta temperatura y tokens)
    this.moodConfig = {
      ENERGETIC: { temp: 0.8, maxTokens: 40, creativity: 0.9, prefix: '¡Vamos! ' },
      TIRED: { temp: 0.4, maxTokens: 25, creativity: 0.3, prefix: 'Mm... ' },
      GRUMPY: { temp: 0.3, maxTokens: 20, creativity: 0.2, prefix: 'Bueno. ' },
      PLAYFUL: { temp: 1.0, maxTokens: 50, creativity: 1.0, prefix: '¿Y si...? ' },
      SOUL: { temp: 0.95, maxTokens: 60, creativity: 1.0, prefix: '✨ ' },
      NEUTRAL: { temp: 0.6, maxTokens: 35, creativity: 0.6, prefix: '' }
    };

    this.cache = new Map(); // LRU cache para respuestas frecuentes
    this.contextWindow = []; // Últimas 3 interacciones
    this.maxCacheSize = 50;
  }

  async generate(input, gameContext = null) {
    const mood = window.MICA?.getState()?.mood || 'NEUTRAL';
    const config = this.moodConfig[mood];
    
    // 1. Intentar template semántico (90% de casos, 0ms latencia)
    const template = this.matchSemanticTemplate(input, gameContext);
    if (template && Math.random() > 0.2) { // 80% uso template, 20% variación NN
      return this.applyStyle(template, mood);
    }

    // 2. Hugging Face Inference API (para conversación compleja)
    return await this.queryNeural(input, config, gameContext);
  }

  matchSemanticTemplate(input, gameContext) {
    // Matching basado en intención, no en string exacto
    const intent = this.extractIntent(input);
    
    const templates = {
      'start_game': [
        "Configurando el espacio... Listos para jugar con {game}",
        "Preparando el tablero. Que sea un proceso interesante",
        "Nueva partida. Intentemos encontrar el equilibrio en {game}"
      ],
      'victory': [
        "Checkmate visual. Buena composición",
        "Victoria. El ritmo estaba de tu lado",
        "Ganaste. Esa última jugada tenía tensión perfecta"
      ],
      'defeat': [
        "Colapsó la estructura... pero aprendimos algo del vacío",
        "Derrota. A veces el error es más interesante que el acierto",
        "Se acabó. Vamos, no es un museo, es solo un juego"
      ],
      'help_request': [
        "Mira el espacio negativo... ahí suele estar la clave",
        "Prueba con la intuición primero, la lógica después",
        "¿Y si desplazas la pieza que menos te convence?"
      ],
      'neutral': [
        "Exploremos eso...",
        "Interesante punto de vista",
        "Veamos dónde nos lleva esto"
      ]
    };

    const pool = templates[intent] || templates['neutral'];
    let response = pool[Math.floor(Math.random() * pool.length)];
    
    // Reemplazar variables
    if (gameContext && gameContext.game) {
      response = response.replace('{game}', gameContext.game);
    }
    
    return response;
  }

  async queryNeural(input, config, gameContext) {
    // Prompt engineering estructurado para estilo Naroa
    const systemPrompt = this.buildSystemPrompt(config, gameContext);
    
    const payload = {
      inputs: `${systemPrompt}\nUsuario: ${input}\nMICA:`,
      parameters: {
        max_new_tokens: config.maxTokens,
        temperature: config.temp,
        repetition_penalty: 1.3,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false
      }
    };

    try {
      // Usar distilgpt2 para velocidad (ligero) o flan-t5 para calidad
      const HF_TOKEN = 'hf_YOUR_TOKEN_HERE'; // Reemplazar con variable de entorno
      
      const response = await fetch(
        'https://api-inference.huggingface.co/models/distilgpt2',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error('HF API limit');
      
      const data = await response.json();
      let text = data[0].generated_text.trim();
      
      // Post-procesado de estilo Naroa
      text = this.postProcessNaroaStyle(text, config);
      
      // Guardar en caché
      this.addToCache(input.toLowerCase(), text);
      
      return text;
      
    } catch (error) {
      // Fallback graceful a templates
      Logger.warn('HF API fail, using templates:', error);
      return this.applyStyle("Exploremos eso...", window.MICA?.getState()?.mood || 'NEUTRAL');
    }
  }

  buildSystemPrompt(config, gameContext) {
    const gameVocab = gameContext ? this.getGameVocabulary(gameContext.game) : '';
    
    return `Eres MICA, asistente creativa de Naroa Gutiérrez Gil. 
Estilo: Minimalista, artístico, usa metáforas visuales (composición, textura, equilibrio).
Tono: ${config.temp > 0.7 ? 'Entusiasta' : config.temp < 0.5 ? 'Reservada' : 'Neutral'}.
Vocabulario: ${this.styleCorpus.aesthetic.join(', ')}${gameVocab}.
Reglas: Frases cortas (máx 10 palabras). Sin emojis. Usa "..." para pausas.`;
  }

  getGameVocabulary(gameId) {
    const vocabularies = {
      'tetris': ', bloques, encaje, gravedad, líneas',
      'chess': ', estrategia, sacrificio, tempo, apertura',
      'collage': ', capas, superposición, transparencia, montaje',
      'quiz': ', conocimiento, curiosidad, descubrimiento'
    };
    return vocabularies[gameId] || '';
  }

  postProcessNaroaStyle(text, config) {
    // Aplicar tics de personalidad según mood
    
    // Eliminar repeticiones
    text = text.replace(/(.+?)\1+/g, '$1');
    
    if (config.temp < 0.5) {
      // Modo grumpy/tired: pausas dramáticas, vocabulario selectivo
      text = text.replace(/\./g, '...');
      text = text.replace(/muy bueno/gi, 'aceptable');
      text = text.replace(/genial/gi, 'interesante');
    }
    
    if (config.temp > 0.8) {
      // Modo playful: capitalización irregular para ritmo visual
      const words = text.split(' ');
      text = words.map((w, i) => 
        i % 3 === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w
      ).join(' ');
    }
    
    // Asegurar que no exceda longitud
    return text.length > 60 ? text.substring(0, 60) + '...' : text;
  }

  applyStyle(baseText, mood) {
    const prefixes = this.moodConfig[mood]?.prefix || '';
    return prefixes + baseText;
  }

  extractIntent(input) {
    // NLP ligero local (sin API)
    const lower = input.toLowerCase();
    if (lower.match(/(empieza|jugar|start|nueva)/)) return 'start_game';
    if (lower.match(/(ayuda|help|cómo|how)/)) return 'help_request';
    if (lower.match(/(gané|victoria|win)/)) return 'victory';
    if (lower.match(/(perdí|derrota|lose)/)) return 'defeat';
    return 'neutral';
  }

  addToCache(key, value) {
    if (this.cache.size >= this.maxCacheSize) {
      // Eliminar entrada más antigua (LRU)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  // API pública para integración con juegos
  async speak(eventType, metadata = {}) {
    const response = await this.generate(eventType, metadata);
    
    // Trigger typewriter y partículas
    if (window.naroaTypewriter) {
      await window.naroaTypewriter.escribir(response);
    }
    
    return response;
  }
}

// Singleton global
if (typeof window !== 'undefined') {
  window.MicaNLP = new MicaNaroaPersonality();
}

export default MicaNaroaPersonality;
