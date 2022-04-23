import {attackHandler, ctx, gameFrame, movementHandler } from "./gameFramework.js";

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
        this.idle = true;
        this.moving = 0; // 0 none, 1 right, -1 left Only counts for player movement
        this.direction = 0; // 1 right, -1 left
        this.moveinc = moveinc;
        this.vel = {
            x: 0,
            y: 0,
        }
        this.charFrame = 0
    }
    moveLeft() {
        if(this.vel.x > -this.moveinc) this.vel.x -=.3;
        this.moving = -1;
        this.direction = -1;
        this.idle = false;
    }
    
    moveRight() {
        if(this.vel.x < this.moveinc) this.vel.x +=.3;
        this.moving = 1;
        this.direction = 1;
        this.idle = false;
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
        movementHandler()
        this.jumpAnimations()
        attackHandler()
        this.colliderUpdate()
    }

    draw(){
        //Collider
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        if (this.direction == -1) {
            //This all essentially flips the image
            ctx.translate(this.x+this.spriteWidth,this.y);

            // scaleX by -1; this "trick" flips horizontally
            ctx.scale(-1,1);

            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, -this.spriteCollider.width /*Compensates for flip */, 0, 300, 300);
            
            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }

        else{
            // Img Src, spritePositionX, spritePositionY, spriteWidth, spriteHeight, ImageX, ImageY, Image Width, Image Height
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, 300, 300);
        }

        //Eveything below handles a majority of the animation logic
        if (this.moving == 0 && !this.idle && !this.attacking){
            this.img.src = this.imgPath+'/Idle.png'
            this.moving = false;
            this.idle = true
        }

        //Staggers the frames so the animations don't play too fast
        if(gameFrame % staggerFrame != 0) return;
        //Animates next frame if there is another frame otherwise start over from first frame
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

    //Handles Jumping Animations
    jumpAnimations() {
        if(this.jumping) return;
        if(this.vel.y > 0) {
            this.img.src = this.imgPath+'/Fall.png'
            this.totalFrames = 1;
        }
        if(this.vel.y < 0) {
            this.img.src = this.imgPath+'/Jump.png'
            this.totalFrames = 1;
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
            y: this.y+135,
            width: 50,
            height: 70
        }
    }

    physUpdate(){
        if(this.vel.x < .07 && this.vel.x > 0) { this.vel.x = 0}
        if(this.vel.x > -gravity.x && this.vel.x < 0) { this.vel.x = 0}
        if(this.vel.x < 0) {
            this.vel.x += gravity.x;
            if (this.jumping) this.vel.x -= gravity.x/2
        }
        if (this.vel.x > 0) {
            this.vel.x -= gravity.x
            if (this.jumping) this.vel.x += gravity.x/2
        }
        if(this.vel.x == 0) this.moving = 0
        if(this.vel.y != 0) this.idle = false; 
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