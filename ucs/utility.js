/**
 * Function that sleeps the inputted ms, you can also toggle a log that says how long it sleeps and when it finishes
 * 
 * @param {Number} ms 
 * @param {Boolean} lg 
 * @returns resolved promise
 */
export async function sleep(ms, lg=false){
    if(ms <= 0){
        return console.error("Invalid sleep time: " + ms);
    }
    if (lg) console.log("Sleeping " + ms + "ms...") 
    
    return new Promise(resolve => setTimeout(resolve, ms)).then(() => {
        if (lg) console.log("done")
    })
}

/**
 * Function that generates a random intger from 
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * Accessed: 3/26/23
 * 
 * @param {Number} min 
 * @param {Number} max 
 * @returns the random number
 */
export function getRandInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

// Class that checks if the passed through interval has elapsed
// Source: Teacher
// From: utilityClassesAndFunctions.js
// Accessed: 3/28/23
export class Timer{
    constructor(timeIntervalMS, enabled = true){
        this.oldTime = new Date();

        this.interval = timeIntervalMS;
        
        this.accum = 0;

        this.enabled = enabled;
    }

    /**
     * Source: Teacher
     * Accessed: 3/28/23
     * From: utilityClassesAndFunctions.js
     * @returns if the timer is ready
     */
    isReady(){
        var curTime = new Date();
        var delta = curTime - this.oldTime;

        this.accum += delta;
        this.oldTime = curTime;
        if (this.accum > this.interval && this.enabled){
            this.accum = 0;
            return true;
        }
        else{
            return false;
        }
    }
}
