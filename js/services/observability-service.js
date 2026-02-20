/**
 * 👁️ OBSERVABILITY SERVICE
 * Sistema ligero de monitoreo y captura de errores para Naroa 2026.
 * Cumple con el punto 4 de la lista de auditoría de seguridad.
 */

class ObservabilityService {
    constructor() {
        this.maxLogs = 50;
        this.logs = JSON.parse(localStorage.getItem('naroa_logs') || '[]');
        this.initialized = false;
    }

    /**
     * Inicializa la captura global de errores y promesas fallidas
     */
    init() {
        if (this.initialized) return;

        // Capturar errores no manejados
        window.onerror = (message, source, lineno, colno, error) => {
            this.log('ERROR', `${message} at ${source}:${lineno}:${colno}`, { stack: error?.stack });
            return false; // Dejar que el error siga su curso normal
        };

        // Capturar promesas rechazadas no manejadas
        window.onunhandledrejection = (event) => {
            this.log('REJECTION', event.reason?.message || 'Unknown promise rejection', { 
                reason: event.reason 
            });
        };

        this.log('INFO', 'Observability Service initialised');
        this.initialized = true;
        
        // Exponer globalmente para depuración manual si es necesario
        window.NaroaObs = this;
    }

    /**
     * Registra un log con timestamp
     * @param {string} level - INFO, WARN, ERROR, REJECTION
     * @param {string} message - Mensaje descriptivo
     * @param {object} context - Datos adicionales opcionales
     */
    log(level, message, context = {}) {
        const entry = {
            ts: new Date().toISOString(),
            level,
            msg: message,
            ctx: context,
            url: window.location.href
        };

        this.logs.unshift(entry);
        
        // Limitar tamaño
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // Persistir en localStorage
        try {
            localStorage.setItem('naroa_logs', JSON.stringify(this.logs));
        } catch (e) {
            Logger.warn('Obs: LocalStorage full, clearing logs');
            localStorage.removeItem('naroa_logs');
        }

        // También al console
        const color = level === 'ERROR' || level === 'REJECTION' ? 'red' : level === 'WARN' ? 'orange' : 'cyan';
    }

    /**
     * Retorna todos los logs acumulados
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Limpia el historial
     */
    clear() {
        this.logs = [];
        localStorage.removeItem('naroa_logs');
        this.log('INFO', 'Logs cleared');
    }

    /**
     * Exporta los logs como string (para que el usuario los envíe si hay fallos)
     */
    export() {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Singleton export
export const obs = new ObservabilityService();
export default obs;
