import { PongEngine } from "./PongEngine";
import { BALL_SIZE, GAME_HEIGHT, GAME_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH } from "./types";


document.querySelector<HTMLCanvasElement>("#app")!.innerHTML = `
<div>
    <h1> King Kong Pong </h1>
    <canvas id="pongCanvas" width=${GAME_WIDTH} height=${GAME_HEIGHT} style = "border: 3px solid grey;"></canvas>
`

const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
const engine = new PongEngine();

const keysPressed: {[key : string] : boolean} = {};

GameLoop();

function GameLoop(){
    handleInput();
    engine.update(); //might want to pass deltaTime here later and use for ball and paddle movement
    context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    context.fillStyle = "brown";
    context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawPaddles();
    drawBall();
    drawScores();
    drawNet();
    requestAnimationFrame(GameLoop);
}


window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "W", "w", "S", "s"].includes(e.key))
        e.preventDefault();
    keysPressed[e.key] = true;
} )

window.addEventListener("keyup", (e) =>{
    keysPressed[e.key] = false;
})

function handleInput(){
    if (keysPressed["W"] || keysPressed["w"]){
        engine.movePaddle(1, "UP");
    }
    if (keysPressed["S"] || keysPressed["s"]){
        engine.movePaddle(1, "DOWN");
    }
    if (keysPressed["ArrowUp"]){
        engine.movePaddle(2, "UP");
    }
    if (keysPressed["ArrowDown"]){
        engine.movePaddle(2, "DOWN");
    }
}

function drawPaddles () {
    context.fillStyle = "white";
    context.fillRect(engine.state.p1.x, engine.state.p1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.fillRect(engine.state.p2.x, engine.state.p2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function drawBall () {
    context.fillStyle = "yellow";
    context.fillRect(engine.state.ball.x, engine.state.ball.y, BALL_SIZE, BALL_SIZE);
}

function drawScores(){
    context.fillStyle = "pink";
    context.font = "20px Monospace";
    context.fillText("Player 1", GAME_WIDTH / 4 - 50, 40)
    context.fillText(`${engine.state.p1score}`, GAME_WIDTH / 4 - 15, 70)
    context.fillText("Player 2", (GAME_WIDTH - GAME_WIDTH / 4) - 50, 40)
    context.fillText(`${engine.state.p2score}`,  (GAME_WIDTH - GAME_WIDTH / 4) - 15, 70)
}

function drawNet(){
    context.fillStyle = "white";
    const segment = 20;
    for (let y = 10; y < GAME_HEIGHT; y += segment * 2){
        context.fillRect(GAME_WIDTH / 2 - 1, y, 2, segment)
    }
}