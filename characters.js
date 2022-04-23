import {ctx, gameFrame, movementAndAttackHandler } from "./gameFramework.js";

const staggerFrame = 15

const c = myCanvas;
const cWidth = c.width; 
const cHeight = c.height;
const ground = cHeight;
const gravity = {x: .17, y: 0.3};


class character{
    constructor(x, y, health, imgSrc, spriteWidth = 250, spriteHeight = 250, moveinc = 7){
        this.x = x;
        this.y = y;
        this.health = health;
        this.imgPath = imgSrc;
        this.img = new Image();
        this.img.src = this.imgPath+'/Idle.png';
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.jumping = true;
        this.attacking = false;
        this.moving = 0; // 0 none, 1 right, -1 left Only counts for player movement
        this.moveinc = moveinc;
        this.vel = {
            x: 0,
            y: 0,
        }
        this.charFrame = 0
    }
    moveLeft() {
        if(this.vel.x > -this.moveinc) this.vel.x -=.3;
        this.moving = -1
    }
    
    moveRight() {
        if(this.vel.x < this.moveinc) this.vel.x +=.3;
        this.moving = 1
    }
}

export class wizard extends character {
    constructor(x, y, health, imgSrc, spriteWidth, spriteHeight, moveinc){
        super(x, y, health, imgSrc, spriteWidth, spriteHeight, moveinc);
        this.spriteCollider = {
            x: 0, 
            y: 0,
            width: 0,
            height: 0,
        }
        this.totalFrames = 7
    }

    update(){
        this.physUpdate()
        movementAndAttackHandler()
        this.colliderUpdate()
    }

    draw(){
        //Displays Hitbox
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        // Img Src, spritePositionX, spritePositionY, spriteWidth, spriteHeight, ImageX, ImageY, Image Width, Image Height
        ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, 300, 300);
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

    jump(){
        if(this.jumping) return;
        this.vel.y = -15;
        this.jumping = true
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
            y: this.y+135,
            width: 50,
            height: 70
        }
    }

    physUpdate(){
        if(this.vel.x < .07 && this.vel.x > 0) { this.vel.x = 0}
        if(this.vel.x > -gravity.x && this.vel.x < 0) { this.vel.x = 0}
        if(this.vel.x < 0) this.vel.x += gravity.x;
        if (this.vel.x > 0) this.vel.x -= gravity.x
        console.log(this.vel.x, this.vel.y)
        this.vel.y += gravity.y;
        this.x += this.vel.x;
        this.y += this.vel.y;
        this.colliderUpdate()
        const gpos = ground - this.spriteCollider.height*2.9;
        const g = ground - this.spriteCollider.height;
        if(this.spriteCollider.y > g) { 
            this.y = gpos; // Update pos to match ground
            this.vel.y = 0;  // change velocity 0;
            this.jumping = false;
        }
    }
}