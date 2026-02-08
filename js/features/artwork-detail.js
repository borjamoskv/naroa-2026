/**
 * Artwork Detail View v1.0 - WOW Edition
 * 
 * Vista individual de obra con:
 * - Hero parallax con efecto Ken Burns
 * - Metadata elegante con animaciones
 * - Obras relacionadas por serie
 * - Botón de contacto para compra
 * 
 * @route #/obra/:artworkId
 */

export class ArtworkDetail {
    constructor() {
        this.container = null;
        this.artworkId = null;
        this.artwork = null;
        this.allArtworks = [];
        this.parallaxFactor = 0.3;
    }

    /**
     * Inicializa la vista con el ID de la obra
     */
    async init(artworkId) {
        this.artworkId = artworkId;
        this.container = document.getElementById('view-obra');
        
        if (!this.container) {
            console.error('[ArtworkDetail] Container #view-obra not found');
            return;
        }

        // Mostrar loading
        this.renderLoading();

        try {
            // Cargar datos
            await this.loadArtworkData();
            
            // Renderizar vista
            this.render();
            
            // Inicializar efectos
            this.initEffects();
            
        } catch (error) {
            console.error('[ArtworkDetail] Error:', error);
            this.renderError();
        }
    }

    /**
     * Carga los datos de la obra desde el JSON
     */
    async loadArtworkData() {
        const response = await fetch('data/artworks-metadata.json');
        const data = await response.json();
        this.allArtworks = data.artworks;
        
        this.artwork = this.allArtworks.find(a => a.id === this.artworkId);
        
        if (!this.artwork) {
            throw new Error(`Artwork not found: ${this.artworkId}`);
        }
    }

    /**
     * Obtiene la ruta de la imagen
     */
    getImagePath(id) {
        // Primero intenta webp, luego jpg
        return `images/artworks/${id}.webp`;
    }

    /**
     * Obtiene obras relacionadas por serie
     */
    getRelatedArtworks() {
        return this.allArtworks
            .filter(a => a.series === this.artwork.series && a.id !== this.artworkId)
            .slice(0, 4);
    }

    /**
     * Renderiza el estado de carga
     */
    renderLoading() {
        this.container.innerHTML = `
            <div class="artwork-detail-loading">
                <div class="shimmer-block shimmer-hero"></div>
                <div class="shimmer-content">
                    <div class="shimmer-block shimmer-title"></div>
                    <div class="shimmer-block shimmer-meta"></div>
                    <div class="shimmer-block shimmer-desc"></div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza error
     */
    renderError() {
        this.container.innerHTML = `
            <div class="artwork-detail-error">
                <span class="error-icon">🎨</span>
                <h2>Obra no encontrada</h2>
                <p>La obra solicitada no existe en el catálogo.</p>
                <a href="#/galeria" class="back-link magnetic-btn">
                    ← Volver a la galería
                </a>
            </div>
        `;
    }

    /**
     * Formatea el nombre de la serie
     */
    formatSeries(series) {
        const seriesNames = {
            'rocks': 'ROCKS Collection',
            'cantinflas': 'Serie Cantinflas',
            'retratos': 'Retratos',
            'tributos-musicales': 'Tributos Musicales',
            'espejos-del-alma': 'Espejos del Alma',
            'enlatas': 'En.lata.das',
            'walking-gallery': 'Walking Gallery',
            'bodas': 'Bodas',
            'golden': 'Golden Series',
            'amor': 'AMOR',
            'naturaleza': 'Naturaleza'
        };
        return seriesNames[series] || series;
    }

    /**
     * Formatea la técnica
     */
    formatTechnique(technique) {
        const techniques = {
            'mixed-media': 'Técnica mixta sobre lienzo',
            'collage': 'Collage sobre madera',
            'pencil': 'Lápiz sobre papel',
            'oil': 'Óleo sobre lienzo',
            'acrylic': 'Acrílico sobre lienzo'
        };
        return techniques[technique] || technique;
    }

    /**
     * Renderiza la vista completa
     */
    render() {
        const related = this.getRelatedArtworks();
        
        this.container.innerHTML = `
            <article class="artwork-detail">
                <!-- Hero Parallax -->
                <section class="artwork-hero" data-parallax="hero">
                    <div class="hero-image-wrapper">
                        <img src="${this.getImagePath(this.artwork.id)}" 
                             alt="${this.artwork.title}"
                             class="hero-image"
                             loading="eager">
                        <div class="hero-overlay"></div>
                    </div>
                    
                    <div class="hero-content">
                        <a href="#/galeria" class="back-nav magnetic-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            <span>Galería</span>
                        </a>
                        
                        <div class="hero-title-block">
                            <h1 class="artwork-title kinetic-text">${this.artwork.title}</h1>
                            <div class="artwork-badges">
                                <span class="badge badge-series">${this.formatSeries(this.artwork.series)}</span>
                                <span class="badge badge-year">${this.artwork.year}</span>
                                ${this.artwork.featured ? '<span class="badge badge-featured">★ DESTACADA</span>' : ''}
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Detalles -->
                <section class="artwork-info">
                    <div class="info-grid">
                        <div class="info-main">
                            <div class="info-card tilt-card">
                                <h2 class="info-label">Técnica</h2>
                                <p class="info-value">${this.formatTechnique(this.artwork.technique)}</p>
                            </div>
                            
                            <div class="info-card tilt-card">
                                <h2 class="info-label">Serie</h2>
                                <p class="info-value">${this.formatSeries(this.artwork.series)}</p>
                            </div>
                            
                            <div class="info-card tilt-card">
                                <h2 class="info-label">Año</h2>
                                <p class="info-value artwork-year">${this.artwork.year}</p>
                            </div>
                        </div>
                        
                        <div class="info-cta">
                            <div class="cta-card">
                                <h3>¿Interesado en esta obra?</h3>
                                <p>Contacta con Naroa para información sobre disponibilidad y precios.</p>
                                <a href="#/contacto" class="cta-button magnetic-btn">
                                    <span>Solicitar información</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Obras Relacionadas -->
                ${related.length > 0 ? `
                    <section class="related-works">
                        <h2 class="section-title">
                            <span class="title-line"></span>
                            Más de ${this.formatSeries(this.artwork.series)}
                            <span class="title-line"></span>
                        </h2>
                        
                        <div class="related-grid">
                            ${related.map((art, i) => `
                                <a href="#/obra/${art.id}" 
                                   class="related-card tilt-card"
                                   style="--card-delay: ${i * 0.1}s">
                                    <div class="related-image">
                                        <img src="${this.getImagePath(art.id)}" 
                                             alt="${art.title}"
                                             loading="lazy">
                                        <div class="related-overlay"></div>
                                    </div>
                                    <div class="related-info">
                                        <h3>${art.title}</h3>
                                        <span>${art.year}</span>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}
            </article>
        `;
    }

    /**
     * Inicializa efectos WOW
     */
    initEffects() {
        // Parallax en hero
        this.initParallax();
        
        // 3D Tilt en tarjetas
        this.initTiltCards();
        
        // Botones magnéticos
        this.initMagneticButtons();
        
        // Animaciones de entrada
        this.initEntranceAnimations();
    }

    /**
     * Parallax en hero image
     */
    initParallax() {
        const hero = this.container.querySelector('.artwork-hero');
        const image = this.container.querySelector('.hero-image');
        
        if (!hero || !image) return;

        const handleScroll = () => {
            const rect = hero.getBoundingClientRect();
            const scrolled = -rect.top;
            const parallaxValue = scrolled * this.parallaxFactor;
            
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                image.style.transform = `translateY(${parallaxValue}px) scale(1.1)`;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    /**
     * 3D Tilt effect
     */
    initTiltCards() {
        const cards = this.container.querySelectorAll('.tilt-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }

    /**
     * Magnetic buttons
     */
    initMagneticButtons() {
        const buttons = this.container.querySelectorAll('.magnetic-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    /**
     * Animaciones de entrada con IntersectionObserver
     */
    initEntranceAnimations() {
        const elements = this.container.querySelectorAll('.info-card, .related-card, .cta-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        elements.forEach(el => observer.observe(el));
    }

    /**
     * Cleanup al salir de la vista
     */
    destroy() {
        // Remove event listeners si es necesario
    }
}

// Export singleton para uso global
export const artworkDetail = new ArtworkDetail();
