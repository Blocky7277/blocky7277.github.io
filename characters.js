import { c, ctx } from "./gameFramework.js";

class character{
    constructor(x, y, health, imgSrc, spriteWidth = 36, spriteHeight = 37){
        this.x = x;
        this.y = y;
        this.health = health;
        this.img = new Image();
        this.img.src = imgSrc;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.vel = {
            x: 0,
            y: 0,
        }
        this.charFrame = 0
    }
    draw(){
        ctx.drawImage(this.img, this.charFrame*this.spriteWidth, this.charFrame*this.spriteHeight, this.spriteWidth, this.spriteHeight, 0, 0, this.spriteWidth*2, this.spriteHeight*2)
    }

    animate(){
        
    }

}

export class char1 extends character {
    constructor(x, y, width, height, health, imgSrc, spriteWidth = 55){
        super(x, y, width, height, health, imgSrc, spriteWidth);

    }
}