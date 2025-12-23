import { PongEngine } from "./PongEngine";
import { GAME_WIDTH, GAME_HEIGHT } from "./types";
import { sendMatchResult } from "../api/game";
import { t } from "../lang";
import { GameRenderer } from "./GameRenderer";
import { GameAI } from "./GameAI";
import { TournamentManager } from "./TournamentManager";
import { GameUI } from "./GameUI";
import { FourPlayerSetup } from "./FourPlayerSetup";
import { FourPlayerManager } from "./FourPlayerManager";

type AppFlowState = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'GAMEOVER';

export class GameApp {
    private container: HTMLElement;
    private engine: PongEngine;
    private renderer!: GameRenderer;
    private ai!: GameAI;
    private tournament!: TournamentManager;
    private fourPlayerManager: FourPlayerManager | null = null;

    private canvas!: HTMLCanvasElement;
    private context!: CanvasRenderingContext2D;
    private animationFrameId: number | null = null;

    // State
    private gameState: AppFlowState = 'MENU';
    private gameMode: 'PvP' | 'PvAI' | 'Tournament' = 'PvP';
    private playerSide: 'Left' | 'Right' = 'Left';
    private winningScore: number = 11;
    private countDown = 3;
    private countDownTimer = 0;
    private displayP1name = "Player 1";
    private displayP2name = "Player 2";
    private currentUsername: string;
    private userId: number | null = null;
    private keysPressed: { [key: string]: boolean } = {};
    private pending4PlayerNames: {top: string; bottom: string; left: string; right: string;} | null = null;

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
    private customizationMenu!: HTMLElement;

    constructor(container: HTMLElement, username: string = "Player 1", userId: number | null) {
        this.container = container;
        this.currentUsername = username;
        this.userId = userId;
        this.engine = new PongEngine();
        this.tournament = new TournamentManager();
        this.init();
    }

    private init() {
        this.renderHTML();
        this.cacheElements();

        this.renderer = new GameRenderer(this.context, this.engine);
        this.ai = new GameAI(this.engine);

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
        this.container.innerHTML = GameUI.getHTML();
    }

    private cacheElements() {
        const q = (sel: string) => this.container.querySelector(sel) as HTMLElement;
        this.canvas = this.container.querySelector("#pongCanvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d")!;
        this.uiLayer = q("#uiLayer");
        this.mainMenu = q("#mainMenu");
        this.customizationMenu = q("#customizationMenu");
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
            this.tournament.setupTournament(this.tournament.tournamentSize, this.currentUsername, this.container);
        });

        q("#btn4Players").addEventListener("click", () => {
            this.tournament.tournamentSize = 4;
            q("#btn4Players").classList.add("selected");
            q("#btn8Players").classList.remove("selected");
            this.tournament.setupTournament(4, this.currentUsername, this.container);
        });

        q("#btn8Players").addEventListener("click", () => {
            this.tournament.tournamentSize = 8;
            q("#btn8Players").classList.add("selected");
            q("#btn4Players").classList.remove("selected");
            this.tournament.setupTournament(8, this.currentUsername, this.container);
        });

        q("#btnBack").addEventListener("click", () => {
            q("#btnTourney").classList.remove("selected");
            q("#btnPvP").classList.add("selected");
            this.gameMode = 'PvP';
            this.tournamentMenu.style.display = "none";
            this.mainMenu.style.display = "block";
        });

        q("#btnStartTourney").addEventListener("click", () => {
            if (this.tournament.startTournament(this.container)) {
                this.tournamentMenu.style.display = "none";
                this.customizationMenu.style.display = "block";
            }
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

        q("#btnMultiplayer").addEventListener("click", () => {
            this.mainMenu.style.display = "none";
            new FourPlayerSetup(
                this.container,
                this.currentUsername,
                (names) => {
                    this.pending4PlayerNames = names;
                    this.customizationMenu.style.display = "block";
                },
                () => {
                        const q = (sel: string) => this.container.querySelector(sel) as HTMLElement;
                        q("#btnPvP").classList.add("selected");
                        q("#btnPvAI").classList.remove("selected");
                        q("#btnTourney").classList.remove("selected");
                        q("#btnMultiplayer").classList.remove("selected");
                        this.gameMode = 'PvP';
                        this.mainMenu.style.display = "block";
                }
            );
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
            this.tournament.renderBracket(this.container);
            this.tournamentMatchScreen.style.display = "none";
            this.bracketScreen.style.display = "flex";
        });

        q("#btnViewBracketChamp").addEventListener("click", () => {
            this.tournament.renderBracket(this.container);
            this.championScreen.style.display = "none";
            this.bracketScreen.style.display = "flex";
        });

        q("#btnCloseBracket").addEventListener("click", () => {
            this.bracketScreen.style.display = "none";
            if (this.tournament.tournamentBracket.length === 1 && this.tournament.tournamentWinner.length === 1 && this.tournament.tournamentRound > 1) {
                this.championScreen.style.display = "block";
            } else {
                this.tournamentMatchScreen.style.display = "block";
            }
        });

        q("#btnStart").addEventListener("click", () => {
            this.mainMenu.style.display = "none";
            this.customizationMenu.style.display = "block";
        });

        const paddleSlider = q("#paddleSizeSlider") as HTMLInputElement;
        const paddleInput = q("#paddleSizeInput") as HTMLInputElement;
        const ballSlider = q("#ballSpeedSlider") as HTMLInputElement;
        const ballInput = q("#ballSpeedInput") as HTMLInputElement;
        const paddleVal = q("#paddleSizeVal");
        const ballVal = q("#ballSpeedVal");

        const sync = (source: HTMLInputElement, target: HTMLInputElement, display: HTMLElement) => {
            let val = parseFloat(source.value);
            const min = parseFloat(source.min);
            const max = parseFloat(source.max);

            if (val < min) val = min;
            if (val > max) val = max;

            if (source.type === 'number') {
                source.value = val.toString();
            }

            target.value = val.toString();
            display.textContent = val.toString();
        };

        paddleSlider.addEventListener("input", () => sync(paddleSlider, paddleInput, paddleVal));
        paddleInput.addEventListener("change", () => sync(paddleInput, paddleSlider, paddleVal));
        ballSlider.addEventListener("input", () => sync(ballSlider, ballInput, ballVal));
        ballInput.addEventListener("change", () => sync(ballInput, ballSlider, ballVal));

        q("#btnBackCustom").addEventListener("click", () => {
            this.customizationMenu.style.display = "none";
            this.mainMenu.style.display = "block";
        });

        q("#btnPlay").addEventListener("click", () => {
            const pHeight = parseInt(paddleInput.value);
            const bSpeed = parseFloat(ballInput.value);

            this.customizationMenu.style.display = "none";

            if (this.pending4PlayerNames) {
                this.start4playerGame(this.pending4PlayerNames, pHeight, bSpeed);
                this.pending4PlayerNames = null;
                return;
            }

            this.engine.setGameParameters(pHeight, bSpeed);
            this.engine.setWinningScore(this.winningScore);
            this.engine.restart();

            if (this.gameMode === 'Tournament') {
                this.prepareNextMatch();
                return;
            }

            this.uiLayer.style.display = "none";
            this.gameOverScreen.style.display = "none";

            if (this.gameMode === 'PvP') {
                this.displayP1name = this.currentUsername;
                this.displayP2name = "Player 2";
            } else if (this.gameMode === 'PvAI') {
                this.displayP1name = this.playerSide === 'Left' ? this.currentUsername : "AI";
                this.displayP2name = this.playerSide === 'Right' ? this.currentUsername : "AI";
            }

            this.ai.reset();
            this.countDown = 3;
            this.gameState = 'COUNTDOWN';
            this.countDownTimer = performance.now();
        });
    }

    private prepareNextMatch() {
        if (this.tournament.currentMatchIndex < this.tournament.tournamentBracket.length) {
            const match = this.tournament.tournamentBracket[this.tournament.currentMatchIndex];
            (this.container.querySelector("#tourneyRoundDisplay") as HTMLElement).innerText = this.tournament.tournamentRound.toString();
            (this.container.querySelector("#matchupText") as HTMLElement).innerText = `${match.player1}  VS  ${match.player2}`;
            this.displayP1name = match.player1;
            this.displayP2name = match.player2;
            this.uiLayer.style.display = "flex";
            this.tournamentMatchScreen.style.display = "block";
            this.mainMenu.style.display = "none";
            this.gameOverScreen.style.display = "none";
        } else {
            if (this.tournament.tournamentBracket.length === 1) {
                (this.container.querySelector("#championName") as HTMLElement).innerText = this.tournament.tournamentWinner[0];
                this.championScreen.style.display = "block";
                this.tournamentMatchScreen.style.display = "none";
                this.gameOverScreen.style.display = "none";
                this.uiLayer.style.display = "flex";
                const q = (sel: string) => this.container.querySelector(sel) as HTMLElement;
                q("#btnPvP").classList.add("selected");
                q("#btnPvAI").classList.remove("selected");
                q("#btnTourney").classList.remove("selected");
                q("#btnMultiplayer").classList.remove("selected");
                this.gameMode = 'PvP';
            } else {
                const survivors = [...this.tournament.tournamentWinner];
                this.tournament.tournamentWinner = [];
                this.tournament.tournamentBracket = [];
                for (let i = 0; i < survivors.length; i += 2) {
                    this.tournament.tournamentBracket.push({ player1: survivors[i], player2: survivors[i + 1] });
                }
                this.tournament.currentMatchIndex = 0;
                this.tournament.tournamentRound += 1;
                this.prepareNextMatch();
            }
        }
    }

    private resetInputs() {
        for (const key in this.keysPressed) {
            this.keysPressed[key] = false;
        }
    }

    private async handleMatchEnd() {
        if (!this.userId) {
            console.warn("User ID not available. Cannot send match result.");
            return;
        }

        try {
            let userSide: 1 | 2;
            let userScore: number;
            let opponentScore: number;
            let didUserWin: boolean;
            let opponentId: string;

            if (this.gameMode === 'PvAI') {
                userSide = this.playerSide === 'Left' ? 1 : 2;
                opponentId = 'AI';
                if (userSide === 1) {
                    userScore = this.engine.state.p1score;
                    opponentScore = this.engine.state.p2score;
                } else {
                    userScore = this.engine.state.p2score;
                    opponentScore = this.engine.state.p1score;
                }
                didUserWin = userScore > opponentScore;
            } else {
                userSide = 1;
                opponentId = this.displayP2name;
                userScore = this.engine.state.p1score;
                opponentScore = this.engine.state.p2score;
                didUserWin = userScore > opponentScore;
            }

            await sendMatchResult({
                userId: this.userId,
                opponentId: opponentId,
                userSide: userSide,
                userScore: userScore,
                opponentScore: opponentScore,
                didUserWin: didUserWin,
                gameMode: this.gameMode,
            });
            console.log("Match result sent successfully.");
        } catch (error) {
            console.error("Error sending match result:", error);
        }

    }
    private async handleTournamentEnd(player1: string, player2: string, winner: string) {
        if (!this.userId) {
            return;
        }

        try {
            const userIsPlayer1 = player1 === this.currentUsername;
            const userSide = userIsPlayer1 ? 1 : 2;
            const userScore = userIsPlayer1 ? this.engine.state.p1score : this.engine.state.p2score;
            const opponentScore = userIsPlayer1 ? this.engine.state.p2score : this.engine.state.p1score;
            const didUserWin = (userSide === 1 && winner === player1) || (userSide === 2 && winner === player2);
            const opponentId = userIsPlayer1 ? player2 : player1;

            await sendMatchResult({
                userId: this.userId,
                opponentId: opponentId,
                userSide: userSide,
                userScore: userScore,
                opponentScore: opponentScore,
                didUserWin: didUserWin,
                gameMode: this.gameMode,
                tournamentRound: this.tournament.tournamentRound,
                tournamentSize: this.tournament.tournamentSize,
                isEliminated: !didUserWin,
            });
            console.log("Tournament match result sent successfully.");
        } catch (error) {
            console.error("Error sending tournament match result:", error);
        }
    }

    private GameLoop(timestamp: number) {
        if (this.gameState === 'COUNTDOWN') {
            this.renderer.render(this.displayP1name, this.displayP2name);
            this.renderer.drawCountdown(this.countDown);

            if (timestamp - this.countDownTimer > 1000) {
                this.countDown -= 1;
                this.countDownTimer = timestamp;
                if (this.countDown < 0) {
                    // this.renderer.drawGo();
                    this.gameState = 'PLAYING';
                }
            }
        }
        else if (this.gameState === 'PLAYING') {
            if (this.gameMode === 'PvAI') {
                this.ai.update(timestamp, this.playerSide);
            }

            this.handleInput();
            this.engine.update();

            if (this.engine.state.winner !== 0) {
                if (this.gameMode === 'Tournament') {
                    const match = this.tournament.tournamentBracket[this.tournament.currentMatchIndex];
                    const winnerName = this.engine.state.winner === 1 ? match.player1 : match.player2;
                    const roundIndex = this.tournament.tournamentRound - 1;

                    if (this.tournament.visualBracket[roundIndex] && this.tournament.visualBracket[roundIndex][this.tournament.currentMatchIndex]) {
                        this.tournament.visualBracket[roundIndex][this.tournament.currentMatchIndex].winner = winnerName;
                    }

                    const nextRoundIndex = roundIndex + 1;
                    if (this.tournament.visualBracket[nextRoundIndex]) {
                        const nextMatchIndex = Math.floor(this.tournament.currentMatchIndex / 2);
                        const isPlayer1Slot = (this.tournament.currentMatchIndex % 2 === 0);

                        if (this.tournament.visualBracket[nextRoundIndex][nextMatchIndex]) {
                            if (isPlayer1Slot) {
                                this.tournament.visualBracket[nextRoundIndex][nextMatchIndex].p1 = winnerName;
                            } else {
                                this.tournament.visualBracket[nextRoundIndex][nextMatchIndex].p2 = winnerName;
                            }
                        }
                    }
                    this.handleTournamentEnd(match.player1, match.player2, winnerName);
                    this.tournament.tournamentWinner.push(winnerName);
                    this.tournament.currentMatchIndex += 1;
                    this.gameState = 'MENU';
                    this.engine.state.winner = 0;
                    this.prepareNextMatch();
                } else {
                    this.handleMatchEnd();
                    this.gameState = 'GAMEOVER';
                    this.showGameOverScreen(this.engine.state.winner);
                }
            }
            this.renderer.render(this.displayP1name, this.displayP2name);
        }
        else {
            this.renderer.render(this.displayP1name, this.displayP2name);
        }
        this.animationFrameId = requestAnimationFrame(this.GameLoop);
    }

    private showGameOverScreen(winner: number) {
        this.uiLayer.style.display = "flex";
        this.mainMenu.style.display = "none";
        this.gameOverScreen.style.display = "block";

        let text = `${t("player_name_placeholder")} ${winner} ${t("wins")}`;
        if (this.gameMode === 'PvAI') {
            if ((winner === 1 && this.playerSide === 'Left') || (winner === 2 && this.playerSide === 'Right')) {
                text = t("you_win");
            } else {
                text = t("ai_wins");
            }
        }
        this.winnerText.textContent = text;
    }

    private handleInput() {
        if (this.gameMode === 'PvP' || this.gameMode === 'PvAI' && this.playerSide === 'Left' || this.gameMode === 'Tournament') {
            if (this.keysPressed["W"] || this.keysPressed["w"]) {
                this.engine.movePaddle(1, "UP");
            }
            if (this.keysPressed["S"] || this.keysPressed["s"]) {
                this.engine.movePaddle(1, "DOWN");
            }
        }
        if (this.gameMode === 'PvP' || this.gameMode === 'PvAI' && this.playerSide === 'Right' || this.gameMode === 'Tournament') {
            if (this.keysPressed["ArrowUp"]) {
                this.engine.movePaddle(2, "UP");
            }
            if (this.keysPressed["ArrowDown"]) {
                this.engine.movePaddle(2, "DOWN");
            }
        }
    }

    private start4playerGame(names: {top: string; bottom: string; left: string; right: string;}, paddleLength?: number, ballSpeed?: number) {
        this.uiLayer.style.display = "none";
        this.canvas.style.display = "none";
        this.fourPlayerManager = new FourPlayerManager(
            this.container,
            names,
            this.userId,
            () => {
                if (this.fourPlayerManager) {
                    this.fourPlayerManager.destroy();
                    this.fourPlayerManager = null;
                }
                this.canvas.style.display = "block";
                this.uiLayer.style.display = "flex";
                this.mainMenu.style.display = "block";

                const q = (sel: string) => this.container.querySelector(sel) as HTMLElement;
                q("#btnPvP").classList.add("selected");
                q("#btnPvAI").classList.remove("selected");
                q("#btnTourney").classList.remove("selected");
                q("#btnMultiplayer").classList.remove("selected");
                this.gameMode = 'PvP';
            },
            paddleLength,
            ballSpeed
        );
    }
}
