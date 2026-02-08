/**
 * MICA Brain v1.0 - Core Intelligence
 *
 * El cerebro central de MICA. Orquesta:
 * - Memoria (Semantic + Episodic)
 * - Estado Emocional (Energy + Mood)
 * - Generación de Respuestas (Gemini API via Cloud Function o simulado)
 * - Swarm Delegation (Agentes especializados)
 */

export class MicaBrain {
    constructor() {
        this.state = {
            mood: 'neutral',   // neutral, excited, intrigued, zen
            energy: 80,        // 0-100
            currentContext: 'home'
        };
        
        this.config = {
            name: 'MICA',
            version: '7.0',
            personality: {
                tone: 'warm', // warm, professional, artistic
                verbosity: 0.7 // 0-1
            }
        };

        // Enlace a memoria global
        this.memory = window.MICAMemory || null; // Espera a que cargue
    }

    /**
     * Inicializa el cerebro
     */
    async init() {
        console.log('[MicaBrain] Initializing Neural Core...');
        // Cargar estado previo si existe
        if (this.memory) {
            const lastState = await this.memory.recall('mica_state_snapshot', 1);
            if (lastState && lastState.length > 0) {
                // Restore state logic
            }
        }
    }

    /**
     * Procesa entrada del usuario
     * @param {string} input - Texto del usuario
     * @param {string} context - Contexto actual (ej: 'artwork-detail')
     */
    async processInput(input, context = 'general') {
        this.state.currentContext = context;
        
        // 1. Guardar input en memoria
        if (this.memory) {
            await this.memory.remember(input, 'chat_user', { context });
            
            // Extraer facts implícitos (simple NLP)
            if (input.toLowerCase().includes('me gusta')) {
                await this.memory.remember(input, 'preference');
            }
        }

        // 2. Analizar intención (Swarm Routing)
        const intent = this.detectIntent(input);
        
        // 3. Generar respuesta
        let response = '';
        
        if (intent === 'sales') {
            response = await this.delegateToSalesAgent(input);
        } else if (intent === 'art_expert') {
            response = await this.delegateToArtExpert(input);
        } else {
            response = await this.generateConversation(input);
        }

        // 4. Actualizar estado emocional
        this.evolveState(input, response);

        // 5. Guardar respuesta
        if (this.memory) {
            await this.memory.remember(response, 'chat_bot', { context, mood: this.state.mood });
        }

        return {
            text: response,
            mood: this.state.mood,
            intent: intent
        };
    }

    /**
     * Detecta la intención del usuario
     */
    detectIntent(input) {
        const text = input.toLowerCase();
        if (text.includes('precio') || text.includes('comprar') || text.includes('encargo')) return 'sales';
        if (text.includes('técnica') || text.includes('inspiración') || text.includes('significado')) return 'art_expert';
        return 'chat';
    }

    /**
     * Simulación de generación de agentes (Placeholder para LLM real)
     */
    async delegateToSalesAgent(input) {
        // En un futuro, esto llamaría a un agente especializado
        return "Para temas de adquisición o encargos, te sugiero usar el nuevo Panel de Videollamada. ¿Te gustaría que te abra la agenda?";
    }

    async delegateToArtExpert(input) {
        return "Esa es una pregunta profunda. La obra de Naroa explora la dualidad entre lo digital y lo orgánico...";
    }

    async generateConversation(input) {
        // Aquí iría la llamada a la API de Gemini
        // Por ahora, lógica simple basada en memoria
        
        let contextString = '';
        if (this.memory) {
            contextString = await this.memory.buildContextString(input);
        }

        const responses = [
            "Interesante perspectiva.",
            "Cuéntame más sobre eso.",
            "Absolutamente.",
            "Esa vibración es muy MICA NOIR."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)] + (contextString ? " (Recordé algo sobre eso...)" : "");
    }

    /**
     * Evoluciona el estado emocional
     */
    evolveState(input, response) {
        // Lógica simple de evolución
        if (input.length > 50) this.state.energy = Math.min(100, this.state.energy + 10);
        if (input.includes('gracias')) this.state.mood = 'happy';
    }
}

export const micaBrain = new MicaBrain();
