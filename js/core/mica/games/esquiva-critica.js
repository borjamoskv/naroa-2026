import { MicroGame } from '../micro-game.js';

export class EsquivaCriticaGame extends MicroGame {
    constructor(c, x) {
        super(c, x);
        this.instruction = "¡NO ESCUCHES!";
        this.playerX = c.width / 2;
        this.critics = [];
        this.duration = 4000;
        this.onMoveBound = this.onMove.bind(this);
    }

    start() {
        document.addEventListener('mousemove', this.onMoveBound);
        super.start();
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
            if (Math.abs(c.x - this.playerX) < 40 && c.y > this.h - 100) {
                this.end(false);
            }
        });
        
        if (Date.now() - this.startTime > this.duration - 100) {
            this.end(true);
        }
    }

    draw() {
        this.ctx.font = "50px Arial";
        this.ctx.fillText("😇", this.playerX, this.h - 50);
        this.critics.forEach(c => {
            this.ctx.font = "40px Arial";
            this.ctx.fillText(c.msg, c.x, c.y);
        });
    }

    end(success) {
        document.removeEventListener('mousemove', this.onMoveBound);
        super.end(success);
    }
}
