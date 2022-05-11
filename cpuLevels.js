import * as util from "./utilityClassesAndFunctions.js"
import {player, cpu, ctx} from './gameFramework.js'

var cpuReactionTime = 250
var cpuReactionTimer = new util.Timer(cpuReactionTime)
var cpuDirection
var canAttack
export var detectionBox = {
    x: (cpu?.x+cpu?.width/2)-100,
    y: (cpu?.y+cpu?.height/2)-100,
    width: 100,
    height:100,
}

detectionBox.draw = function() {
    ctx.fillRect(detectionBox.x, detectionBox.y, detectionBox.width, detectionBox.height)
}

detectionBox.update = function() {
    this.x = (cpu?.x+cpu?.width/2)-100;
    this.y = (cpu?.y+cpu?.height/2)-100;
}

function intersects(obj1, obj2){
    if (obj1.attackCollider.x < obj2.spriteCollider.x + obj2.spriteCollider.width && obj1.attackCollider.x + obj1.attackCollider.width > obj2.spriteCollider.x && obj1.attackCollider.y < obj2.spriteCollider.y + obj2.spriteCollider.height && obj1.attackCollider.y + obj1.attackCollider.height > obj2.spriteCollider.y) {
        return true;
    }
    else {
        return false;
    }
}



export function CpuLevel1() {
    if(cpuReactionTimer.interval != 2000) {
        cpuReactionTimer.interval = 2000;
    }
    if(cpuReactionTimer.isReady()){
    }
}