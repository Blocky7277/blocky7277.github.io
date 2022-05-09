import {attackHandler, ctx, gameFrame, movementHandler, player, cpu} from "./gameFramework.js";
import * as util from "./utilityClassesAndFunctions.js";

const staggerFrame = 5;

const c = myCanvas;
const cWidth = c.width; 
const cHeight = c.height;
const ground = cHeight-80;
const gravity = {x: .3, y: 0.5};

//Template for characters
class character{
    constructor(x = 0, y = 0, moveinc = 5, isPlayer = false, direction = 1){
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.spriteCollider = {
        }
        this.attackCollider = {
            x: this.spriteCollider.x,
            y: this.spriteCollider.y,
            height: this.spriteCollider.height,
            width: this.spriteCollider.width,
        }
        this.currentAttack = 0;
        this.currentAttackDmg = 0;
        this.damageFrame = 0;
        this.inAir = false;
        this.attacking = false;
        this.attacked = false;
        this.direction = direction; // 1 right, -1 left
        this.koed = false;
        this.moveinc = moveinc;
        this.isPlayer = isPlayer;
        this.vel = {
            x: 0,
            y: 0,
        }
        this.charFrame = 0
    }
    
    moveLeft() {
        if(this.vel.x > -this.moveinc) this.vel.x -=.6;
        this.direction = -1;
    }
    
    moveRight() {
        if(this.vel.x < this.moveinc) this.vel.x +=.6;
        this.direction = 1;
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
    
    update(){
        //Update the physics with inputs from last frame/tick
        this.physUpdate()
        //Grab the inputs from this frame
        movementHandler()
        //Check for attacks last so you can attack in mid air
        attackHandler()
        //Updates Animations
        this.animationUpdate()
        
    }
    
    updateTitle(){
        //Update the physics with inputs from last frame/tick
        this.physUpdate()
        //Updates Animations
        this.animationUpdate()
    }
    
    colliderUpdate(){
        this.spriteCollider = {
            x: this.x+this?.spriteOffsetX, 
            y: this.y+this?.spriteOffsetY,
            width: this.spriteColliderWidth,
            height: this.spriteColliderHeight,
        }
    }
    
    jump(){
        if(this.inAir) return;
        this.vel.y = -12;
        this.inAir = true
    }
    
    attackIntersects(obj){
        //Checks if the attack collides with the sprite's hitbox
        if (this.attackCollider.x < obj.spriteCollider.x + obj.spriteCollider.width && this.attackCollider.x + this.attackCollider.width > obj.spriteCollider.x && this.attackCollider.y < obj.spriteCollider.y + obj.spriteCollider.height && this.attackCollider.y + this.attackCollider.height > obj.spriteCollider.y) {
            return true;
        }
        else {
            return false;
        }
    }

    updateXYFromCollider(){
        //Updates the sprites xy from collider positioning
        this.x = this.spriteCollider.x - this?.spriteOffsetX
        this.y = this.spriteCollider.y - this?.spriteOffsetY
    }
}

export class wizard extends character {
    constructor(x, y, moveinc, isPlayer, direction){
        super(x, y, moveinc, isPlayer, direction);
        this.maxHealth = 50;
        this.health = this.maxHealth;
        this.canAttack1 = true;
        this.imgPath = './sprites/mahonohito';
        this.img.src = this.imgPath+'/Idle.png';
        this.totalFrames = 7;
        this.spriteWidth = 250;
        this.spriteHeight = 250;
        this.spriteOffsetX = 86;
        this.spriteOffsetY = 85;
        this.drawOffsetX = 20;
        this.drawOffsetY = 50;
        this.spriteColliderWidth = 30;
        this.spriteColliderHeight = 50;
    }
    
    //Draw Sprite
    draw(){
        ctx.fillStyle = 'red'
        //Attack Collider
        // ctx.fillRect(this.attackCollider.x, this.attackCollider.y, this.attackCollider.width, this.attackCollider.height)
        ctx.fillStyle = 'black'
        //Collider
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        if (this.direction == -1) {
            //This all essentially flips the image
            
            //Translates to the images position
            ctx.translate(this.x+this.spriteCollider.width*23/4,this.y);
            
            // scaleX by -1; this "trick" flips horizontally
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, -this.spriteCollider.width /*Compensates for flip */, 0, 200, 200);
            
            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }
        
        else{
            // Img Src, spritePositionX, spritePositionY, spriteWidth, spriteHeight, positionOnScreenX, positionOnScreenY, widthOnScreen, heightOnScreen
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, 200, 200);
        }
    }
    
    attack1(){
        // Damage of 10
        if(this.attacking || this.inAir || !this.canAttack1) return;
        this.currentAttack = 1;
        this.canAttack1 = false;
        this.currentAttackDmg = 7;
        this.damageFrame = 3;
        this.img.src = this.imgPath+'/Attack1.png';
        this.charFrame = 0;
        this.totalFrames = 7;
        this.attacking = true;
    }
    attack2(){
        // Damage of 17
        if(this.attacking || this.inAir) return;
        this.currentAttack = 2;
        this.currentAttackDmg = 12;
        this.damageFrame = 2;
        this.img.src = this.imgPath+'/Attack2.png';
        this.charFrame = 0;
        this.damageFrame = 7;
        this.totalFrames = 7;
        this.attacking = true;
    }
    
    attackLogicPlayer(){
        if(this.currentAttack == 1){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*2.3
                this.attackCollider.width = this.spriteCollider.width*2
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x+ this.spriteCollider.width*1.3;
                this.attackCollider.width = this.spriteCollider.width*2;
            }
            this.attackCollider.y = this.spriteCollider.y-40;
            this.attackCollider.height = this.spriteCollider.height+20;  
        }
        else if(this.currentAttack == 2){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*2.6
                this.attackCollider.width = this.spriteCollider.width*2.6
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x + this.spriteCollider.width;
                this.attackCollider.width = this.spriteCollider.width*2.6;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        if(this.attackIntersects(cpu) && !cpu.koed) {
            cpu.charFrame = 0;
            cpu.health -= this.currentAttackDmg;
            cpu.attacked = true;
        }
    }
    attackLogicCPU(){
        if(this.currentAttack == 1){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*2.3
                this.attackCollider.width = this.spriteCollider.width*2
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x+ this.spriteCollider.width*1.3;
                this.attackCollider.width = this.spriteCollider.width*2;
            }
            this.attackCollider.y = this.spriteCollider.y-40;
            this.attackCollider.height = this.spriteCollider.height+20;  
        }
        else if(this.currentAttack == 2){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*3.8
                this.attackCollider.width = this.spriteCollider.width*3.8
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x + this.spriteCollider.width;
                this.attackCollider.width = this.spriteCollider.width*3.8;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        if(this.attackIntersects(player) && !player.koed) {
            player.charFrame = 0;
            player.health -= this.currentAttackDmg;
            player.attacked = true;
        }
    }
    
    animationUpdate(){
        //Staggers the frames so the animations don't play too fast
        if(gameFrame % staggerFrame != 0) return;
        //Animates next frame if there is another frame otherwise start over from first frame
        if(this.charFrame < this.totalFrames) this.charFrame++;
        else{
            //Checks if the character lost because then there is no need to update animations
            if(this.koed) return;
            this.charFrame = 0
        }
        //Eveything below handles a majority of the animation logic
        
        //Checks if the conditions are met runs the animation then returns otherwise 
        if(this.health <= 0){
            if(!this.koed) this.charFrame = 0;
            this.img.src = this.imgPath+'/Death.png'
            this.totalFrames = 6;
            this.koed = true;
            return
        }
        //Attacked Animations
        else if(this.attacked){
            this.totalFrames = 2;
            this.img.src = this.imgPath+'/Hit.png'
            if(this.charFrame == this.totalFrames) this.attacked = false;
            return
        }
        
        if(this.attacking) {
            if(this.charFrame == this.damageFrame){
                if(this.isPlayer) this.attackLogicPlayer()
                else this.attackLogicCPU()
            }
            if(this.charFrame == this.totalFrames) {
                if(this.currentAttack == 1){
                    //Attack cooldowns
                    util.sleep(500).then(() =>{
                        this.canAttack1 = true;
                    })
                }
                this.attacking = false;
                this.currentAttack = 0;
            }
            return;
        }
        
        else if(this.inAir){
            this.totalFrames = 1;
            if(this.charFrame >= this.totalFrames) this.charFrame = 0;
            if(this.vel.y > 0) {
                this.img.src = this.imgPath+'/Fall.png'
            }
            else if(this.vel.y < 0) {
                this.img.src = this.imgPath+'/Jump.png'
            }
            return;
        }
        
        else if(this.vel.x != 0){
            this.img.src = this.imgPath+'/Run.png';
            this.totalFrames = 7;
            return
        }
        
        else{
            this.img.src = this.imgPath+'/Idle.png'
            this.totalFrames = 7;
            return;
        }
        
        
    }
}

export class windElemental extends character{
    constructor(x, y, moveinc, isPlayer, direction){
        super(x, y, moveinc, isPlayer, direction);
        this.spriteCollider = {
        }
        this.maxHealth = 75
        this.health = this.maxHealth
        this.animationcolumn = 0;
        this.totalFrames = 7;
        this.spriteWidth = 288;
        this.spriteHeight = 128;
        this.spriteOffsetX = 160;
        this.spriteOffsetY = 113;
        this.drawOffsetX = 15;
        this.drawOffsetY = 0;
        this.spriteColliderWidth = 35;
        this.spriteColliderHeight = 46;
        this.img.src = './sprites/kazeyoke/wind_SpriteSheet_288x128.png'
    }
    
    attack1(){
        if(this.attacking) return;
        if(this.inAir) {
            // Damage of 6
            this.currentAttack = 3
            this.damageFrame = 2;
            this.currentAttackDmg = 6;
            this.animationcolumn = 5
            this.totalFrames = 6;
        }
        else {
            // Damage of 15
            this.currentAttack = 1;
            this.currentAttackDmg = 15;
            this.damageFrame = 4;
            this.animationcolumn = 8
            this.totalFrames = 15;
        }
        this.charFrame = 0;
        this.attacking = true;
    }
    attack2(){
        // Damage of 10
        if(this.attacking) return;
        this.currentAttack = 2;
        this.currentAttackDmg = 10;
        this.damageFrame = 5;
        this.animationcolumn = 10;
        this.charFrame = 0;
        this.totalFrames = 13;
        this.attacking = true;
    }

    attackLogicPlayer(){
        if(this.currentAttack == 1){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.8;
                this.attackCollider.width = this.spriteCollider.width*2.8
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x;
                this.attackCollider.width = this.spriteCollider.width*2.8;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;  
        }
        else if(this.currentAttack == 2){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*2.8
                this.attackCollider.width = this.spriteCollider.width*2.8
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x + this.spriteCollider.width;
                this.attackCollider.width = this.spriteCollider.width*2.8;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        else if(this.currentAttack == 3){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.5
                this.attackCollider.width = this.spriteCollider.width*1.5
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x + this.spriteCollider.width;
                this.attackCollider.width = this.spriteCollider.width*1.5;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        if(this.attackIntersects(cpu) && !cpu.koed) {
            cpu.charFrame = 0;
            cpu.health -= this.currentAttackDmg;
            cpu.attacked = true;
        }
    }
    attackLogicCPU(){
        if(this.currentAttack == 1){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.8;
                this.attackCollider.width = this.spriteCollider.width*2.8
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x;
                this.attackCollider.width = this.spriteCollider.width*2.8;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;  
        }
        else if(this.currentAttack == 2){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*2.8
                this.attackCollider.width = this.spriteCollider.width*2.8
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x + this.spriteCollider.width;
                this.attackCollider.width = this.spriteCollider.width*2.8;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        else if(this.currentAttack == 3){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.5
                this.attackCollider.width = this.spriteCollider.width*1.5
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x + this.spriteCollider.width;
                this.attackCollider.width = this.spriteCollider.width*1.5;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        if(this.attackIntersects(player) && !player.koed) {
            player.charFrame = 0;
            player.health -= this.currentAttackDmg;
            player.attacked = true;
        }
    }
    
    jump(){
        if(this.inAir) return;
        this.vel.y = -15;
        this.inAir = true
    }

    animationUpdate(){
        //Staggers the frames so the animations don't play too fast
        if(gameFrame % staggerFrame != 0) return;
        //Animates next frame if there is another frame otherwise start over from first frame
        if(this.charFrame < this.totalFrames) this.charFrame++;
        else{
            //Checks if the character lost because then there is no need to update animations
            if(this.koed) return;
            this.charFrame = 0
        }
        //Eveything below handles a majority of the animation logic

        //Checks if the conditions are met runs the animation then returns otherwise 
        if(this.health <= 0){
            if(!this.koed) this.charFrame = 0;
            this.animationcolumn = 13;
            this.totalFrames = 18;
            this.koed = true;
            return
        }
        //Attacked Animations
        else if(this.attacked){
            this.totalFrames = 3;
            this.animationcolumn = 12
            if(this.charFrame == this.totalFrames) this.attacked = false;
            return
        }
        
        if(this.attacking) {
            if(this.charFrame == this.damageFrame){
                if(this.isPlayer) this.attackLogicPlayer()
                else this.attackLogicCPU()
            }
            if(this.charFrame == this.totalFrames) {
                this.attacking = false;
                this.currentAttack = 0;
            }
            return;
        }
        
        else if(this.inAir){
            this.totalFrames = 2;
            if(this.charFrame >= this.totalFrames) this.charFrame = 0;
            if(this.vel.y > 0) {
                this.animationcolumn = 3;
            }
            else if(this.vel.y < 0) {
                this.animationcolumn = 4;
            }
            return;
        }
        
        else if(this.vel.x != 0){
            this.animationcolumn = 2;
            this.totalFrames = 7;
            return
        }

        else{
            this.animationcolumn = 1
            this.totalFrames = 7;
            return;
        }

    }

    //Draw Sprite
    draw(){
        //Attack Collider
        ctx.fillStyle = 'red'
        //Attack Collider
        // ctx.fillRect(this.attackCollider.x, this.attackCollider.y, this.attackCollider.width, this.attackCollider.height)
        ctx.fillStyle = 'black'
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        if (this.direction == -1) {
            //This all essentially flips the image
    
            //Translates to the images position
            ctx.translate(this.x,this.y);
            
            // scaleX by -1; this "trick" flips horizontally
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, (this.animationcolumn-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, -this.spriteWidth*1.25 /*Compensates for flip */, 0, this.spriteWidth*1.25, this.spriteHeight*1.25);
            
            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }
        
        else{
            // Img Src, spritePositionX, spritePositionY, spriteWidth, spriteHeight, positionOnScreenX, positionOnScreenY, widthOnScreen, heightOnScreen
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, (this.animationcolumn-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.spriteWidth*1.25, this.spriteHeight*1.25);
        }
    }
}

export class metalBender extends character{
    constructor(x, y, moveinc, isPlayer, direction){
        super(x, y, moveinc, isPlayer, direction);
        this.spriteCollider = {
        }
        this.maxHealth = 90
        this.health = this.maxHealth;
        this.canAttack1 = true;
        this.canAttack2 = true;
        this.animationcolumn = 0;
        this.totalFrames = 7;
        this.spriteWidth = 288;
        this.spriteHeight = 128;
        this.spriteOffsetX = 160;
        this.spriteOffsetY = 108;
        this.drawOffsetX = 15;
        this.drawOffsetY = 0;
        this.spriteColliderWidth = 35;
        this.spriteColliderHeight = 50;
        this.img.src = './sprites/tetsuryu/metal_bladekeeper_FREE_v1.1_SpriteSheet_288x128.png'
    }
    
    attack1(){
        if(this.attacking || !this.canAttack1) return;
        // Damage of 15
        this.canAttack1 = false;
        this.currentAttack = 1;
        this.currentAttackDmg = 10;
        this.damageFrame = 4;
        this.animationcolumn = 11;
        this.totalFrames = 7;
        this.charFrame = 0;
        this.attacking = true;
    }
    attack2(){
        // Damage of 17
        if(this.attacking || this.inAir || !this.canAttack2) return;
        this.canAttack2 = false;
        this.currentAttack = 2;
        this.currentAttackDmg = 17;
        this.damageFrame = 5;
        this.animationcolumn = 13;
        this.charFrame = 0;
        this.totalFrames = 10;
        this.attacking = true;
    }

    attackLogicPlayer(){
        if(this.currentAttack == 1){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.43;
                this.attackCollider.width = this.spriteCollider.width*2.45
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x;
                this.attackCollider.width = this.spriteCollider.width*2.45;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;  
        }
        else if(this.currentAttack == 2){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*2.8
                this.attackCollider.width = this.spriteCollider.width*5.6
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.8
                this.attackCollider.width = this.spriteCollider.width*5.6
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        if(this.attackIntersects(cpu) && !cpu.koed) {
            cpu.charFrame = 0;
            cpu.health -= this.currentAttackDmg;
            cpu.attacked = true;
        }
    }
    attackLogicCPU(){
        if(this.currentAttack == 1){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.8;
                this.attackCollider.width = this.spriteCollider.width*2.45
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x;
                this.attackCollider.width = this.spriteCollider.width*2.45;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;  
        }
        else if(this.currentAttack == 2){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*2.8
                this.attackCollider.width = this.spriteCollider.width*5.6
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.8
                this.attackCollider.width = this.spriteCollider.width*5.6
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        if(this.attackIntersects(player) && !player.koed) {
            player.charFrame = 0;
            player.health -= this.currentAttackDmg;
            player.attacked = true;
        }
    }
    
    jump(){
        if(this.inAir) return;
        this.vel.y = -12;
        this.inAir = true
    }

    animationUpdate(){
        //Staggers the frames so the animations don't play too fast
        if(gameFrame % staggerFrame != 0) return;
        //Animates next frame if there is another frame otherwise start over from first frame
        if(this.charFrame < this.totalFrames) this.charFrame++;
        else{
            //Checks if the character lost because then there is no need to update animations
            if(this.koed) return;
            this.charFrame = 0
        }
        //Eveything below handles a majority of the animation logic

        //Checks if the conditions are met runs the animation then returns otherwise 
        if(this.health <= 0){
            if(!this.koed) this.charFrame = 0;
            this.animationcolumn = 16;
            this.totalFrames = 11;
            this.koed = true;
            return
        }
        //Attacked Animations
        else if(this.attacked){
            this.totalFrames = 3;
            this.animationcolumn = 15;
            if(this.charFrame == this.totalFrames) this.attacked = false;
            return
        }
        
        if(this.attacking) {
            if(this.charFrame == this.damageFrame){
                if(this.isPlayer) this.attackLogicPlayer()
                else this.attackLogicCPU()
            }
            if(this.charFrame == this.totalFrames) {
                if(this.currentAttack == 1) {
                    util.sleep(400).then(() => {
                        this.canAttack1 = true;
                    })
                }
                else if(this.currentAttack == 2) {
                    util.sleep(1700).then(() => {
                        this.canAttack2 = true;
                    })
                }
                    this.attacking = false;
                    this.currentAttack = 0;
            }
            return;
        }
        
        else if(this.inAir){
            this.totalFrames = 2;
            if(this.charFrame >= this.totalFrames) this.charFrame = 0;
            if(this.vel.y > 0) {
                this.animationcolumn = 3;
            }
            else if(this.vel.y < 0) {
                this.animationcolumn = 4;
            }
            return;
        }
        
        else if(this.vel.x != 0){
            this.animationcolumn = 2;
            this.totalFrames = 7;
            return
        }

        else{
            this.animationcolumn = 1
            this.totalFrames = 7;
            return;
        }

    }

    //Draw Sprite
    draw(){
        //Hitbox
        ctx.fillStyle = 'red'
        //Attack Collider
        // ctx.fillRect(this.attackCollider.x, this.attackCollider.y, this.attackCollider.width, this.attackCollider.height)
        ctx.fillStyle = 'black'
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        if (this.direction == -1) {
            //This all essentially flips the image
    
            //Translates to the images position
            ctx.translate(this.x,this.y);
            
            // scaleX by -1; this "trick" flips horizontally
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, (this.animationcolumn-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, -this.spriteWidth*1.25 /*Compensates for flip */, 0, this.spriteWidth*1.25, this.spriteHeight*1.25);
            
            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }
        
        else{
            // Img Src, spritePositionX, spritePositionY, spriteWidth, spriteHeight, positionOnScreenX, positionOnScreenY, widthOnScreen, heightOnScreen
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, (this.animationcolumn-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.spriteWidth*1.25, this.spriteHeight*1.25);
        }
    }
}

export class king extends character {
    constructor(x, y, moveinc, isPlayer, direction){
        super(x, y, isPlayer, direction);
        this.maxHealth = 50;
        this.moveinc = 11;
        this.health = this.maxHealth;
        this.canAttack1 = true;
        this.canAttack2 = true;
        this.imgPath = './sprites/osama';
        this.img.src = this.imgPath+'/Idle.png';
        this.totalFrames = 7;
        this.spriteWidth = 160;
        this.spriteHeight = 111;
        this.spriteOffsetX = 67;
        this.spriteOffsetY = 55;
        this.drawOffsetX = 20;
        this.drawOffsetY = 50;
        this.spriteColliderWidth = 30;
        this.spriteColliderHeight = 50;
    }
    
    //Draw Sprite
    draw(){
        ctx.fillStyle = 'red'
        //Attack Collider
        // ctx.fillRect(this.attackCollider.x, this.attackCollider.y, this.attackCollider.width, this.attackCollider.height)
        ctx.fillStyle = 'black'
        //Collider
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        if (this.direction == -1) {
            //This all essentially flips the image
            
            //Translates to the images position
            ctx.translate(this.x+this.spriteCollider.width*23/4,this.y);
            
            // scaleX by -1; this "trick" flips horizontally
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.spriteCollider.width*1/8 /*Compensates for flip */, 0, 160, 111);
            
            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }
        
        else{
            // Img Src, spritePositionX, spritePositionY, spriteWidth, spriteHeight, positionOnScreenX, positionOnScreenY, widthOnScreen, heightOnScreen
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, 160, 111);
        }
    }
    
    attack1(){
        // Damage of 5
        if(this.attacking || this.inAir || !this.canAttack1) return;
        this.currentAttack = 1;
        this.canAttack1 = false;
        this.currentAttackDmg = 5;
        this.damageFrame = 2;
        this.img.src = this.imgPath+'/Attack1.png';
        this.charFrame = 0;
        this.totalFrames = 3;
        this.attacking = true;
    }
    attack2(){
        // Damage of 8
        if(this.attacking || this.inAir || !this.canAttack2) return;
        this.currentAttack = 2;
        this.canAttack2 = false;
        this.currentAttackDmg = 8;
        this.damageFrame = 2;
        this.img.src = this.imgPath+'/Attack2.png';
        this.charFrame = 0;
        this.damageFrame = 2;
        this.totalFrames = 3;
        this.attacking = true;
    }
    
    attackLogicPlayer(){
        if(this.currentAttack == 1){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.5
                this.attackCollider.width = this.spriteCollider.width*2.5
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x;
                this.attackCollider.width = this.spriteCollider.width*2.5;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;  
        }
        else if(this.currentAttack == 2){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*2.6
                this.attackCollider.width = this.spriteCollider.width*2.6
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x + this.spriteCollider.width;
                this.attackCollider.width = this.spriteCollider.width*2.6;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        if(this.attackIntersects(cpu) && !cpu.koed) {
            cpu.charFrame = 0;
            cpu.health -= this.currentAttackDmg;
            cpu.attacked = true;
        }
    }
    attackLogicCPU(){
        if(this.currentAttack == 1){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*1.5
                this.attackCollider.width = this.spriteCollider.width*2.5
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x;
                this.attackCollider.width = this.spriteCollider.width*2.5;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;  
        }
        else if(this.currentAttack == 2){
            if(this.direction == -1) {
                this.attackCollider.x = this.spriteCollider.x - this.spriteCollider.width*2.6
                this.attackCollider.width = this.spriteCollider.width*2.6
            }
            else if(this.direction == 1) {
                this.attackCollider.x = this.spriteCollider.x + this.spriteCollider.width;
                this.attackCollider.width = this.spriteCollider.width*2.6;
            }
            this.attackCollider.y = this.spriteCollider.y;
            this.attackCollider.height = this.spriteCollider.height;
        }
        if(this.attackIntersects(player) && !player.koed) {
            player.charFrame = 0;
            player.health -= this.currentAttackDmg;
            player.attacked = true;
        }
    }
    
    animationUpdate(){
        //Staggers the frames so the animations don't play too fast
        if(gameFrame % staggerFrame != 0) return;
        //Animates next frame if there is another frame otherwise start over from first frame
        if(this.charFrame < this.totalFrames) this.charFrame++;
        else{
            //Checks if the character lost because then there is no need to update animations
            if(this.koed) return;
            this.charFrame = 0
        }
        //Eveything below handles a majority of the animation logic
        
        //Checks if the conditions are met runs the animation then returns otherwise 
        if(this.health <= 0){
            if(!this.koed) this.charFrame = 0;
            this.img.src = this.imgPath+'/Death.png'
            this.totalFrames = 5;
            this.koed = true;
            return
        }
        //Attacked Animations
        else if(this.attacked){
            this.totalFrames = 2;
            this.img.src = this.imgPath+'/Take Hit.png'
            if(this.charFrame == this.totalFrames) this.attacked = false;
            return
        }
        
        if(this.attacking) {
            if(this.charFrame == this.damageFrame){
                if(this.isPlayer) this.attackLogicPlayer()
                else this.attackLogicCPU()
            }
            if(this.charFrame == this.totalFrames) {
                if(this.currentAttack == 1){
                    //Attack cooldowns
                    util.sleep(400).then(() =>{
                        this.canAttack1 = true;
                    })
                }
                if(this.currentAttack == 2){
                    //Attack cooldowns
                    util.sleep(400).then(() =>{
                        this.canAttack2 = true;
                    })
                }
                this.attacking = false;
                this.currentAttack = 0;
            }
            return;
        }
        
        else if(this.inAir){
            this.totalFrames = 1;
            if(this.charFrame >= this.totalFrames) this.charFrame = 0;
            if(this.vel.y > 0) {
                this.img.src = this.imgPath+'/Fall.png'
            }
            else if(this.vel.y < 0) {
                this.img.src = this.imgPath+'/Jump.png'
            }
            return;
        }
        
        else if(this.vel.x != 0){
            this.img.src = this.imgPath+'/Run.png';
            this.totalFrames = 7;
            return
        }
        
        else{
            this.img.src = this.imgPath+'/Idle.png'
            this.totalFrames = 7;
            return;
        }
        
        
    }
}