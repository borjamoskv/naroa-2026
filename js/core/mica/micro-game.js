/**
 * MicroGame Base Class
 * Core component for MICA Crisis Engine
 */

export class MicroGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.w = canvas.width;
        this.h = canvas.height;
        this.instruction = "DO IT!";
        this.duration = 5000;
        this.timer = 0;
        this.running = false;
        this.startTime = 0;
    }

    start() {
        this.running = true;
        this.startTime = Date.now();
        
        // Input Binding (To be handled by engine or specific game)
        this.handleClickBound = this.handleClick.bind(this);
        this.canvas.addEventListener('mousedown', this.handleClickBound);
        this.canvas.addEventListener('touchstart', this.handleClickBound);

        this.loop();
    }

    end(success) {
        this.running = false;
        this.canvas.removeEventListener('mousedown', this.handleClickBound);
        this.canvas.removeEventListener('touchstart', this.handleClickBound);
        
        if (this.onEnd) this.onEnd(success);
    }

    loop() {
        if (!this.running) return;
        
        const elapsed = Date.now() - this.startTime;
        const remaining = this.duration - elapsed;
        const progress = Math.max(0, remaining / this.duration);

        this.ctx.clearRect(0, 0, this.w, this.h);
        
        // Timer UI update handled by Engine or specific draw here
        const timerBar = document.getElementById('mc-timer');
        if (timerBar) {
            timerBar.style.width = `${progress * 100}%`;
            timerBar.style.background = `rgb(255, ${215 * progress}, ${progress < 0.3 ? 0 : 85})`;
        }

        this.update(elapsed);
        this.draw();

        if (remaining <= 0) {
            this.end(false); // Time out
        } else {
            requestAnimationFrame(() => this.loop());
        }
    }

    update(t) {}
    draw() {}
    handleClick(e) {}
}
