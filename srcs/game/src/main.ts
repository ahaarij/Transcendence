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
                <p style="margin-bottom: 5px; color: #aaa;">PLAYER SIDE</p>
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
            <!-- Error Message Area -->
            <p id="tourneyError" style="color: #ff4444; font-size: 14px; height: 20px; margin-bottom: 10px;"></p>

            <div id="playerInputs" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;"></div>
            <button id="btnStartTourney" class="btn" style="border-color: white;">BEGIN TOURNAMENT</button>
            <br><br>
            <button id="btnBack" class="btn" style="font-size: 12px; border: none;">&lt; Back</button>
        </div>

        <!-- TOURNAMENT MATCH READY SCREEN -->
        <div id="tournamentMatchScreen" style="display: none; text-align: center;">
            <h2 style="margin-bottom: 10px; color: #aaa;">TOURNAMENT ROUND <span id="tourneyRoundDisplay">1</span></h2>
            <h1 id="matchupText" style="font-size: 40px; margin-bottom: 30px;">A vs B</h1>
            <!-- BUTTONS -->
            <button id="btnViewBracketMatch" class="btn" style="margin-bottom: 20px; font-size: 14px; display: block; margin-left: auto; margin-right: auto;">VIEW BRACKET</button>
            <button id="btnStartMatch" class="btn" style="border-color: #0f0; color: #0f0; padding: 15px 30px; font-size: 20px;">START MATCH</button>
        </div>

         <!-- TOURNAMENT CHAMPION SCREEN -->
        <div id="championScreen" style="display: none; text-align: center;">
            <h2 style="margin-bottom: 20px; color: gold;">🏆 TOURNAMENT CHAMPION 🏆</h2>
            <h1 id="championName" style="font-size: 60px; margin-bottom: 40px; color: white;">NAME</h1>

            <button id="btnViewBracketChamp" class="btn" style="margin-bottom: 20px;">VIEW FINAL BRACKET</button>
            <br>
            <button id="btnReturnMain" class="btn" style="padding: 15px 30px;">RETURN TO MENU</button>
        </div>

         <!-- BRACKET SCREEN -->
        <div id="bracketScreen" style="display: none; width: 100%; height: 100%; flex-direction: column; justify-content: center; align-items: center; background: rgba(0,0,0,0.95); position: absolute; top: 0; left: 0; z-index: 20;">
            <h2 style="margin-bottom: 30px; color: #fff;">TOURNAMENT BRACKET</h2>
            <div id="bracketContainer" style="display: flex; justify-content: center; gap: 40px; width: 90%; height: 60%;"></div>
            <button id="btnCloseBracket" class="btn" style="margin-top: 30px; border-color: #aaa; color: #aaa;">CLOSE VIEW</button>
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
    
    /* BRACKET STYLES */
    .bracket-column { display: flex; flex-direction: column; justify-content: space-around; height: 100%; align-items: center; }
    
    .match-box { 
        background: #222; border: 1px solid #555; width: 120px; 
        text-align: center; position: relative; margin: 5px 0; z-index: 2;
    }
    .match-box.active { border-color: #0f0; box-shadow: 0 0 8px rgba(0, 255, 0, 0.4); }
    
    .player-slot { padding: 4px; border-bottom: 1px solid #444; font-size: 11px; height: 18px; display: flex; align-items: center; justify-content: center; overflow: hidden; white-space: nowrap; }
    .player-slot:last-child { border-bottom: none; }
    .player-slot.winner { background: #004400; color: #fff; font-weight: bold; }
    
    .final-box { border: 2px solid gold; padding: 10px; width: 140px; text-align: center; color: gold; background: #220000; font-weight: bold; z-index: 2; }
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
let displayP1name = "Player 1";
let displayP2name = "Player 2";

type VisualMatch = {p1: string | null, p2: string | null, winner: string | null};
let visualBracket: VisualMatch[][] = []; // 2D array for rounds and matches

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
const tournamentMatchScreen = document.getElementById("tournamentMatchScreen");
const championScreen = document.getElementById("championScreen");
const tourneyError = document.getElementById("tourneyError");
const bracketScreen = document.getElementById("bracketScreen");


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
    const nameSet = new Set<string>();
    for (let i = 1; i <= tournamentSize; i++){
        const input = document.getElementById(`player${i}`) as HTMLInputElement; 
        const name = input.value.trim() || `Player ${i}`; // this means if no name is entered, use default)
        if (nameSet.has(name)){
            tourneyError!.innerText = `Error: Duplicate name "${name}". Please enter unique names.`;
            return;
        }
        nameSet.add(name);
        tournamentPlayers.push(name);
    }

    tournamentBracket = [];
    
    //shuffle players
    for (let i = tournamentPlayers.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [tournamentPlayers[i], tournamentPlayers[j]] = [tournamentPlayers[j], tournamentPlayers[i]];
    }
    
    //pair players into matches
    for (let i = 0; i < tournamentPlayers.length; i += 2){
        //ok we need to pair players into matches, add shuffling later
        tournamentBracket.push({player1: tournamentPlayers[i], player2: tournamentPlayers[i+1]});
    }

    visualBracket = [];
    
    // Round 1 (Filled)
    let round1Matches: VisualMatch[] = [];
    for (let i = 0; i < tournamentPlayers.length; i += 2) {
        round1Matches.push({ p1: tournamentPlayers[i], p2: tournamentPlayers[i+1], winner: null });
    }
    visualBracket.push(round1Matches);

    // Future Rounds (Empty Placeholders)
    let nextCount = round1Matches.length / 2;
    while (nextCount >= 1) {
        let roundMatches: VisualMatch[] = [];
        for (let k = 0; k < nextCount; k++) {
            roundMatches.push({ p1: "TBD", p2: "TBD", winner: null });
        }
        visualBracket.push(roundMatches);
        nextCount /= 2;
    }

    currentMatchIndex = 0;
    tournamentWinner = [];
    tournamentRound = 1;
    tournamentMenu!.style.display = "none";
    prepareNextMatch();
});

function prepareNextMatch(){
    if (currentMatchIndex < tournamentBracket.length){
        const match = tournamentBracket[currentMatchIndex];
        document.getElementById("tourneyRoundDisplay")!.innerText = tournamentRound.toString();
        document.getElementById("matchupText")!.innerText = `${match.player1}  VS  ${match.player2}`;
        displayP1name = match.player1;
        displayP2name = match.player2;
        uiLayer!.style.display = "flex";
        tournamentMatchScreen!.style.display = "block";
        mainMenu!.style.display = "none";
        gameOverScreen!.style.display = "none";
        
    }
    else{
        //tournament over
        if (tournamentBracket.length === 1){
            document.getElementById("championName")!.innerText = tournamentWinner[0];
            championScreen!.style.display = "block";
            tournamentMatchScreen!.style.display = "none";
            gameOverScreen!.style.display = "none";
            uiLayer!.style.display = "flex";
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
            prepareNextMatch();
        }
        // gameState = 'MENU';
        // tournamentMenu!.style.display = "none";
        // mainMenu!.style.display = "block";
    }
}

document.getElementById("btnStartMatch")!.addEventListener("click", () => {
    tournamentMatchScreen!.style.display = "none";
    uiLayer!.style.display = "none";

    engine.setWinningScore(5); // shorter matches for tournament
    engine.restart();
    engine.state.winner = 0; // reset winner
    resetInputs();
    gameState = 'COUNTDOWN';
    countDown = 3;
    countDownTimer = performance.now();
    gameMode = 'Tournament';
    // aiLastUpdate = 0;
    // aiTargetY = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
});

// Return to main menu from champion screen
document.getElementById("btnReturnMain")!.addEventListener("click", () => {
    championScreen!.style.display = "none";
    mainMenu!.style.display = "block";
    gameState = 'MENU';
});

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


function renderBracket() {
    const container = document.getElementById('bracketContainer')!;
    container.innerHTML = ''; 

    // Adjust width for 8 players
    if (tournamentSize === 8) {
        container.style.width = '100%';
        container.style.transform = 'scale(0.9)'; 
    } else {
        container.style.width = '70%';
        container.style.transform = 'scale(1)';
    }

    // --- LEFT BRANCH ---
    const leftContainer = document.createElement('div');
    leftContainer.style.display = 'flex';
    leftContainer.style.flexDirection = 'row';
    leftContainer.style.alignItems = 'center';
    leftContainer.style.gap = '20px'; // Replaced lines with gaps

    // --- RIGHT BRANCH ---
    const rightContainer = document.createElement('div');
    rightContainer.style.display = 'flex';
    rightContainer.style.flexDirection = 'row-reverse'; // Mirror image
    rightContainer.style.alignItems = 'center';
    rightContainer.style.gap = '20px';

    // --- CENTER (Finals) ---
    const centerContainer = document.createElement('div');
    // FIX: Center content vertically
    centerContainer.style.display = 'flex';
    centerContainer.style.flexDirection = 'column';
    centerContainer.style.justifyContent = 'center';
    centerContainer.style.margin = '0 40px'; 

    const roundsCount = visualBracket.length;
    const finalRoundIdx = roundsCount - 1;

    // Build Left Side
    for (let r = 0; r < finalRoundIdx; r++) {
        const roundMatches = visualBracket[r];
        const half = Math.ceil(roundMatches.length / 2);
        const matches = roundMatches.slice(0, half);
        
        const col = createBracketColumn(matches, r, 'left');
        leftContainer.appendChild(col);
    }

    // Build Right Side
    for (let r = 0; r < finalRoundIdx; r++) {
        const roundMatches = visualBracket[r];
        const half = Math.ceil(roundMatches.length / 2);
        const matches = roundMatches.slice(half);
        
        const col = createBracketColumn(matches, r, 'right');
        rightContainer.appendChild(col);
    }

    // Build Center (Finals)
    const finalMatch = visualBracket[finalRoundIdx][0];
    const finalBox = document.createElement('div');
    finalBox.className = 'final-box';
    finalBox.innerHTML = `
        <div style="font-size: 10px; margin-bottom: 2px;">FINAL</div>
        <div style="font-size: 14px;">${finalMatch.p1 || '?'}</div>
        <div style="font-size: 10px; color: #888;">VS</div>
        <div style="font-size: 14px;">${finalMatch.p2 || '?'}</div>
    `;
    if (finalMatch.winner) {
        finalBox.innerHTML += `<div style="margin-top: 5px; color: gold;">👑 ${finalMatch.winner}</div>`;
    }
    centerContainer.appendChild(finalBox);

    // Assemble
    container.appendChild(leftContainer);
    container.appendChild(centerContainer);
    container.appendChild(rightContainer);
}
document.getElementById("btnViewBracketMatch")!.addEventListener("click", () => {
    renderBracket();
    tournamentMatchScreen!.style.display = "none";
    bracketScreen!.style.display = "flex";
});

function createBracketColumn(matches: VisualMatch[], roundIdx: number, side: 'left'|'right') {
    const col = document.createElement('div');
    col.className = 'bracket-column';
    
    matches.forEach((match, idx) => {
        let actualMatchIdx = idx;
        if (side === 'right') {
            const totalInRound = visualBracket[roundIdx].length;
            const half = Math.ceil(totalInRound / 2);
            actualMatchIdx = idx + half;
        }

        const box = createMatchBox(match, roundIdx, actualMatchIdx);
        col.appendChild(box);
    });
    return col;
}

function createMatchBox(match: VisualMatch, roundIdx: number, matchIdx: number) {
    const box = document.createElement('div');
    box.className = 'match-box';
    
    const isActive = (roundIdx === tournamentRound - 1) && (matchIdx === currentMatchIndex);
    if (isActive) box.classList.add('active');

    const p1 = document.createElement('div');
    p1.className = 'player-slot';
    p1.innerText = match.p1 || 'TBD';
    if (match.winner === match.p1 && match.winner) p1.classList.add('winner');

    const p2 = document.createElement('div');
    p2.className = 'player-slot';
    p2.innerText = match.p2 || 'TBD';
    if (match.winner === match.p2 && match.winner) p2.classList.add('winner');

    box.appendChild(p1);
    box.appendChild(p2);
    return box;
}

document.getElementById("btnViewBracketChamp")!.addEventListener("click", () => {
    renderBracket();
    championScreen!.style.display = "none";
    bracketScreen!.style.display = "flex";
});

document.getElementById("btnCloseBracket")!.addEventListener("click", () => {
    bracketScreen!.style.display = "none";
    if (tournamentBracket.length === 1 && tournamentWinner.length === 1 && tournamentRound > 1){
        championScreen!.style.display = "block";
    }else{
        tournamentMatchScreen!.style.display = "block";
    }
});

document.getElementById("btnStart")!.addEventListener("click", () => {
    engine.setWinningScore(winningScore);
    engine.restart();
    
    mainMenu!.style.display = "none";
    uiLayer!.style.display = "none";
    gameOverScreen!.style.display = "none";

    if (gameMode === 'PvP'){
        displayP1name = "Player 1";
        displayP2name = "Player 2";
    } else if (gameMode === 'PvAI'){
        displayP1name = playerSide === 'Left' ? "Player" : "AI";
        displayP2name = playerSide === 'Right' ? "Player" : "AI";
    }
    
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
                
                const roundIndex = tournamentRound - 1;
                
                if (visualBracket[roundIndex] && visualBracket[roundIndex][currentMatchIndex]) {
                    visualBracket[roundIndex][currentMatchIndex].winner = winnerName;
                }

                // 2. Advance winner to the NEXT round's slot
                // The next round is at roundIndex + 1
                // The match index in the next round is floor(currentMatchIndex / 2)
                // If currentMatchIndex is even (0, 2), they go to P1 slot. If odd (1, 3), they go to P2 slot.
                const nextRoundIndex = roundIndex + 1;
                if (visualBracket[nextRoundIndex]) {
                    const nextMatchIndex = Math.floor(currentMatchIndex / 2);
                    const isPlayer1Slot = (currentMatchIndex % 2 === 0);
                    
                    if (visualBracket[nextRoundIndex][nextMatchIndex]) {
                        if (isPlayer1Slot) {
                            visualBracket[nextRoundIndex][nextMatchIndex].p1 = winnerName;
                        } else {
                            visualBracket[nextRoundIndex][nextMatchIndex].p2 = winnerName;
                        }
                    }
                }
                tournamentWinner.push(winnerName);
                currentMatchIndex += 1;
                gameState = 'MENU'; 
                engine.state.winner = 0; // reset winner for next match
                prepareNextMatch();
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
const AI_REFRESH_RATE = 1000; // 1 second in milliseconds
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
    context.fillText(displayP1name, GAME_WIDTH / 4 - 50, 40)
    context.fillText(`${engine.state.p1score}`, GAME_WIDTH / 4 - 15, 70)
    context.fillText(displayP2name, (GAME_WIDTH - GAME_WIDTH / 4) - 50, 40)
    context.fillText(`${engine.state.p2score}`,  (GAME_WIDTH - GAME_WIDTH / 4) - 15, 70)
}

function drawNet(){
    context.fillStyle = "white";
    const segment = 20;
    for (let y = 10; y < GAME_HEIGHT; y += segment * 2){
        context.fillRect(GAME_WIDTH / 2 - 1, y, 2, segment)
    }
}