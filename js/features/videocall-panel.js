/**
 * Video Call Sales Panel v1.0
 * 
 * Panel de contacto y videollamada para conversión de ventas.
 * Features:
 * - Formulario de contacto elegante
 * - Programar videollamada con calendly-style
 * - WhatsApp/Email quick actions
 * - Integración con MICA para pre-cualificación
 * 
 * @route #/contacto (enhanced)
 */

export class VideoCallPanel {
    constructor() {
        this.container = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.formData = {};
    }

    /**
     * Inicializa el panel
     */
    init(containerId = 'contacto-container') {
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            Logger.error('[VideoCallPanel] Container not found:', containerId);
            return;
        }

        this.render();
        this.bindEvents();
        this.initEffects();
    }

    /**
     * Genera las fechas disponibles (próximos 14 días, excluyendo domingos)
     */
    getAvailableDates() {
        const dates = [];
        const today = new Date();
        
        for (let i = 1; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Excluir domingos (0)
            if (date.getDay() !== 0) {
                dates.push({
                    date: date,
                    dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                    dayNum: date.getDate(),
                    monthName: date.toLocaleDateString('es-ES', { month: 'short' })
                });
            }
        }
        
        return dates.slice(0, 10); // Max 10 días
    }

    /**
     * Horarios disponibles
     */
    getAvailableSlots() {
        return [
            { time: '10:00', label: '10:00' },
            { time: '11:00', label: '11:00' },
            { time: '12:00', label: '12:00' },
            { time: '17:00', label: '17:00' },
            { time: '18:00', label: '18:00' },
            { time: '19:00', label: '19:00' }
        ];
    }

    /**
     * Renderiza el panel completo
     */
    render() {
        const dates = this.getAvailableDates();
        const slots = this.getAvailableSlots();

        this.container.innerHTML = `
            <div class="videocall-panel">
                <!-- Hero Section -->
                <header class="panel-hero">
                    <div class="hero-content">
                        <span class="hero-badge">📞 CONTACTO DIRECTO</span>
                        <h1 class="hero-title">
                            Hablemos de <span class="text-gradient">Arte</span>
                        </h1>
                        <p class="hero-subtitle">
                            Programa una videollamada con Naroa para conocer su obra, 
                            encargar un retrato personalizado o resolver cualquier duda.
                        </p>
                    </div>
                    <div class="hero-avatar">
                        <img src="images/artworks/the-world-is-yours.webp" 
                             alt="Naroa Gutiérrez Gil"
                             class="avatar-image">
                        <div class="avatar-status">
                            <span class="status-dot"></span>
                            Disponible
                        </div>
                    </div>
                </header>

                <!-- Quick Actions -->
                <section class="quick-actions">
                    <a href="https://wa.me/34600000000?text=Hola%20Naroa,%20me%20interesa%20tu%20obra" 
                       target="_blank" 
                       class="action-card whatsapp magnetic-btn">
                        <div class="action-icon">💬</div>
                        <div class="action-info">
                            <h3>WhatsApp</h3>
                            <p>Respuesta inmediata</p>
                        </div>
                    </a>
                    
                    <a href="mailto:naroa@naroagutierrezgil.com?subject=Consulta%20sobre%20tu%20obra" 
                       class="action-card email magnetic-btn">
                        <div class="action-icon">✉️</div>
                        <div class="action-info">
                            <h3>Email</h3>
                            <p>naroa@naroagutierrezgil.com</p>
                        </div>
                    </a>
                    
                    <button type="button" class="action-card videocall magnetic-btn" id="btn-schedule-call">
                        <div class="action-icon">🎥</div>
                        <div class="action-info">
                            <h3>Videollamada</h3>
                            <p>Programa una cita</p>
                        </div>
                    </button>
                </section>

                <!-- Scheduler Section (initially hidden) -->
                <section class="scheduler-section" id="scheduler-section">
                    <div class="scheduler-card tilt-card">
                        <h2 class="scheduler-title">
                            <span class="title-icon">📅</span>
                            Elige fecha y hora
                        </h2>

                        <!-- Date Picker -->
                        <div class="date-picker">
                            <div class="dates-scroll">
                                ${dates.map((d, i) => `
                                    <button type="button" 
                                            class="date-btn" 
                                            data-date="${d.date.toISOString()}"
                                            style="--delay: ${i * 0.05}s">
                                        <span class="date-day">${d.dayName}</span>
                                        <span class="date-num">${d.dayNum}</span>
                                        <span class="date-month">${d.monthName}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Time Slots -->
                        <div class="time-slots" id="time-slots">
                            <p class="slots-hint">Selecciona una fecha primero</p>
                        </div>

                        <!-- Contact Form -->
                        <form class="contact-form" id="contact-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="contact-name">Nombre *</label>
                                    <input type="text" id="contact-name" name="name" required 
                                           placeholder="Tu nombre">
                                </div>
                                <div class="form-group">
                                    <label for="contact-email">Email *</label>
                                    <input type="email" id="contact-email" name="email" required 
                                           placeholder="tu@email.com">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="contact-interest">¿Qué te interesa?</label>
                                <select id="contact-interest" name="interest">
                                    <option value="">Selecciona una opción</option>
                                    <option value="retrato">Encargar un retrato</option>
                                    <option value="compra">Comprar obra existente</option>
                                    <option value="evento">Evento o exposición</option>
                                    <option value="colaboracion">Colaboración artística</option>
                                    <option value="otro">Otra consulta</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="contact-message">Mensaje (opcional)</label>
                                <textarea id="contact-message" name="message" rows="3"
                                          placeholder="Cuéntame más sobre lo que buscas..."></textarea>
                            </div>
                            
                            <button type="submit" class="submit-btn magnetic-btn" id="submit-btn" disabled>
                                <span class="btn-text">Confirmar videollamada</span>
                                <span class="btn-icon">→</span>
                            </button>
                        </form>
                    </div>
                </section>

                <!-- Success Message (hidden) -->
                <section class="success-section" id="success-section" hidden>
                    <div class="success-card">
                        <div class="success-icon">✨</div>
                        <h2>¡Perfecto!</h2>
                        <p class="success-message">
                            Tu videollamada ha sido programada para el 
                            <strong id="confirmed-datetime"></strong>.
                        </p>
                        <p class="success-note">
                            Recibirás un email de confirmación con el enlace de la videollamada.
                        </p>
                        <button type="button" class="back-btn magnetic-btn" id="btn-back">
                            ← Volver a la galería
                        </button>
                    </div>
                </section>

                <!-- Footer -->
                <footer class="panel-footer">
                    <p>
                        ¿Prefieres hablar con MICA primero? 
                        <button type="button" class="mica-link" id="btn-open-mica">
                            Abre el chat →
                        </button>
                    </p>
                </footer>
            </div>
        `;
    }

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Schedule call button
        const scheduleBtn = this.container.querySelector('#btn-schedule-call');
        scheduleBtn?.addEventListener('click', () => this.showScheduler());

        // Date buttons
        const dateBtns = this.container.querySelectorAll('.date-btn');
        dateBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectDate(btn));
        });

        // Form submission
        const form = this.container.querySelector('#contact-form');
        form?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Back button
        const backBtn = this.container.querySelector('#btn-back');
        backBtn?.addEventListener('click', () => {
            window.location.hash = '#/galeria';
        });

        // Open MICA
        const micaBtn = this.container.querySelector('#btn-open-mica');
        micaBtn?.addEventListener('click', () => {
            if (window.micaInstance) {
                window.micaInstance.toggle();
            }
        });
    }

    /**
     * Muestra el scheduler con animación
     */
    showScheduler() {
        const section = this.container.querySelector('#scheduler-section');
        section?.classList.add('visible');
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Selecciona una fecha
     */
    selectDate(btn) {
        // Remove previous selection
        this.container.querySelectorAll('.date-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        this.selectedDate = new Date(btn.dataset.date);
        this.showTimeSlots();
    }

    /**
     * Muestra los horarios disponibles
     */
    showTimeSlots() {
        const slots = this.getAvailableSlots();
        const container = this.container.querySelector('#time-slots');
        
        container.innerHTML = `
            <div class="slots-grid">
                ${slots.map((slot, i) => `
                    <button type="button" 
                            class="time-btn" 
                            data-time="${slot.time}"
                            style="--delay: ${i * 0.05}s">
                        ${slot.label}
                    </button>
                `).join('')}
            </div>
        `;

        // Bind time slot events
        container.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectTime(btn));
        });
    }

    /**
     * Selecciona una hora
     */
    selectTime(btn) {
        this.container.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        this.selectedTime = btn.dataset.time;
        this.updateSubmitButton();
    }

    /**
     * Actualiza el estado del botón de envío
     */
    updateSubmitButton() {
        const submitBtn = this.container.querySelector('#submit-btn');
        const nameInput = this.container.querySelector('#contact-name');
        const emailInput = this.container.querySelector('#contact-email');
        
        const isValid = this.selectedDate && 
                        this.selectedTime && 
                        nameInput?.value.trim() && 
                        emailInput?.value.trim();
        
        submitBtn.disabled = !isValid;
    }

    /**
     * Maneja el envío del formulario
     */
    handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        this.formData = {
            name: formData.get('name'),
            email: formData.get('email'),
            interest: formData.get('interest'),
            message: formData.get('message'),
            date: this.selectedDate,
            time: this.selectedTime
        };

        // Format datetime for display
        const dateStr = this.selectedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        
        const confirmedEl = this.container.querySelector('#confirmed-datetime');
        confirmedEl.textContent = `${dateStr} a las ${this.selectedTime}`;

        // Show success
        this.showSuccess();

        // Log for demo (in production, send to backend)
    }

    /**
     * Muestra mensaje de éxito
     */
    showSuccess() {
        this.container.querySelector('#scheduler-section')?.classList.remove('visible');
        this.container.querySelector('.quick-actions')?.classList.add('hidden');
        this.container.querySelector('#success-section')?.removeAttribute('hidden');
    }

    /**
     * Inicializa efectos WOW
     */
    initEffects() {
        // Magnetic buttons
        const buttons = this.container.querySelectorAll('.magnetic-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });

        // Form input listeners for validation
        const inputs = this.container.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateSubmitButton());
        });

        // 3D Tilt
        const tiltCards = this.container.querySelectorAll('.tilt-card');
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners if needed
    }
}

export const videoCallPanel = new VideoCallPanel();
