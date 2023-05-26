import { sleep, getRandInt } from "./utility.js";
import * as fighters from "./fighters.js"
import {detectionBox} from "./cpuLogic.js"

/** @type {HTMLCanvasElement} */ 
const c = myCanvas;

// Get the dimensions of the canvas
const cWidth = c.offsetWidth; 
const cHeight = c.offsetHeight;
// Update this to match the CSS width and height of the canvas
c.width = cWidth;
c.height = cHeight;
const ctx = c.getContext("2d");
// Control how often the game updates so there won't be an issue on high refresh rate monitors
const tps = 60

var curkeys = []
var newkeys = [];

// Sprite sheet of an archer
// Source: https://astrobob.itch.io/arcane-archer
// Accessed: 3/2/23
const PURPLE_ARROW_PATH = "purple_arrow/spritesheet.png"

// Sprite sheet of an warrior
// Source: https://astrobob.itch.io/arcane-archer
// Accessed: 3/3/23
const WARRIOR_PATH = "warrior/spritesheet.png"

var fighterArr = [new fighters.purple_arrow(PURPLE_ARROW_PATH, true), new fighters.warrior(WARRIOR_PATH, true)]
var fighterArrCpu = [new fighters.purple_arrow(PURPLE_ARROW_PATH, false), new fighters.warrior(WARRIOR_PATH, false)] 

var currFighter = 0
var currCpu = 0

export var player = new fighters.purple_arrow(PURPLE_ARROW_PATH, true)
export var cpu = new fighters.warrior(WARRIOR_PATH, false)

var pLives = 3;
var cLives = 3;

var state = "title"

const bg = new Image() 
// Image of a platformer stage
// Source: https://ansimuz.itch.io/bulkhead-walls-environment\
// Accessed: 3/24/23
bg.src = "./assets/bulkhead-wallsx3.png"

var titleOptionNum = 0
var titleOptionArr = [{ 
    text: "start",
    state: "char_select",
    arrowOffset: -120,
    height: -45,
}, 
{
    text: "instructions", 
    state: "instructions",
    arrowOffset: -220,  
    height: +65,
}]


/**
 * Function that draws text on the canvas.
 * 
 * @param {String} text 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} size 
 * @param {String} color 
 * @param {String} font 
 * @param {String} xAlign 
 * @param {String} yAlign 
 */
function drawText(text, x=cWidth/2, y=cHeight/2-160, size=100, color="white", font="ssbu", xAlign="center", yAlign="middle") {
    ctx.fillStyle = color
    ctx.textAlign = xAlign
    ctx.textBaseline = yAlign
    ctx.font = `${size}px ${font}`
    text = formatText(text)
    ctx.fillText(text, x, y)
}

/**
 * A function that formats the passed through string.
 *
 * @param {String} text 
 * @returns formatted string
 */
function formatText(text) {
    let outputString = ""
    for (let i = 0; i < text.length; i++) {
        if(text[i] == " ") {
            outputString += "  ";
            continue;
        }
        outputString += text[i] + " ";
    }
    return outputString;
}

/**
 * Function that dictates movement of the player character based on user input given through currkeys array and newkeys array
 */
function checkMovement(){
    if(player.attacking) return
    if(curkeys[65] && !player.atacking) player.moveX(-1)    
    else if(curkeys[68] && !player.atacking) player.moveX(1)
    else player.applyFriction()
    if(newkeys[32]) player.jump()
    else if (curkeys[74]) player.shield()
    else if(newkeys[75]) player.ability1()
    else if (newkeys[76]) player.ability2()
    if (!curkeys[74]) player.shielding = false
}

/**
 * Function that updates the game state
 */
function updateGameScreen() {
    checkMovement()
    player.update()
    // cpuLogic.cpuLevel1()
    cpu.update()
    detectionBox.update()
    if (!player.alive && player.lives-1 > 0) {
        fighterArr = [new fighters.purple_arrow(PURPLE_ARROW_PATH, true), new fighters.warrior(WARRIOR_PATH, true)]
        player = fighterArr[currFighter];
        pLives -= 1;
        player.lives = pLives;
    }
    else if (!player.alive && player.lives != 0) {
        player.lives = 0
        state = "game_over"
    }
    
    if (!cpu.alive && cpu.lives-1 > 0) {
        fighterArrCpu = [new fighters.purple_arrow(PURPLE_ARROW_PATH, false), new fighters.warrior(WARRIOR_PATH, false)]
        cpu = fighterArrCpu[currCpu]
        cLives -= 1;
        cpu.lives = cLives;
    }
    else if (!cpu.alive && cpu.lives != 0) {
        cpu.lives = 0
        state = "game_over"
    }
}

/**
 * Updates the instruction screen
 */
function updateInstructionScreen(){
    //Return to home screen when ENTER or ESC is pressed (ESC is intuitive so even though its not in the instructions I made it an option)
    if(!newkeys[13] && !newkeys[27]) return 
    state = "title";
}

/**
 * Function that updates the title screen
*/
function updateTitleScreen() {
    //Handles choosing an option on title screen
    if(newkeys[40]) {
        titleOptionNum++
        if(titleOptionNum > titleOptionArr.length-1) titleOptionNum = 0;
    }
    else if(newkeys[38]) {
        titleOptionNum--
        if(titleOptionNum < 0) titleOptionNum = titleOptionArr.length-1;
    }
    else if(newkeys[13]) {
        //Delay so you don't choose an option right when the state is changed
        sleep(20).then(() =>{
            state = titleOptionArr[titleOptionNum].state
        })
    }
}

/**
 * Updates the character select screen 
*/
function updateCharacterSelectScreen(){
    //Updates the position and animations of characters
    for (let i = 0; i < fighterArr.length; i++) {
        fighterArr[i].updateSelectMode();
        fighterArr[i].x = cWidth*i/5+90;
        fighterArr[i].y = cHeight-fighterArr[i].height*1.4;
    }
    //Return to title
    if(newkeys[27]) state = "title";
    // Choose character
    else if(newkeys[37] && currFighter > 0) currFighter--;
    else if(newkeys[39] && currFighter < fighterArr.length-1) currFighter++;
    else if(newkeys[13]) {
        player = fighterArr[currFighter];
        player.x = 20
        player.y = 0;
        currCpu  = getRandInt(0, fighterArrCpu.length);
        cpu = fighterArrCpu[currCpu]
        cpu.x = cWidth-player.width-20
        cpu.y = 0;
        cpu.direction = -1
        state = "game"
    }
}

/**
 * Updates the gameover screen
 */
function updateGameOverScreen(){
    //Return to home screen when ENTER or ESC is pressed (ESC is intuitive so even though its not in the instructions I made it an option)
    if(!newkeys[13]) return
    pLives = 3;
    cLives = 3;
    fighterArr = [new fighters.purple_arrow(PURPLE_ARROW_PATH, true), new fighters.warrior(WARRIOR_PATH, true)]
    fighterArrCpu = [new fighters.purple_arrow(PURPLE_ARROW_PATH, false), new fighters.warrior(WARRIOR_PATH, false)] 
    sleep(20).then(() => {
        state = "title";
    })
}

/**
 * Function that draws the game state
*/
function drawGameScreen(){    
    ctx.drawImage(bg, 0, 0, cWidth, cHeight)
    
    player.draw(ctx);
    cpu.draw(ctx);

    let radius = 15

    drawText("Player:", 70, cHeight-30, 20)

    // Stock indicators
    if(player.lives > 0) {
        ctx.beginPath();
        ctx.arc(150, cHeight-30, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(0, 0, 255, .7)"
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 180, .7)';
        ctx.stroke();
    }
    
    if(player.lives > 1) {
        ctx.beginPath();
        ctx.arc(200, cHeight-30, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(0, 0, 255, .7)"
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 180, .7)';
        ctx.stroke();
    }
    
    if(player.lives > 2) {
        ctx.beginPath();
        ctx.arc(250, cHeight-30, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(0, 0, 255, .7)"
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 180, .7)';
        ctx.stroke();
    }
    
    drawText(":Cputer", cWidth-70, cHeight-30, 20)

    // Stock indicators
    if(cpu.lives > 0) {
        ctx.beginPath();
        ctx.arc(cWidth-150, cHeight-30, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(255, 0, 0, .7)"
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(180, 0, 0, .7)';
        ctx.stroke();
    }
    
    if(cpu.lives > 1) {
        ctx.beginPath();
        ctx.arc(cWidth-200, cHeight-30, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(255, 0, 0, .7)"
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(180, 0, 0, .7)';
        ctx.stroke();
    }
    
    if(cpu.lives > 2) {
        ctx.beginPath();
        ctx.arc(cWidth-250, cHeight-30, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(255, 0, 0, .7)"
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(180, 0, 0, .7)';
        ctx.stroke();
    }
    
    if(!cpu.alive && cpu.lives-1 < 0 ) {
        drawText("yOu win")
    }
    
    if(!player.alive && player.lives-1 < 0) {
        drawText("yOu lOse")
    }

}

/**
 * Draws the title screen
*/
function drawTitleScreen() {
    ctx.drawImage(bg, 0, 0, cWidth, cHeight);
    
    drawText('Ultra Crush', cWidth/2, cHeight/2-250, 60)
        drawText('Siblings', cWidth/2, cHeight/2-150, 60)
    drawText('>', cWidth/2+titleOptionArr[titleOptionNum].arrowOffset, cHeight/2+titleOptionArr[titleOptionNum].height, 70)
    for (let i = 0; i < titleOptionArr.length; i++) {
        drawText(titleOptionArr[i].text, cWidth/2, cHeight/2+titleOptionArr[i].height, 45)
    }
    drawText('Use arrow keys to move and enter to  select', cWidth/2, cHeight/2+290, 17)
}

/**
 * Draws the instructions screen
*/
function drawInstructionScreen(){
    ctx.drawImage(bg, 0, 0, cWidth, cHeight);
    // Make the background less visible so the instructions have easier readability
    ctx.fillStyle = 'rgba(0, 0, 0, .5)'
    ctx.fillRect(0, 0, cWidth, cHeight)
    
    // Draw instructions
    drawText('Ultra Crush Siblings', cWidth/2, cHeight/2-200, 70)
    drawText('Attack the opposing fighter and attempt to knock them off the map.', cWidth/2, cHeight/2-75, 23)
    drawText('Use WASD to move, to use abilities 1 and 2 press K and L.', cWidth/2, cHeight/2-20, 23)
    drawText('Press SPACE to jump, press it again to double jump.', cWidth/2, cHeight/2+35, 23)
    drawText('Shield with J to prevent knockback and damage.', cWidth/2, cHeight/2+90, 23)
    drawText('Whoever gets knocked off 3 times loses.', cWidth/2, cHeight/2+145, 23)
    drawText('Good  Luck  Have  Fun.', cWidth/2, cHeight/2+200, 23)
    drawText('Press  Enter  to  go  back', cWidth/2, cHeight/2+290, 17)
}

function drawCharacterSelectScreen(){
    let offsetW = 0
    ctx.drawImage(bg, 0, 0, cWidth, cHeight)
    ctx.fillStyle = '#2E514F';
    ctx.fillRect(0, cHeight*53.4/64, cWidth, cHeight)

    //Draw all characters
    for (let i = 0; i < fighterArr.length; i++) {
        fighterArr[i].draw(ctx)
    }
    if (currFighter == 1) offsetW = 10

    drawText('v', fighterArr[currFighter].x + offsetW + fighterArr[currFighter].width/2, cHeight*52/64, 40, "white", "Arial")
    drawText('Press  Enter  to  choose  a  character  (Press  ESC  to  go  back)', cWidth/2, cHeight/2+293, 15)
}

function drawGameOver() {
    let color = "white"
    drawGameScreen()

    ctx.fillStyle = 'rgba(0, 0, 0, .3)'
    ctx.fillRect(0, 0, cWidth, cHeight)

    if(player.lives <= 0) {
        drawText("yOu lOse", cWidth/2, cHeight/2-160, 100, "red")
    }
    if(cpu.lives <= 0) {
        drawText("yOu win", cWidth/2, cHeight/2-160, 100, "blue")
    }

    drawText("Press ENTER to return", cWidth/2, cHeight*2/3, 50)
    drawText("to title screen", cWidth/2, cHeight*2/3+60, 50)
}

/**
 * Draws the correct scene depending on the state
 */
function drawFrame() {
    // Clear the canvas each frame
    ctx.clearRect(0, 0, cWidth, cHeight);
    if(state == "title") drawTitleScreen()
    else if (state == "instructions") drawInstructionScreen()
    else if(state == "char_select") drawCharacterSelectScreen()
    else if(state == "game") drawGameScreen()
    else if(state == "game_over") drawGameOver()
    requestAnimationFrame(drawFrame);
}

/**
 * Updates the game depending on the current state
*/
function update() {
    if(state == "title") updateTitleScreen()
    else if (state == "instructions") updateInstructionScreen()
    else if(state == "char_select") updateCharacterSelectScreen()
    else if(state == "game") updateGameScreen()
    else if(state == "game_over") updateGameOverScreen()


    for (let i = 0; i < newkeys.length; i++) {
        newkeys[i] = false;
    }
    setTimeout(() => {
        requestAnimationFrame(update);
    }, 1000 / tps);
}

/**
 * Function that initializes the game
 */
function init() {
    // This segment of code allows me to collect keyboard inputs from the user
    // Source: Teacher
    // Accessed on 2/9/23
    window.addEventListener('keydown',
    /**
     * Function that takes the event and updates the keys being pressed down
     * @param {Event} e 
     */
    function(e){ if(!curkeys[e.keyCode]){
        curkeys[e.keyCode] = true; 
        newkeys[e.keyCode] = true;}})
        window.addEventListener('keyup', 
        /**
         * Function that takes the event and updates the keys being pressed down
        * @param {Event} e 
        */
        function(e){ curkeys[e.keyCode] = false;
            if (e.keyCode == 65 || e.keyCode == 68) {
                player.velocity[0] = 0;
            }
        })
    
    
    //Imaging stuff so sprites scale smoothly and maintain their original look
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;


    // Start the loop for the canvas
    update();
    drawFrame();
}

init();