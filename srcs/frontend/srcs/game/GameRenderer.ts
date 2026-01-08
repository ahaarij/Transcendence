import { PongEngine } from "./PongEngine";
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, BALL_SIZE } from "./types";

export class GameRenderer {
    private context: CanvasRenderingContext2D;
    private engine: PongEngine;

    constructor(context: CanvasRenderingContext2D, engine: PongEngine) {
        this.context = context;
        this.engine = engine;
    }

    public render(displayP1name: string, displayP2name: string) {
        this.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        // Background
        this.context.fillStyle = "#1a1a1a";
        this.context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        this.drawPaddles();
        this.drawBall();
        this.drawScores(displayP1name, displayP2name);
        this.drawNet();
    }

    public drawCountdown(count: number) {
        this.context.fillStyle = "#ffffff";
        this.context.font = "120px Monospace";
        if (count > 0){
            this.context.fillText(count.toString(), GAME_WIDTH / 2 - 30, GAME_HEIGHT / 2 + 20);
            // this.context.fillText(count.toString(), (GAME_WIDTH - GAME_WIDTH / 4) - 40, GAME_HEIGHT / 2 + 30);
        }else{
            this.drawGo();
        }
    }
    
    public drawGo() {
        this.context.fillStyle = "#00ff00";
        this.context.font = "100px Monospace";

        this.context.fillText("Go!", GAME_WIDTH / 2 - 50, GAME_HEIGHT / 2 + 10);
    }

    private drawPaddles() {
        this.context.fillStyle = "white";
        this.context.fillRect(this.engine.state.p1.x, this.engine.state.p1.y, PADDLE_WIDTH, this.engine.paddleHeight);
        this.context.fillRect(this.engine.state.p2.x, this.engine.state.p2.y, PADDLE_WIDTH, this.engine.paddleHeight);
    }

    private drawBall() {
        this.context.fillStyle = "yellow";
        this.context.fillRect(this.engine.state.ball.x, this.engine.state.ball.y, BALL_SIZE, BALL_SIZE);
    }

    private drawScores(p1Name: string, p2Name: string) {
        this.context.fillStyle = "#ffffff";
        this.context.font = "30px Monospace";
        // this.context.fillText(p1Name, GAME_WIDTH / 4 - 50, 40);
        this.context.fillText(`${this.engine.state.p1score}`, GAME_WIDTH / 4 - 15, 70);
        // this.context.fillText(p2Name, (GAME_WIDTH - GAME_WIDTH / 4) - 50, 40);
        this.context.fillText(`${this.engine.state.p2score}`,  (GAME_WIDTH - GAME_WIDTH / 4) - 15, 70);
    }

    private drawNet() {
        this.context.fillStyle = "white";
        const segment = 20;
        for (let y = 10; y < GAME_HEIGHT; y += segment * 2){
            this.context.fillRect(GAME_WIDTH / 2 - 1, y, 2, segment);
        }
    }
}
