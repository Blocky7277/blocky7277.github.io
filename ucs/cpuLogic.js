import {player, cpu} from "./index.js"
import {Timer, getRandInt} from "./utility.js"
import {ground} from "./fighters.js"

var cpuReactionTime = 250
var cpuReactionTimer = new Timer(cpuReactionTime)
var cpuDirection = 0
var cpuBoxOffset = 250

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

function intersects(obj1, obj2 = detectionBox) {
    if (obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x && obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y) {
        return true;
    }
    else {
        return false;
    }
}



export function cpuLogic() {
    console.log(player.y+player.height, myCanvas.offsetHeight-ground)
    if(!cpu.alive || cpu.hurt || cpu.attacking || player.y+player.height > myCanvas.offsetHeight-ground) return;
    if(cpuReactionTimer.interval != 500) {
        cpuReactionTimer.interval = 500;
        cpuReactionTimer.accum = 0;
    }
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
        if(intersects(player)){
            let x = getRandInt(0, 4)
            if(x == 1) cpu.ability1()
            else cpu.ability1()
        }
    }
    if(cpu.x < -cpu.width*2){
        cpuDirection = 1
    }
    else if(cpu.x + cpu.width > myCanvas.offsetWidth+cpu.width*2){
        cpuDirection = -1
    }
    if(cpu.y+cpu.height>myCanvas.offsetHeight-ground+1) cpu.jump()
    cpu.moveX(cpuDirection)
    cpu.moveX(cpuDirection)
}
