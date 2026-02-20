import { MicroGame } from '../micro-game.js';

export class AtrapaInspiracionGame extends MicroGame {
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
