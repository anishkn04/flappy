// Canvas details
const CANVAS = document.getElementById("game")
const CTX = CANVAS.getContext("2d");
const CANVAS_WIDTH = 288;
const CANVAS_HEIGHT = 512;

// Initial state of the bird
const GRAVITY = 0.1; // Might make it variable, maybe as difficulty?
const BIRD_POS_X = CANVAS_WIDTH/2;
const BIRD_POS_Y = CANVAS_HEIGHT/2;
const FLAP_STRENGTH = -GRAVITY*35;

// Pipes constants
const PIPE_WIDTH = 50;
const PIPE_SPEED = -1 ;
const PIPE_GAP = 200;
const MIN_GAP_Y = 100;
const MAX_GAP_Y = CANVAS_HEIGHT - 100;
const PIPE_DISTANCE = 200;
let pipeTimer = PIPE_DISTANCE;

// Bird class
class Bird {
    constructor() {
        this.x = BIRD_POS_X;
        this.y = BIRD_POS_Y;
        this.vel_y = 0;
        this.gravity = GRAVITY
        this.flapStrength = FLAP_STRENGTH
    }
    // Update the bird position
    update(){
        this.vel_y += this.gravity
        this.y += this.vel_y
    }
    // Set the velocity to negative to make the bird go upward
    flap() {
        this.vel_y = this.flapStrength
    }
    // Draw function for the bird into the canvas
    draw(){
        CTX.fillStyle = "#FFFFFF"
        CTX.fillRect(this.x, this.y, 20, 20)
    }
}

class Pipe {
    constructor() {
        this.x = CANVAS_WIDTH;
        this.vel_x = PIPE_SPEED;
        this.gap_height = PIPE_GAP;
        this.width = PIPE_WIDTH;
        this.gap_y = Math.random() * (MAX_GAP_Y - MIN_GAP_Y) + 0;
    }
    update(){
        this.x += this.vel_x
    }
    draw(){
        CTX.fillStyle = "#00FF00"
        // Lower pipe, starts at the random gap
        CTX.fillRect(this.x, 0, this.width, this.gap_y)
        //Upper pipe, starts at random gap + the gap height
        let lowerPipeY = this.gap_height + this.gap_y;
        CTX.fillRect(this.x, lowerPipeY, this.width, CANVAS_HEIGHT - lowerPipeY)
    }
}


let bird = new Bird()
let pipes = []

function draw(){
    CTX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Update the bird state
    bird.update()
    // Draw the bird to canvas
    bird.draw()

    // If the pipe has already moved PIPE_DISTANCE, then create new one
    if(pipeTimer <= 0 ) {
        pipes.push(new Pipe())
        pipeTimer = PIPE_DISTANCE
    }
    pipeTimer--;

    pipes.forEach((pipe, ind) => {
        // Update pipe state
        pipe.update()
        // Draw the pipe to canvas
        pipe.draw()
    })

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    requestAnimationFrame(draw)
}

draw();

document.addEventListener("keypress", () => {
    bird.flap()
})