// HTML elements
const START_BUTTON = document.getElementById("start-button")
const SCORE_CARD = document.getElementById("score-card")
const SCORE_SPAN = document.getElementById("score-span")

const loadScore = () => {
    SCORE_SPAN.innerText = localStorage.getItem("high_score") || 0
}
loadScore()

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
const SHIELD_IMAGE = new Image(40, 40)
SHIELD_IMAGE.src = "./images/shield40.png"

// Pipes constants
const PIPE_WIDTH = 50;
const PIPE_SPEED = -1 ;
const PIPE_GAP = 200;
const MIN_GAP_Y = 100;
const MAX_GAP_Y = CANVAS_HEIGHT - 100;
const PIPE_DISTANCE = 300;
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
        this.powerUp = {
            state: false,
            kind: null,
        }
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
            return
        }
        CTX.drawImage(frame, this.x, this.y, BIRD_SIZE, BIRD_SIZE)
        if(this.powerUp.state) {
            console.log("Power Up")
            CTX.strokeStyle = "gold"
            CTX.beginPath()
            CTX.arc(this.x + BIRD_SIZE / 2, this.y + BIRD_SIZE / 2, BIRD_SIZE / 2 + 10, 0, 2 * Math.PI)
            CTX.stroke()
        }
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
        if (pipeRight < flyingLeft) {
            if(this.crossStatus) {
                cross =false
            } else {
                this.crossStatus = true
                cross = true
            }
        }

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
        CTX.fillText("SCORE: " + this.currentScore, 10, 30)
        CTX.fillText("HIGH: " + this.highScore, 10, 50)
    }
    increaseScore(){
        this.currentScore++;
        if(this.currentScore > this.highScore) {
            this.highScore = this.currentScore
        }
    }
}

class Sound {
    constructor(src){
        this.soundElem = document.getElementById("audio")
        if(src){
            this.soundElem.src = src
        }
    }
    play(repeat=true){
        if(repeat){
            this.soundElem.loop = true
        } else {
            this.soundElem.loop = false
        }
        this.soundElem.play()
    }
    stop(){
        this.soundElem.pause()
    }
}

class Powerup {
    constructor(kind){
        this.kind = kind || "shield"
        this.x = Math.random() * CANVAS_WIDTH + CANVAS_WIDTH;
        this.y = Math.random() * CANVAS_HEIGHT;
        this.vel_x = PIPE_SPEED;
        this.is_drawn = false;
        this.is_absorbed = false;
        this.timer = 500;
    }
    draw(){
        if(this.is_drawn) return
        if(this.is_absorbed) return
        CTX.beginPath();
        CTX.strokeStyle = "gold"
        CTX.drawImage(SHIELD_IMAGE, this.x - 20, this.y - 16)
        CTX.arc(this.x, this.y, 20, 0, 2 * Math.PI)
        CTX.stroke()
    }
    update(){
        this.x += this.vel_x
    }
    did_touch(flyingObject){
        // Find the closest point on the rectangle to the circle center
        let closestX = Math.max(flyingObject.x, Math.min(this.x, flyingObject.x + BIRD_SIZE));
        let closestY = Math.max(flyingObject.y, Math.min(this.y, flyingObject.y + BIRD_SIZE));
        
        // Calculate distance from circle center to closest point
        let distance = Math.sqrt((this.x - closestX) ** 2 + (this.y - closestY) ** 2);
        
        // Return true if distance is less than or equal to radius
        if(distance <= 20){
            this.is_absorbed = true;
            return true
        }
        return false
    }
}

let bird;
let pipes;
let score;
let sound;
let powerUp;
let powerUpInterval;

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
        if(crash_cross.crash && !bird.powerUp.state) {
            bird.draw(true)
            shouldEndGame = endGame()
        }
        if(crash_cross.cross) {
            score.increaseScore()
        }
    })

    powerUp.update()
    powerUp.draw()

    score.draw()

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    // If bird touches the surface or the ceiling
    if ((bird.y + BIRD_SIZE >= CANVAS_HEIGHT || bird.y <= 0) && !bird.powerUp.state){
        bird.draw(true)
        shouldEndGame = endGame()
    }

    // If bird touches powerup
    if(powerUp.did_touch(bird) && !bird.powerUp.state) {
        console.log(bird)
        bird.powerUp = {
            state: true,
            kind: powerUp.kind
        }
    }
    
    if (bird.powerUp.state && (powerUp.timer-- <= 0) ) {
        bird.powerUp = {
            state: false,
            kind: null
        }
    } 

    if(shouldEndGame) {
        return
    }

    requestAnimationFrame(draw)
}

function startGame(){
    SCORE_CARD.style.display = "none";
    bird = new Bird();
    pipes = []
    score = new Score()
    sound = new Sound("./sounds/panchhi_banu.webm")
    sound.play()
    START_BUTTON.style.visibility = "hidden"
    is_running = true
    powerUp = new Powerup("shield")
    powerUpInterval = setInterval(() => {
        powerUp = new Powerup("shield")
    }, 15000)
    draw();
}

function endGame() {
    is_running = false
    localStorage.setItem("high_score", score.highScore)
    START_BUTTON.style.visibility = "visible"
    sound.stop()
    sound = new Sound("./sounds/quack.mp3")
    sound.play(false)
    setTimeout(()=> {
        if(is_running == false){
            SCORE_CARD.style.display = "flex"
        }
    }, 1000)
    clearInterval(powerUpInterval)
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

document.addEventListener("keypress", (e) => {
    if(e.key == " " || e.key == "Spacebar") {
        bird.flap()
    }
})

CANVAS.addEventListener("pointerdown", () => {
    bird.flap()
})