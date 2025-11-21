// Canvas details
const CANVAS = document.getElementById("game")
const CTX = CANVAS.getContext("2d");
const CANVAS_WIDTH = 288;
const CANVAS_HEIGHT = 512;

// Initial state of the bird
const BIRD_POS_X = CANVAS_WIDTH/2;
const BIRD_POS_Y = CANVAS_HEIGHT/2;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -10;

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




let bird = new Bird()

function draw(){
    CTX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Update the bird state
    bird.update()
    // Draw the bird to canvas
    bird.draw()

    requestAnimationFrame(draw)
}

draw();

document.addEventListener("keypress", () => {
    bird.flap()
})