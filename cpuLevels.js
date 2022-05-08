import * as util from "./utilityClassesAndFunctions.js"
import {player, cpu} from './gameFramework.js'

var cpuReactionTime = 250
var cpuReactionTimer = new util.Timer(cpuReactionTime)
var cpuDirection
var canAttack

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
        console.log("cpuUpdate")
    }
}