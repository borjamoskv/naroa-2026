/**
 * Exposiciones Timeline v2.0 - PREMIUM WOW EDITION
 * Vista cronológica de exposiciones con efectos de impacto máximo
 * Datos: NotebookLM/Gemini → JSON local (fallback)
 * 
 * WOW Effects Incluidos:
 * - 3D Card Tilt Perspective
 * - Kinetic Typography Header
 * - Staggered Entrance Animations
 * - Particle Trail on Year Navigation
 * - Scroll-driven Color Transitions
 * - Magnetic Hover on Cards
 * 
 * @version 2.0.0
 * @author Antigravity + Agent Evolution Protocol
 */

import { exposicionesDataService } from '../services/exposiciones-data-service.js';

class ExposicionesTimeline {
    constructor() {
        this.container = null;
        this.data = [];
        this.activeYear = null;
        this.dataService = exposicionesDataService;
        this.mousePos = { x: 0, y: 0 };
        this.particles = [];
        this.raf = null;
    }

    /**
     * Inicializa el componente con WOW effects
     */
    async init(containerId = 'exposiciones-container') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            Logger.error('[ExposicionesTimeline] Container not found');
            return;
        }

        // Premium loading state con shimmer
        this.container.textContent = '';
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'timeline-loading';
        loadingDiv.innerHTML = `
                <div class="loading-shimmer"></div>
                <span class="loading-text">Cargando trayectoria...</span>
        `;
        this.container.appendChild(loadingDiv);

        await this.loadData();
        this.render();
        this.attachEvents();
        this.initWowEffects();
        
        const stats = this.dataService.getStats(this.data);
    }

    /**
     * Carga datos de exposiciones via DataService
     */
    async loadData() {
        try {
            this.data = await this.dataService.getExposiciones();
            this.data.sort((a, b) => b.year - a.year);
        } catch (error) {
            Logger.error('Failed to load exhibitions:', error);
            this.data = [];
        }
    }

    /**
     * Agrupa exposiciones por año
     */
    groupByYear() {
        const grouped = {};
        this.data.forEach(expo => {
            const year = expo.year;
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(expo);
        });
        return grouped;
    }

    /**
     * Iconos por tipo con emojis expresivos
     */
    getTypeIcon(type) {
        const icons = {
            'solo': '🎨', 'group': '👥', 'online': '🌐',
            'market': '🛒', 'festival': '🎪', 'publication': '📰'
        };
        return icons[type] || '📍';
    }

    /**
     * Clase de badge por tipo
     */
    getTypeBadgeClass(type) {
        const classes = {
            'solo': 'badge-solo', 'group': 'badge-group',
            'online': 'badge-online', 'market': 'badge-market',
            'festival': 'badge-festival', 'publication': 'badge-publication'
        };
        return classes[type] || 'badge-default';
    }

    /**
     * Renderiza el timeline con estructura WOW
     */
    render() {
        const grouped = this.groupByYear();
        const years = Object.keys(grouped).sort((a, b) => b - a);
        const totalExpos = this.data.length;

        this.container.innerHTML = `
            <section class="exposiciones-timeline">
                <!-- Canvas para partículas -->
                <canvas class="particles-canvas" id="timeline-particles"></canvas>
                
                <!-- Header con Kinetic Typography -->
                <header class="timeline-header">
                    <h1 class="timeline-title kinetic-text">
                        <span class="title-number" data-value="${totalExpos}">0</span>
                        <span class="title-word">Exposiciones</span>
                    </h1>
                    <p class="timeline-subtitle reveal-text">
                        <span>2013</span>
                        <span class="subtitle-line"></span>
                        <span>2025</span>
                    </p>
                    <div class="subtitle-glow"></div>
                </header>

                <!-- Navegación con efecto magnético -->
                <nav class="timeline-nav magnetic-nav">
                    <div class="nav-backdrop"></div>
                    ${years.map((year, i) => `
                        <button class="year-btn magnetic-btn ${i === 0 ? 'active' : ''}" 
                                data-year="${year}"
                                style="--delay: ${i * 0.05}s">
                            <span class="btn-text">${year}</span>
                            <span class="btn-glow"></span>
                        </button>
                    `).join('')}
                </nav>

                <!-- Timeline Track con línea animada -->
                <div class="timeline-track">
                    <div class="timeline-line">
                        <div class="line-progress"></div>
                        <div class="line-pulse"></div>
                    </div>
                    
                    ${years.map((year, yi) => `
                        <div class="timeline-year-group" data-year="${year}" style="--group-delay: ${yi * 0.1}s">
                            <div class="year-marker">
                                <div class="marker-orb">
                                    <div class="orb-ring"></div>
                                    <div class="orb-core"></div>
                                </div>
                                <span class="year-label">${year}</span>
                                <span class="year-count">${grouped[year].length} ${grouped[year].length === 1 ? 'expo' : 'expos'}</span>
                            </div>
                            
                            <div class="exhibitions-grid">
                                ${grouped[year].map((expo, i) => this.renderCard(expo, i)).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Stats Footer Flotante -->
                <footer class="timeline-footer">
                    <div class="stat-chip"><span class="stat-value">${totalExpos}</span> Total</div>
                    <div class="stat-chip"><span class="stat-value">${years.length}</span> Años</div>
                    <div class="stat-chip"><span class="stat-value">${grouped[years[0]]?.length || 0}</span> Este año</div>
                </footer>
            </section>
        `;
    }

    /**
     * Renderiza una tarjeta con imagen y efecto 3D tilt
     */
    renderCard(expo, index) {
        const dateStr = expo.month ? `${expo.month}${expo.day ? ` ${expo.day}` : ''}` : '';
        const hasImage = expo.image && expo.image.length > 0;
        
        return `
            <article class="expo-card tilt-card ${hasImage ? 'has-image' : ''}" 
                     data-id="${expo.id}" 
                     style="--card-delay: ${index * 0.08}s">
                <div class="card-shine"></div>
                <div class="card-glow"></div>
                
                ${hasImage ? `
                    <div class="card-image">
                        <img src="${expo.image}" 
                             alt="${expo.title}"
                             loading="lazy"
                             decoding="async"
                             onerror="this.parentElement.classList.add('img-error')">
                        <div class="image-overlay"></div>
                    </div>
                ` : ''}
                
                <div class="card-content">
                    <div class="card-header">
                        <span class="expo-icon">${this.getTypeIcon(expo.type)}</span>
                        <span class="expo-badge ${this.getTypeBadgeClass(expo.type)}">
                            ${expo.type.toUpperCase()}
                        </span>
                    </div>
                    
                    <h3 class="expo-title">${expo.title}</h3>
                    ${expo.subtitle ? `<p class="expo-subtitle">${expo.subtitle}</p>` : ''}
                    
                    <div class="expo-meta">
                        <span class="expo-location">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${expo.location}
                        </span>
                        ${dateStr ? `<span class="expo-date">📅 ${dateStr}</span>` : ''}
                    </div>

                    ${expo.description ? `
                        <p class="expo-description">${expo.description}</p>
                    ` : ''}

                    ${expo.url ? `
                        <a href="${expo.url}" target="_blank" rel="noopener" class="expo-link magnetic-btn">
                            <span>Ver más</span>
                            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </a>
                    ` : ''}
                </div>
            </article>
        `;
    }

    /**
     * Events y interacciones
     */
    attachEvents() {
        // Navegación por años
        this.container.querySelectorAll('.year-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.scrollToYear(e.currentTarget.dataset.year);
                this.updateActiveYear(e.currentTarget);
            });
        });

        // Track mouse para efectos
        this.container.addEventListener('mousemove', (e) => {
            this.mousePos = { x: e.clientX, y: e.clientY };
        });

        // 3D Tilt en cards
        this.container.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleTilt(card, e));
            card.addEventListener('mouseleave', () => this.resetTilt(card));
            card.addEventListener('mouseenter', () => this.activateCard(card));
        });

        // Scroll animations
        this.setupScrollAnimations();
        this.setupScrollProgress();
    }

    /**
     * Inicializa efectos WOW premium (sin partículas)
     */
    initWowEffects() {
        this.animateCountUp();
        // Partículas desactivadas para mejor rendimiento
    }

    /**
     * Count-up animación para el número total
     */
    animateCountUp() {
        const counter = this.container.querySelector('.title-number');
        if (!counter) return;

        const target = parseInt(counter.dataset.value);
        let current = 0;
        const duration = 2000;
        const step = target / (duration / 16);

        const animate = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(animate);
            } else {
                counter.textContent = target;
            }
        };
        
        // Delay para efecto dramático
        setTimeout(animate, 300);
    }

    /**
     * Canvas de partículas para fondo
     */
    initParticleCanvas() {
        const canvas = this.container.querySelector('#timeline-particles');
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.ctx = canvas.getContext('2d');

        // Crear partículas iniciales
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    /**
     * Loop de animación de partículas
     */
    startParticleLoop() {
        if (!this.ctx) return;

        const animate = () => {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            
            this.particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around
                if (p.x < 0) p.x = this.ctx.canvas.width;
                if (p.x > this.ctx.canvas.width) p.x = 0;
                if (p.y < 0) p.y = this.ctx.canvas.height;
                if (p.y > this.ctx.canvas.height) p.y = 0;

                // Draw
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(50, 205, 50, ${p.opacity})`;
                this.ctx.fill();
            });

            this.raf = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * 3D Tilt Effect
     */
    handleTilt(card, e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = `
            perspective(1000px)
            rotateY(${x * 15}deg)
            rotateX(${y * -15}deg)
            scale3d(1.02, 1.02, 1.02)
        `;

        // Move shine
        const shine = card.querySelector('.card-shine');
        if (shine) {
            shine.style.background = `radial-gradient(
                circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px,
                rgba(50, 205, 50, 0.15) 0%,
                transparent 50%
            )`;
        }
    }

    /**
     * Reset tilt
     */
    resetTilt(card) {
        card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
        const shine = card.querySelector('.card-shine');
        if (shine) shine.style.background = 'transparent';
    }

    /**
     * Activa efectos en card
     */
    activateCard(card) {
        const glow = card.querySelector('.card-glow');
        if (glow) glow.style.opacity = '1';
    }

    /**
     * Actualiza año activo
     */
    updateActiveYear(btn) {
        this.container.querySelectorAll('.year-btn').forEach(b => 
            b.classList.remove('active')
        );
        btn.classList.add('active');
    }

    /**
     * Scroll suave a año
     */
    scrollToYear(year) {
        const yearGroup = this.container.querySelector(`[data-year="${year}"]`);
        if (yearGroup) {
            yearGroup.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
        }
    }

    /**
     * Scroll animations con IntersectionObserver
     */
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.style.animationDelay = entry.target.style.getPropertyValue('--card-delay');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        this.container.querySelectorAll('.expo-card, .timeline-year-group').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Progress de scroll para la línea
     */
    setupScrollProgress() {
        const line = this.container.querySelector('.line-progress');
        if (!line) return;

        window.addEventListener('scroll', () => {
            const timeline = this.container.querySelector('.timeline-track');
            if (!timeline) return;
            
            const rect = timeline.getBoundingClientRect();
            const progress = Math.min(1, Math.max(0, 
                (window.innerHeight - rect.top) / (rect.height + window.innerHeight)
            ));
            
            line.style.height = `${progress * 100}%`;
        }, { passive: true });
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.particles = [];
    }
}

// Export singleton
export const exposicionesTimeline = new ExposicionesTimeline();
export default exposicionesTimeline;
