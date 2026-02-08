/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 MICA SEMANTIC MEMORY v1.0
 * Memoria episódica persistente con IndexedDB
 * 
 * Features:
 * - IndexedDB para persistencia entre sesiones
 * - Aging automático de facts (>24h decay, >7d archive)
 * - Búsqueda semántica simple (keyword-based)
 * - Context compression para historial largo
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class MICAMemory {
  constructor() {
    this.dbName = 'MICAMemory';
    this.dbVersion = 2; // Incremented for new stores
    this.db = null;
    this.isReady = false;
    
    // Tipos de memoria
    this.factTypes = {
      PREFERENCE: 'preference',   // "Le gustan los Rocks"
      ARTWORK: 'artwork',         // "Preguntó por Cantinflas"
      INTERACTION: 'interaction', // "Visitó la galería"
      CONTEXT: 'context'          // Facts comprimidos del historial
    };
    
    this.init();
  }
  
  async init() {
    try {
      this.db = await this.openDatabase();
      this.isReady = true;
      console.log('🧠 MICA Memory: IndexedDB ready');
      
      // Run aging on startup
      await this.runAgingProtocol();
    } catch (e) {
      console.warn('🧠 MICA Memory: IndexedDB failed, using localStorage fallback', e);
      this.useFallback = true;
    }
  }
  
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Facts store (Existing)
        if (!db.objectStoreNames.contains('facts')) {
          const factsStore = db.createObjectStore('facts', { keyPath: 'id', autoIncrement: true });
          factsStore.createIndex('type', 'type', { unique: false });
          factsStore.createIndex('timestamp', 'timestamp', { unique: false });
          factsStore.createIndex('decayWeight', 'decayWeight', { unique: false });
        }
        
        // Sessions store (Existing)
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionsStore.createIndex('date', 'date', { unique: false });
        }

        // Conversations store (NEW for Dashboard)
        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', { keyPath: 'id', autoIncrement: true });
          convStore.createIndex('timestamp', 'timestamp', { unique: false });
          convStore.createIndex('session', 'session', { unique: false });
        }
      };
    });
  }
  
  /**
   * 📝 Recordar un hecho y opcionalmente el mensaje completo
   * @param {string} content - El hecho o mensaje interactivo
   * @param {string} type - Tipo de fact (preference, artwork, interaction, chat_user, chat_bot)
   * @param {object} metadata - Datos adicionales
   */
  async remember(content, type = 'interaction', metadata = {}) {
    if (!this.isReady) return;
    
    const timestamp = Date.now();

    // 1. Guardar en historial de chat si es mensaje
    if (type === 'chat_user' || type === 'chat_bot') {
        try {
            const tx = this.db.transaction('conversations', 'readwrite');
            const store = tx.objectStore('conversations');
            await store.add({
                role: type === 'chat_user' ? 'user' : 'assistant',
                content,
                timestamp,
                session: sessionStorage.getItem('mica_session_id') || 'default',
                ...metadata
            });
        } catch (e) {
            console.warn('🧠 Chat save failed:', e);
        }
    }

    // 2. Guardar fact semántico (solo si es relevante o explícito)
    if (type !== 'chat_user' && type !== 'chat_bot') {
        const fact = {
            content,
            type,
            metadata,
            timestamp,
            decayWeight: 1.0, 
            recalled: 0       
        };
        
        try {
            const tx = this.db.transaction('facts', 'readwrite');
            const store = tx.objectStore('facts');
            await store.add(fact);
            console.log(`🧠 Remembered Fact: "${content.substring(0, 30)}..."`);
        } catch (e) {
            console.warn('🧠 Fact remember failed:', e);
        }
    }
  }
  
  /**
   * 🔍 Recordar facts relevantes
   * @param {string} query - Búsqueda
   * @param {number} limit - Máximo de resultados
   */
  async recall(query, limit = 5) {
    if (!this.isReady) return [];
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const results = [];
    
    try {
      const tx = this.db.transaction('facts', 'readonly');
      const store = tx.objectStore('facts');
      const cursor = await this.cursorToArray(store.openCursor());
      
      // Simple semantic matching (keyword overlap)
      for (const fact of cursor) {
        const factWords = fact.content.toLowerCase().split(/\s+/);
        const overlap = queryWords.filter(w => factWords.some(fw => fw.includes(w))).length;
        
        if (overlap > 0) {
          results.push({
            ...fact,
            relevance: (overlap / queryWords.length) * fact.decayWeight
          });
        }
      }
      
      // Sort by relevance and boost recalled items
      results.sort((a, b) => {
        const scoreA = a.relevance + (a.recalled * 0.1);
        const scoreB = b.relevance + (b.recalled * 0.1);
        return scoreB - scoreA;
      });
      
      // Update recall count for returned items
      const topResults = results.slice(0, limit);
      for (const r of topResults) {
        await this.boostRecall(r.id);
      }
      
      return topResults;
    } catch (e) {
      console.warn('🧠 Recall failed:', e);
      return [];
    }
  }
  
  async boostRecall(factId) {
    try {
      const tx = this.db.transaction('facts', 'readwrite');
      const store = tx.objectStore('facts');
      const fact = await this.promisifyRequest(store.get(factId));
      if (fact) {
        fact.recalled++;
        fact.decayWeight = Math.min(1.0, fact.decayWeight + 0.1); // Refresh importance
        await store.put(fact);
      }
    } catch (e) {
      // Silent fail for boost
    }
  }

  /**
   * 📜 Obtener historial reciente (para Dashboard)
   */
  async getRecentHistory(limit = 20) {
      if (!this.isReady) return [];
      
      return new Promise((resolve, reject) => {
          try {
              const tx = this.db.transaction('conversations', 'readonly');
              const store = tx.objectStore('conversations');
              const index = store.index('timestamp');
              const request = index.openCursor(null, 'prev');
              
              const results = [];
              
              request.onsuccess = (event) => {
                  const cursor = event.target.result;
                  if (cursor && results.length < limit) {
                      results.unshift(cursor.value); // Orden cronológico
                      cursor.continue();
                  } else {
                      resolve(results);
                  }
              };
              
              request.onerror = () => reject(request.error);
          } catch (e) {
              resolve([]); // Fail safe
          }
      });
  }
  
  /**
   * 🗜️ Context Compression
   * Comprimir historial largo en facts semánticos
   */
  async compressConversation(history) {
    if (history.length < 10) return history;
    
    // Extract key facts from old messages
    const oldMessages = history.slice(0, -10);
    const facts = this.extractFacts(oldMessages);
    
    // Store as compressed context
    for (const fact of facts) {
      await this.remember(fact, 'context');
    }
    
    // Return only recent messages
    return history.slice(-10);
  }
  
  extractFacts(messages) {
    const facts = [];
    
    for (const msg of messages) {
      const text = msg.parts?.[0]?.text || '';
      
      // Extract artwork mentions
      if (text.match(/rocks|cantinflas|facefood|divinos|enlata/i)) {
        facts.push(`Usuario interesado en: ${text.match(/rocks|cantinflas|facefood|divinos|enlata/i)[0]}`);
      }
      
      // Extract price questions
      if (text.match(/precio|cuánto|comprar/i)) {
        facts.push('Usuario preguntó por precios');
      }
      
      // Extract preferences
      if (text.match(/me gusta|prefiero|favorit/i)) {
        facts.push(`Preferencia expresada: ${text.substring(0, 50)}`);
      }
    }
    
    return [...new Set(facts)]; // Deduplicate
  }
  
  /**
   * 📉 Aging Protocol
   * Reduce importance of old facts
   */
  async runAgingProtocol() {
    if (!this.isReady) return;
    
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const WEEK = 7 * DAY;
    
    try {
      const tx = this.db.transaction('facts', 'readwrite');
      const store = tx.objectStore('facts');
      const cursor = await this.cursorToArray(store.openCursor());
      
      for (const fact of cursor) {
        const age = now - fact.timestamp;
        
        if (age > WEEK) {
          // Archive: Delete or move to cold storage
          await store.delete(fact.id);
          console.log(`🧠 Archived old fact: "${fact.content.substring(0, 20)}..."`);
        } else if (age > DAY) {
          // Decay: Reduce importance
          fact.decayWeight = Math.max(0.1, fact.decayWeight - 0.2);
          await store.put(fact);
        }
      }
    } catch (e) {
      console.warn('🧠 Aging failed:', e);
    }
  }
  
  /**
   * 🔧 Build context string for prompts
   */
  async buildContextString(query) {
    const relevantFacts = await this.recall(query, 3);
    
    if (relevantFacts.length === 0) return '';
    
    const factStrings = relevantFacts.map(f => `- ${f.content}`).join('\n');
    return `\n[Memoria previa del usuario]:\n${factStrings}`;
  }
  
  // Helpers
  cursorToArray(cursorRequest) {
    return new Promise((resolve, reject) => {
      const results = [];
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  }
  
  promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * 📊 Stats for debugging
   */
  async getStats() {
    if (!this.isReady) return { ready: false };
    
    const tx = this.db.transaction('facts', 'readonly');
    const store = tx.objectStore('facts');
    const count = await this.promisifyRequest(store.count());
    
    return {
      ready: true,
      totalFacts: count,
      dbName: this.dbName
    };
  }
}

// Singleton global
if (typeof window !== 'undefined') {
  window.MICAMemory = new MICAMemory();
  console.log('🧠 MICA Semantic Memory Engine loaded');
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MICAMemory;
}
