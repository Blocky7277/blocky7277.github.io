import * as util from "./utilityClassesAndFunctions.js"
import {player, cpu, ctx} from './gameFramework.js'
import * as char from './characters.js'

var cpuReactionTime = 250
var cpuReactionTimer = new util.Timer(cpuReactionTime)
var cpuDirection
var canAttack
var cpuBoxOffset = 250
export var detectionBox = {
    x: 0,
    y: 0,
    width: cpuBoxOffset,
    height: cpuBoxOffset,
}

export var miniBox = {
    x: 0,
    y: 0,
    width: cpuBoxOffset/2,
    height: cpuBoxOffset/2,
}

detectionBox.draw = function() {
    ctx.fillStyle = 'rgba(0, 0, 0, .1)'
    ctx.fillRect(detectionBox.x, detectionBox.y, detectionBox.width, detectionBox.height)
    ctx.fillStyle = 'rgba(255, 0, 0, .1)'
    ctx.fillRect(miniBox.x, miniBox.y, miniBox.width, miniBox.height)
}

detectionBox.update = function() {
    this.x = (cpu?.spriteCollider.x+cpu?.spriteCollider.width/2)-cpuBoxOffset/2;
    this.y = (cpu?.spriteCollider.y+cpu?.spriteCollider.height/2)-cpuBoxOffset/2;
}

miniBox.update = function() {
    this.x = (cpu?.spriteCollider.x+cpu?.spriteCollider.width/2)-cpuBoxOffset/4;
    this.y = (cpu?.spriteCollider.y+cpu?.spriteCollider.height/2)-cpuBoxOffset/4;
}

function intersects(obj1, obj2 = detectionBox) {
    if (obj1.spriteCollider.x < obj2.x + obj2.width && obj1.spriteCollider.x + obj1.spriteCollider.width > obj2.x && obj1.spriteCollider.y < obj2.y + obj2.height && obj1.spriteCollider.y + obj1.spriteCollider.height > obj2.y) {
        return true;
    }
    else {
        return false;
    }
}



export function cpuLevel1() {
    if(cpu.koed || cpu.attacked || cpu.attacking) return;
    if(cpuReactionTimer.interval != 1500) {
        cpuReactionTimer.interval = 1500;
        cpuReactionTimer.accum = 0;
    }
    if(cpuReactionTimer.isReady()){
        if(player.spriteCollider.x < cpu.spriteCollider.x){
            cpuDirection = -1
        }
        else if(player.spriteCollider.x > cpu.spriteCollider.x){
            cpuDirection = 1
        }
        else{
            cpuDirection = 1
        }
        if(intersects(player)){
            let x = util.getRandIntBetween(0, 3)
            if(x == 1) cpu.attack1()
            else cpu.attack2()
        }
    }
    if(cpuDirection == -1) cpu.moveLeft()
    if(cpuDirection == 1) cpu.moveRight()
}

export function cpuLevel2() {
    if(cpu.koed || cpu.attacked || cpu.attacking) return;
    if(cpuReactionTimer.interval != 1250) {
        cpuReactionTimer.interval = 1250;
        cpuReactionTimer.accum = 0;
    }
    if(cpuReactionTimer.isReady()){
        if(player.spriteCollider.x < cpu.spriteCollider.x){
            cpuDirection = -1
        }
        else if(player.spriteCollider.x > cpu.spriteCollider.x){
            cpuDirection = 1
        }
        else{
            cpuDirection = 1
        }
        if(intersects(player)){
            let x = util.getRandIntBetween(0, 3)
            if(x == 1) cpu.attack1()
            else cpu.attack2()
        }
    }
    if(cpuDirection == -1) cpu.moveLeft()
    if(cpuDirection == 1) cpu.moveRight()
}

export function cpuLevel3() {
    if(cpu.koed || cpu.attacked || cpu.attacking) return;
    if(cpuReactionTimer.interval != 750) {
        cpuReactionTimer.interval = 750;
        cpuReactionTimer.accum = 0;
    }
    if(cpuReactionTimer.isReady()){
        if(player.spriteCollider.x < cpu.spriteCollider.x){
            cpuDirection = -1
        }
        else if(player.spriteCollider.x > cpu.spriteCollider.x){
            cpuDirection = 1
        }
        else{
            cpuDirection = 1
        }
        if(intersects(player)){
            let x = util.getRandIntBetween(0, 3)
            if(x == 1) cpu.attack1()
            else cpu.attack2()
        }
    }
    if(cpuDirection == -1) cpu.moveLeft()
    if(cpuDirection == 1) cpu.moveRight()
}

export function cpuLevel4() {
    if(cpu.koed || cpu.attacked || cpu.attacking) return;
    if(cpuReactionTimer.interval != 400) {
        cpuReactionTimer.interval = 400;
        cpuReactionTimer.accum = 0;
    }
    if(cpuReactionTimer.isReady()){
        if(player.spriteCollider.x < cpu.spriteCollider.x){
            cpuDirection = -1
        }
        else if(player.spriteCollider.x > cpu.spriteCollider.x){
            cpuDirection = 1
        }
        else{
            cpuDirection = 1
        }
        if(intersects(player)){
            let x = util.getRandIntBetween(0, 3)
            console.log(x)
            if(x == 1) cpu.attack1()
            else cpu.attack2()
        }
    }
    if(cpuDirection == -1) cpu.moveLeft()
    if(cpuDirection == 1) cpu.moveRight()
}

export function cpuLevel5() {
    if(cpu.koed || cpu.attacked || cpu.attacking) return;
    if(cpuReactionTimer.interval != 180) {
        cpuReactionTimer.interval = 180;
        cpuReactionTimer.accum = 0;
    }
    if(cpuReactionTimer.isReady()){
        if(player.spriteCollider.x < cpu.spriteCollider.x){
            cpuDirection = -1
        }
        else if(player.spriteCollider.x > cpu.spriteCollider.x){
            cpuDirection = 1
        }
        else{
            cpuDirection = 0
        }
        if(intersects(player) && !player.koed) canAttack = true;
        else canAttack = false;
    }
    if(canAttack){
        if(intersects(player, miniBox)){
            cpu.attack1()
        }
        else cpu.attack2()
    }
    if(cpuDirection == -1 && cpu.health > 0 ) cpu.moveLeft()
    else if(cpuDirection == 1) cpu.moveRight()
}