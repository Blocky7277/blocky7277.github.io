// Canvas Related Constants
/** @type {HTMLCanvasElement} */
export const  c = myCanvas;
export const ctx = c.getContext("2d");
const cWidth = c.width; 
const cHeight = c.height;

import { char1 } from "./characters.js";

//Classes for the game
export class character{
    constructor(x, y, width, height, health, imgSrc){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.imgSrc = imgSrc;
    }

}

// The keycode events

// When the key is pressed it will stay true
var curkeys = [];
// Only true for one frame
var newkeys = [];

//Game States 0: title screen, 1: settings, 2: instructions, 3: playing -1: lose, 3: win, .5: pause,
var gameState = 0;

var player = new char1(1, 1, 100, 100, 100, './sprites/adventurerSprites.png')
console.log(player)

var wasdKeys = [65, 68]
var arrowKeys = [37, 39]

var movement_key_codes = {
    left: 65,
    right: 68
}

function initialize(){

    window.addEventListener('keydown', function(e){ curkeys[e.keyCode] = true;})
    window.addEventListener('keyup', function(e){ curkeys[e.keyCode] = false;})

    window.requestAnimationFrame(gameUpdate);
}

function gameUpdate() {
    //GAME UPDATE LOGIC


    //Don't modify the code below
    gameDraw();
    window.requestAnimationFrame(gameUpdate);
}

function gameDraw(){
    ctx.clearRect(0, 0, cWidth, cHeight);
    //DRAW STATEMENTS

    player.draw()

}

function movementHandler() {
    if(curkeys[movement_key_codes.right]){
        player.moveRight()
        player.moveLeft()
    }
}

initialize();