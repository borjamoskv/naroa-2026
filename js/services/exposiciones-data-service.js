/**
 * Exposiciones Data Service
 * Fuente de datos para el timeline de exposiciones
 * Prioridad: NotebookLM/Rovo Search → JSON local
 * @version 1.0.0
 */

class ExposicionesDataService {
    constructor() {
        this.cache = null;
        this.cacheExpiry = 0;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    }

    /**
     * Obtiene datos de exposiciones con estrategia de fallback
     * @returns {Promise<Array>} Lista de exposiciones
     */
    async getExposiciones() {
        // Check cache first
        if (this.cache && Date.now() < this.cacheExpiry) {
            console.log('[ExposicionesData] Serving from cache');
            return this.cache;
        }

        let data = null;

        // 1. Intentar NotebookLM/Gemini (si está configurado)
        try {
            data = await this.fetchFromNotebookLM();
            if (data && data.length > 0) {
                console.log('[ExposicionesData] Data from NotebookLM:', data.length, 'items');
                this.setCache(data);
                return data;
            }
        } catch (e) {
            console.warn('[ExposicionesData] NotebookLM unavailable:', e.message);
        }

        // 2. Fallback: JSON local
        try {
            data = await this.fetchFromLocalJSON();
            console.log('[ExposicionesData] Data from local JSON:', data.length, 'items');
            this.setCache(data);
            return data;
        } catch (e) {
            console.error('[ExposicionesData] Local JSON failed:', e);
            return [];
        }
    }

    /**
     * Intenta obtener datos desde NotebookLM via Gemini API
     * NotebookLM actúa como "Master Source" con contexto de Naroa
     */
    async fetchFromNotebookLM() {
        // Verificar si MICA (que usa Gemini) está disponible
        if (!window.micaInstance || !window.micaInstance.apiKey) {
            throw new Error('MICA/Gemini not configured');
        }

        const prompt = `
            Eres el asistente de Naroa Gutiérrez Gil. 
            Dame un JSON array con TODAS las exposiciones de Naroa desde 2013 hasta 2025.
            Formato exacto por exposición:
            {
                "id": "kebab-case-id",
                "title": "Título",
                "subtitle": "Subtítulo opcional",
                "location": "Lugar, Ciudad",
                "year": 2024,
                "month": "January",
                "day": 15,
                "type": "solo|group|online|market|festival|publication",
                "description": "Descripción opcional",
                "url": "URL opcional"
            }
            Responde SOLO con el JSON array, sin explicaciones.
        `;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + window.micaInstance.apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 8000
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Extraer JSON del texto
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in response');
        }

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Carga datos desde el JSON local
     */
    async fetchFromLocalJSON() {
        const response = await fetch('/data/exhibitions.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const json = await response.json();
        return json.exhibitions || [];
    }

    /**
     * Guarda en caché
     */
    setCache(data) {
        this.cache = data;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    }

    /**
     * Invalida el caché
     */
    invalidateCache() {
        this.cache = null;
        this.cacheExpiry = 0;
    }

    /**
     * Agrupa exposiciones por año
     */
    groupByYear(exposiciones) {
        const grouped = {};
        exposiciones.forEach(expo => {
            const year = expo.year;
            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(expo);
        });
        return grouped;
    }

    /**
     * Filtra por tipo
     */
    filterByType(exposiciones, type) {
        return exposiciones.filter(e => e.type === type);
    }

    /**
     * Estadísticas rápidas
     */
    getStats(exposiciones) {
        const byType = {};
        exposiciones.forEach(e => {
            byType[e.type] = (byType[e.type] || 0) + 1;
        });

        const years = [...new Set(exposiciones.map(e => e.year))].sort();
        
        return {
            total: exposiciones.length,
            byType,
            yearRange: years.length ? `${years[0]}-${years[years.length - 1]}` : 'N/A',
            soloCount: byType['solo'] || 0,
            groupCount: byType['group'] || 0
        };
    }
}

// Singleton export
export const exposicionesDataService = new ExposicionesDataService();
export default exposicionesDataService;
