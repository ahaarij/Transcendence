import { PongEngine } from "./PongEngine";
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, BALL_SIZE } from "./types";

type GameState = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'GAMEOVER';
type VisualMatch = {p1: string | null, p2: string | null, winner: string | null};

export class GameApp {
    private container: HTMLElement;
    private engine: PongEngine;
    private canvas!: HTMLCanvasElement;
    private context!: CanvasRenderingContext2D;
    private animationFrameId: number | null = null;
    
    // State
    private gameState: GameState = 'MENU';
    private gameMode: 'PvP' | 'PvAI' | 'Tournament' = 'PvP';
    private playerSide: 'Left' | 'Right' = 'Left';
    private winningScore: number = 11;
    private countDown = 3;
    private countDownTimer = 0;
    private displayP1name = "Player 1";
    private displayP2name = "Player 2";
    private currentUsername: string;
    private keysPressed: { [key: string]: boolean } = {};

    // AI State
    private aiTargetY = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    private readonly AI_REFRESH_RATE = 1000;
    private aiLastUpdate = 0;

    // Tournament State
    private visualBracket: VisualMatch[][] = [];
    private tournamentPlayers: string[] = [];
    private tournamentBracket: {player1: string, player2: string}[] = [];
    private tournamentWinner: string[] = [];
    private currentMatchIndex = 0;
    private tournamentRound = 1;
    private tournamentSize = 4;

    // UI Elements
    private uiLayer!: HTMLElement;
    private mainMenu!: HTMLElement;
    private tournamentMenu!: HTMLElement;
    private gameOverScreen!: HTMLElement;
    private winnerText!: HTMLElement;
    private aiOptions!: HTMLElement;
    private tournamentMatchScreen!: HTMLElement;
    private championScreen!: HTMLElement;
    private tourneyError!: HTMLElement;
    private bracketScreen!: HTMLElement;

    constructor(container: HTMLElement, username: string = "Player 1") {
        this.container = container;
        this.currentUsername = username;
        this.engine = new PongEngine();
        this.init();
    }

    private init() {
        this.renderHTML();
        this.cacheElements();
        this.attachEventListeners();
        
        this.GameLoop = this.GameLoop.bind(this);
        this.animationFrameId = requestAnimationFrame(this.GameLoop);
        
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    public destroy() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
        window.removeEventListener('resize', this.resize);
    }

    private resize = () => {
        const wrapper = this.container.querySelector("#game-wrapper") as HTMLElement;
        if (!wrapper) return;

        const padding = 40; 
        const availableW = window.innerWidth - padding;
        const availableH = window.innerHeight - padding;
        
        const scaleW = availableW / GAME_WIDTH;
        const scaleH = availableH / GAME_HEIGHT;
        const scale = Math.min(scaleW, scaleH);

        wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    private renderHTML() {
        this.container.innerHTML = `
        <div id="game-wrapper" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${GAME_WIDTH}px;
            height: ${GAME_HEIGHT}px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        ">
            <canvas id="pongCanvas" width="${GAME_WIDTH}" height="${GAME_HEIGHT}" style="width: 100%; height: 100%; border: 3px solid grey; background: black; display: block; box-sizing: border-box;"></canvas>
            <div id="uiLayer" style="
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                background: rgba(0,0,0,0.85); color: white; font-family: monospace; z-index: 10;
                backdrop-filter: blur(2px);
            ">
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
                    <button id="btnStart" style="padding: 15px 40px; font-size: 24px; background: white; color: black; border: none; cursor: pointer; font-weight: bold; margin-top: 20px;">START GAME</button>
                </div>

                <div id="tournamentMenu" style="display: none; text-align: center;">
                    <h2 style="margin-bottom: 20px;">TOURNAMENT REGISTRATION</h2>
                    <div style="margin-bottom: 15px;">
                        <p style="color: #aaa; margin-bottom: 5px;">PLAYERS</p>
                        <button id="btn4Players" class="btn selected">4</button>
                        <button id="btn8Players" class="btn">8</button>
                    </div>
                    <p id="tourneyError" style="color: #ff4444; font-size: 14px; height: 20px; margin-bottom: 10px;"></p>
                    <div id="playerInputs" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;"></div>
                    <button id="btnStartTourney" class="btn" style="border-color: white;">BEGIN TOURNAMENT</button>
                    <br><br>
                    <button id="btnBack" class="btn" style="font-size: 12px; border: none;">&lt; Back</button>
                </div>

                <div id="tournamentMatchScreen" style="display: none; text-align: center;">
                    <h2 style="margin-bottom: 10px; color: #aaa;">TOURNAMENT ROUND <span id="tourneyRoundDisplay">1</span></h2>
                    <h1 id="matchupText" style="font-size: 40px; margin-bottom: 30px;">A vs B</h1>
                    <button id="btnViewBracketMatch" class="btn" style="margin-bottom: 20px; font-size: 14px; display: block; margin-left: auto; margin-right: auto;">VIEW BRACKET</button>
                    <button id="btnStartMatch" class="btn" style="border-color: #0f0; color: #0f0; padding: 15px 30px; font-size: 20px;">START MATCH</button>
                </div>

                <div id="championScreen" style="display: none; text-align: center;">
                    <h2 style="margin-bottom: 20px; color: gold;">🏆 TOURNAMENT CHAMPION 🏆</h2>
                    <h1 id="championName" style="font-size: 60px; margin-bottom: 40px; color: white;">NAME</h1>
                    <button id="btnViewBracketChamp" class="btn" style="margin-bottom: 20px;">VIEW FINAL BRACKET</button>
                    <br>
                    <button id="btnReturnMain" class="btn" style="padding: 15px 30px;">RETURN TO MENU</button>
                </div>

                <div id="bracketScreen" style="display: none; width: 100%; height: 100%; flex-direction: column; justify-content: center; align-items: center; background: rgba(0,0,0,0.95); position: absolute; top: 0; left: 0; z-index: 20;">
                    <h2 style="margin-bottom: 30px; color: #fff;">TOURNAMENT BRACKET</h2>
                    <div id="bracketContainer" style="display: flex; justify-content: center; gap: 40px; width: 90%; height: 60%;"></div>
                    <button id="btnCloseBracket" class="btn" style="margin-top: 30px; border-color: #aaa; color: #aaa;">CLOSE VIEW</button>
                </div>

                <div id="gameOverScreen" style="display: none; text-align: center;">
                    <h1 id="winnerText" style="font-size: 50px; margin-bottom: 20px; color: #0ff;">PLAYER 1 WINS</h1>
                    <p style="color: #aaa; margin-bottom: 30px;">Press ENTER to return to menu</p>
                </div>
            </div>
        </div>
        `;
    }

    private cacheElements() {
        const q = (sel: string) => this.container.querySelector(sel) as HTMLElement;
        this.canvas = this.container.querySelector("#pongCanvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d")!;
        this.uiLayer = q("#uiLayer");
        this.mainMenu = q("#mainMenu");
        this.tournamentMenu = q("#tournamentMenu");
        this.gameOverScreen = q("#gameOverScreen");
        this.winnerText = q("#winnerText");
        this.aiOptions = q("#aiOptions");
        this.tournamentMatchScreen = q("#tournamentMatchScreen");
        this.championScreen = q("#championScreen");
        this.tourneyError = q("#tourneyError");
        this.bracketScreen = q("#bracketScreen");
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        const activeElement = document.activeElement?.tagName.toLowerCase();
        if (activeElement === 'input') return;

        if (this.gameState === 'GAMEOVER' && e.key === 'Enter') {
            this.gameOverScreen.style.display = 'none';
            this.mainMenu.style.display = 'block';
            this.gameState = 'MENU';
        }
        
        if (["ArrowUp", "ArrowDown", "W", "w", "S", "s"].includes(e.key))
            e.preventDefault();
        this.keysPressed[e.key] = true;
    }

    private handleKeyUp = (e: KeyboardEvent) => {
        this.keysPressed[e.key] = false;
    }

    private attachEventListeners() {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);

        const q = (sel: string) => this.container.querySelector(sel) as HTMLElement;

        q("#btnTourney").addEventListener("click", () => {
            this.gameMode = 'Tournament';
            q("#btnTourney").classList.add("selected");
            q("#btnPvP").classList.remove("selected");
            q("#btnPvAI").classList.remove("selected");
            this.aiOptions.style.display = "none";
            this.mainMenu.style.display = "none";
            this.tournamentMenu.style.display = "block";
            this.setupTournament(this.tournamentSize);
        });

        q("#btn4Players").addEventListener("click", () => {
            this.tournamentSize = 4;
            q("#btn4Players").classList.add("selected");
            q("#btn8Players").classList.remove("selected");
            this.setupTournament(4);
        });

        q("#btn8Players").addEventListener("click", () => {
            this.tournamentSize = 8;
            q("#btn8Players").classList.add("selected");
            q("#btn4Players").classList.remove("selected");
            this.setupTournament(8);
        });

        q("#btnBack").addEventListener("click", () => {
            q("#btnTourney").classList.remove("selected");
            q("#btnPvP").classList.add("selected");
            this.gameMode = 'PvP';
            this.tournamentMenu.style.display = "none";
            this.mainMenu.style.display = "block";
        });

        q("#btnStartTourney").addEventListener("click", () => {
            this.startTournament();
        });

        q("#btnStartMatch").addEventListener("click", () => {
            this.tournamentMatchScreen.style.display = "none";
            this.uiLayer.style.display = "none";
            this.engine.setWinningScore(5);
            this.engine.restart();
            this.engine.state.winner = 0;
            this.resetInputs();
            this.gameState = 'COUNTDOWN';
            this.countDown = 3;
            this.countDownTimer = performance.now();
            this.gameMode = 'Tournament';
        });

        q("#btnReturnMain").addEventListener("click", () => {
            this.championScreen.style.display = "none";
            this.mainMenu.style.display = "block";
            this.gameState = 'MENU';
        });

        q("#btnPvP").addEventListener("click", () => {
            this.gameMode = 'PvP';
            q("#btnPvP").classList.add("selected");
            q("#btnPvAI").classList.remove("selected");
            this.aiOptions.style.display = "none";
        });

        q("#btnPvAI").addEventListener("click", () => {
            this.gameMode = 'PvAI';
            q("#btnPvAI").classList.add("selected");
            q("#btnPvP").classList.remove("selected");
            this.aiOptions.style.display = "block";
        });

        q("#btnLeft").addEventListener("click", () => {
            this.playerSide = 'Left';
            q("#btnLeft").classList.add("selected");
            q("#btnRight").classList.remove("selected");
        });

        q("#btnRight").addEventListener("click", () => {
            this.playerSide = 'Right';
            q("#btnRight").classList.add("selected");
            q("#btnLeft").classList.remove("selected");
        });

        q("#score5").addEventListener("click", () => {
            this.winningScore = 5;
            q("#score5").classList.add("selected");
            q("#score11").classList.remove("selected");
            q("#score21").classList.remove("selected");
        });

        q("#score11").addEventListener("click", () => {
            this.winningScore = 11;
            q("#score11").classList.add("selected");
            q("#score5").classList.remove("selected");
            q("#score21").classList.remove("selected");
        });

        q("#score21").addEventListener("click", () => {
            this.winningScore = 21;
            q("#score21").classList.add("selected");
            q("#score5").classList.remove("selected");
            q("#score11").classList.remove("selected");
        });

        q("#btnViewBracketMatch").addEventListener("click", () => {
            this.renderBracket();
            this.tournamentMatchScreen.style.display = "none";
            this.bracketScreen.style.display = "flex";
        });

        q("#btnViewBracketChamp").addEventListener("click", () => {
            this.renderBracket();
            this.championScreen.style.display = "none";
            this.bracketScreen.style.display = "flex";
        });

        q("#btnCloseBracket").addEventListener("click", () => {
            this.bracketScreen.style.display = "none";
            if (this.tournamentBracket.length === 1 && this.tournamentWinner.length === 1 && this.tournamentRound > 1){
                this.championScreen.style.display = "block";
            } else {
                this.tournamentMatchScreen.style.display = "block";
            }
        });

        q("#btnStart").addEventListener("click", () => {
            this.engine.setWinningScore(this.winningScore);
            this.engine.restart();
            this.mainMenu.style.display = "none";
            this.uiLayer.style.display = "none";
            this.gameOverScreen.style.display = "none";

            if (this.gameMode === 'PvP'){
                // this.displayP1name = "Player 1";
                this.displayP1name = this.currentUsername;
                this.displayP2name = "Player 2";
            } else if (this.gameMode === 'PvAI'){
                this.displayP1name = this.playerSide === 'Left' ? this.currentUsername : "AI";
                this.displayP2name = this.playerSide === 'Right' ? this.currentUsername : "AI";
            }
            
            this.aiTargetY = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
            this.aiLastUpdate = 0;
            this.countDown = 3;
            this.gameState = 'COUNTDOWN';
            this.countDownTimer = performance.now();
        });
    }

    private setupTournament(count: number) {
        const playerInput = this.container.querySelector("#playerInputs")!;
        playerInput.innerHTML = "";

        const firstInput = document.createElement("input");
        firstInput.type = "text";
        firstInput.placeholder = this.currentUsername;
        firstInput.value = this.currentUsername;
        firstInput.id = `player1`;
        playerInput.appendChild(firstInput);

        for (let i = 2; i <= count; i++){
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `Player ${i} Name`;
            input.id = `player${i}`;
            playerInput.appendChild(input);
        }
    }

    private startTournament() {
        this.tournamentPlayers = [];
        const nameSet = new Set<string>();
        for (let i = 1; i <= this.tournamentSize; i++){
            const input = this.container.querySelector(`#player${i}`) as HTMLInputElement; 
            const name = input.value.trim() || `Player ${i}`;
            if (nameSet.has(name)){
                this.tourneyError.innerText = `Error: Duplicate name "${name}". Please enter unique names.`;
                return;
            }
            nameSet.add(name);
            this.tournamentPlayers.push(name);
        }

        this.tournamentBracket = [];
        for (let i = this.tournamentPlayers.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [this.tournamentPlayers[i], this.tournamentPlayers[j]] = [this.tournamentPlayers[j], this.tournamentPlayers[i]];
        }
        
        for (let i = 0; i < this.tournamentPlayers.length; i += 2){
            this.tournamentBracket.push({player1: this.tournamentPlayers[i], player2: this.tournamentPlayers[i+1]});
        }

        this.visualBracket = [];
        let round1Matches: VisualMatch[] = [];
        for (let i = 0; i < this.tournamentPlayers.length; i += 2) {
            round1Matches.push({ p1: this.tournamentPlayers[i], p2: this.tournamentPlayers[i+1], winner: null });
        }
        this.visualBracket.push(round1Matches);

        let nextCount = round1Matches.length / 2;
        while (nextCount >= 1) {
            let roundMatches: VisualMatch[] = [];
            for (let k = 0; k < nextCount; k++) {
                roundMatches.push({ p1: "TBD", p2: "TBD", winner: null });
            }
            this.visualBracket.push(roundMatches);
            nextCount /= 2;
        }

        this.currentMatchIndex = 0;
        this.tournamentWinner = [];
        this.tournamentRound = 1;
        this.tournamentMenu.style.display = "none";
        this.prepareNextMatch();
    }

    private prepareNextMatch() {
        if (this.currentMatchIndex < this.tournamentBracket.length){
            const match = this.tournamentBracket[this.currentMatchIndex];
            (this.container.querySelector("#tourneyRoundDisplay") as HTMLElement).innerText = this.tournamentRound.toString();
            (this.container.querySelector("#matchupText") as HTMLElement).innerText = `${match.player1}  VS  ${match.player2}`;
            this.displayP1name = match.player1;
            this.displayP2name = match.player2;
            this.uiLayer.style.display = "flex";
            this.tournamentMatchScreen.style.display = "block";
            this.mainMenu.style.display = "none";
            this.gameOverScreen.style.display = "none";
        } else {
            if (this.tournamentBracket.length === 1){
                (this.container.querySelector("#championName") as HTMLElement).innerText = this.tournamentWinner[0];
                this.championScreen.style.display = "block";
                this.tournamentMatchScreen.style.display = "none";
                this.gameOverScreen.style.display = "none";
                this.uiLayer.style.display = "flex";
            } else {
                const survivors = [...this.tournamentWinner];
                this.tournamentWinner = [];
                this.tournamentBracket = [];
                for (let i = 0; i < survivors.length; i += 2){
                    this.tournamentBracket.push({player1: survivors[i], player2: survivors[i+1]});
                }
                this.currentMatchIndex = 0;
                this.tournamentRound += 1;
                this.prepareNextMatch();
            }
        }
    }

    private resetInputs() {
        for (const key in this.keysPressed) {
            this.keysPressed[key] = false;
        }
    }

    private GameLoop(timestamp: number) {
        if (this.gameState === 'COUNTDOWN'){
            this.renderGame();
            this.context.fillStyle = "Green";
            this.context.font = "100px Monospace";
            this.context.fillText(this.countDown.toString(), GAME_WIDTH / 4 - 40, GAME_HEIGHT / 2 + 30);
            this.context.fillText(this.countDown.toString(), (GAME_WIDTH - GAME_WIDTH / 4) - 40, GAME_HEIGHT / 2 + 30);
            if (timestamp - this.countDownTimer > 1000){
                this.countDown -= 1;
                this.countDownTimer = timestamp;
                if (this.countDown <= 0) {
                    this.context.fillText("Go!", GAME_WIDTH / 2 - 50, GAME_HEIGHT / 2 + 10);
                    this.gameState = 'PLAYING';
                }
            }
        }
        else if (this.gameState === 'PLAYING'){
            if (this.gameMode === 'PvAI'){
                this.runAi(timestamp);
                this.moveAiPaddle();
            }
            
            this.handleInput();
            this.engine.update();
            
            if (this.engine.state.winner !== 0){
                if (this.gameMode === 'Tournament'){
                    const match = this.tournamentBracket[this.currentMatchIndex];
                    const winnerName = this.engine.state.winner === 1 ? match.player1 : match.player2;
                    const roundIndex = this.tournamentRound - 1;
                    
                    if (this.visualBracket[roundIndex] && this.visualBracket[roundIndex][this.currentMatchIndex]) {
                        this.visualBracket[roundIndex][this.currentMatchIndex].winner = winnerName;
                    }

                    const nextRoundIndex = roundIndex + 1;
                    if (this.visualBracket[nextRoundIndex]) {
                        const nextMatchIndex = Math.floor(this.currentMatchIndex / 2);
                        const isPlayer1Slot = (this.currentMatchIndex % 2 === 0);
                        
                        if (this.visualBracket[nextRoundIndex][nextMatchIndex]) {
                            if (isPlayer1Slot) {
                                this.visualBracket[nextRoundIndex][nextMatchIndex].p1 = winnerName;
                            } else {
                                this.visualBracket[nextRoundIndex][nextMatchIndex].p2 = winnerName;
                            }
                        }
                    }
                    this.tournamentWinner.push(winnerName);
                    this.currentMatchIndex += 1;
                    this.gameState = 'MENU'; 
                    this.engine.state.winner = 0;
                    this.prepareNextMatch();
                } else {
                    this.gameState = 'GAMEOVER';
                    this.showGameOverScreen(this.engine.state.winner);
                }
            }
            this.renderGame();
        }
        else {
            this.renderGame();
        }
        this.animationFrameId = requestAnimationFrame(this.GameLoop);
    }

    private renderGame() {
        this.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.context.fillStyle = "brown";
        this.context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.drawPaddles();
        this.drawBall();
        this.drawScores();
        this.drawNet();
    }

    private drawPaddles() {
        this.context.fillStyle = "white";
        this.context.fillRect(this.engine.state.p1.x, this.engine.state.p1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
        this.context.fillRect(this.engine.state.p2.x, this.engine.state.p2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }

    private drawBall() {
        this.context.fillStyle = "yellow";
        this.context.fillRect(this.engine.state.ball.x, this.engine.state.ball.y, BALL_SIZE, BALL_SIZE);
    }

    private drawScores() {
        this.context.fillStyle = "pink";
        this.context.font = "20px Monospace";
        this.context.fillText(this.displayP1name, GAME_WIDTH / 4 - 50, 40)
        this.context.fillText(`${this.engine.state.p1score}`, GAME_WIDTH / 4 - 15, 70)
        this.context.fillText(this.displayP2name, (GAME_WIDTH - GAME_WIDTH / 4) - 50, 40)
        this.context.fillText(`${this.engine.state.p2score}`,  (GAME_WIDTH - GAME_WIDTH / 4) - 15, 70)
    }

    private drawNet() {
        this.context.fillStyle = "white";
        const segment = 20;
        for (let y = 10; y < GAME_HEIGHT; y += segment * 2){
            this.context.fillRect(GAME_WIDTH / 2 - 1, y, 2, segment)
        }
    }

    private showGameOverScreen(winner: number) {
        this.uiLayer.style.display = "flex";
        this.mainMenu.style.display = "none";
        this.gameOverScreen.style.display = "block";
        
        let text = `Player ${winner} Wins!`;
        if (this.gameMode === 'PvAI'){
            if ((winner === 1 && this.playerSide === 'Left') || (winner === 2 && this.playerSide === 'Right')){
                text = "You Win!";
            } else {
                text = "AI Wins!";
            }
        }
        this.winnerText.textContent = text;
    }

    private handleInput() {
        if (this.gameMode === 'PvP' || this.gameMode === 'PvAI' && this.playerSide === 'Left' || this.gameMode === 'Tournament'){
            if (this.keysPressed["W"] || this.keysPressed["w"]){
                this.engine.movePaddle(1, "UP");
            }
            if (this.keysPressed["S"] || this.keysPressed["s"]){
                this.engine.movePaddle(1, "DOWN");
            }
        }
        if (this.gameMode === 'PvP' || this.gameMode === 'PvAI' && this.playerSide === 'Right' || this.gameMode === 'Tournament'){
            if (this.keysPressed["ArrowUp"]){
                this.engine.movePaddle(2, "UP");
            }
            if (this.keysPressed["ArrowDown"]){
                this.engine.movePaddle(2, "DOWN");
            }
        }
    }

    private runAi(timestamp: number) {
        const aiPaddle = this.playerSide === 'Left' ? 2 : 1;
        const ballIncoming = (aiPaddle === 1 && this.engine.state.ballVelocity.x < 0) || 
                             (aiPaddle === 2 && this.engine.state.ballVelocity.x > 0);
        
        if (timestamp - this.aiLastUpdate > this.AI_REFRESH_RATE){
            this.aiLastUpdate = timestamp;
            const ball = this.engine.state.ball;
            const velocity = this.engine.state.ballVelocity;

            if (!ballIncoming){
                this.aiTargetY = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
            } else {
                const predictedY = this.predictBallY(ball, velocity, aiPaddle);
                this.aiTargetY = predictedY - PADDLE_HEIGHT / 2;
            }
        }
    }

    private predictBallY(ball: {x: number, y: number}, velocity: {x: number, y: number}, aiPaddle: 1 | 2): number {
        const paddleX = aiPaddle === 1 ? this.engine.state.p1.x : this.engine.state.p2.x;
        const distanceX = paddleX - ball.x;
        const framesToImpact = Math.abs(distanceX / velocity.x);

        let predictedY = ball.y + (velocity.y * framesToImpact);
        while (predictedY < 0 || predictedY > GAME_HEIGHT){
            if (predictedY < 0){
                predictedY = -predictedY;
            } else if (predictedY > GAME_HEIGHT){
                predictedY = 2 * GAME_HEIGHT - predictedY;
            }
        }
        return predictedY;
    }

    private moveAiPaddle() {
        const aiPaddle = this.playerSide === 'Left' ? 2 : 1;
        const currentY = aiPaddle === 1 ? this.engine.state.p1.y : this.engine.state.p2.y;
        const deadZone = 10;

        const diff = this.aiTargetY - currentY;
        if (Math.abs(diff) > deadZone){
            if (diff > 0){
                this.engine.movePaddle(aiPaddle, "DOWN");
            } else {
                this.engine.movePaddle(aiPaddle, "UP");
            }
        }
    }

    private renderBracket() {
        const container = this.container.querySelector('#bracketContainer') as HTMLElement;
        container.innerHTML = ''; 

        if (this.tournamentSize === 8) {
            container.style.width = '100%';
            container.style.transform = 'scale(0.9)'; 
        } else {
            container.style.width = '70%';
            container.style.transform = 'scale(1)';
        }

        const leftContainer = document.createElement('div');
        leftContainer.style.display = 'flex';
        leftContainer.style.flexDirection = 'row';
        leftContainer.style.alignItems = 'center';
        leftContainer.style.gap = '20px';

        const rightContainer = document.createElement('div');
        rightContainer.style.display = 'flex';
        rightContainer.style.flexDirection = 'row-reverse';
        rightContainer.style.alignItems = 'center';
        rightContainer.style.gap = '20px';

        const centerContainer = document.createElement('div');
        centerContainer.style.display = 'flex';
        centerContainer.style.flexDirection = 'column';
        centerContainer.style.justifyContent = 'center';
        centerContainer.style.alignItems = 'center';
        centerContainer.style.margin = '0 40px';
        centerContainer.style.position = 'relative'; 

        const roundsCount = this.visualBracket.length;
        const finalRoundIdx = roundsCount - 1;

        for (let r = 0; r < finalRoundIdx; r++) {
            const roundMatches = this.visualBracket[r];
            const half = Math.ceil(roundMatches.length / 2);
            const matches = roundMatches.slice(0, half);
            const col = this.createBracketColumn(matches, r, 'left');
            leftContainer.appendChild(col);
        }

        for (let r = 0; r < finalRoundIdx; r++) {
            const roundMatches = this.visualBracket[r];
            const half = Math.ceil(roundMatches.length / 2);
            const matches = roundMatches.slice(half);
            const col = this.createBracketColumn(matches, r, 'right');
            rightContainer.appendChild(col);
        }

        const finalMatch = this.visualBracket[finalRoundIdx][0];

        
        const finalBox = document.createElement('div');
        finalBox.className = 'final-box';
        finalBox.innerHTML = `
        <div style="font-size: 10px; margin-bottom: 2px;">FINAL</div>
        <div style="font-size: 14px;">${finalMatch.p1 || '?'}</div>
        <div style="font-size: 10px; color: #888;">VS</div>
        <div style="font-size: 14px;">${finalMatch.p2 || '?'}</div>
        `;
        if (finalMatch.winner) {
            finalBox.style.boxShadow = "0 0 20px rgba(255, 215, 0, 0.4)"; // gold glow effect
            finalBox.style.borderColor = "gold";
            finalBox.style.background = "#332200";
            }
        centerContainer.appendChild(finalBox);
        if (finalMatch.winner) {
            const winnerDisplay = document.createElement('div');
            winnerDisplay.style.position = 'absolute'; // Position relative to centerContainer
            winnerDisplay.style.bottom = '260px';
            winnerDisplay.style.left = '50%';
            winnerDisplay.style.width = '300%';
            winnerDisplay.style.transform = 'translateX(-50%)'; // Center horizontally by 
            // winnerDisplay.style.marginBottom = '10px'; // not needed anymore
            winnerDisplay.style.textAlign = 'center';
            winnerDisplay.style.pointerEvents = 'none';
            winnerDisplay.innerHTML = `
                <div style="font-size: 12px; color: gold; letter-spacing: 2px; margin-bottom: 5px;">TOURNAMENT WINNER</div>
                <div style="font-size: 28px; color: #fff; font-weight: bold; text-shadow: 0 0 15px gold;">
                    👑 ${finalMatch.winner} 👑
                </div>
            `;
            centerContainer.appendChild(winnerDisplay);
        }

        container.appendChild(leftContainer);
        container.appendChild(centerContainer);
        container.appendChild(rightContainer);
    }

    private createBracketColumn(matches: VisualMatch[], roundIdx: number, side: 'left'|'right') {
        const col = document.createElement('div');
        col.className = 'bracket-column';
        
        matches.forEach((match, idx) => {
            let actualMatchIdx = idx;
            if (side === 'right') {
                const totalInRound = this.visualBracket[roundIdx].length;
                const half = Math.ceil(totalInRound / 2);
                actualMatchIdx = idx + half;
            }
            const box = this.createMatchBox(match, roundIdx, actualMatchIdx);
            col.appendChild(box);
        });
        return col;
    }

    private createMatchBox(match: VisualMatch, roundIdx: number, matchIdx: number) {
        const box = document.createElement('div');
        box.className = 'match-box';
        
        const isActive = (roundIdx === this.tournamentRound - 1) && (matchIdx === this.currentMatchIndex);
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
}
