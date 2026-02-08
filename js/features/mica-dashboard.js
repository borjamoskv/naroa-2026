/**
 * MICA Dashboard v1.0 - Admin Panel
 * 
 * Dashboard de estadísticas y administración del chatbot MICA.
 * Features:
 * - Estadísticas de conversaciones
 * - Métricas de engagement
 * - Último historial de chats
 * - Configuración de personalidad
 * 
 * @route #/mica-dashboard (admin only)
 */

export class MicaDashboard {
    constructor() {
        this.container = null;
        this.stats = {};
        this.recentChats = [];
    }

    /**
     * Inicializa el dashboard
     */
    init(containerId = 'mica-dashboard-container') {
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error('[MicaDashboard] Container not found:', containerId);
            return;
        }

        // Load stats from localStorage
        this.loadStats();
        
        // Render dashboard
        this.render();
        
        // Initialize effects
        this.initEffects();
    }

    /**
     * Carga estadísticas desde MicaMemory (IndexedDB)
     */
    async loadStats() {
        // Wait for memory to be ready
        if (!window.MICAMemory) {
            setTimeout(() => this.loadStats(), 500); // Retry
            return;
        }

        try {
            // Get MICA chat history from DB
            const history = await window.MICAMemory.getRecentHistory(100);
            
            // Calculate stats
            const totalMessages = history.length;
            const userMessages = history.filter(m => m.role === 'user').length;
            const botMessages = history.filter(m => m.role === 'assistant').length;
            
            // Session stats (approximation based on time gaps > 30min)
            let totalSessions = 1;
            if (history.length > 1) {
                // Simple logic: if gap > 30min, new session
                // Todo: Use session ID from store if available
            }
            
            // Time-based stats
            const today = new Date();
            const todayMessages = history.filter(m => {
                const msgDate = new Date(m.timestamp);
                return msgDate.toDateString() === today.toDateString();
            }).length;

            // Updated Recent chats
            this.recentChats = history.slice(0, 10); // Already sorted desc by getRecentHistory

            this.stats = {
                totalMessages,
                userMessages,
                botMessages,
                totalSessions: Math.max(1, Math.ceil(totalMessages / 10)), // Mock approximation
                todayMessages,
                avgResponseTime: '0.8s', 
                satisfaction: '98%',
                topTopics: this.extractTopics(history)
            };

            // Re-render to show data
            this.render();
            this.animateCountUp();
            this.initEffects(); // Re-bind effects
            
        } catch (e) {
            console.warn('[MicaDashboard] Error loading stats:', e);
        }
    }

    /**
     * Extrae temas frecuentes de los mensajes
     */
    extractTopics(history) {
        const keywords = {
            'retrato': 0,
            'precio': 0,
            'encargo': 0,
            'rock': 0,
            'cantinflas': 0,
            'exposición': 0,
            'contacto': 0,
            'técnica': 0
        };

        history.forEach(m => {
            if (m.role === 'user' && m.content) {
                const content = m.content.toLowerCase();
                Object.keys(keywords).forEach(key => {
                    if (content.includes(key)) {
                        keywords[key]++;
                    }
                });
            }
        });

        return Object.entries(keywords)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    /**
     * Formatea timestamp
     */
    formatTime(timestamp) {
        if (!timestamp) return 'Hace poco';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Hace un momento';
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    /**
     * Renderiza el dashboard
     */
    render() {
        this.container.innerHTML = `
            <div class="mica-dashboard">
                <!-- Header -->
                <header class="dash-header">
                    <div class="header-left">
                        <span class="header-icon">🤖</span>
                        <div>
                            <h1>MICA Dashboard</h1>
                            <p class="header-subtitle">Panel de control del asistente IA</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="status-pill online">
                            <span class="status-dot"></span>
                            MICA Online
                        </div>
                    </div>
                </header>

                <!-- Stats Grid -->
                <section class="stats-grid">
                    <div class="stat-card tilt-card" style="--delay: 0s">
                        <div class="stat-icon">💬</div>
                        <div class="stat-content">
                            <span class="stat-value count-up" data-target="${this.stats.totalMessages}">${this.stats.totalMessages}</span>
                            <span class="stat-label">Mensajes totales</span>
                        </div>
                    </div>
                    
                    <div class="stat-card tilt-card" style="--delay: 0.1s">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <span class="stat-value count-up" data-target="${this.stats.totalSessions}">${this.stats.totalSessions}</span>
                            <span class="stat-label">Sesiones</span>
                        </div>
                    </div>
                    
                    <div class="stat-card tilt-card" style="--delay: 0.2s">
                        <div class="stat-icon">📅</div>
                        <div class="stat-content">
                            <span class="stat-value count-up" data-target="${this.stats.todayMessages}">${this.stats.todayMessages}</span>
                            <span class="stat-label">Mensajes hoy</span>
                        </div>
                    </div>
                    
                    <div class="stat-card tilt-card" style="--delay: 0.3s">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-content">
                            <span class="stat-value">${this.stats.avgResponseTime}</span>
                            <span class="stat-label">Tiempo respuesta</span>
                        </div>
                    </div>
                    
                    <div class="stat-card tilt-card" style="--delay: 0.4s">
                        <div class="stat-icon">😊</div>
                        <div class="stat-content">
                            <span class="stat-value">${this.stats.satisfaction}</span>
                            <span class="stat-label">Satisfacción</span>
                        </div>
                    </div>
                </section>

                <!-- Main Content -->
                <div class="dash-content">
                    <!-- Recent Chats -->
                    <section class="recent-chats card">
                        <h2 class="section-title">
                            <span>💬</span> Conversaciones recientes
                        </h2>
                        <div class="chat-list">
                            ${this.recentChats.length > 0 
                                ? this.recentChats.map(msg => `
                                    <div class="chat-item ${msg.role}">
                                        <div class="chat-avatar">
                                            ${msg.role === 'user' ? '👤' : '🤖'}
                                        </div>
                                        <div class="chat-content">
                                            <p class="chat-message">${this.truncate(msg.content, 80)}</p>
                                            <span class="chat-time">${this.formatTime(msg.timestamp)}</span>
                                        </div>
                                    </div>
                                `).join('')
                                : '<p class="empty-state">No hay conversaciones recientes</p>'
                            }
                        </div>
                    </section>

                    <!-- Topics & Config -->
                    <aside class="sidebar">
                        <!-- Top Topics -->
                        <section class="topics-card card">
                            <h2 class="section-title">
                                <span>🔥</span> Temas populares
                            </h2>
                            <div class="topics-list">
                                ${this.stats.topTopics.length > 0
                                    ? this.stats.topTopics.map(([topic, count], i) => `
                                        <div class="topic-item" style="--delay: ${i * 0.1}s">
                                            <span class="topic-name">${topic}</span>
                                            <span class="topic-count">${count}</span>
                                        </div>
                                    `).join('')
                                    : '<p class="empty-state">Sin datos aún</p>'
                                }
                            </div>
                        </section>

                        <!-- Quick Actions -->
                        <section class="actions-card card">
                            <h2 class="section-title">
                                <span>⚙️</span> Acciones rápidas
                            </h2>
                            <div class="actions-list">
                                <button class="action-btn magnetic-btn" id="btn-clear-history">
                                    <span>🗑️</span> Limpiar historial
                                </button>
                                <button class="action-btn magnetic-btn" id="btn-export-data">
                                    <span>📤</span> Exportar datos
                                </button>
                                <button class="action-btn magnetic-btn" id="btn-open-mica">
                                    <span>💬</span> Abrir MICA
                                </button>
                            </div>
                        </section>
                    </aside>
                </div>

                <!-- Personality Config -->
                <section class="personality-section card">
                    <h2 class="section-title">
                        <span>🎭</span> Personalidad de MICA
                    </h2>
                    <div class="personality-grid">
                        <div class="personality-trait">
                            <label>Tono</label>
                            <select id="mica-tone">
                                <option value="warm" selected>Cálido y cercano</option>
                                <option value="professional">Profesional</option>
                                <option value="artistic">Artístico/Poético</option>
                            </select>
                        </div>
                        <div class="personality-trait">
                            <label>Verbosidad</label>
                            <input type="range" min="1" max="5" value="3" id="mica-verbosity">
                            <span class="range-label">Media</span>
                        </div>
                        <div class="personality-trait">
                            <label>Emojis</label>
                            <label class="toggle">
                                <input type="checkbox" id="mica-emojis" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    /**
     * Trunca texto
     */
    truncate(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * Inicializa efectos
     */
    initEffects() {
        // 3D Tilt
        const cards = this.container.querySelectorAll('.tilt-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 25;
                const rotateY = (centerX - x) / 25;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });

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

        // Action buttons
        this.container.querySelector('#btn-clear-history')?.addEventListener('click', () => {
            if (confirm('¿Borrar todo el historial de MICA?')) {
                localStorage.removeItem('mica-chat-history');
                this.loadStats();
                this.render();
                this.initEffects();
            }
        });

        this.container.querySelector('#btn-export-data')?.addEventListener('click', () => {
            const data = JSON.stringify({
                stats: this.stats,
                history: JSON.parse(localStorage.getItem('mica-chat-history') || '[]')
            }, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mica-export.json';
            a.click();
        });

        this.container.querySelector('#btn-open-mica')?.addEventListener('click', () => {
            if (window.micaInstance) {
                window.micaInstance.toggle();
            }
        });

        // Count-up animation
        this.animateCountUp();
    }

    /**
     * Animación count-up para números
     */
    animateCountUp() {
        const elements = this.container.querySelectorAll('.count-up');
        
        elements.forEach(el => {
            const target = parseInt(el.dataset.target) || 0;
            const duration = 1500;
            const step = target / (duration / 16);
            let current = 0;

            const animate = () => {
                current += step;
                if (current < target) {
                    el.textContent = Math.floor(current);
                    requestAnimationFrame(animate);
                } else {
                    el.textContent = target;
                }
            };

            animate();
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners if needed
    }
}

export const micaDashboard = new MicaDashboard();
