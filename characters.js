import { c, ctx } from "./gameFramework.js";

class character{
    constructor(x, y, width, height, health, imgSrc, spriteWidth = 55){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.img = new Image();
        this.img.src = imgSrc;
        this.spriteWidth = spriteWidth;
        this.vel = {
            x: 0,
            y: 0,
        }
    }
    draw(){
        ctx.drawImage(this.img, this.x, this.y, this.spriteWidth, 50, 0, 0, 100, 100)
    }

    animate(){
        
    }

}

export class char1 extends character {
    constructor(x, y, width, height, health, imgSrc, spriteWidth = 55){
        super(x, y, width, height, health, imgSrc, spriteWidth);

    }
}