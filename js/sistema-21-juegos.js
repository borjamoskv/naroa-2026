/**
 * SISTEMA HOLÍSTICO DE 21 JUEGOS (SH21J) PARA MICA
 * 7 Niveles × 3 Juegos = 21
 * 5 Dimensiones: MENTE, CUERPO, EMOCION, ESPIRITU, SOCIAL
 */

class Sistema21Juegos {
    constructor(usuarioId) {
        this.usuario = usuarioId;
        this.nivelActual = 1;
        this.juegosCompletados = [];
        this.dimensiones = {
            MENTE: 0,
            CUERPO: 0,
            EMOCION: 0,
            ESPIRITU: 0,
            SOCIAL: 0
        };
        
        this.inicializar21Juegos();
    }

    inicializar21Juegos() {
        this.juegos = [
            // NIVEL 1: DESPERTAR
            { id: 1, nombre: "El Espejo Digital", nivel: 1, dimensiones: {EMOCION: 40, MENTE: 30, CUERPO: 20, ESPIRITU: 10}, recompensa: "Avatar color dorado" },
            { id: 2, nombre: "Termómetro del Alma", nivel: 1, dimensiones: {EMOCION: 50, ESPIRITU: 30, MENTE: 20}, recompensa: "Partículas personalizadas" },
            { id: 3, nombre: "Caminata Zen", nivel: 1, dimensiones: {CUERPO: 60, ESPIRITU: 25, MENTE: 15}, recompensa: "Zapatillas digitales" },
            
            // NIVEL 2: CONEXIÓN
            { id: 4, nombre: "Sinapsis Viva", nivel: 2, dimensiones: {MENTE: 50, CUERPO: 30, EMOCION: 20}, recompensa: "Corona neural" },
            { id: 5, nombre: "Alquimia Emocional", nivel: 2, dimensiones: {EMOCION: 60, MENTE: 25, ESPIRITU: 15}, recompensa: "Poción emocional" },
            { id: 6, nombre: "Eco Sincrónico", nivel: 2, dimensiones: {SOCIAL: 40, EMOCION: 35, MENTE: 25}, recompensa: "Lupa cósmica" },
            
            // NIVEL 3: POTENCIA
            { id: 7, nombre: "Flow State Trainer", nivel: 3, dimensiones: {MENTE: 40, CUERPO: 40, EMOCION: 20}, recompensa: "Aura concentración" },
            { id: 8, nombre: "Árbol 7 Hábitos", nivel: 3, dimensiones: {ESPIRITU: 40, MENTE: 30, CUERPO: 20, SOCIAL: 10}, recompensa: "Frutos dorados" },
            { id: 9, nombre: "Danza de Datos", nivel: 3, dimensiones: {CUERPO: 50, MENTE: 30, EMOCION: 20}, recompensa: "Skin bailarín" },
            
            // NIVEL 4: TRANSFORMACIÓN
            { id: 10, nombre: "Sombra Digital", nivel: 4, dimensiones: {ESPIRITU: 35, EMOCION: 35, MENTE: 30}, recompensa: "Máscara integración" },
            { id: 11, nombre: "Ayuno Dopamina", nivel: 4, dimensiones: {MENTE: 50, ESPIRITU: 30, CUERPO: 20}, recompensa: "Cetro disciplina" },
            { id: 12, nombre: "Cartografía Miedo", nivel: 4, dimensiones: {EMOCION: 50, MENTE: 30, CUERPO: 20}, recompensa: "Mapa tesoro" },
            
            // NIVEL 5: SINERGIA
            { id: 13, nombre: "Tribu Digital", nivel: 5, dimensiones: {SOCIAL: 50, ESPIRITU: 25, EMOCION: 25}, recompensa: "Campamento tribal" },
            { id: 14, nombre: "Economía Bienestar", nivel: 5, dimensiones: {SOCIAL: 40, MENTE: 30, ESPIRITU: 30}, recompensa: "Moneda MICA" },
            { id: 15, nombre: "Cadena Gratitud", nivel: 5, dimensiones: {EMOCION: 40, SOCIAL: 40, ESPIRITU: 20}, recompensa: "Corazón dorado" },
            
            // NIVEL 6: TRASCENDENCIA
            { id: 16, nombre: "Legado Cósmico", nivel: 6, dimensiones: {ESPIRITU: 50, MENTE: 30, SOCIAL: 20}, recompensa: "Estrella nombre" },
            { id: 17, nombre: "Museo Yo Futuro", nivel: 6, dimensiones: {MENTE: 40, ESPIRITU: 40, EMOCION: 20}, recompensa: "Galería personal" },
            { id: 18, nombre: "Rito Passage", nivel: 6, dimensiones: {ESPIRITU: 60, CUERPO: 25, SOCIAL: 15}, recompensa: "Fénix dorado" },
            
            // NIVEL 7: ILUMINACIÓN
            { id: 19, nombre: "Juego Infinito", nivel: 7, dimensiones: {ESPIRITU: 40, MENTE: 30, EMOCION: 15, CUERPO: 15}, recompensa: "Anillo maestría" },
            { id: 20, nombre: "Mandala Existencia", nivel: 7, dimensiones: {MENTE: 20, EMOCION: 20, CUERPO: 20, ESPIRITU: 20, SOCIAL: 20}, recompensa: "Pieza central" },
            { id: 21, nombre: "Mentoría Inversa", nivel: 7, dimensiones: {SOCIAL: 50, ESPIRITU: 30, MENTE: 20}, recompensa: "Guardián Sistema" }
        ];
    }

    calcularBalanceDimensional() {
        const valores = Object.values(this.dimensiones);
        const media = valores.reduce((a,b) => a+b, 0) / 5;
        const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / 5;
        return {
            balance: 100 - (varianza / 10),
            fortalezas: Object.entries(this.dimensiones).sort((a,b) => b[1]-a[1]).slice(0,2),
            debilidades: Object.entries(this.dimensiones).sort((a,b) => a[1]-b[1]).slice(0,2)
        };
    }

    sugerirSiguienteJuego() {
        const balance = this.calcularBalanceDimensional();
        const juegosDisponibles = this.juegos.filter(j => 
            j.nivel <= this.nivelActual + 1 && 
            !this.juegosCompletados.includes(j.id)
        );
        
        return juegosDisponibles.sort((a,b) => {
            const scoreA = balance.debilidades.reduce((sum, [dim]) => sum + (a.dimensiones[dim] || 0), 0);
            const scoreB = balance.debilidades.reduce((sum, [dim]) => sum + (b.dimensiones[dim] || 0), 0);
            return scoreB - scoreA;
        })[0];
    }

    completarJuego(juegoId) {
        const juego = this.juegos.find(j => j.id === juegoId);
        if (!juego) return null;
        
        Object.entries(juego.dimensiones).forEach(([dim, pts]) => {
            this.dimensiones[dim] += pts;
        });
        
        this.juegosCompletados.push(juegoId);
        
        const completadosNivel = this.juegos.filter(j => 
            j.nivel === this.nivelActual && this.juegosCompletados.includes(j.id)
        ).length;
        
        if (completadosNivel >= 2 && this.nivelActual < 7) {
            this.nivelActual++;
            document.dispatchEvent(new CustomEvent('mica-level-up', {
                detail: { nivel: this.nivelActual, dimensiones: this.dimensiones }
            }));
        }
        
        return {
            recompensa: juego.recompensa,
            mensaje: `¡Ostia tío! Has desbloqueado: ${juego.recompensa}`,
            nuevoNivel: this.nivelActual
        };
    }

    getProgreso() {
        return {
            nivel: this.nivelActual,
            juegosCompletados: this.juegosCompletados.length,
            totalJuegos: 21,
            dimensiones: this.dimensiones,
            balance: this.calcularBalanceDimensional()
        };
    }
}

// Integración con MICA
class MICA21Juegos extends Sistema21Juegos {
    constructor(usuarioId, micaUI) {
        super(usuarioId);
        this.ui = micaUI;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('festivo-detectado', () => {
            this.dimensiones.ESPIRITU += 10;
        });
    }

    iniciarJuegoDiario() {
        const sugerencia = this.sugerirSiguienteJuego();
        const frases = [
            `Ostia, hoy toca ${sugerencia.nombre}. Te va a venir genial.`,
            `Mira tío, el sistema dice que pruebes "${sugerencia.nombre}". ¿Te animas?`,
            `Nivel ${sugerencia.nivel} - ${sugerencia.nombre} es el siguiente paso.`
        ];
        return frases[Math.floor(Math.random() * frases.length)];
    }
}

// Auto-inicializar
if (typeof window !== 'undefined') {
    window.Sistema21Juegos = Sistema21Juegos;
    window.MICA21Juegos = MICA21Juegos;
    console.log('✨ Sistema 21 Juegos loaded');
}

export { Sistema21Juegos, MICA21Juegos };
