import {sleep} from "./utility.js" 
import {player, cpu} from "./index.js"
import * as cpuLogic from "./cpuLogic.js" 

/**
 * 
 * @param {*} enemy An object representing an enemy
 * @param {*} range The range of the attack of the object of the attack such as a projectile
 * @returns 
 */
function collides(range, enemy) {
    if (range.x < enemy.x + enemy.width && range.x + range.width > enemy.x && range.y < enemy.y + enemy.height && range.y + range.height > enemy.y) {
        return true;
    }
    return false;
}


/** @type {HTMLCanvasElement} */ 
const c = myCanvas;

const cWidth = c.offsetWidth; 
const cHeight = c.offsetHeight;

// Path for fighter assets
const path = "./assets/fighters/";

const gravity = 0.4;
export const ground = 120;

// Stagger frame for animation to have a consistent and normalize the speed
const staggerFrame = 5;


const SHIELD = new Image()
// Custom asset made by me in pixlr
// Created On: 3/15/23
SHIELD.src = "./assets/shield.png"


class projectile {
    /**
     * Constructs the projectile object
     * 
     * @param {HTMLImageElement} img 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} sx 
     * @param {Number} direction 
     */
    constructor(img, isPlayer, x=-800, y=500, sx=80, direction=1) {
        this.img = img;
        this.isPlayer = isPlayer
        this.x = x;
        this.y = y;
        this.width = this.img.width
        this.height = this.img.height
        this.speedX = sx;
        this.direction= direction;
    }

    /** 
     * Draws the object
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){
        //No need to draw if it's off the screen
        if(this.x + this.img.width < -200 || this.x > cWidth - this.img.width + 200) return;

        if(this.direction == -1) {
            //This all essentially flips the image
            
            //Translates to the image position
            ctx.translate(this.x,this.y);
            
            // scaleX by -1; flip horizontally
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, -this.img.width, 0, this.img.width, this.img.height);
            
            // reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }
        else {
            ctx.drawImage(this.img, this.x, this.y, this.img.width, this.img.height);
        }
    }

    /**
     * Updates the object
     */
    update(){
        if(this.x + this.img.width < 0 || this.x > cWidth-this.img.width + 200) return;
        this.x += this.speedX * this.direction
        // Checks if shot by player
        if(this.isPlayer) {
            // Checks for collision then applies damage if collided
            if(collides(cpu, this) && !cpu.shielding) {
                this.x = -800
                cpu.damage += 25
                cpu.velocity[0] += 5*(1+cpu.damage*20/100)*this.direction
                cpu.frameNum = 1
                cpu.hurt = true
                sleep(1000).then(() => {
                    cpu.hurt = false
                })
            }
        }
        // Since it wasn't shot by the player
        else {
            // Checks for collision then applies damage if collided
            if(collides(player, this) && !player.shielding) {
                this.x = -800
                player.damage += 25
                player.velocity[0] += 2*(1+player.damage*20/100)*this.direction
                player.frameNum = 1
                player.hurt = true
                sleep(1000).then(() => {
                    player.hurt = false
                })
            }
        }
    }
}


// General fighter class the other fighters will inherit
export class fighter {
    /**
     * Contructs the fighter object
     * 
     * @param {*} src This can be an array or a string depending on the sprite sheet given
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(src, isPlayer=false, spW=64, spH=64, x = cWidth/2, y = 0, width = 15, height = 8.5) {
        this.isPlayer = isPlayer;

        this.scale = 1.5

        this.attackRange = {
            x: this.x,
            y: this.y,
            width: 20,
            height: this.height,
        }

        this.img = new Image();
        if(Array.isArray(src)){
            this.srcArray = src;
            this.img.src = path + src[0]
        }
        else this.img.src = path + src;
        
        this.offsetHeight = 0;
        this.offsetWidth = 20;

        this.shieldOffsetX = 0;
        this.offsetWidthY = 0;
        
        this.x = x;
        this.y = y;
        
        this.velocity = [0, 0] // [vx, vy]
        this.direction = 1;
        this.maxSpeed = 10
        this.jumpForce = 15
        this.grounded = true;
        this.hasDoubleJump = true

        this.lives = 3
        
        this.width = cWidth/width;
        this.height = cHeight/height;

        this.spriteWidth = spW;
        this.spriteHeight = spH;

        this.damage = 0;

        this.maxFrameNum = 1
        this.frameNum = 0
        this.gameFrame = 0

        this.animation = 8-1

        this.alive = true;
        this.hurt = false;
        this.moving = false;
        this.attacking = false;
        this.falling = false;

        this.shielding = false;


    }

    /**
     * Updates the fighter
     */
    update() {
        if(!this.isPlayer) {
            this.applyFriction()
            cpuLogic.cpuLogic()
        }
        this.applyGravity()
        this.gameFrame++
        
        this.checkState()
        
        this.animate()
        
        this.x += this.velocity[0];
        this.y += this.velocity[1];
        if(this.y == cHeight - ground - this.height) this.grounded = true
        else this.grounded = false
        
        if (this.direction == 1) {
            this.attackRange.x = this.x + this.width
        }
        else {
            this.attackRange.x = this.x - this.attackRange.width
        }
        this.attackRange.y = this.y

    }

    /**
     * Special update function for character select 
     */
    updateSelectMode() {
        this.gameFrame++
        
        this.animate()
    }

    /**
     * Draw the fighter on the canvas
     *  
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawHitboxes(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "red";
        ctx.fillRect(this.attackRange.x, this.attackRange.y, this.attackRange.width, this.attackRange.height);
    }
    
    /**
     * Draw the fighter on the canvas
     *  
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if(this.direction == -1) {
            //This all essentially flips the image
    
            //Translates to the images position
            ctx.translate(this.x,this.y);
            // scaleX by -1; this "trick" flips horizontally
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, (this.frameNum-1)*this.spriteWidth, (this.animation-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, -this.spriteWidth-this.offsetWidth, this.offsetHeight, this.spriteWidth*this.scale, this.spriteHeight*this.scale);
            
            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }
        else {
            ctx.drawImage(this.img, (this.frameNum-1)*this.spriteWidth, (this.animation-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x-this.offsetWidth, this.y+this.offsetHeight, this.spriteWidth*this.scale, this.spriteHeight*this.scale);
        }
        if(this.shielding){
            ctx.drawImage(SHIELD, this.x-this.shieldOffsetX, this.y-this.shieldOffsetY, this.width, this.height);
        }
    }

    /**
     * Applies friction to the fighter
     */
    applyFriction() {
        if(this.velocity[0] !== 0) {
            if(this.velocity[0] > 0) {
                this.velocity[0] -= gravity
            }
            else if (this.velocity[0] < 0) {
                this.velocity[0] += gravity
            }
            if(this.velocity[0] > -1 && this.velocity[0] < 1 && this.velocity[0] !== 0) {
                this.velocity[0] = 0
            }

        }
    }

    /**
     * Applies gravity to the fighter
     */
    applyGravity(){
        if( this.y < cHeight-ground - this.height || this.y > cHeight - ground) this.velocity[1] += gravity;
        else {
            if(this.x + this.width < 0 || this.x > cWidth) {
                this.velocity[1] += gravity;
                return
            }
            if(this.velocity[1] > 0){
                this.velocity[1] = 0;
                this.y = cHeight - ground-this.height;
                this.hasDoubleJump = true;
            }
        }
    }

    /**
     * Activates the shield for the fighter
     */
    shield() {
        if(!this.grounded || this.attacking) return
        this.velocity[0] = 0 
        this.shielding = true
    }
    
    /**
     * Function to control the fighters movement
     * 
     * @param {Number} direction 1, -1 or 0
     */
    moveX(direction = 0) {
        if(this.hurt) return

        if (direction != 0){
            this.direction = direction;
        }
        
        this.velocity[0] += direction * 1;
        
        // Don't want movement limits to interfere with damage knockback
        if(this.velocity[0] > this.maxSpeed+5) return;
        else if(this.velocity[0] < -this.maxSpeed-5) return;

        else if(this.velocity[0] > this.maxSpeed) this.velocity[0] = this.maxSpeed;
        else if(this.velocity[0] < -this.maxSpeed) this.velocity[0] = -this.maxSpeed ;
        
        
    }
    
    /**
     * Function to make the fighter jump
     */
    jump() {
        if(!this.grounded && !this.hasDoubleJump || this.shielding || this.attacking) return
        if(this.hasDoubleJump && !this.grounded) this.hasDoubleJump = false
        this.velocity[1] = -this.jumpForce;
    }
}

export class purple_arrow extends fighter {
    /**
     * 
     * @param {String} src
     * @param {Boolean} isPlayer
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} spW Sprite Width
     * @param {Number} spH Sprite Height
     */
    constructor(src, isPlayer=false, spW=64, spH=64, x = cWidth/2, y = 0, width = 16, height = 9) {
        super(src, isPlayer, spW, spH, x, y, width, height)
        this.scale = 1.5

        this.arrow_img = new Image()
        // Image of an arrow
        // Source: https://astrobob.itch.io/arcane-archer
        // Accessed on 3/24/23
        this.arrow_img.src = "./assets/fighters/purple_arrow/projectile.png"

        this.offsetHeight = -5;
        this.offsetWidth = 20;
        
        
        this.maxSpeed = 15
        
        
        this.maxFrameNum = 7
        this.frameNum = 0
        this.gameFrame = 0
        
        this.animation = 0
        
        this.arrow = new projectile(this.arrow_img, this.isPlayer)
    }


    /**
     * Draw the fighter on the canvas
     *  
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if((this.direction == -1 && this.animation!= 5) || (this.direction == 1 && this.animation == 5)) {
            //This all essentially flips the image
            
            //Translates to the image position
            ctx.translate(this.x,this.y);
            
            // scaleX by -1; flip horizontally
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, (this.frameNum-1)*this.spriteWidth, (this.animation-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, -this.spriteWidth-this.offsetWidth, this.offsetHeight, this.spriteWidth*this.scale, this.spriteHeight*this.scale);

            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }
        else if ((this.direction == 1 && this.animation!= 5) || (this.direction == -1 && this.animation == 5)) {
            ctx.drawImage(this.img, (this.frameNum-1)*this.spriteWidth, (this.animation-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x-this.offsetWidth, this.y+this.offsetHeight, this.spriteWidth*this.scale, this.spriteHeight*this.scale);
        }
        if(this.shielding){
            ctx.drawImage(SHIELD, this.x-this.offsetWidth/4, this.y-this.offsetHeight, this.width, this.height);
        }
        this.arrow.draw(ctx)
    }

    /**
     * Updates the fighter
     */
    update() {
        this.applyGravity()
        this.gameFrame++

        if(!this.isPlayer) {
            this.applyFriction()
            cpuLogic.cpuLogic()
        }


        this.checkState()

        this.animate()
        
        this.x += this.velocity[0];
        this.y += this.velocity[1];
        if(this.y == cHeight - ground - this.height) this.grounded = true
        else this.grounded = false

        this.arrow.update()
    }

    /**
     * Activates the fighter's first ability
     */
    ability1() {
        if(this.attacking || this.hurt) return
        this.velocity[0] = 0
        this.attacking = "ability1"
        this.frameNum = 1
        sleep(900).then(() => {
            this.attacking = false
            if(this.hurt) return
            this.arrow = new projectile(this.arrow_img, this.isPlayer, this.x, this.y+this.height/2, 60, this.direction)
        })
    }
    
    /**
     * Activates the fighter's second ability
     */
    ability2() {
        if(this.attacking || this.hurt) return
        this.velocity[0] = this.velocity[0] * 1.5
        this.attacking = "ability2"
        this.frameNum = 1
        this.maxSpeed = this.maxSpeed*1.5
        sleep(1000).then(() => {
            this.attacking = false
            if(this.velocity[0] < 0) this.velocity[0] = -1
            else if(this.velocity[0] > 0) this.velocity[0] = 1
            this.maxSpeed = this.maxSpeed/1.5
        })

    }

    /**
     * Checks for a few states and responds correctly 
     */
    checkState() {
        for (let i = 0; i < 4; i++) {
            if(this.attacking == "ability2" && Math.abs(this.velocity[0]) < this.maxSpeed) this.moveX(this.direction)
            if(Math.abs(this.velocity[0]) > this.maxSpeed) {
                if(this.velocity[0] < -this.maxSpeed) this.velocity[0] = -this.maxSpeed
                else if(this.velocity[0] > this.maxSpeed) this.velocity[0] = this.maxSpeed 
            }
        }
        if(this.x < -500 || this.x+this.width > cWidth + 500 || this.y > cWidth + 500 || this.y < -500) this.alive = false
    }

    // Code to manage current animation and animation frame.
    // Author: Me
    // Source: characters.js 
    // Accessed on 2/16/23
    // Written on 4/25/22
    animate(){
         //Staggers the frames so the animations don't play too fast
         if(this.gameFrame % staggerFrame != 0) return;
         //Animates next frame if there is another frame otherwise start over from first frame
         if(this.frameNum < this.maxFrameNum) this.frameNum++;
         else{
             //Checks if the character lost because then there is no need to update animations
             if(!this.alive) return;
             this.frameNum = 1
         }
         //Eveything below handles a majority of the animation logic
 
         //Checks if the conditions are met runs the animation then returns otherwise 
         //Attacked Animations
        if(this.hurt){
             this.maxFrameNum = 2;
             this.animation = 8;
             if(this.frameNum > this.maxFrameNum) this.frameNum = 1;
             return
         }
         
         if(this.attacking) {
            if (this.attacking == "ability1") {
                this.animation = 4
                this.maxFrameNum = 7
            }
            else if (this.attacking == "ability2") {
                this.animation = 3
                this.maxFrameNum = 7
                this.velocity[0] = this.velocity[0] * 1.5
            }
             return;
         }
         
         else if(!this.grounded){
            let vy = this.velocity[1]
            if(vy <= 0 && this.animation != 7) {
                this.animation = 7
                this.maxFrameNum = 4
            }
            else if(vy > 0 && this.animation!= 5) {
                this.animation = 5
                this.maxFrameNum = 2
                if(this.frameNum > this.maxFrameNum) this.frameNum = 1
            }
            if(this.frameNum > this.maxFrameNum) this.frameNum = 1
            return
         }
         
         else if(this.velocity[0] != 0){
             this.animation = 1;
             this.maxFrameNum = 8;
             if(this.frameNum > this.maxFrameNum) this.frameNum = 1
             return
            }
            
            else{
             this.animation = 6
             this.maxFrameNum = 4;
             if(this.frameNum > this.maxFrameNum) this.frameNum = 1
             return;
         }
    }
}

export class warrior extends fighter {
    /**
     * Constructs the warrior class  which extends the fighter class
     * 
     * @param {String} src
     * @param {Boolean} isPlayer
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} spW Sprite Width
     * @param {Number} spH Sprite Height
     */
    constructor(src, isPlayer=false, spW=80, spH=80, x = cWidth/2, y = 0, width = 16, height = 9) {
        super(src, isPlayer, spW, spH, x, y, width, height)
        this.scale = 2

        this.attackRange = {
            x: this.x,
            y: this.y,
            width: 80,
            height: this.height,
        }

        this.offsetWidth = 40;
        this.offsetHeight = -57;
        
        this.shieldOffsetX = 0;
        this.shieldOffsetY = -5;
        
        this.maxSpeed = 10
        this.jumpForce = 10
        
        
        this.maxFrameNum = 7
        this.frameNum = 0
        this.gameFrame = 0
        
        this.animation = 0
    }

    /**
     * Activates the first ability of the fighter
     */
    ability1() {
        if(this.attacking || this.hurt) return
        this.velocity[0] = 0
        this.attacking = "ability1"
        this.frameNum = 1
        sleep(1500).then(() => {
            this.attacking = false
            if(this.hurt) return
            if(this.isPlayer) {
                // Checks for collision then applies damage if collided
                if (collides(cpu, this.attackRange) && !cpu.shielding) {
                    cpu.hurt = true
                    cpu.damage += 80
                    cpu.velocity[0] += 2*(1+cpu.damage*20/100)*this.direction
                    cpu.frameNum = 1
                    sleep(1000).then(() => {
                        cpu.hurt = false
                    })
                }
            }
            
            else {
                // Checks for collision then applies damage if collided
                if (collides(player, this.attackRange) && !player.shielding) {
                    player.hurt = true
                    player.damage += 80
                    player.velocity[0] += 2*(1+player.damage*20/100)*this.direction
                    player.frameNum = 1
                    sleep(1000).then(() => {
                        player.hurt = false
                        
                    })
                }
            }
            
        })
    }

    /**
     * Activates the second ability of the fighter
     */
    ability2() {
        if(this.attacking || this.hurt) return
        this.velocity[0] = this.velocity[0] * 1.5
        this.attacking = "ability2"
        this.frameNum = 1
        this.maxSpeed = 20
        this.moveX(this.direction)
        sleep(500).then(() => {
            this.attacking = "ability1"
            this.frameNum = 10
            this.maxSpeed = 10
            sleep(150).then(
                () => {
                    this.attacking = false
                    if(this.hurt) return
                    // Checks for collision then applies damage if collided
                    if (collides(cpu, this.attackRange) && !cpu.shielding) {
                        cpu.damage += 60
                        cpu.velocity[0] += 2*(1+cpu.damage*20/100)*this.direction
                        cpu.frameNum = 1
                        cpu.hurt = true
                        sleep(1000).then(() => {
                            cpu.hurt = false
                        })
                    }
                    // Checks for collision then applies damage if collided
                    else if (collides(player, this.attackRange) && !player.shielding) {
                        player.hurt = true
                        player.damage += 80
                        player.velocity[0] += 2*(1+player.damage*20/100)*this.direction
                        player.frameNum = 1
                        sleep(1000).then(() => {
                            player.hurt = false
                            
                        })
                    }
                    
                    this.moveX(this.direction)
                })
        })

    }

    /**
     * Checks for a few states and responds correctly 
     */
    checkState() {
        for (let i = 0; i < 4; i++) {
            if(this.attacking == "ability2" && Math.abs(this.velocity[0]) < this.maxSpeed) this.moveX(this.direction)
            if(Math.abs(this.velocity[0]) > this.maxSpeed) {
                if(this.velocity[0] < -this.maxSpeed) this.velocity[0] = -this.maxSpeed
                else if(this.velocity[0] > this.maxSpeed) this.velocity[0] = this.maxSpeed 
            }
        }
        if(this.x < -500 || this.x+this.width > cWidth + 500 || this.y > cWidth + 500 || this.y < -500) this.alive = false
    }

    // Code to manage current animation and animation frame.
    // Author: Me
    // Source: characters.js 
    // Accessed on 2/16/23
    // Written on 4/25/22
    animate(){
         //Staggers the frames so the animations don't play too fast
         if(this.gameFrame % staggerFrame != 0) return;
         //Animates next frame if there is another frame otherwise start over from first frame
         if(this.frameNum < this.maxFrameNum) this.frameNum++;
         else{
             //Checks if the character lost because then there is no need to update animations
             if(!this.alive) return;
             this.frameNum = 1
         }
         //Eveything below handles a majority of the animation logic
 
         //Checks if the conditions are met runs the animation then returns when selecting the animation 
        if(this.hurt){
            this.maxFrameNum = 5;
            this.animation = 4;
            if (this.frameNum > this.maxFrameNum) this.frameNum = 1
            return
         }
         
         if(this.attacking) {
            if (this.attacking == "ability1") {
                this.animation = 3
                this.maxFrameNum = 12
            }
            else if (this.attacking == "ability2") {
                this.animation = 3
                this.maxFrameNum = 7
                this.velocity[0] = this.velocity[0] * 1.5
            }
            if(this.frameNum == this.totalFrames) {
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
         
         else if(!this.grounded){
            let vx = this.velocity[0]
            this.animation = 2
            this.maxFrameNum = 6
            if (vx == 0) {
                this.animation = 1
                this.maxFrameNum = 9
            } 
            if(this.frameNum > this.maxFrameNum) this.frameNum = 1
            return
         }
         
         else if(this.velocity[0] != 0){
             this.animation = 2;
             this.maxFrameNum = 6;
             if(this.frameNum > this.maxFrameNum) this.frameNum = 1
             return
            }
            
            else{
             this.animation = 1
             this.maxFrameNum = 9;
             if(this.frameNum > this.maxFrameNum) this.frameNum = 1
             return;
         }
    }
}
