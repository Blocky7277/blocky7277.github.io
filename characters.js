import {attackHandler, ctx, gameFrame, movementHandler } from "./gameFramework.js";

const staggerFrame = 15

const c = myCanvas;
const cWidth = c.width; 
const cHeight = c.height;
const ground = cHeight;
const gravity = {x: .17, y: 0.3};


class character{
    constructor(x, y, health, imgSrc, spriteWidth = 250, spriteHeight = 250, moveinc = 7, spriteOffsetX, spriteOffsetY, drawOffsetX = 0, drawOffsetY = 0){
        this.x = x;
        this.y = y;
        this.health = health;
        this.imgPath = imgSrc;
        this.img = new Image();
        this.img.src = this.imgPath+'/Idle.png';
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.spriteOffsetX = spriteOffsetX;
        this.spriteOffsetY = spriteOffsetY;
        this.drawOffsetX = drawOffsetX;
        this.drawOffsetY = drawOffsetY;
        this.spriteCollider = {
            x: 0,
            y: 0,
        }
        this.inAir = false;
        this.attacking = false;
        this.idle = true;
        this.direction = 1; // 1 right, -1 left
        this.moveinc = moveinc;
        this.vel = {
            x: 0,
            y: 0,
        }
        this.charFrame = 0
    }

    moveLeft() {
        if(this.vel.x > -this.moveinc) this.vel.x -=.3;
        this.direction = -1;
        this.idle = false;
    }
    
    moveRight() {
        if(this.vel.x < this.moveinc) this.vel.x +=.3;
        this.direction = 1;
        this.idle = false;
    }

    //Update Physics
    physUpdate(){
        if(this.vel.x < .07 && this.vel.x > 0) { this.vel.x = 0}
        if(this.vel.x > -gravity.x && this.vel.x < 0) { this.vel.x = 0}
        if(this.vel.x < 0) {
            this.vel.x += gravity.x;
            if (this.inAir) this.vel.x -= gravity.x*15/16
        }
        if (this.vel.x > 0) {
            this.vel.x -= gravity.x
            if (this.inAir) this.vel.x += gravity.x*15/16
        }
        if(this.vel.y != 0) {
            this.idle = false;
            this.inAir = true;
        } 
        
        //Check if the sprite would go off screen and update the velocity and position to prevent that
        if(this.spriteCollider.x + this.vel.x < this.drawOffsetX) {
            this.vel.x = 0
            this.x = -this.spriteOffsetX+ +this.drawOffsetX
        };
        if(this.spriteCollider.x+this.spriteCollider.width+this.drawOffsetX + this.vel.x > cWidth) {
            this.vel.x = 0
            this.x = cWidth-(this.spriteOffsetX+this.spriteCollider.width+this.drawOffsetX)
        }

        //Apply the calculated forces
        this.vel.y += gravity.y;
        this.x += this.vel.x;
        this.y += this.vel.y;
        //Updates the collider so the frames match
        this.colliderUpdate()
        //Position of the ground relative to drawn character
        const gpos = ground - this.spriteCollider.height-this.spriteOffsetY;
        //Position of ground relative to the collider
        const g = ground - this.spriteCollider.height;
        if(this.spriteCollider.y > g) { 
            this.y = gpos; // Update pos to match ground
            this.vel.y = 0;  // change velocity 0;
            this.inAir = false;
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
}

export class wizard extends character {
    constructor(x, y, health, imgSrc, spriteWidth, spriteHeight, moveinc, spriteOffsetX, spriteOffsetY,  drawOffsetX, drawOffsetY){
        super(x, y, health, imgSrc, spriteWidth, spriteHeight, moveinc, spriteOffsetX, spriteOffsetY, drawOffsetX, drawOffsetY);
        this.spriteCollider = {
            x: 0, 
            y: 0,
            width: 0,
            height: 0,
        }
        this.totalFrames = 7
    }
    
    update(){
        //Update the physics with inputs from last frame/tick
        this.physUpdate()
        //Grab the inputs from this frame
        movementHandler()
        //Update the jump animations after the inputs
        this.jumpAnimations()
        //Check for attacks last so you can attack in mid air
        attackHandler()
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
        if (this.vel.x == 0 && !this.idle && !this.attacking){
            this.img.src = this.imgPath+'/Idle.png'
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
    
    
    jump(){
        if(this.inAir) return;
        this.vel.y = -15;
        this.inAir = true
    }
    
    //Handles Jumping Animations
    jumpAnimations() {
        if(!this.inAir || this.attacking) return;
        if(this.vel.y > 0) {
            this.charFrame = 0;
            this.img.src = this.imgPath+'/Fall.png'
            this.totalFrames = 1;
        }
        if(this.vel.y < 0) {
            this.charFrame = 0;
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
            x: this.x+this.spriteOffsetX, 
            y: this.y+this.spriteOffsetY,
            width: 50,
            height: 70
        }
    }
    
}