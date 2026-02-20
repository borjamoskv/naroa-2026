import { MicroGame } from '../micro-game.js';

export class PelaPatatasGame extends MicroGame {
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
        if (this.peels >= this.target) this.end(true);
    }
}
