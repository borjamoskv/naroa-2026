import { MicroGame } from '../micro-game.js';

export class MezclaColoresGame extends MicroGame {
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
        if (mx > this.w / 2) {
             this.end(true);
        } else {
            this.end(false);
        }
    }
}
