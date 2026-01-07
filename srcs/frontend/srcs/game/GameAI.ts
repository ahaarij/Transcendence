import { PongEngine } from "./PongEngine";
import { GAME_HEIGHT } from "./types";

export type AIDifficulty = 'Easy' | 'Medium' | 'Hard';

export class GameAI {
    private engine: PongEngine;
    private aiTargetY: number;
    private aiLastUpdate: number = 0;
    private readonly AI_REFRESH_RATE = 1000;
    private difficulty: AIDifficulty = 'Medium';

    constructor(engine: PongEngine) {
        this.engine = engine;
        this.aiTargetY = GAME_HEIGHT / 2 - engine.paddleHeight / 2;
    }

    public setDifficulty(difficulty: AIDifficulty) {
        this.difficulty = difficulty;
    }

    public reset() {
        this.aiTargetY = GAME_HEIGHT / 2 - this.engine.paddleHeight / 2;
        this.aiLastUpdate = 0;
    }

    public adjustForPause(pauseDuration: number) {
        this.aiLastUpdate += pauseDuration;
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
                let predictedY = this.predictBallY(ball, velocity, aiPaddle);

                if (this.difficulty === 'Easy'){
                    const errorMargin = 80; // maybe make it 90/100 later
                    const randomError = (Math.random() - 0.5) * 2 * errorMargin;
                    predictedY += randomError;
                }
                else if (this.difficulty === 'Hard'){
                    const playerPaddle = playerSide === 'Left' ? 1 : 2;
                    const playerY = playerPaddle === 1 ? this.engine.state.p1.y : this.engine.state.p2.y;
                    const playerCenter = playerY + this.engine.paddleHeight / 2;

                    const aiY = aiPaddle === 1 ? this.engine.state.p1.y : this.engine.state.p2.y;
                    const aiCenter = aiY + this.engine.paddleHeight / 2;
                    const screenCenter = GAME_HEIGHT / 2;
                    const cornerThreshold = GAME_HEIGHT * 0.25;
                    const playerInTopCorner = playerCenter < cornerThreshold;
                    const playerInBottomCorner = playerCenter > (GAME_HEIGHT - cornerThreshold);
                    const playerInCenterZone = !playerInTopCorner && !playerInBottomCorner;
                    const aiInTop = aiCenter < cornerThreshold;
                    const aiInBottom = aiCenter > (GAME_HEIGHT - cornerThreshold);
                    
                    const aimOffset = this.engine.paddleHeight * 0.35;
                    const oppositeCorners = (playerInTopCorner && aiInBottom) || (playerInBottomCorner && aiInTop);
                    if (!oppositeCorners){
                        if (playerCenter > GAME_HEIGHT / 2){
                            predictedY += aimOffset;
                        } else {
                            predictedY -= aimOffset;
                        }
                    }
                }
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
        //maybe can add like chance to skip movement for easy mode like 10%-15% chance to skip movement optional movement feels hesitant
        // if (this.difficulty === 'Easy' && Math.random() < 0.15) {
        //     return; // Skip movement 15% of the time on Easy difficulty
        // }
        
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
