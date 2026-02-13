/**
 * Google Stitch Service
 * Integración con la API de Google Stitch para generación de UI con IA
 * @version 1.0.0
 */

class StitchService {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://stitch.googleapis.com/v1';
        this.initialized = false;
    }

    /**
     * Inicializa el servicio con la API key
     */
    async init() {
        // En producción, la key vendría de variables de entorno del servidor
        // Para desarrollo local, usamos la key directamente
        try {
            // Intentar cargar desde .env (requiere bundler con soporte dotenv)
            // Vite expone variables con prefijo VITE_ automáticamente en import.meta.env
            this.apiKey = import.meta.env?.VITE_STITCH_API_KEY || null;
            this.initialized = !!this.apiKey;
            
            if (this.initialized) {
                console.log('✅ Stitch Service: Initialized with API Key');
            } else {
                console.warn('⚠️ Stitch API key not found in env. UI generation disabled.');
            }
        } catch (e) {
            console.warn('⚠️ Stitch Service: Running without API key');
        }
        
        return this.initialized;
    }

    /**
     * Genera una interfaz desde un prompt de texto
     * @param {string} prompt - Descripción de la UI deseada
     * @param {object} options - Opciones adicionales
     * @returns {Promise<object>} - Proyecto generado con código
     */
    async generateUI(prompt, options = {}) {
        if (!this.initialized) {
            console.warn('Stitch not initialized. Returning mock response.');
            return this._getMockResponse(prompt);
        }

        const payload = {
            prompt,
            style: options.style || 'modern-dark',
            framework: options.framework || 'vanilla',
            responsive: options.responsive !== false,
            colorScheme: options.colorScheme || {
                background: '#0a0a0a',
                accent: '#32CD32',
                cta: '#8B0000',
                text: '#ffffff'
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Stitch API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Stitch generation failed:', error);
            return this._getMockResponse(prompt);
        }
    }

    /**
     * Lista proyectos existentes en Stitch
     * @returns {Promise<array>}
     */
    async listProjects() {
        if (!this.initialized) return [];

        try {
            const response = await fetch(`${this.baseUrl}/projects`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to list Stitch projects:', error);
            return [];
        }
    }

    /**
     * Exporta el código de un proyecto
     * @param {string} projectId 
     * @returns {Promise<object>}
     */
    async exportCode(projectId) {
        if (!this.initialized) return null;

        try {
            const response = await fetch(`${this.baseUrl}/projects/${projectId}/export`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to export Stitch project:', error);
            return null;
        }
    }

    /**
     * Respuesta mock para desarrollo sin API key
     */
    _getMockResponse(prompt) {
        return {
            success: true,
            mock: true,
            message: 'Mock response - Stitch API not connected',
            prompt,
            generatedAt: new Date().toISOString()
        };
    }
}

// Singleton export
export const stitchService = new StitchService();
export default stitchService;
