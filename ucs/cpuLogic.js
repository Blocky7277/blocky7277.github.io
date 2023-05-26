import {player, cpu} from "./index.js"
import {Timer, getRandInt} from "./utility.js"
import {ground} from "./fighters.js"

// Variables relating cpu logic
var cpuReactionTime = 250
var cpuReactionTimer = new Timer(cpuReactionTime)
var cpuDirection = 0
var cpuBoxOffset = 250

// Detection box for the CPU
export var detectionBox = {
    x: 0,
    y: 0,
    width: cpuBoxOffset,
    height: cpuBoxOffset,
    update: function() {
        this.x = (cpu.x+cpu.width/2)-cpuBoxOffset/2;
        this.y = (cpu.y+cpu.height/2)-cpuBoxOffset/2;
    },
}

/**
 * 
 * Function that checks if object 1 and object 2 intersect then returns true if they do and false if they don't
 * 
 * @param {*} obj1 
 * @param {*} obj2 
 * @returns true or false
 */
function intersects(obj1, obj2 = detectionBox) {
    if (obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x && obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y) {
        return true;
    }
    else {
        return false;
    }
}


/**
 * Function that controls the cpu actions
 */
export function cpuLogic() {
    // Make sure the cpu is in a state where it can move and that the player isn't dead or off the map
    if(!cpu.alive || cpu.hurt || cpu.attacking || player.y+player.height > myCanvas.offsetHeight-ground || !player.alive) return;
    // Allows the cpu to have a more human reaction time because it becomes insanely difficult if it reacts in 1/60 of a second
    if(cpuReactionTimer.interval != 500) {
        cpuReactionTimer.interval = 500;
        cpuReactionTimer.accum = 0;
    }
    // Move towards the player
    if(cpuReactionTimer.isReady()){
        if(player.x < cpu.x){
            cpuDirection = -1
        }
        else if(player.x > cpu.x){
            cpuDirection = 1
        }
        else{
            cpuDirection = 1
        }
        // Check if the player is in range then attacks
        if(intersects(player)){
            let x = getRandInt(0, 4)
            if(x == 1) cpu.ability1()
            else cpu.ability1()
        }
    }

    // Head back towards the map if the cpu is off the map
    if(cpu.x < -cpu.width*2){
        cpuDirection = 1
    }
    else if(cpu.x + cpu.width > myCanvas.offsetWidth+cpu.width*2){
        cpuDirection = -1
    }
    // Jump to get back on the map
    if(cpu.y+cpu.height>myCanvas.offsetHeight-ground+1) cpu.jump()
    // The movements that were set above
    cpu.moveX(cpuDirection)
    cpu.moveX(cpuDirection)
}
