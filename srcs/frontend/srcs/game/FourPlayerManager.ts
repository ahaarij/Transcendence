import { FourPlayerEngine } from "./FourPlayerEngine";
import { FourPlayerRenderer } from "./FourPlayerRenderer";
import { FourPlayerInput } from "./FourPlayerInput";

type GameState = 'SETUP' | 'COUNTDOWN' | 'PLAYING' | 'GAMEOVER';


export class FourPlayerManager {
    private engine: FourPlayerEngine;
    private renderer: FourPlayerRenderer;
    private input: FourPlayerInput;

    private canvas: HTMLCanvasElement;
    private container: HTMLElement;

    private gameState: GameState = 'SETUP';
    private animationFrameId: number | null = null;
    private countdownValue: number = 3; // seconds
    private countdownTimer: number = 0;

    private onGameEnd?: () => void; // this function will be called when the game ends its purpose is to allow the parent component to handle game end events
    constructor(
        container: HTMLElement,
        playerNames: {top: string; bottom: string; left: string; right: string;},
        onGameEnd? : () => void
    ){
        this.container = container;
        this.onGameEnd = onGameEnd;

        this.canvas = this.createCanvas();
        this.engine = new FourPlayerEngine(playerNames);
        this.renderer = new FourPlayerRenderer(this.canvas);
        this.input = new FourPlayerInput();

        this.setupEventListeners();
        this.startCountdown();
    }

    private createCanvas(): HTMLCanvasElement {
        
        const wrapper = document.createElement('div');
        wrapper.id = 'fourPlayerWrapper';
        wrapper.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
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
        wrapper.appendChild(canvas);
        this.container.appendChild(wrapper);

        this.applyScaling(wrapper);
        window.addEventListener('resize', () => this.applyScaling(wrapper));
    // this.container.appendChild(canvas);
        return canvas;
    }

    private applyScaling(wrapper: HTMLElement): void {
        const padding = 40;
        const availableW = window.innerWidth - padding;
        const availableH = window.innerHeight - padding;
        const gameSize = 600;

        const scaleW = availableW / gameSize;
        const scaleH = availableH / gameSize;
        const scale = Math.min(scaleW, scaleH);

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
        if (this.engine.state.winner !== null) {
            this.gameState = 'GAMEOVER';
        }

        this.animationFrameId = requestAnimationFrame(this.gameLoop);
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

    private handleGameOver(): void {
        this.renderer.render(this.engine.state);
        if (this.engine.state.winner){
            const winnerName = this.engine.state.players[this.engine.state.winner].name;
            this.renderer.drawWinner(winnerName);
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

        const wrapper = this.container.querySelector('#fourPlayerWrapper');
        if (wrapper && wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
        // if (this.canvas && this.canvas.parentNode) {
        //     this.canvas.parentNode.removeChild(this.canvas);
        // }
    }
}