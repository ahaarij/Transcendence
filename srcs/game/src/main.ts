import { PongEngine } from "./PongEngine";
import { BALL_SIZE, GAME_HEIGHT, GAME_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH } from "./types";


// We are building a container with TWO layers:
// Layer 1 (Bottom): The Canvas (The Game)
// Layer 2 (Top): The UI (Menus, Buttons)
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div style="position: relative; width: ${GAME_WIDTH + 7}px; height: ${GAME_HEIGHT + 7}px; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
    
    <!-- LAYER 1: THE GAME -->
    <canvas id="pongCanvas" width="${GAME_WIDTH}" height="${GAME_HEIGHT}" style="border: 3px solid grey; background: black; display: block;"></canvas>

    <!-- LAYER 2: THE UI OVERLAY -->
    <div id="uiLayer" style="
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background: rgba(0,0,0,0.85); color: white; font-family: monospace; z-index: 10;
        backdrop-filter: blur(2px);
    ">
        
        <!-- START MENU SCREEN -->
        <div id="mainMenu" style="text-align: center;">
            <h1 style="font-size: 60px; margin-bottom: 20px; color: #fff; text-shadow: 0 0 10px #fff;">KING KONG PONG</h1>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #aaa; margin-bottom: 5px;">SELECT MODE</p>
                <button id="btnPvP" class="btn selected">2 Players</button>
                <button id="btnPvAI" class="btn">vs AI</button>
                <button id="btnTourney" class="btn">Tournament</button>
            </div>

            <div id="aiOptions" style="display: none; margin-bottom: 20px;">
                <p style="margin-bottom: 5px; color: #aaa;">SIDE</p>
                <button id="btnLeft" class="btn selected">Left</button>
                <button id="btnRight" class="btn">Right</button>
            </div>

            <div style="margin-bottom: 30px;">
                <p style="margin-bottom: 5px; color: #aaa;">WIN SCORE</p>
                <button id="score5" class="btn">5</button>
                <button id="score11" class="btn selected">11</button>
                <button id="score21" class="btn">21</button>
            </div>

            <button id="btnStart" style="
                padding: 15px 40px; font-size: 24px; background: white; color: black; 
                border: none; cursor: pointer; font-weight: bold; margin-top: 20px;
            ">START GAME</button>
        </div>

        <!-- TOURNAMENT SETUP SCREEN -->
        <div id="tournamentMenu" style="display: none; text-align: center;">
            <h2 style="margin-bottom: 20px;">TOURNAMENT REGISTRATION</h2>
            <div style="margin-bottom: 15px;">
                <p style="color: #aaa; margin-bottom: 5px;">PLAYERS</p>
                <button id="btn4Players" class="btn selected">4</button>
                <button id="btn8Players" class="btn">8</button>
            </div>
            <div id="playerInputs" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;"></div>
            <button id="btnStartTourney" class="btn" style="border-color: white;">BEGIN TOURNAMENT</button>
            <br><br>
            <button id="btnBack" class="btn" style="font-size: 12px; border: none;">&lt; Back</button>
        </div>

        <!-- GAME OVER SCREEN -->
        <div id="gameOverScreen" style="display: none; text-align: center;">
            <h1 id="winnerText" style="font-size: 50px; margin-bottom: 20px; color: #0ff;">PLAYER 1 WINS</h1>
            <p style="color: #aaa; margin-bottom: 30px;">Press ENTER to return to menu</p>
        </div>

    </div>
</div>
`;

// 2. STYLES
const style = document.createElement('style');
style.innerHTML = `
    .btn { padding: 10px 20px; margin: 0 5px; background: transparent; border: 2px solid #555; color: #888; cursor: pointer; font-family: monospace; transition: all 0.2s; }
    .btn.selected { border-color: white; color: white; background: rgba(255,255,255,0.1); box-shadow: 0 0 10px rgba(255,255,255,0.2); }
    .btn:hover { border-color: #aaa; color: #aaa; }
    input { padding: 8px; background: #222; border: 1px solid #555; color: white; font-family: monospace; text-align: center; }
`;
document.head.appendChild(style);


const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
const engine = new PongEngine();

type GameState = 'MENU' | 'COUNTDOWN' |'PLAYING' | 'GAMEOVER';
let gameState: GameState = 'MENU';
let gameMode: 'PvP' | 'PvAI' | 'Tournament' = 'PvP';
let playerSide: 'Left' | 'Right' = 'Left';
let winningScore: number = 11;
let countDown = 3;
let countDownTimer = 0;

let tournamentPlayers: string[] = []; // names of players in tournament mode
let tournamentBracket: {player1: string, player2: string}[] = []; // pairs of players for each match
let tournamentWinner: string[] = []; // winner names
let currentMatchIndex = 0; // index of current match in tournamentBracket
let tournamentRound = 1; // current round number (Quarterfinals, Semifinals, Finals, etc.)
let tournamentSize = 4;

const uiLayer = document.getElementById("uiLayer");
const mainMenu = document.getElementById("mainMenu");
const tournamentMenu = document.getElementById("tournamentMenu");
const gameOverScreen = document.getElementById("gameOverScreen");
const winnerText = document.getElementById("winnerText");
const aiOptions = document.getElementById("aiOptions");


document.getElementById("btnTourney")!.addEventListener("click", () => {
    gameMode = 'Tournament';
    document.getElementById("btnTourney")!.classList.add("selected");
    document.getElementById("btnPvP")!.classList.remove("selected");
    document.getElementById("btnPvAI")!.classList.remove("selected");
    aiOptions!.style.display = "none";

    mainMenu!.style.display = "none";
    tournamentMenu!.style.display = "block";

    setupTournament(tournamentSize); // for now we set up for 4 players, can add option later
});

document.getElementById("btn4Players")!.addEventListener("click", () => {
    tournamentSize = 4;
    document.getElementById("btn4Players")!.classList.add("selected");
    document.getElementById("btn8Players")!.classList.remove("selected");
    setupTournament(4);
});

document.getElementById("btn8Players")!.addEventListener("click", () => {
    tournamentSize = 8;
    document.getElementById("btn8Players")!.classList.add("selected");
    document.getElementById("btn4Players")!.classList.remove("selected");
    setupTournament(8);
});

document.getElementById("btnBack")!.addEventListener("click", () => {
    
    document.getElementById("btnTourney")!.classList.remove("selected");
    document.getElementById("btnPvP")!.classList.add("selected");
    gameMode = 'PvP';
    tournamentMenu!.style.display = "none";
    mainMenu!.style.display = "block";
});

document.getElementById("btnStartTourney")!.addEventListener("click", () => {
    tournamentPlayers = [];
    for (let i = 1; i <= tournamentSize; i++){
        const input = document.getElementById(`player${i}`) as HTMLInputElement; 
        const name = input.value.trim() || `Player ${i}`; // this means if no name is entered, use default
        tournamentPlayers.push(name);
    }

    tournamentBracket = [];
    for (let i = 0; i < tournamentPlayers.length; i += 2){
        //ok we need to pair players into matches, add shuffling later
        tournamentBracket.push({player1: tournamentPlayers[i], player2: tournamentPlayers[i+1]});
    }

    currentMatchIndex = 0;
    tournamentWinner = [];

    startNextMatch();
});

function startNextMatch(){
    if (currentMatchIndex < tournamentBracket.length){
        const match = tournamentBracket[currentMatchIndex];
        alert(`Starting Match: ${match.player1} vs ${match.player2}`);

        engine.setWinningScore(5); // shorter matches for tournament
        engine.restart();

        resetInputs();
        tournamentMenu!.style.display = "none";
        uiLayer!.style.display = "none";

        gameState = 'PLAYING';
        // gameMode = 'PvP'; // tournament is always PvP

        aiLastUpdate = 0;
        aiTargetY = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    }
    else{
        //tournament over
        if (tournamentBracket.length === 1){
            alert(`Tournament Over! Winner: ${tournamentWinner[0]}`);
            location.reload(); // simple way to reset everything for now
        }else{
            //setup next round
            const survivors = [...tournamentWinner]; //
            tournamentWinner = [];
            tournamentBracket = [];
            for (let i = 0; i < survivors.length; i += 2){
                tournamentBracket.push({player1: survivors[i], player2: survivors[i+1]});
            }
            currentMatchIndex = 0;
            tournamentRound += 1;
            alert(`Starting Round ${tournamentRound}`);
            startNextMatch();
        }
        // gameState = 'MENU';
        // tournamentMenu!.style.display = "none";
        // mainMenu!.style.display = "block";
    }
}

document.getElementById("btnPvP")!.addEventListener("click", () => {
    gameMode = 'PvP';
    document.getElementById("btnPvP")!.classList.add("selected");
    document.getElementById("btnPvAI")!.classList.remove("selected");
    aiOptions!.style.display = "none";
});

document.getElementById("btnPvAI")!.addEventListener("click", () => {
    gameMode = 'PvAI';
    document.getElementById("btnPvAI")!.classList.add("selected");
    document.getElementById("btnPvP")!.classList.remove("selected");
    aiOptions!.style.display = "block";
});

document.getElementById("btnLeft")!.addEventListener("click", () => {
    playerSide = 'Left';
    document.getElementById("btnLeft")!.classList.add("selected");
    document.getElementById("btnRight")!.classList.remove("selected");
});


document.getElementById("btnRight")!.addEventListener("click", () => {
    playerSide = 'Right';
    document.getElementById("btnRight")!.classList.add("selected");
    document.getElementById("btnLeft")!.classList.remove("selected");
});

document.getElementById("score5")!.addEventListener("click", () => {
    winningScore = 5;
    document.getElementById("score5")!.classList.add("selected");
    document.getElementById("score11")!.classList.remove("selected");
    document.getElementById("score21")!.classList.remove("selected");
});

document.getElementById("score11")!.addEventListener("click", () => {
    winningScore = 11;
    document.getElementById("score11")!.classList.add("selected");
    document.getElementById("score5")!.classList.remove("selected");
    document.getElementById("score21")!.classList.remove("selected");
});

document.getElementById("score21")!.addEventListener("click", () => {
    winningScore = 21;
    document.getElementById("score21")!.classList.add("selected");
    document.getElementById("score5")!.classList.remove("selected");
    document.getElementById("score11")!.classList.remove("selected");
});


document.getElementById("btnStart")!.addEventListener("click", () => {
    engine.setWinningScore(winningScore);
    engine.restart();
    
    mainMenu!.style.display = "none";
    uiLayer!.style.display = "none";
    gameOverScreen!.style.display = "none";
    
    aiTargetY = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    aiLastUpdate = 0;
    
    countDown = 3;
    gameState = 'COUNTDOWN';

    countDownTimer = performance.now();
    

});


function setupTournament(count: number){
    const playerInput = document.getElementById("playerInputs")!;
    playerInput.innerHTML = ""; // clear previous entries

    for (let i = 1; i <= count; i++){
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Player ${i} Name`;
        input.id = `player${i}`;
        playerInput.appendChild(input);
    }
}

function resetInputs() {
    // Clear all keys
    for (const key in keysPressed) {
        keysPressed[key] = false;
    }
}

requestAnimationFrame(GameLoop);

// GameLoop();

function GameLoop(timestamp: number = 0)
{

    if (gameState === 'COUNTDOWN'){
        renderGame();
        context.fillStyle = "Green";
        context.font = "100px Monospace";
        context.fillText(countDown.toString(), GAME_WIDTH / 4 - 40, GAME_HEIGHT / 2 + 30);
        context.fillText(countDown.toString(), (GAME_WIDTH - GAME_WIDTH / 4) - 40, GAME_HEIGHT / 2 + 30);
        if (timestamp - countDownTimer > 1000){
            countDown -= 1;
            countDownTimer = timestamp;
            if (countDown <= 0) {
                context.fillText("Go!", GAME_WIDTH / 2 - 50, GAME_HEIGHT / 2 + 10);
                gameState = 'PLAYING';
            }
        }
    }

    else if (gameState === 'PLAYING'){
        
        if (gameMode === 'PvAI'){
            runAi(timestamp);
            moveAiPaddle();
        }
        
        handleInput();
        engine.update(); //might want to pass deltaTime here later and use for ball and paddle movement
        
        if (engine.state.winner !== 0){
            if (gameMode === 'Tournament'){
                const match = tournamentBracket[currentMatchIndex];
                const winnerName = engine.state.winner === 1 ? match.player1 : match.player2;
                alert(`Match Over! Winner: ${winnerName}`);
                tournamentWinner.push(winnerName);
                currentMatchIndex += 1;
                engine.state.winner = 0; // reset winner for next match
                startNextMatch();
                // return; // exit the loop to avoid rendering game over screen immediately
            }else{
            gameState = 'GAMEOVER';
            showGameOverScreen(engine.state.winner);
            }
        }
        renderGame();
    }
    else {
        renderGame();
    }
    requestAnimationFrame(GameLoop);
}

function renderGame(){
    context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    context.fillStyle = "brown";
    context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawPaddles();
    drawBall();
    drawScores();
    drawNet();
    //optional Draws a border around the game area to avoid doing it in css which would be outside the canvas
    // context.strokeStyle = "grey";
    // context.lineWidth = 6; // 3px visible
    // context.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function showGameOverScreen(winner: number){
    uiLayer!.style.display = "flex";
    mainMenu!.style.display = "none";
    gameOverScreen!.style.display = "block";
    
    let text = `Player ${winner} Wins!`;
    if (gameMode === 'PvAI'){
        if ((winner === 1 && playerSide === 'Left') || (winner === 2 && playerSide === 'Right')){
            text = "You Win!";
        }else{
            text = "AI Wins!";
        }
    }
    winnerText!.textContent = text;
}


const keysPressed: {[key : string] : boolean} = {};

let aiTargetY = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2; //what y position the ai is trying to move to 
const AI_REFRESH_RATE = 1000 // 1 second in milliseconds
let aiLastUpdate = 0; //timestamp of last AI update

function runAi(timestamp: number){
    
    const aiPaddle = playerSide === 'Left' ? 2 : 1;

    const ballIncoming = (aiPaddle === 1 && engine.state.ballVelocity.x < 0) || 
                         (aiPaddle === 2 && engine.state.ballVelocity.x > 0);
    
    if (timestamp - aiLastUpdate > AI_REFRESH_RATE){
        aiLastUpdate = timestamp;
        
        const ball = engine.state.ball;
        const velocity = engine.state.ballVelocity;

        if (!ballIncoming){
            //ball is moving away from ai, just go to center
            aiTargetY = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        }
        else{
            const predictedY = predictBallY(ball, velocity, aiPaddle);
            // we can add some randomness here later to make it less perfect
            // const errorMargin = 60; //120 easy
            // const randomErr = (Math.random() - 0.5) * errorMargin;
            // aiTargetY = predictedY - PADDLE_HEIGHT / 2 + randomErr; 
            aiTargetY = predictedY - PADDLE_HEIGHT / 2; // aim for center of paddle

        }
        // console.log(`ai target Y: ${Math.round(aiTargetY)}`);
    }
}

function predictBallY(ball: {x: number, y: number}, velocity: {x: number, y: number}, aiPaddle: 1 | 2): number{
    
    const paddleX = aiPaddle === 1 ? engine.state.p1.x : engine.state.p2.x;
    const distanceX = paddleX - ball.x;
    const framesToImpact = Math.abs(distanceX / velocity.x);

    let predictedY = ball.y + (velocity.y * framesToImpact);
    // now we handle bounces off top and bottom walls
    while (predictedY < 0 || predictedY > GAME_HEIGHT){
        if (predictedY < 0){
            predictedY = -predictedY; // reflect off top wall
        }else if (predictedY > GAME_HEIGHT){
            predictedY = 2 * GAME_HEIGHT - predictedY; // reflect off bottom wall
        }
    }
    return predictedY;
}

function moveAiPaddle(){

    const aiPaddle = playerSide === 'Left' ? 2 : 1;
    const currentY = aiPaddle === 1 ? engine.state.p1.y : engine.state.p2.y;
    const deadZone = 10; // 10 pixels to stop jitter, for example if aiTargetY is 5 pixels above currentY, don't move or else the paddle will jitter up and down until it reaches the target, say targer is at 100, currentY is 200, we then have to move to +-10 of target 100 before stopping, so if currentY is between 90 and 110, we stop moving

    const diff = aiTargetY - currentY;
    if (Math.abs(diff) > deadZone){
        if (diff > 0){
            engine.movePaddle(aiPaddle, "DOWN"); // used to 2 instead of aiPaddle
        }else{
            engine.movePaddle(aiPaddle, "UP"); // same here
        }
    }
}



window.addEventListener("keydown", (e) => {
    

    const activeElement = document.activeElement?.tagName.toLowerCase();
    if (activeElement === 'input') return; // ignore keydown when typing in input fields

     if (gameState === 'GAMEOVER' && e.key === 'Enter') {
        gameOverScreen!.style.display = 'none';
        mainMenu!.style.display = 'block';
        gameState = 'MENU';
    }
    
    if (["ArrowUp", "ArrowDown", "W", "w", "S", "s"].includes(e.key))
        e.preventDefault();
    keysPressed[e.key] = true;
} )

window.addEventListener("keyup", (e) =>{
    keysPressed[e.key] = false;
})

function handleInput(){
    
    if (gameMode === 'PvP' || gameMode === 'PvAI' && playerSide === 'Left' || gameMode === 'Tournament'){
        if (keysPressed["W"] || keysPressed["w"]){
            engine.movePaddle(1, "UP");
        }
        if (keysPressed["S"] || keysPressed["s"]){
            engine.movePaddle(1, "DOWN");
        }
    }
    if (gameMode === 'PvP' || gameMode === 'PvAI' && playerSide === 'Right' || gameMode === 'Tournament'){
        if (keysPressed["ArrowUp"]){
            engine.movePaddle(2, "UP");
        }
        if (keysPressed["ArrowDown"]){
            engine.movePaddle(2, "DOWN");
        }
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