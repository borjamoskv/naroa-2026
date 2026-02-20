/**
 * MICA TYPEWRITER - Sistema de escritura con personalidad Naroa
 * Simula escritura humana: errores, correcciones, jerga madrileña, velocidad variable
 */

class NaroaTypewriter {
    constructor(elementId = 'chat-output') {
        this.elemento = document.getElementById(elementId);
        if (!this.elemento) {
            Logger.error('Elemento no encontrado:', elementId);
            return;
        }
        
        this.texto = '';
        this.velocidadBase = 50;
        this.estaEscribiendo = false;
        
        // Palabras/características específicas del estilo Naroa
        this.muletillas = ['ostia', 'tío', 'tía', 'en serio', 'qué fuerte', 'madre mía'];
        this.correcciones = [
            { original: 'hola', corregido: 'holaaa' },
            { original: 'bien', corregido: 'bien bien' },
            { original: 'ok', corregido: 'vale vale' }
        ];
    }
    
    async escribir(texto) {
        this.estaEscribiendo = true;
        this.limpiar();
        
        // Crear un nodo de texto persistente para el contenido
        const textNode = document.createTextNode('');
        this.elemento.appendChild(textNode);
        
        // Añadir variaciones aleatorias al estilo Naroa
        texto = this.aplicarEstiloNaroa(texto);
        
        // Disparar evento de que MICA empieza a hablar
        document.dispatchEvent(new CustomEvent('mica-habla'));
        
        // Activar avatar si existe
        if (window.micaAvatar) {
            window.micaAvatar.activarHabla();
        }
        
        let i = 0;
        let txtActual = '';
        while (i < texto.length) {
            // Velocidad variable (más rápido en palabras comunes, lento en énfasis)
            let delay = this.velocidadBase + (Math.random() * 50 - 25);
            
            // Pausas en puntuación expresiva
            if ('.!?'.includes(texto[i])) {
                delay = 300 + Math.random() * 200;
            }
            
            // Simular error tipográfico ocasional (5% probabilidad)
            if (Math.random() < 0.05 && texto[i] !== ' ') {
                const error = this.generarError(texto[i]);
                textNode.textContent = txtActual + error;
                await this.esperar(delay);
                
                // Borrar error
                textNode.textContent = txtActual;
                await this.esperar(100);
            }
            
            // Escribir caracter correcto
            txtActual += texto[i];
            textNode.textContent = txtActual;
            
            // Scroll automático
            this.elemento.scrollTop = this.elemento.scrollHeight;
            
            // Efecto de partículas en el avatar (Easter egg)
            if (texto.toLowerCase().includes('ostia') && i === texto.toLowerCase().indexOf('ostia') + 4) {
                this.activarEasterEgg();
            }
            
            await this.esperar(delay);
            i++;
        }
        
        this.estaEscribiendo = false;
        
        // Efecto de "pensando" al final (cursor parpadeante custom)
        this.iniciarCursorIdle();
    }
    
    aplicarEstiloNaroa(texto) {
        // Añadir muletillas al inicio ocasionalmente
        if (Math.random() < 0.3) {
            const muletilla = this.muletillas[Math.floor(Math.random() * this.muletillas.length)];
            texto = muletilla.charAt(0).toUpperCase() + muletilla.slice(1) + ', ' + texto.toLowerCase();
        }
        
        // Alargar vocales finales aleatoriamente (ej: "hola" -> "holaa")
        texto = texto.replace(/([aeiou])([.!?]|$)/g, (match, vocal, fin) => {
            return Math.random() < 0.4 ? vocal + vocal + fin : match;
        });
        
        return texto;
    }
    
    generarError(caracter) {
        const teclasCercanas = {
            'a': 's', 's': 'a', 'd': 's', 'f': 'g',
            'n': 'm', 'm': 'n', 'o': 'p', 'p': 'o',
            'e': 'r', 'r': 'e', 'i': 'o', 'u': 'i'
        };
        return teclasCercanas[caracter.toLowerCase()] || caracter;
    }
    
    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    iniciarCursorIdle() {
        const cursor = document.createElement('span');
        cursor.className = 'cursor-idle';
        cursor.textContent = '|';
        cursor.style.cssText = `
            animation: parpadeo 1s infinite;
            color: #FFD700;
            margin-left: 2px;
        `;
        this.elemento.appendChild(cursor);
    }
    
    activarEasterEgg() {
        // Easter egg: destello dorado cuando aparece "ostia"
        document.dispatchEvent(new CustomEvent('mica-easter-egg', {
            detail: { tipo: 'ostia' }
        }));
    }
    
    limpiar() {
        this.elemento.innerHTML = '';
    }
}

// CSS para el cursor parpadeante
const estilo = document.createElement('style');
estilo.textContent = `
    @keyframes parpadeo {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
`;
document.head.appendChild(estilo);

// Auto-inicializar
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('chat-output')) {
            window.naroaTypewriter = new NaroaTypewriter();
        }
    });
}

export default NaroaTypewriter;
