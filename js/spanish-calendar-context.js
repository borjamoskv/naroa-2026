/**
 * SPANISH CULTURAL CONTEXT ENGINE
 * Awareness de calendario español para modificar comportamiento de MICA
 * 
 * Features:
 * - Festivos nacionales 2026
 * - Detección de temporadas (verano, navidad, etc)
 * - Puentes lógicos
 * - Frases contextuales por temporada
 * - Modificadores de energía
 * 
 * Tamaño: ~3KB (sin dependencias)
 */

class SpanishCulturalContext {
  constructor() {
    // Festivos nacionales oficiales España 2026
    this.festivosNacionales = [
      '2026-01-01', // Año Nuevo
      '2026-01-06', // Reyes Magos
      '2026-04-02', // Jueves Santo (aproximado)
      '2026-04-03', // Viernes Santo (aproximado)
      '2026-05-01', // Día del Trabajo
      '2026-08-15', // Asunción de la Virgen
      '2026-10-12', // Fiesta Nacional
      '2026-11-01', // Todos los Santos
      '2026-12-06', // Día de la Constitución
      '2026-12-08', // Inmaculada Concepción
      '2026-12-25'  // Navidad
    ];

    this.currentSeason = this.detectSeason();
    this.isDaylightSavingTime = this.checkDST();
  }

  /**
   * Detecta la temporada actual
   */
  detectSeason() {
    const month = new Date().getMonth(); // 0-11
    const day = new Date().getDate();

    // Verano (21 junio - 21 septiembre)
    if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day <= 21)) {
      return 'VERANO';
    }

    // Agosto completo merece categoría propia en España
    if (month === 7) {
      return 'AGOSTO';
    }

    // Navidad (20 diciembre - 6 enero)
    if ((month === 11 && day >= 20) || (month === 0 && day <= 6)) {
      return 'NAVIDAD';
    }

    // Semana Santa 2026: 29 marzo - 5 abril (variable)
    if (month === 2 && day >= 29 || month === 3 && day <= 5) {
      return 'SEMANA_SANTA';
    }

    // Otoño (22 septiembre - 20 diciembre)
    if ((month === 8 && day >= 22) || month === 9 || month === 10 || (month === 11 && day <= 20)) {
      return 'OTOÑO';
    }

    // Invierno (21 diciembre - 20 marzo)
    if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day <= 20)) {
      return 'INVIERNO';
    }

    // Primavera (21 marzo - 20 junio)
    return 'PRIMAVERA';
  }

  /**
   * Verifica si hoy es festivo nacional
   */
  isFestivo() {
    const today = this.getDateString(new Date());
    return this.festivosNacionales.includes(today);
  }

  /**
   * Detecta si es "puente" (festivo en jueves/martes → viernes/lunes libre)
   */
  isPuente() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado

    // Si es viernes, check si jueves fue festivo
    if (dayOfWeek === 5) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return this.festivosNacionales.includes(this.getDateString(yesterday));
    }

    // Si es lunes, check si martes es festivo
    if (dayOfWeek === 1) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return this.festivosNacionales.includes(this.getDateString(tomorrow));
    }

    return false;
  }

  /**
   * Detecta horario de verano (DST)
   * España: último domingo de marzo → último domingo de octubre
   */
  checkDST() {
    const jan = new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(new Date().getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) !== new Date().getTimezoneOffset();
  }

  /**
   * Obtiene modificador de energía según contexto
   */
  getEnergyModifier() {
    let modifier = 0;

    // Festivos: +20 energy (día de descanso)
    if (this.isFestivo()) {
      modifier += 20;
    }

    // Puentes: +10 energy (medio festivo)
    if (this.isPuente()) {
      modifier += 10;
    }

    // Modificadores por temporada
    switch (this.currentSeason) {
      case 'VERANO':
        modifier += 10; // Energía alta
        break;
      case 'AGOSTO':
        modifier -= 15; // Modo vacaciones, todo va más lento
        break;
      case 'NAVIDAD':
        modifier += 5; // Festivo pero también cansancio acumulado
        break;
      case 'INVIERNO':
        modifier -= 10; // Días cortos, menos energía
        break;
      case 'OTOÑO':
        modifier -= 5; // Cuesta de septiembre
        break;
    }

    return modifier;
  }

  /**
   * Frases contextuales por temporada
   */
  getSeasonalPhrases() {
    const phrases = {
      VERANO: [
        'Con este calor, mejor un juego relajante ☀️',
        '¿Has visto la luz de la tarde? Perfecta para crear',
        'Verano: cuando el tiempo se estira como caramelo'
      ],
      AGOSTO: [
        'Medio mundo está en la playa, pero aquí estamos... 🏖️',
        'Modo agosto activado: lento pero constante',
        'Agosto es para experimentar sin presión',
        '¿Quién necesita vacaciones cuando tienes juegos?'
      ],
      NAVIDAD: [
        'Entre turrones y juegos, el equilibrio perfecto 🎄',
        'Estas fechas son para experimentar sin presión',
        'La luz navideña tiene algo especial para crear',
        'Diciembre: mes de rendimientos decrecientes y magia creciente'
      ],
      SEMANA_SANTA: [
        'Semana Santa: tiempo para procesos lentos 🕯️',
        'La calma procesional invita a la reflexión creativa'
      ],
      INVIERNO: [
        'Los días cortos invitan al trabajo profundo ❄️',
        'Invierno: la mejor temporada para proyectos densos'
      ],
      OTOÑO: [
        'Septiembre: cuesta arriba pero con vistas 🍂',
        'El otoño trae colores nuevos para la paleta'
      ],
      PRIMAVERA: [
        'Primavera: tiempo de florecer proyectos 🌸',
        'La luz cambia, las ideas también'
      ]
    };

    return phrases[this.currentSeason] || [];
  }

  /**
   * Obtiene modificadores visuales por temporada
   */
  getVisualModifiers() {
    const modifiers = {
      VERANO: {
        colorShift: { hue: +5, saturation: +10, lightness: +5 }, // Más luminoso
        animationSpeed: 1.2, // Más rápido
        particleType: 'light'
      },
      AGOSTO: {
        colorShift: { hue: 0, saturation: -10, lightness: +10 }, // Desaturado, luminoso
        animationSpeed: 0.6, // Más lento
        blur: 1 // Efecto calima
      },
      NAVIDAD: {
        colorShift: { hue: +10, saturation: +5, lightness: 0 }, // Tono cálido
        animationSpeed: 0.8,
        particleType: 'snow'
      },
      INVIERNO: {
        colorShift: { hue: -5, saturation: -5, lightness: -10 }, // Más frío, oscuro
        animationSpeed: 0.9,
        contrast: 1.1
      },
      SEMANA_SANTA: {
        colorShift: { hue: -10, saturation: -15, lightness: -5 }, // Tonos sepia
        animationSpeed: 0.7,
        particleType: 'incense'
      }
    };

    return modifiers[this.currentSeason] || {};
  }

  /**
   * Contexto completo para MICA
   */
  getContext() {
    const isFestivo = this.isFestivo();
    const isPuente = this.isPuente();

    return {
      season: this.currentSeason,
      isFestivo,
      isPuente,
      isDST: this.isDaylightSavingTime,
      energyModifier: this.getEnergyModifier(),
      phrases: this.getSeasonalPhrases(),
      visualModifiers: this.getVisualModifiers(),
      mode: isFestivo ? 'FIESTA' : isPuente ? 'PUENTE' : 'LABORAL'
    };
  }

  /**
   * Helper: Convierte Date a string YYYY-MM-DD
   */
  getDateString(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Obtiene próximo festivo
   */
  getNextFestivo() {
    const today = new Date();
    const todayStr = this.getDateString(today);

    for (const festivo of this.festivosNacionales) {
      if (festivo > todayStr) {
        const date = new Date(festivo);
        const daysUntil = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
        
        return {
          date: festivo,
          daysUntil,
          name: this.getFestivoName(festivo)
        };
      }
    }

    // Si no hay más este año, devolver primero del próximo
    return {
      date: this.festivosNacionales[0].replace('2026', '2027'),
      daysUntil: 999,
      name: 'Año Nuevo'
    };
  }

  /**
   * Nombres de festivos
   */
  getFestivoName(dateStr) {
    const names = {
      '2026-01-01': 'Año Nuevo',
      '2026-01-06': 'Reyes Magos',
      '2026-04-02': 'Jueves Santo',
      '2026-04-03': 'Viernes Santo',
      '2026-05-01': 'Día del Trabajo',
      '2026-08-15': 'Asunción',
      '2026-10-12': 'Fiesta Nacional',
      '2026-11-01': 'Todos los Santos',
      '2026-12-06': 'Constitución',
      '2026-12-08': 'Inmaculada',
      '2026-12-25': 'Navidad'
    };

    return names[dateStr] || 'Festivo';
  }
}

// Singleton global
if (typeof window !== 'undefined') {
  window.SpanishCalendar = new SpanishCulturalContext();
}

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpanishCulturalContext;
}
