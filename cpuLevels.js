import * as util from "./utilityClassesAndFunctions.js"
import {player, cpu} from './gameFramework.js'

var cpuReactionTime = 250
var cpuReactionTimer = new util.Timer(cpuReactionTime)
var cpuDirection

export function CpuLevel1() {
    if(cpuReactionTimer.interval != 2000) {
        cpuReactionTimer.interval = 2000;
    }
    if(cpuReactionTimer.isReady()){
        console.log("cpuUpdate")
    }
}