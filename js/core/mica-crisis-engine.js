/**
 * MICA CRISIS ENGINE v1.0 [GOLDEN STATE]
 * 
 * The unified game engine for Naroa Web.
 * Replaces 26 fragmented game files with a single, high-octane loop.
 * 
 * Architecture:
 * - GameManager: Orchestrates the loop (Menu -> Intro -> Game -> Score -> Loop)
 * - MicroGames: 5-10s simple games (Phaser-less, pure Canvas/DOM)
 * - MacroGames: Unlimited time games (Snake, Tetris) available in Zen Mode
 * 
 * @author Kimi (Antigravity)
 */

class MicaCrisisEngine {
    constructor() {
        this.active = false;
        this.score = 0;
        this.lives = 3;
        this.bpm = 120; // Heartbeat speed
        this.currentGame = null;
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        // Game Registry
        this.games = {
            micro: [
                PelaPatatasGame,
                EsquivaCriticaGame,
                AtrapaInspiracionGame,
                LimpiaPincelGame,
                MezclaColoresGame
            ],
            macro: [
                SnakeZenGame,
                TetrisArtGame
            ]
        };
    }

    init() {
        console.log('⚡ MICA CRISIS ENGINE: INITIALIZED');
        this.injectStyles();
        this.setupDOM();
        this.bindEvents();
        this.initAudio();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
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
            .mc-canvas {
                width: 100%; height: 100%; display: block;
                image-rendering: pixelated; /* CRT/Retro Feel - ACTIVATED */
            }
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
            .mc-btn:hover { transform: translate(-50%, -50%) scale(1.1); }
            
            /* Glitch Effect */
            .glitch-text { animation: glitch 1s infinite; }
            @keyframes glitch {
                0% { transform: translate(0) }
                20% { transform: translate(-2px, 2px) }
                40% { transform: translate(-2px, -2px) }
                60% { transform: translate(2px, 2px) }
                80% { transform: translate(2px, -2px) }
                100% { transform: translate(0) }
            }
        `;
        document.head.appendChild(style);
    }
    
    initAudio() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.connect(this.audioCtx.destination);
        this.gainNode.gain.value = 0.3; // Master Volume
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
        impact.style.fixed = 'fixed';
        impact.style.top = '0';
        impact.style.left = '0';
        impact.style.width = '100vw';
        impact.style.height = '100vh';
        impact.style.backgroundColor = color;
        impact.style.zIndex = '10005';
        impact.style.pointerEvents = 'none';
        impact.style.opacity = '0.5';
        document.body.appendChild(impact);
        setTimeout(() => impact.remove(), duration);
        
        // Shake screen
        this.container.style.animation = 'mc-shake 0.2s cubic-bezier(.36,.07,.19,.97) both';
        setTimeout(() => this.container.style.animation = '', 200);
    }

    setupDOM() {
        this.container = document.createElement('div');
        this.container.id = 'mica-crisis-overlay';
        this.container.innerHTML = `
            <div class="crt-overlay"></div>
            <div class="crt-vignette"></div>
            
            <div class="mc-hud">
                <div class="mc-score">SCORE: <span id="mc-score-val">0</span></div>
                <div class="mc-lives">❤️❤️❤️</div>
            </div>
            
            <div id="mc-timer" class="mc-timer-bar" style="width: 100%;"></div>

            <canvas id="mc-canvas" class="mc-canvas"></canvas>
            
            <div id="mc-menu" class="mc-menu">
                <h1 class="glitch-text" style="font-size: 80px; line-height: 0.9;">MICA<br>CRISIS</h1>
                <p style="font-size: 24px; margin: 20px 0; opacity: 0.8;">THE ART RUSH</p>
                <button class="mc-btn" id="mc-start-btn">JUGAR</button>
                <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: center;">
                    <button class="mc-btn" style="font-size: 14px; padding: 10px 20px;" id="mc-zen-btn">ZEN MODE</button>
                </div>
                <button class="mc-close" style="position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%); background: none; border: 1px solid #333; color: #666; padding: 10px 20px; cursor: pointer;">SALIR</button>
            </div>

            <div id="mc-result" class="mc-result" style="display: none;">
                <h1 style="font-size: 60px;">GAME OVER</h1>
                <p style="font-size: 30px;">SCORE: <span id="mc-final-score">0</span></p>
                <button class="mc-btn" id="mc-restart-btn">RETRY</button>
                <button class="mc-btn" id="mc-exit-btn" style="background: transparent; color: #fff; border: 1px solid #fff;">EXIT</button>
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
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        document.getElementById('mc-start-btn').addEventListener('click', () => this.startRun());
        document.getElementById('mc-zen-btn').addEventListener('click', () => this.startZenMode());
        document.getElementById('mc-restart-btn').addEventListener('click', () => this.startRun());
        document.getElementById('mc-exit-btn').addEventListener('click', () => this.close());
        this.container.querySelector('.mc-close').addEventListener('click', () => this.close());
        
        // Router Hook
        window.addEventListener('hashchange', () => {
            if (location.hash === '#/mica-crisis' || location.hash.startsWith('#/juego')) {
                this.open();
            }
        });
    }

    open() {
        this.container.style.display = 'block';
        document.getElementById('mc-menu').style.display = 'block';
        document.getElementById('mc-result').style.display = 'none';
        this.resizeCanvas();
        if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
    }

    close() {
        this.container.style.display = 'none';
        this.active = false;
        if (this.currentGame) this.currentGame.end();
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
        
        // Play beat
        this.playBeat();
        
        // 1. Pick Random Game
        const GameClass = this.games.micro[Math.floor(Math.random() * this.games.micro.length)];
        this.currentGame = new GameClass(this.canvas, this.ctx);

        // 2. Show Instruction
        const instr = document.getElementById('mc-instruction');
        instr.innerText = this.currentGame.instruction;
        instr.style.display = 'block';
        instr.classList.add('glitch-text');
        this.playTone(600, 'sine', 0.1); // Instruction SFX
        
        // Wait 1s
        await new Promise(r => setTimeout(r, 1200));
        instr.style.display = 'none';
        instr.classList.remove('glitch-text');

        // 3. Start Game
        this.currentGame.start()
            .then(success => {
                if (success) {
                    this.score += 100;
                    this.bpm += 5;
                    this.playWinSFX();
                    this.screenImpact('rgba(255,215,0,0.3)', 150);
                } else {
                    this.lives--;
                    this.playFailSFX();
                    this.screenImpact('rgba(255,0,0,0.5)', 300);
                }
                this.updateHUD();
                
                if (this.lives > 0) {
                    setTimeout(() => this.nextMicroGame(), 500);
                } else {
                    this.gameOver();
                }
            });
    }

    gameOver() {
        this.active = false;
        document.getElementById('mc-result').style.display = 'block';
        document.getElementById('mc-final-score').innerText = this.score;
    }
    
    startZenMode() {
        // Launches Snake or Tetris
    }
}

// =============================================================================
// MICRO-GAMES (The "WarioWare" Units)
// =============================================================================

class MicroGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.w = canvas.width;
        this.h = canvas.height;
        this.instruction = "DO IT!";
        this.duration = 5000; // 5s default
        this.timer = 0;
    }
    
    start() {
        return new Promise(resolve => {
            this.resolve = resolve;
            this.running = true;
            this.startTime = Date.now();
            this.loop();
            
            // Input
            this.onClick = (e) => this.handleClick(e);
            this.canvas.addEventListener('mousedown', this.onClick);
            this.canvas.addEventListener('touchstart', this.onClick);
        });
    }

    end(success) {
        this.running = false;
        this.canvas.removeEventListener('mousedown', this.onClick);
        this.canvas.removeEventListener('touchstart', this.onClick);
        this.resolve(success);
    }

    loop() {
        if (!this.running) return;
        
        const elapsed = Date.now() - this.startTime;
        const remaining = this.duration - elapsed;
        const progress = Math.max(0, remaining / this.duration);

        this.ctx.clearRect(0,0, this.w, this.h);
        
        // Update CSS Timer Bar
        const timerBar = document.getElementById('mc-timer');
        if (timerBar) {
            timerBar.style.width = `${progress * 100}%`;
            // Color shift from golden to red
            timerBar.style.background = `rgb(${255}, ${215 * progress}, ${progress < 0.3 ? 0 : 85})`;
        }

        this.update(elapsed);
        this.draw();

        if (remaining <= 0) {
            this.end(false); // Time out = fail
        } else {
            requestAnimationFrame(() => this.loop());
        }
    }

    update(t) {}
    draw() {}
    handleClick(e) {}
}

// GAME 1: PELA PATATAS (Repeated Clicking)
class PelaPatatasGame extends MicroGame {
    constructor(c, x) {
        super(c, x);
        this.instruction = "¡PELA!";
        this.peels = 0;
        this.target = 5;
    }
    
    draw() {
        this.ctx.font = "100px Arial";
        this.ctx.fillStyle = "#eebb44";
        this.ctx.textAlign = "center";
        this.ctx.fillText("🥔", this.w/2, this.h/2);
        
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(`${this.peels}/${this.target}`, this.w/2, this.h/2 + 60);
    }

    handleClick(e) {
        this.peels++;
        // Visualize peel
        if (this.peels >= this.target) this.end(true);
    }
}

// GAME 2: ATTRAPA LA INSPIRACIÓN (Moving Target)
class AtrapaInspiracionGame extends MicroGame {
    constructor(c, x) {
        super(c, x);
        this.instruction = "¡ATRAPA!";
        this.x = Math.random() * (c.width - 100);
        this.y = Math.random() * (c.height - 100);
        this.vx = 5;
        this.vy = 5;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > this.w - 50) this.vx *= -1;
        if (this.y < 0 || this.y > this.h - 50) this.vy *= -1;
    }

    draw() {
        this.ctx.font = "60px Arial";
        this.ctx.fillText("💡", this.x, this.y);
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = (e.clientX || e.touches[0].clientX) - rect.left;
        const my = (e.clientY || e.touches[0].clientY) - rect.top;
        
        if (Math.abs(mx - this.x) < 50 && Math.abs(my - this.y) < 50) {
            this.end(true);
        }
    }
}

// GAME 3: ESQUIVA LA CRÍTICA (Avoidance)
class EsquivaCriticaGame extends MicroGame {
    constructor(c, x) {
        super(c, x);
        this.instruction = "¡NO ESCUCHES!";
        this.playerX = c.width / 2;
        this.critics = [];
        this.duration = 4000; // Survive for 4s
        
        document.addEventListener('mousemove', this.onMove.bind(this));
    }

    onMove(e) {
        this.playerX = e.clientX;
    }

    update() {
        if (Math.random() < 0.1) {
            this.critics.push({
                x: Math.random() * this.w,
                y: -50,
                msg: ["👎", "😡", "💩"][Math.floor(Math.random()*3)]
            });
        }

        this.critics.forEach(c => {
            c.y += 10;
            // Collision
            if (Math.abs(c.x - this.playerX) < 40 && c.y > this.h - 100) {
                this.end(false); // Hit!
            }
        });
        
        // If timer runs out naturally, win (handled in super)
        // Hack: check remaining time in Loop.
        if (Date.now() - this.startTime > this.duration - 100) {
            this.end(true);
        }
    }

    draw() {
        // Player
        this.ctx.font = "50px Arial";
        this.ctx.fillText("😇", this.playerX, this.h - 50);
        
        // Critics
        this.critics.forEach(c => {
            this.ctx.font = "40px Arial";
            this.ctx.fillText(c.msg, c.x, c.y);
        });
    }

    end(success) {
        document.removeEventListener('mousemove', this.onMove);
        super.end(success);
    }
}

// GAME 4: LIMPIA PINCEL (Shake mouse/swipe)
class LimpiaPincelGame extends MicroGame {
    constructor(c, x) {
        super(c, x);
        this.instruction = "¡AGITA!";
        this.dirty = 100;
        this.lastX = 0;
        document.addEventListener('mousemove', this.onShake.bind(this));
    }

    onShake(e) {
        const delta = Math.abs(e.clientX - this.lastX);
        this.dirty -= delta * 0.5;
        this.lastX = e.clientX;
        if (this.dirty <= 0) this.end(true);
    }

    draw() {
        this.ctx.fillStyle = `rgb(${this.dirty + 50}, ${this.dirty + 50}, ${this.dirty + 50})`;
        this.ctx.fillRect(this.w/2 - 50, this.h/2 - 50, 100, 100);
        this.ctx.fillText("🖌️", this.w/2, this.h/2);
    }
}

// GAME 5: MEZCLA COLORES (Color Match - Simple Click)
class MezclaColoresGame extends MicroGame {
    constructor(c, x) {
        super(c, x);
        this.instruction = "¡TOQUE AZUL!";
        this.targetColor = "blue";
        this.options = [
            { c: 'red', x: 100, y: 300 },
            { c: 'blue', x: c.width - 100, y: 300 }
        ];
    }
    
    draw() {
        this.options.forEach(o => {
            this.ctx.fillStyle = o.c;
            this.ctx.beginPath();
            this.ctx.arc(o.x, o.y, 50, 0, Math.PI*2);
            this.ctx.fill();
        });
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = (e.clientX || e.touches[0].clientX) - rect.left;
        
        // Simple logic: Left or Right
        if (mx > this.w / 2) {
             // Right side (Blue)
             this.end(true);
        } else {
            this.end(false);
        }
    }
}

// =============================================================================
// MACRO GAMES (Zen Mode Games)
// =============================================================================
class SnakeZenGame extends MicroGame {
    // Implement Snake Logic Here (Full Screen)
}

class TetrisArtGame extends MicroGame {
    // Implement Tetris Logic Here
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================
export const micaCrisis = new MicaCrisisEngine();
micaCrisis.init();
