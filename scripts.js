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
const BIRD_POS_X = CANVAS_WIDTH/3;
const BIRD_POS_Y = CANVAS_HEIGHT/2;
const FLAP_STRENGTH = -GRAVITY*35;
// const IMAGE_SROUCE = ["./images/dragon_up.webp", "./images/dragon_mid.webp", "./images/dragon_down.webp"];
const IMAGE_SROUCE = ["./images/Ears_Down.png", "./images/Ears_Mid_Down.png", "./images/Ears_Mid.png", "./images/Ears_Mid_Up.png", "./images/Ears_Up.png"];
const SPRITE_FRAME_INTERVAL = 5;
const BIRD_SPRITES = IMAGE_SROUCE.map((src) => {
    const img = new Image(BIRD_SIZE, BIRD_SIZE);
    img.src = src;
    return img;
});
const DEAD_SPRITE = new Image(BIRD_SIZE, BIRD_SIZE)
DEAD_SPRITE.src = "./images/Dead.png"

// Pipes constants
const PIPE_WIDTH = 50;
const PIPE_SPEED = -1 ;
const PIPE_GAP = 200;
const MIN_GAP_Y = 100;
const MAX_GAP_Y = CANVAS_HEIGHT - 100;
const PIPE_DISTANCE = 200;
let pipeTimer = PIPE_DISTANCE;

// Game status
let is_running = false;

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
    draw(dead = false){
        CTX.fillStyle = "#FFFFFF"
        let frame = BIRD_SPRITES[this.img_ind]
        if(dead){
            CTX.drawImage(DEAD_SPRITE, this.x, this.y, BIRD_SIZE, BIRD_SIZE)
        } else {
            CTX.drawImage(frame, this.x, this.y, BIRD_SIZE, BIRD_SIZE)
        }
        // A circle around the bird, so that the user knows which part of the bird makes them out
        CTX.strokeStyle = "red"
        // Decrease the height of bird container
        // CTX.strokeRect(this.x, this.y + 5, BIRD_SIZE, BIRD_SIZE - 10)
    }
}

class Pipe {
    constructor() {
        this.x = CANVAS_WIDTH;
        this.vel_x = PIPE_SPEED;
        this.gap_height = PIPE_GAP - Math.random() * 50
        ;
        this.width = PIPE_WIDTH;
        this.gap_y = Math.random() * (MAX_GAP_Y - MIN_GAP_Y);
        this.crossStatus = false
    }
    update(){
        this.x += this.vel_x
    }
    draw(){
        CTX.fillStyle = "#00FF00"
        // Upper pipe, starts at 0 and upto the random gap
        CTX.fillRect(this.x, 0, this.width, this.gap_y)
        //Lower pipe, starts at random gap + the gap height
        let lowerPipeY = this.gap_height + this.gap_y;
        CTX.fillRect(this.x, lowerPipeY, this.width, CANVAS_HEIGHT - lowerPipeY)
    }
    did_it_touch(flyingObj) {
        let pipeLeft = this.x;
        let pipeRight = this.x + this.width;
        let lowerPipeTop = this.gap_height + this.gap_y + 2.5
        let upperPipeBottom = this.gap_y - 2.5
        let flyingRight = flyingObj.x + BIRD_SIZE;
        let flyingLeft = flyingObj.x;
        let flyingTop = flyingObj.y;
        let flyingBottom = flyingObj.y + BIRD_SIZE;
        // Bool to check crash
        let crash = false;
        // Bool to check pipe cross
        let cross = false;
        if (pipeLeft <= flyingRight && pipeRight >= flyingLeft) {
            // Check overlap with upper pipe
            if (flyingTop < upperPipeBottom && flyingBottom > 0) {
            crash = true;
            }
            // Check overlap with lower pipe
            if (flyingTop < CANVAS_HEIGHT && flyingBottom > lowerPipeTop) {
            crash = true;
            }
        }
        if (pipeRight < flyingLeft) {
            if(this.crossStatus) {
                cross =false
            } else {
                this.crossStatus = true
                cross = true
            }
        }

        return {
            crash,
            cross
        }
    }
}

class Score {
    constructor(){
        this.currentScore = 0;
        this.highScore = localStorage.getItem("high_score") || 0
    }
    draw(){
        CTX.font = "15px 'Press Start 2P'"
        CTX.strokeText("SCORE: " + this.currentScore, 10, 30)
        CTX.strokeText("HIGH: " + this.highScore, 10, 50)
    }
    increaseScore(){
        this.currentScore++;
        if(this.currentScore > this.highScore) {
            this.highScore = this.currentScore
        }
    }
}

let bird = new Bird()
let pipes = []
let score = new Score()

function draw(){
    let shouldEndGame = false;
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
        let crash_cross = pipe.did_it_touch(bird)
        // If bird touches the pipes end the game
        if(crash_cross.crash) {
            bird.draw(true)
            shouldEndGame = endGame()
        }
        if(crash_cross.cross) {
            score.increaseScore()
        }
    })

    
    score.draw()

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    // If bird touches the surface or the ceiling
    if (bird.y + BIRD_SIZE >= CANVAS_HEIGHT || bird.y <= 0){
        bird.draw(true)
        shouldEndGame = endGame()
    }

    if(shouldEndGame) {
        return
    }

    requestAnimationFrame(draw)
}

function startGame(){
    bird = new Bird();
    pipes = []
    score = new Score()
    START_BUTTON.style.visibility = "hidden"
    is_running = true
    draw();
}

function endGame() {
    is_running = false
    localStorage.setItem("high_score", score.highScore)
    START_BUTTON.style.visibility = "visible"
    return true
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