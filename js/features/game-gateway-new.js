/**
 * Game Gateway v3.1 [ORGANIC]
 * MICA Organic Art Invitation System.
 * 
 * Orchestrates the entry point for the "WarioWare" style art games.
 * Features scroll-based and time-based organic triggers.
 */

import { Logger } from '../core/logger.js';

const CONFIG = {
    trigger: {
        scrollThreshold: 0.6,
        timeThreshold: 45000,
        maxShowsPerSession: 2
    },
    games: [
        { id: 'memory', name: 'Memory', icon: '🧠', tags: ['calm', 'art'] },
        { id: 'puzzle', name: 'Puzzle', icon: '🧩', tags: ['calm', 'art'] },
        { id: 'snake', name: 'Snake', icon: '🐍', tags: ['action'] },
        { id: 'mica', name: 'MICA Viva', icon: '✨', tags: ['art', 'zen'] }
        // ... rest of the registry truncated for brevity, can be expanded if needed
    ],
    quotes: {
        yes: ['¡Así me gusta! Vamos a jugar... 🎮', 'Excelente elección ✨'],
        depends: ['Mmm, indecisión... Te muestro opciones 😏'],
        no: ['Respeto tu decisión... pero volveré 🖤']
    }
};

export class GameGateway {
    constructor() {
        this.state = {
            shown: false,
            showCount: 0,
            dismissed: sessionStorage.getItem('gg-dismissed') === 'true'
        };
        this.overlay = null;
    }

    init() {
        if (this.state.dismissed) return;
        this.setupTriggers();
        this.setupArtworkTracking();
        Logger.info('[Gateway] Organic Art Invitation System Ready');
    }

    setupTriggers() {
        const handleScroll = () => {
            if (this.state.shown || this.state.dismissed) return;
            const scroll = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            if (scroll >= CONFIG.trigger.scrollThreshold) this.show();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        setTimeout(() => { if (!this.state.shown) this.show(); }, CONFIG.trigger.timeThreshold);
    }

    setupArtworkTracking() {
        document.querySelectorAll('[data-artwork]').forEach(el => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) this.saveViewed(el.dataset.artwork);
                });
            }, { threshold: 0.5 });
            observer.observe(el);
        });
    }

    saveViewed(id) {
        let viewed = JSON.parse(localStorage.getItem('naroa-viewed') || '[]');
        if (!viewed.includes(id)) {
            viewed.push(id);
            localStorage.setItem('naroa-viewed', JSON.stringify(viewed.slice(-50)));
        }
    }

    createDOM() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'gg-overlay';
        this.overlay.innerHTML = `
            <div class="gg-backdrop"></div>
            <div class="gg-dialog">
                <button class="gg-close">✕</button>
                <div class="gg-avatar">🎭</div>
                <div class="gg-label">MICA te pregunta</div>
                <div class="gg-text" id="gg-mica-text"></div>
                <div class="gg-buttons">
                    <button class="gg-btn gg-btn--yes" data-action="yes">🎮 ¡Sí!</button>
                    <button class="gg-btn gg-btn--depends" data-action="depends">🤔 Depende</button>
                    <button class="gg-btn gg-btn--no" data-action="no">Mejor no</button>
                </div>
                <div class="gg-response" id="gg-response"></div>
                <div class="gg-recs" id="gg-recommendations">
                    <div class="gg-rec-list" id="gg-rec-list"></div>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        this.overlay.querySelector('.gg-close').onclick = () => this.hide();
        this.overlay.querySelectorAll('.gg-btn').forEach(btn => {
            btn.onclick = () => this.handleAction(btn.dataset.action);
        });
    }

    show() {
        if (this.state.shown || this.state.showCount >= CONFIG.trigger.maxShowsPerSession) return;
        if (!this.overlay) this.createDOM();

        this.state.shown = true;
        this.state.showCount++;
        this.overlay.classList.add('active');
        
        this.typewriter(this.overlay.querySelector('#gg-mica-text'), '¿Juegas?', 80);
    }

    hide() {
        if (!this.overlay) return;
        this.overlay.classList.remove('active');
        this.state.shown = false;
    }

    handleAction(action) {
        const resp = this.overlay.querySelector('#gg-response');
        const quote = CONFIG.quotes[action][0]; // Simple for now
        this.typewriter(resp, quote, 40);

        if (action === 'yes') {
            setTimeout(() => { window.location.hash = '/juego'; this.hide(); }, 1500);
        } else if (action === 'no') {
            setTimeout(() => { 
                this.hide(); 
                sessionStorage.setItem('gg-dismissed', 'true');
                this.state.dismissed = true;
            }, 1500);
        }
    }

    typewriter(el, text, speed) {
        el.textContent = '';
        let i = 0;
        const type = () => {
            if (i < text.length) {
                el.textContent += text[i++];
                setTimeout(type, speed);
            }
        };
        type();
    }
}

export const gameGateway = new GameGateway();
