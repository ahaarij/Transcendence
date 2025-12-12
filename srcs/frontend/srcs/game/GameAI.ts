import { PongEngine } from "./PongEngine";
import { GAME_HEIGHT } from "./types";

export class GameAI {
    private engine: PongEngine;
    private aiTargetY: number;
    private aiLastUpdate: number = 0;
    private readonly AI_REFRESH_RATE = 1000;

    constructor(engine: PongEngine) {
        this.engine = engine;
        this.aiTargetY = GAME_HEIGHT / 2 - engine.paddleHeight / 2;
    }

    public reset() {
        this.aiTargetY = GAME_HEIGHT / 2 - this.engine.paddleHeight / 2;
        this.aiLastUpdate = 0;
    }

    public update(timestamp: number, playerSide: 'Left' | 'Right') {
        this.runAi(timestamp, playerSide);
        this.moveAiPaddle(playerSide);
    }

    private runAi(timestamp: number, playerSide: 'Left' | 'Right') {
        const aiPaddle = playerSide === 'Left' ? 2 : 1;
        const ballIncoming = (aiPaddle === 1 && this.engine.state.ballVelocity.x < 0) || 
                             (aiPaddle === 2 && this.engine.state.ballVelocity.x > 0);
        
        if (timestamp - this.aiLastUpdate > this.AI_REFRESH_RATE){
            this.aiLastUpdate = timestamp;
            const ball = this.engine.state.ball;
            const velocity = this.engine.state.ballVelocity;

            if (!ballIncoming){
                this.aiTargetY = GAME_HEIGHT / 2 - this.engine.paddleHeight / 2;
            } else {
                const predictedY = this.predictBallY(ball, velocity, aiPaddle);
                this.aiTargetY = predictedY - this.engine.paddleHeight / 2;
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

    private moveAiPaddle(playerSide: 'Left' | 'Right') {
        const aiPaddle = playerSide === 'Left' ? 2 : 1;
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
}
