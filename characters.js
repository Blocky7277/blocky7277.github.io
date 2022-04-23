import { ctx, gameFrame } from "./gameFramework.js";

const staggerFrame = 15

class character{
    constructor(x, y, health, imgSrc, spriteWidth = 250, spriteHeight = 250, moveinc = 5){
        this.x = x;
        this.y = y;
        this.health = health;
        this.imgPath = imgSrc;
        this.img = new Image();
        this.img.src = this.imgPath+'/Idle.png';
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.jumping = false;
        this.attacking = false;
        this.moveinc = moveinc;
        this.vel = {
            x: 0,
            y: 0,
        }
        this.charFrame = 0
    }
    moveLeft() {
        if(this.vel.x > -this.moveinc) this.vel.x -=.25;
        console.log(this.vel.x)
        this.x += this.vel.x;
    }
    
    moveRight() {
        if(this.vel.x < this.moveinc) this.vel.x +=.25;
        console.log(this.vel.x)
        this.x += this.vel.x;
        this.x += this.moveinc;
    }
}

export class wizard extends character {
    constructor(x, y, health, imgSrc, spriteWidth, spriteHeight, moveinc){
        super(x, y, health, imgSrc, spriteWidth, spriteHeight, moveinc);
        this.spriteCollider = {
            x: this.x+106, 
            y: this.y+50,
            width: 60,
            height: 70
        }
        this.totalFrames = 7
    }

    draw(){
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 70, this.spriteWidth, this.spriteHeight, this.x, this.y, 300, 300);
        if(gameFrame % staggerFrame != 0) return;
        if(this.charFrame < this.totalFrames ) this.charFrame++
        else{
            this.charFrame = 0
            if(this.attacking) {
                this.img.src = this.imgPath+'/Idle.png'
                this.attacking = false;
            }
        }
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
        if(this.attacking) return;
        this.img.src = this.imgPath+'/Attack1.png';
        this.charFrame = 0;
        this.totalFrames = 7;
        this.attacking = true;
    }
    attack2(){
        if(this.attacking) return;
        this.img.src = this.imgPath+'/Attack2.png';
        this.charFrame = 0;
        this.totalFrames = 7;
        this.attacking = true;
    }

    colliderUpdate(){
        this.spriteCollider = {
            x: this.x+125, 
            y: this.y+50,
            width: 50,
            height: 70
        }
    }
}