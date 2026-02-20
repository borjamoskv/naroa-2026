/**
 * MICA CRISIS ENGINE v2.0 [SOVEREIGN EDITION]
 * 
 * The unified game engine for Naroa Web.
 * Optimized with modular architecture and high-frequency game loop.
 * 
 * @module core/mica/engine
 * @author Antigravity (Sovereign AI)
 */

import { Logger } from '../logger.js';
import { PelaPatatasGame } from './games/pela-patatas.js';
import { EsquivaCriticaGame } from './games/esquiva-critica.js';
import { AtrapaInspiracionGame } from './games/atrapa-inspiracion.js';
import { LimpiaPincelGame } from './games/limpia-pincel.js';
import { MezclaColoresGame } from './games/mezcla-colores.js';

export class MicaCrisisEngine {
    constructor() {
        this.active = false;
        this.score = 0;
        this.lives = 3;
        this.bpm = 120;
        this.currentGame = null;
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.games = {
            micro: [
                PelaPatatasGame,
                EsquivaCriticaGame,
                AtrapaInspiracionGame,
                LimpiaPincelGame,
                MezclaColoresGame
            ]
        };
    }

    init() {
        this.injectStyles();
        this.setupDOM();
        this.bindEvents();
        this.initAudio();
        Logger.info('[MICA] Crisis Engine Initialized');
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #mica-crisis-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: #000; z-index: 9999; display: none;
                font-family: 'Satoshi', sans-serif; color: #fff;
                overflow: hidden;
            }
            .mc-hud {
                position: absolute; top: 20px; left: 20px; right: 20px;
                display: flex; justify-content: space-between; pointer-events: none;
                font-size: 24px; font-weight: bold; mix-blend-mode: difference;
            }
            .mc-canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
            .mc-menu, .mc-result {
                position: absolute; top: 50%; left: 50%; 
                transform: translate(-50%, -50%); text-align: center;
            }
            .mc-btn {
                background: #fff; color: #000; padding: 15px 40px;
                font-size: 20px; text-transform: uppercase; border: none;
                cursor: pointer; margin-top: 20px; font-weight: 900;
                transition: transform 0.1s;
            }
            .mc-btn:hover { transform: scale(1.1); }
            .mc-timer-bar {
                position: absolute; bottom: 0; left: 0; height: 10px;
                background: #fff; transition: width 0.1s linear;
            }
            #mc-instruction {
                position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);
                font-size: 80px; font-weight: 900; color: #fff; text-shadow: 0 0 20px rgba(255,255,255,0.5);
                display: none; pointer-events: none; z-index: 10001;
            }
            .glitch-text { animation: mc-glitch 0.2s infinite; }
            @keyframes mc-glitch {
                0% { transform: translate(-50%, -50%) translate(0); }
                20% { transform: translate(-50%, -50%) translate(-5px, 5px); }
                40% { transform: translate(-50%, -50%) translate(-5px, -5px); }
                60% { transform: translate(-50%, -50%) translate(5px, 5px); }
                80% { transform: translate(-50%, -50%) translate(5px, -5px); }
                100% { transform: translate(-50%, -50%) translate(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    initAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioCtx.createGain();
            this.gainNode.connect(this.audioCtx.destination);
            this.gainNode.gain.value = 0.3;
        } catch(e) { Logger.warn('AudioContext failed', e); }
    }

    playTone(freq, type, duration) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.connect(this.gainNode);
        osc.connect(gain);
        osc.start();
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playWinSFX() {
        this.playTone(440, 'square', 0.1);
        setTimeout(() => this.playTone(880, 'square', 0.2), 100);
    }

    playFailSFX() {
        this.playTone(150, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(100, 'sawtooth', 0.5), 200);
    }
    
    playBeat() {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.5);
    }

    screenImpact(color = 'white', duration = 100) {
        const impact = document.createElement('div');
        Object.assign(impact.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: color, zIndex: '10005', pointerEvents: 'none', opacity: '0.8',
            mixBlendMode: 'overlay',
            transition: `opacity ${duration}ms ease-out`
        });
        document.body.appendChild(impact);
        
        // Animate opacity instead of just removing
        requestAnimationFrame(() => {
            impact.style.opacity = '0';
        });
        setTimeout(() => impact.remove(), duration);

        // Physical Screen Shake
        if (this.container) {
            this.container.animate([
                { transform: 'translate(1px, 1px) rotate(0deg)' },
                { transform: 'translate(-1px, -2px) rotate(-1deg)' },
                { transform: 'translate(-3px, 0px) rotate(1deg)' },
                { transform: 'translate(3px, 2px) rotate(0deg)' },
                { transform: 'translate(1px, -1px) rotate(1deg)' },
                { transform: 'translate(-1px, 2px) rotate(-1deg)' },
                { transform: 'translate(-3px, 1px) rotate(0deg)' },
                { transform: 'translate(3px, 1px) rotate(-1deg)' },
                { transform: 'translate(-1px, -1px) rotate(1deg)' },
                { transform: 'translate(1px, 2px) rotate(0deg)' },
                { transform: 'translate(1px, -2px) rotate(-1deg)' }
            ], { duration: 200, easing: 'ease-in-out' });
        }
    }

    setupDOM() {
        this.container = document.createElement('div');
        this.container.id = 'mica-crisis-overlay';
        this.container.innerHTML = `
            <div class="mc-hud">
                <div class="mc-score">SCORE: <span id="mc-score-val">0</span></div>
                <div class="mc-lives">❤️❤️❤️</div>
            </div>
            <div id="mc-timer" class="mc-timer-bar"></div>
            <canvas id="mc-canvas" class="mc-canvas"></canvas>
            <div id="mc-menu" class="mc-menu">
                <h1 style="font-size: 80px; line-height: 0.9;">MICA<br>CRISIS</h1>
                <button class="mc-btn" id="mc-start-btn">JUGAR</button>
                <button class="mc-close" style="display:block; margin: 20px auto; background:none; border:1px solid #333; color:#666; padding:10px 20px; cursor:pointer;">SALIR</button>
            </div>
            <div id="mc-result" class="mc-result" style="display: none;">
                <h1 style="font-size: 60px;">GAME OVER</h1>
                <p style="font-size: 30px;">SCORE: <span id="mc-final-score">0</span></p>
                <button class="mc-btn" id="mc-restart-btn">RETRY</button>
            </div>
            <div id="mc-instruction"></div>
        `;
        document.body.appendChild(this.container);
        this.canvas = this.container.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        document.getElementById('mc-start-btn').onclick = () => this.startRun();
        document.getElementById('mc-restart-btn').onclick = () => this.startRun();
        this.container.querySelector('.mc-close').onclick = () => this.close();
        
        window.addEventListener('hashchange', () => {
            if (location.hash === '#/mica-crisis') this.open();
        });
    }

    open() {
        this.container.style.display = 'block';
        document.getElementById('mc-menu').style.display = 'block';
        document.getElementById('mc-result').style.display = 'none';
        this.resizeCanvas();
        if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
    }

    close() {
        this.container.style.display = 'none';
        this.active = false;
        if (this.currentGame) this.currentGame.end(false);
        location.hash = '#/';
    }

    startRun() {
        document.getElementById('mc-menu').style.display = 'none';
        document.getElementById('mc-result').style.display = 'none';
        this.score = 0;
        this.lives = 3;
        this.bpm = 120;
        this.updateHUD();
        this.active = true;
        this.nextMicroGame();
    }

    updateHUD() {
        document.getElementById('mc-score-val').innerText = this.score;
        document.querySelector('.mc-lives').innerText = '❤️'.repeat(this.lives);
    }

    async nextMicroGame() {
        if (!this.active) return;
        this.playBeat();
        
        const GameClass = this.games.micro[Math.floor(Math.random() * this.games.micro.length)];
        this.currentGame = new GameClass(this.canvas, this.ctx);
        this.currentGame.onEnd = (success) => {
            if (success) {
                this.score += 100;
                this.playWinSFX();
                this.screenImpact('rgba(255,215,0,0.2)', 100);
            } else {
                this.lives--;
                this.playFailSFX();
                this.screenImpact('rgba(255,0,0,0.3)', 200);
            }
            this.updateHUD();
            if (this.lives > 0 && this.active) {
                setTimeout(() => this.nextMicroGame(), 800);
            } else if (this.active) {
                this.gameOver();
            }
        };

        const instr = document.getElementById('mc-instruction');
        instr.innerText = this.currentGame.instruction;
        instr.style.display = 'block';
        instr.classList.add('glitch-text');
        
        await new Promise(r => setTimeout(r, 1000));
        instr.style.display = 'none';
        instr.classList.remove('glitch-text');

        if (this.active) this.currentGame.start();
    }

    gameOver() {
        this.active = false;
        document.getElementById('mc-result').style.display = 'block';
        document.getElementById('mc-final-score').innerText = this.score;
    }
}
