import { type GameState, GAME_WIDTH, GAME_HEIGHT, PADDLE_HEIGHT, PADDLE_OFFSET, PADDLE_WIDTH, PADDLE_SPEED, BALL_SIZE, BALL_SPEED } from "./types.js";


export class PongEngine{
    public state: GameState;
    private lastPaddle : 1 | 2 | null = null; // prevent speed stacking on same paddle

    public winningScore: number = 11; // default winning score
    constructor(){
        this.state = this.resetGame();
    }

    public setWinningScore(score: number){
        this.winningScore = score;
    }

    public restart(){
        this.state = this.resetGame();
    }

    private resetGame(): GameState{
        return {
            p1score: 0,
            p2score: 0,
            ball: {x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2},
            p1: {x: PADDLE_OFFSET, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2},
            p2: {x: GAME_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2},
            ballVelocity: {x: BALL_SPEED, y: BALL_SPEED},
            winner: 0 // for later use to determine if someone has won
        }
    }

    public update(deltaTime: number= 1/60){

        if (this.state.winner !== 0) return; // game over
        this.state.ball.x += this.state.ballVelocity.x * deltaTime * 60;
        this.state.ball.y += this.state.ballVelocity.y * deltaTime * 60;
        if (this.state.ball.y <= 0 ){
            this.state.ballVelocity.y = Math.abs(this.state.ballVelocity.y);
            this.state.ball.y = 1;
    }
        else if(this.state.ball.y + BALL_SIZE >= GAME_HEIGHT){
            this.state.ballVelocity.y = -Math.abs(this.state.ballVelocity.y);
            this.state.ball.y = GAME_HEIGHT - BALL_SIZE - 1;
        }
        this.checkPaddleCollision();
        if (this.state.ball.x + BALL_SIZE <= 0){
            this.state.p2score += 1;
            this.checkWinCondition();
            this.resetBall();
        }
        else if (this.state.ball.x >= GAME_WIDTH){
            this.state.p1score += 1;
            this.checkWinCondition();
            this.resetBall();
        }
    }

    // this method is commented out for now, but can be used later to check for win condition
    private checkWinCondition(){
        if (this.state.p1score >= this.winningScore){
            this.state.winner = 1;
        }
        else if (this.state.p2score >= this.winningScore){
            this.state.winner = 2;
        }
    }

    private resetBall(){
        this.state.ball.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
        this.state.ball.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
        if (this.state.ballVelocity.x < 0)
            this.state.ballVelocity.x = BALL_SPEED;
        else
            this.state.ballVelocity.x = -BALL_SPEED;
        this.state.ballVelocity.y = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
        this.lastPaddle = null;
    }

    public movePaddle(paddleNumber: 1 | 2, direction: "UP" | "DOWN") {
        const offset = 0; // if you want to add some offset from the top and bottom
        const speed = direction === "UP" ? -PADDLE_SPEED : PADDLE_SPEED;
        if (paddleNumber === 1){

            this.state.p1.y += speed;
            this.state.p1.y = Math.max(offset, Math.min(GAME_HEIGHT - PADDLE_HEIGHT - offset, this.state.p1.y));
        }
        else{
            this.state.p2.y += speed;
            this.state.p2.y = Math.max(offset, Math.min(GAME_HEIGHT - PADDLE_HEIGHT - offset, this.state.p2.y));
        }
    }

    private checkPaddleCollision(){
        
        const ball = this.state.ball;
        const p1 = this.state.p1;
        const p2 = this.state.p2;
          // Define a "Center" for the ball
        const ballCenterY = ball.y + BALL_SIZE / 2;
        
        // Constants for Speed Control
        const MAX_SPEED = 15;   // Cap the speed so it never becomes impossible
        const SPEED_MULT = 1.1; // Only increase speed by 2% per hit

        // --- PLAYER 1 (LEFT) ---
         if (
            ball.x <= PADDLE_OFFSET + PADDLE_WIDTH && 
            ball.x + BALL_SIZE >= PADDLE_OFFSET && 
            ball.y + BALL_SIZE >= p1.y && 
            ball.y <= p1.y + PADDLE_HEIGHT
        ) {
            // 1. Where did we hit?
            const paddleCenter = p1.y + PADDLE_HEIGHT / 2;
            const impactFactor = (ballCenterY - paddleCenter) / (PADDLE_HEIGHT / 2);
            const normalizedImpact = Math.max(-1, Math.min(1, impactFactor));

            // 2. Calculate bounce angle (Max 45 degrees = PI/4)
            const angle = normalizedImpact * (Math.PI / 4);

            // 3. Convert Polar to Cartesian
            const currentSpeed = Math.sqrt(this.state.ballVelocity.x**2 + this.state.ballVelocity.y**2);
            let newSpeed = currentSpeed;
            
            // 4. Clamp Speed
            if (this.lastPaddle !== 1){
                newSpeed = currentSpeed * SPEED_MULT;
                if (newSpeed > MAX_SPEED) newSpeed = MAX_SPEED;
                this.lastPaddle = 1;
            }

            // 5. Apply new Velocity
            this.state.ballVelocity.x = newSpeed * Math.cos(angle);
            this.state.ballVelocity.y = newSpeed * Math.sin(angle);

            // 6. Push out to prevent tunneling
            this.state.ball.x = PADDLE_OFFSET + PADDLE_WIDTH + 1;
        }

        // --- PLAYER 2 (RIGHT) ---
        const p2X = GAME_WIDTH - PADDLE_WIDTH - PADDLE_OFFSET;
        
        if (
            ball.x + BALL_SIZE >= p2X && 
            ball.x <= p2X + PADDLE_WIDTH &&
            ball.y + BALL_SIZE >= p2.y && 
            ball.y <= p2.y + PADDLE_HEIGHT
        ) {
            // 1. Where did we hit?
            const paddleCenter = p2.y + PADDLE_HEIGHT / 2;
            const impactFactor = (ballCenterY - paddleCenter) / (PADDLE_HEIGHT / 2);
            const normalizedImpact = Math.max(-1, Math.min(1, impactFactor));

            // 2. Calculate Angle
            const angle = normalizedImpact * (Math.PI / 4);

            // 3. Convert Polar to Cartesian (Negative X for left direction)
            const currentSpeed = Math.sqrt(this.state.ballVelocity.x**2 + this.state.ballVelocity.y**2);
             let newSpeed = currentSpeed;
            
            // 4. Clamp Speed
            if (this.lastPaddle !== 2){
                newSpeed = currentSpeed * SPEED_MULT;
                if (newSpeed > MAX_SPEED) newSpeed = MAX_SPEED;
                this.lastPaddle = 2;
            }

            // 5. Apply
            this.state.ballVelocity.x = -1 * newSpeed * Math.cos(angle);
            this.state.ballVelocity.y = newSpeed * Math.sin(angle);

            // 6. Push out
            this.state.ball.x = p2X - BALL_SIZE - 1;
        }
    }
}
