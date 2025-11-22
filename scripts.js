// HTML elements
const START_BUTTON = document.getElementById("start-button")
const SCORE_CARD = document.getElementById("score-card")

// Canvas details
const CANVAS = document.getElementById("game")
const CTX = CANVAS.getContext("2d");
const CANVAS_WIDTH = 288;
const CANVAS_HEIGHT = 512;
const BIRD_SIZE = 50;

// Initial state of the bird
const GRAVITY = 0.1; // Might make it variable, maybe as difficulty?
const BIRD_POS_X = CANVAS_WIDTH/2;
const BIRD_POS_Y = CANVAS_HEIGHT/2;
const FLAP_STRENGTH = -GRAVITY*35;
const IMAGE_SROUCE = ["./images/dragon_up.webp", "./images/dragon_mid.webp", "./images/dragon_down.webp"];
const SPRITE_FRAME_INTERVAL = 15;
const BIRD_SPRITES = IMAGE_SROUCE.map((src) => {
    const img = new Image(BIRD_SIZE, BIRD_SIZE);
    img.src = src;
    return img;
});

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
        this.img_ind = 0;
        this.frameTimer = 0;
        this.frameInterval = SPRITE_FRAME_INTERVAL;
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
        this.frameTimer++;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.img_ind = (this.img_ind + 1) % BIRD_SPRITES.length
        }
    }
    // Set the velocity to negative to make the bird go upward
    flap() {
        this.vel_y = this.flapStrength
    }
    // Draw function for the bird into the canvas
    draw(){
        CTX.fillStyle = "#FFFFFF"
        const frame = BIRD_SPRITES[this.img_ind]
        CTX.drawImage(frame, this.x, this.y, BIRD_SIZE, BIRD_SIZE)
        // A circle around the bird, so that the user knows which part of the bird makes them out
        CTX.beginPath()
        CTX.arc(this.x + BIRD_SIZE / 2, this.y + BIRD_SIZE / 2, BIRD_SIZE/2, 2 * Math.PI, 0)
        CTX.stroke()
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

    if (bird.y + BIRD_SIZE >= CANVAS_HEIGHT || bird.y <= 0){
        endGame()
        return
    }

    requestAnimationFrame(draw)
}

function startGame(){
    bird = new Bird();
    pipes = []
    START_BUTTON.style.visibility = "hidden"
    draw();
}

function endGame() {
    START_BUTTON.style.visibility = "visible"
}

START_BUTTON.addEventListener("click", () => {
    startGame()
})

document.addEventListener("keypress", (e) => {
    if(e.key == "Enter") {
        startGame()
    }
})

document.addEventListener("keypress", () => {
    bird.flap()
})

CANVAS.addEventListener("pointerdown", () => {
    bird.flap()
})