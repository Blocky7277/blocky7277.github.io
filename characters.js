import { c, ctx, gameFrame } from "./gameFramework.js";

const staggerFrame = 10

class character{
    constructor(x, y, health, imgSrc, spriteWidth = 250, spriteHeight = 250,){
        this.x = x;
        this.y = y;
        this.health = health;
        this.img = new Image();
        this.img.src = imgSrc+'/Idle.png';
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.vel = {
            x: 0,
            y: 0,
        }
        this.charFrame = 0
    }

}

export class wizard extends character {
    constructor(x, y, width, height, health, imgSrc, spriteWidth, spriteHeight){
        super(x, y, width, height, health, imgSrc, spriteWidth, spriteHeight);
        this.spriteCollider = {
            x: this.x, 
            y: this.y+50,
            width: 50,
            height: 70
        }
    }

    draw(){
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        ctx.drawImage(this.img, this.charFrame*this.spriteWidth+105, 70, this.spriteHeight, this.spriteHeight, this.x, this.y, 300, 300);
        if(gameFrame % staggerFrame != 0) return;
        if(this.charFrame < 7 ) this.charFrame++
        else this.charFrame = 0
    }

    intersects(obj){
		if (this.spriteCollider.x < obj.spriteCollider.x + obj.spriteCollider.width && this.spriteCollider.x + this.spriteCollider.width > obj.x && this.y < obj.y + obj.height && this.y + this.height > obj.y) {
			return true;
		}
		else {
			return false;
		}
    }

    attack1(){

    }
}