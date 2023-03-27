//Timer Class
export class Timer{
    constructor(timeIntervalMS, enabled = true){
        this.oldTime = new Date();

        this.interval = timeIntervalMS;
        
        this.accum = 0;

        this.enabled = enabled;
    }

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

//Get rand int between inputs
export function getRandIntBetween(max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min)
} 

//Python sleep function in JS
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}