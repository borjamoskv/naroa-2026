import { MicroGame } from '../micro-game.js';

export class LimpiaPincelGame extends MicroGame {
    constructor(c, x) {
        super(c, x);
        this.instruction = "¡AGITA!";
        this.dirty = 100;
        this.lastX = 0;
        this.onShakeBound = this.onShake.bind(this);
    }

    start() {
        document.addEventListener('mousemove', this.onShakeBound);
        super.start();
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
        this.ctx.font = "50px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("🖌️", this.w/2, this.h/2);
    }

    end(success) {
        document.removeEventListener('mousemove', this.onShakeBound);
        super.end(success);
    }
}
