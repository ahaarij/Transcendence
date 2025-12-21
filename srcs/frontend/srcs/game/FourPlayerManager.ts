import { FourPlayerEngine } from "./FourPlayerEngine";
import { FourPlayerRenderer } from "./FourPlayerRenderer";
import { FourPlayerInput } from "./FourPlayerInput";
import { PlayerSide } from "./types";
import { sendMatchResult } from "../api/game";

type GameState = 'SETUP' | 'COUNTDOWN' | 'PLAYING' | 'GAMEOVER';


export class FourPlayerManager {
    private engine: FourPlayerEngine;
    private renderer: FourPlayerRenderer;
    private input: FourPlayerInput;

    private canvas: HTMLCanvasElement;
    private container: HTMLElement;
    private gameContainer!: HTMLElement;
    private resultSent: boolean = false;
    private userId: number | null;
    private gameState: GameState = 'SETUP';
    private animationFrameId: number | null = null;
    private countdownValue: number = 3; // seconds
    private countdownTimer: number = 0;

    private handleResize = () => {
        if (this.gameContainer) {
            this.applyScaling(this.gameContainer);
        }
    };

    private onGameEnd?: () => void; // this function will be called when the game ends its purpose is to allow the parent component to handle game end events
    constructor(
        container: HTMLElement,
        playerNames: {top: string; bottom: string; left: string; right: string;},
        userId: number | null = null,
        onGameEnd? : () => void
    ){
        this.container = container;
        this.onGameEnd = onGameEnd;
        this.userId = userId;
        this.canvas = this.createCanvas();
        this.engine = new FourPlayerEngine(playerNames);
        this.renderer = new FourPlayerRenderer(this.canvas);
        this.input = new FourPlayerInput();

        this.setupEventListeners();
        this.startCountdown();
    }

    private createCanvas(): HTMLCanvasElement {
        
        const gameContainer = document.createElement('div');
        gameContainer.id = 'fourPlayerGameContainer';
        gameContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: grid;
            grid-template-areas:
                ". top ."
                "left canvas right"
                ". bottom .";
            grid-template-columns: 200px 600px 200px;
            grid-template-rows: auto 600px auto;
            align-items: center;
            gap: 20px;
        `;

        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.cssText = `
            grid-area: canvas;
            width: 600px;
            height: 600px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;
     
        const canvas = document.createElement('canvas');
        canvas.id = 'fourPlayerCanvas';
        canvas.width = 600;
        canvas.height = 600;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            border: 3px solid grey;
            background: black;
            display: block;
            box-sizing: border-box;
        `;
        canvasWrapper.appendChild(canvas);

        const sides: Array<{side: PlayerSide, gridArea: string}> = [
            {side: 'top', gridArea: 'top'},
            {side: 'bottom', gridArea: 'bottom'},
            {side: 'left', gridArea: 'left'},
            {side: 'right', gridArea: 'right'},
        ];

        sides.forEach(({side, gridArea}) => {
            const infoBox = document.createElement('div');
            infoBox.id = `info-${side}`;
            infoBox.style.cssText = `
                grid-area: ${gridArea};
                padding: 15px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 10px;
                text-align: center;
            `;
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.style.cssText = 'font-size: 20px; font-weight: bold; margin-bottom: 10px;';

            const playerLives = document.createElement('div');
            playerLives.className = 'player-lives';
            playerLives.style.cssText = 'margin-bottom: 8px;';

            const playerControls = document.createElement('div');
            playerControls.className = 'player-controls';
            playerControls.style.cssText = 'color: #888; font-size: 14px;';

            infoBox.appendChild(playerName);
            infoBox.appendChild(playerLives);
            infoBox.appendChild(playerControls);
            
            gameContainer.appendChild(infoBox);
        });
        gameContainer.appendChild(canvasWrapper);
        this.container.appendChild(gameContainer);
        this.gameContainer = gameContainer;

        this.applyScaling(gameContainer);
        window.addEventListener('resize', this.handleResize);

        return canvas;
    }

    private applyScaling(wrapper: HTMLElement): void {
        const padding = 40;
        const availableW = window.innerWidth - padding;
        const availableH = window.innerHeight - padding;
        const totalWidth = 1000;
        const totalHeight = 800;

        const scaleW = availableW / totalWidth;
        const scaleH = availableH / totalHeight;
        const scale = Math.min(scaleW, scaleH, 1);

        wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', this.handleKeyDown);
    }

    private handleKeyDown = (e: KeyboardEvent): void => {
        if (this.gameState === 'GAMEOVER' && e.key === 'Enter') {
            this.handleGameEnd();
        }
    };

    private startCountdown(): void {
        this.gameState = 'COUNTDOWN';
        this.countdownValue = 3;
        this.countdownTimer = performance.now();

        //start the game loop
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    private gameLoop = (timestamp: number): void => {
        if (this.gameState === 'COUNTDOWN') {
            this.handleCountdown(timestamp);
        } else if (this.gameState === 'PLAYING') {
            this.handleGameplay(timestamp);
        } else if (this.gameState === 'GAMEOVER') {
            this.handleGameOver();
        }
    };

    private handleCountdown(timestamp: number): void {
        this.renderer.render(this.engine.state);
        this.renderer.drawCountdown(this.countdownValue);
        this.updatePlayerInfo();
        if (timestamp - this.countdownTimer > 1000){
            this.countdownValue -= 1;
            this.countdownTimer = timestamp;
            if (this.countdownValue < 0){
                this.gameState = 'PLAYING';
            }
        }
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    private handleGameplay(timestamp: number): void {
        this.processInput();
        this.engine.update();
        this.renderer.render(this.engine.state);
        this.updatePlayerInfo();
        if (this.engine.state.winner !== null) {
            this.gameState = 'GAMEOVER';
        }

        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    private updatePlayerInfo(): void {
        const controlMap = {
            top: 'J / K',
            bottom: 'V / B',
            left: 'W / S',
            right: '↑/↓'
        };
        
        (['top', 'bottom', 'left', 'right'] as PlayerSide[]).forEach((side: PlayerSide) => {
            const infoBox = document.getElementById(`info-${side}`);
            if (!infoBox) return;

            const player = this.engine.state.players[side];
            const nameEl = infoBox.querySelector('.player-name') as HTMLElement;
            const livesEl = infoBox.querySelector('.player-lives') as HTMLElement;
            const controlsEl = infoBox.querySelector('.player-controls') as HTMLElement;

            if (nameEl) nameEl.textContent = player.name;
            if (controlsEl) controlsEl.textContent = controlMap[side];
            if (livesEl){
                if (player.isEliminated) {
                    livesEl.textContent = 'ELIMINATED';
                    livesEl.style.color = '#ff4444';
                    infoBox.style.opacity = '0.5';
                    infoBox.style.borderColor = '#444';
                } else {
                    //add red hearts for lives and black hearts for lost lives
                    livesEl.textContent = '❤️'.repeat(player.lives) + '🖤'.repeat(3 - player.lives);
                    infoBox.style.opacity = '1';
                    infoBox.style.borderColor = '#0f0';
                }
            }
        })
    }

    private processInput(): void {
        if (this.input.isPressed('top', 'left')) {
            this.engine.movePaddle('top', 'LEFT');
        }
        if (this.input.isPressed('top', 'right')) {
            this.engine.movePaddle('top', 'RIGHT');
        }
        if (this.input.isPressed('bottom', 'left')) {
            this.engine.movePaddle('bottom', 'LEFT');
        }
        if (this.input.isPressed('bottom', 'right')) {
            this.engine.movePaddle('bottom', 'RIGHT');
        }
        if (this.input.isPressed('left', 'up')) {
            this.engine.movePaddle('left', 'UP');
        }
        if (this.input.isPressed('left', 'down')) {
            this.engine.movePaddle('left', 'DOWN');
        }
        if (this.input.isPressed('right', 'up')) {
            this.engine.movePaddle('right', 'UP');
        }
        if (this.input.isPressed('right', 'down')) {
            this.engine.movePaddle('right', 'DOWN');
        }
    }


    private async sendFourPlayerMatchResult(): Promise<void> {
        if (!this.userId || !this.engine.state.winner) return; // userId is required to send match result
        
        const winnerSide = this.engine.state.winner;
        const userSide: PlayerSide = 'left'; //assuming user is always left player for now
        const didUserWin = userSide === winnerSide;
        const userLivesRemaining = this.engine.state.players[userSide].lives;

        const opponents: string[] = [];
        const sides: PlayerSide[] = ['top', 'bottom', 'right']; // all sides except left(user)
        sides.forEach(side => {
            opponents.push(this.engine.state.players[side].name);
        });

        try {
            await sendMatchResult({
                userId: this.userId,
                userSide: 1, //not relevant for 4 player mode
                opponentId: opponents.join(','), // join all opponent names
                userScore: didUserWin ? 1 : 0, // win = 1, lose = 0
                opponentScore: didUserWin ? 0 : 1,
                didUserWin: didUserWin,
                gameMode: 'FourPlayer',
                livesRemaining: userLivesRemaining,
            });
            console.log('Four player match result sent successfully');
        } catch (error) {
            console.error('Error sending four player match result:', error);
        }
    }

    private handleGameOver(): void {
        this.renderer.render(this.engine.state);
        if (this.engine.state.winner){
            const winnerName = this.engine.state.players[this.engine.state.winner].name;
            this.renderer.drawWinner(winnerName);

            if (!this.resultSent){
                this.sendFourPlayerMatchResult();
                this.resultSent = true;
            }
        }
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    private handleGameEnd(): void {
        this.destroy();
        if (this.onGameEnd) {
            this.onGameEnd();
        }
    }

    public destroy(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null; // maybe not necessary but safe
        }
        this.input.destroy();
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.handleResize);

        if (this.gameContainer && this.gameContainer.parentNode) {
            this.gameContainer.parentNode.removeChild(this.gameContainer);
        }
    }
}