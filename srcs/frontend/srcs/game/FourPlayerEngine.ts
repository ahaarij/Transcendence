import {
    type FourPlayerGameState,
    type PlayerSide,
    type Point,
    FOUR_PLAYER_BOARD_SIZE,
    FOUR_PLAYER_PADDLE_LENGTH,
    FOUR_PLAYER_PADDLE_WIDTH,
    FOUR_PLAYER_BALL_SIZE,
    FOUR_PLAYER_PADDLE_SPEED,
    FOUR_PLAYER_BALL_SPEED,
    FOUR_PLAYER_PADDLE_OFFSET
} from "./types";


export class FourPlayerEngine {
    public state: FourPlayerGameState;
    private boardSize: number = FOUR_PLAYER_BOARD_SIZE;
    private paddleLength: number = FOUR_PLAYER_PADDLE_LENGTH;
    private paddleWidth: number = FOUR_PLAYER_PADDLE_WIDTH;
    private ballSpeed: number = FOUR_PLAYER_BALL_SPEED;

    private readonly STARTING_LIVES: number = 3; // readonly is a constant value that will not be changed after initialization
    private lastPaddleHit: PlayerSide | null = null;
    
    constructor(playerNames: { top: string; bottom: string; left: string; right: string }) {
        this.state = this.initGame(playerNames);
    }

    private initGame(playerNames: { top: string; bottom: string; left: string; right: string }): FourPlayerGameState {
        const center = this.boardSize / 2;
        const activePlayers = new Set<PlayerSide> (['top', 'bottom', 'left', 'right']);
        return {
            players: {
                top: {
                    name: playerNames.top,
                    position: {
                        x: center - this.paddleLength / 2,
                        y: FOUR_PLAYER_PADDLE_OFFSET
                    },
                    isEliminated: false,
                    eliminationOrder: 0,
                    lives: this.STARTING_LIVES
                },
                bottom: {
                    name: playerNames.bottom,
                    position:{
                        x: center - this.paddleLength / 2,
                        y: this.boardSize - FOUR_PLAYER_PADDLE_OFFSET - this.paddleWidth
                    },
                    isEliminated: false,
                    eliminationOrder: 0,
                    lives: this.STARTING_LIVES
                },
                left: {
                    name: playerNames.left,
                    position: {
                        x: FOUR_PLAYER_PADDLE_OFFSET,
                        y: center - this.paddleLength / 2
                    },
                    isEliminated: false,
                    eliminationOrder: 0,
                    lives: this.STARTING_LIVES
                },
                right: {
                    name: playerNames.right,
                    position: {
                        x: this.boardSize - FOUR_PLAYER_PADDLE_OFFSET - this.paddleWidth,
                        y: center - this.paddleLength / 2
                    },
                    isEliminated: false,
                    eliminationOrder: 0,
                    lives: this.STARTING_LIVES
                }
            },

            ball: {
                x: center - FOUR_PLAYER_BALL_SIZE / 2,
                y: center - FOUR_PLAYER_BALL_SIZE / 2
            },

            ballVelocity: this.getRandomInitialVelocity(activePlayers),

            winner:null,
            // activePlayers: new Set(['top', 'bottom', 'left', 'right'])
            activePlayers: activePlayers
        };
    }

    private getRandomInitialVelocity(activePlayers?: Set<PlayerSide>): Point {
        // random direction: 0 = up, 1 = down, 2 = left, 3 = right
        // we need to ensure the ball doesn't go too vertically or horizontally straight
        //also if someone is eliminated we need to avoid going towards their side
        const activeSet = activePlayers || this.state.activePlayers;
        const activeSides: PlayerSide[] = [];
        if (activeSet.has('top')) activeSides.push('top');
        if (activeSet.has('bottom')) activeSides.push('bottom'); 
        if (activeSet.has('left')) activeSides.push('left'); 
        if (activeSet.has('right')) activeSides.push('right');

        const targetSides = activeSides[Math.floor(Math.random() * activeSides.length)];
        // const direction = Math.floor(Math.random() * 4);
        
        // now add randomness to the angle
        // const angle = (Math.random() - 0.5) * 0.8; // angle  -0.5 to 0.5
        const angle =  (Math.random() * 0.4 + 0.3) * (Math.random() < 0.5 ? -1 : 1); // angle between 0.3 and 0.7 or -0.3 and -0.7

        switch (targetSides) {
            case 'top': // up
                return {x: this.ballSpeed * angle, y: -this.ballSpeed};
            case 'bottom': // down
                return {x: this.ballSpeed * angle, y: this.ballSpeed};
            case 'left': // left
                return {x: -this.ballSpeed, y: this.ballSpeed * angle};
            case 'right': // right
            default:
                return {x: this.ballSpeed, y: this.ballSpeed * angle};
        }
    }

    public update(deltaTime: number = 1/60): void {
        if (this.state.winner !== null) return; // game over

        this.state.ball.x += this.state.ballVelocity.x * deltaTime * 60;
        this.state.ball.y += this.state.ballVelocity.y * deltaTime * 60;

        this.checkCollisions();
        this.checkEliminations();
        this.checkWinCondition();
    }

    private checkCollisions(): void {
        const ball = this.state.ball;
        const ballSize = FOUR_PLAYER_BALL_SIZE;

        //top side collision
        if (ball.y <= FOUR_PLAYER_PADDLE_OFFSET + this.paddleWidth){
            if (this.state.activePlayers.has('top')){
                this.checkTopPaddleCollision();
            } else {
                // player eliminated, bounce off wall
                if (ball.y <= 0)
                this.bounceOffWall('top');
            }
        }
        // bottom side collision
        if (ball.y + ballSize >= this.boardSize - FOUR_PLAYER_PADDLE_OFFSET - this.paddleWidth){
             if (this.state.activePlayers.has('bottom')){
                this.checkBottomPaddleCollision();
            } else {
                // player eliminated, bounce off wall
                if (ball.y + ballSize >= this.boardSize)
                this.bounceOffWall('bottom');
            }
        }
        // left side collision
        if (ball.x <= FOUR_PLAYER_PADDLE_OFFSET + this.paddleWidth){
             if (this.state.activePlayers.has('left')){
                this.checkLeftPaddleCollision();
            } else {
                // player eliminated, bounce off wall
                if (ball.x <= 0)
                this.bounceOffWall('left');
            }
        }
        // right side collision
        if (ball.x + ballSize >= this.boardSize - FOUR_PLAYER_PADDLE_OFFSET - this.paddleWidth){
             if (this.state.activePlayers.has('right')){
                this.checkRightPaddleCollision();
            } else {
                // player eliminated, bounce off wall
                if (ball.x + ballSize >= this.boardSize)
                this.bounceOffWall('right');
            }
        }
    }

    private bounceOffWall(side: PlayerSide): void {
        const ballSize = FOUR_PLAYER_BALL_SIZE;
        const pushOff = 2;

        switch (side) {
            case 'top':
                if (this.state.ballVelocity.y < 0){
                    this.state.ballVelocity.y = Math.abs(this.state.ballVelocity.y);
                    this.state.ball.y = pushOff;
                }
                break;
            case 'bottom':
                if (this.state.ballVelocity.y > 0){
                    this.state.ballVelocity.y = -Math.abs(this.state.ballVelocity.y);
                    this.state.ball.y = this.boardSize - ballSize - pushOff;
                }
                break;
            case 'left':
                if (this.state.ballVelocity.x < 0){
                    this.state.ballVelocity.x = Math.abs(this.state.ballVelocity.x);
                    this.state.ball.x = pushOff;
                }
                break;
            case 'right':
                if (this.state.ballVelocity.x > 0){
                    this.state.ballVelocity.x = -Math.abs(this.state.ballVelocity.x);
                    this.state.ball.x = this.boardSize - ballSize - pushOff;
                }
        }
    }

    private checkTopPaddleCollision(): void {
        const paddle = this.state.players.top.position;
        const ball = this.state.ball;
        const ballSize = FOUR_PLAYER_BALL_SIZE;
        const paddleOff = FOUR_PLAYER_PADDLE_OFFSET;

        if (
            ball.y <= paddleOff + this.paddleWidth &&
            ball.x + ballSize >= paddle.x &&
            ball.x <= paddle.x + this.paddleLength &&
            ball.y + ballSize >= paddleOff
        ){
            this.handlePaddleHit('top', paddle.x, paddle.x + this.paddleLength, ball.x, true);
        }
    }

    private checkBottomPaddleCollision(): void {
        const paddle = this.state.players.bottom.position;
        const ball = this.state.ball;
        const ballSize = FOUR_PLAYER_BALL_SIZE;
        const paddleOff = FOUR_PLAYER_PADDLE_OFFSET;

        if (
            ball.y + ballSize >= this.boardSize - paddleOff - this.paddleWidth &&
            ball.x + ballSize >= paddle.x &&
            ball.x <= paddle.x + this.paddleLength &&
            ball.y <= this.boardSize - paddleOff
        ){
            this.handlePaddleHit('bottom', paddle.x, paddle.x + this.paddleLength, ball.x, true);
        }
    }

    private checkLeftPaddleCollision(): void {
        const paddle = this.state.players.left.position;
        const ball = this.state.ball;
        const ballSize = FOUR_PLAYER_BALL_SIZE;
        const paddleOff = FOUR_PLAYER_PADDLE_OFFSET;
        
        if (
            ball.x <= paddleOff + this.paddleWidth &&
            ball.y + ballSize >= paddle.y &&
            ball.y <= paddle.y + this.paddleLength &&
            ball.x + ballSize >= paddleOff
        ){
            this.handlePaddleHit('left', paddle.y, paddle.y + this.paddleLength, ball.y, false);
        }
    }

    private checkRightPaddleCollision(): void {
        const paddle = this.state.players.right.position;
        const ball = this.state.ball;
        const ballSize = FOUR_PLAYER_BALL_SIZE;
        const paddleOff = FOUR_PLAYER_PADDLE_OFFSET;

        if (
            ball.x + ballSize  >= this.boardSize - paddleOff - this.paddleWidth &&
            ball.y + ballSize >= paddle.y &&
            ball.y <= paddle.y + this.paddleLength &&
            ball.x <= this.boardSize - paddleOff
        ){
            this.handlePaddleHit('right', paddle.y, paddle.y + this.paddleLength, ball.y, false);
        }
    }

    private handlePaddleHit(
        side: PlayerSide,
        paddleStart: number,
        paddleEnd: number,
        ballPos: number,
        isHorizontal: boolean
    ): void {
        const paddleCenter = (paddleStart + paddleEnd) / 2;
        const ballCenter = ballPos + FOUR_PLAYER_BALL_SIZE / 2;
        const impactFactor = (ballCenter - paddleCenter) / (this.paddleLength / 2); // -1 to 1
        const normalizedImpact = Math.max(-1, Math.min(1, impactFactor));

        const angle = normalizedImpact * (Math.PI / 3); // max 45 degrees if you need max 60 degrees change 4 to 3
        const currentSpeed = Math.sqrt(this.state.ballVelocity.x**2 + this.state.ballVelocity.y**2);
        let newSpeed = currentSpeed;
        const MAX_SPEED = 10;
        const SPEED_MULT = 1.05;

        if (this.lastPaddleHit !== side){
            newSpeed = Math.min(currentSpeed * SPEED_MULT, MAX_SPEED);
            this.lastPaddleHit = side;
        }

        if (isHorizontal){
            const direction = side === 'top' ? 1 : -1; // top bounces down, bottom bounces up
            // this.state.ballVelocity.x = newSpeed * Math.cos(angle);
            // this.state.ballVelocity.y = direction * newSpeed * Math.sin(angle);
            this.state.ballVelocity.x = newSpeed * Math.sin(angle);
            this.state.ballVelocity.y = direction * newSpeed * Math.cos(angle);
        } else {
            const direction = side === 'left' ? 1 : -1; // left bounces to right, right bounces to left
            this.state.ballVelocity.x = direction * newSpeed * Math.cos(angle);
            this.state.ballVelocity.y = newSpeed * Math.sin(angle);
        }
        // now push the ball away from paddle to prevent tunneling
        this.pushBallAwayFromPaddle(side);
    }

    private pushBallAwayFromPaddle(side: PlayerSide): void {
        const ballSize = FOUR_PLAYER_BALL_SIZE;
        const offset = 2;

        switch (side) {
            case 'top':
                this.state.ball.y = FOUR_PLAYER_PADDLE_OFFSET + this.paddleWidth + offset;
                break;
            case 'bottom':
                this.state.ball.y = this.boardSize - FOUR_PLAYER_PADDLE_OFFSET - this.paddleWidth - ballSize - offset;
                break;
            case 'left':
                this.state.ball.x = FOUR_PLAYER_PADDLE_OFFSET + this.paddleWidth + offset;
                break;
            case 'right':
                this.state.ball.x = this.boardSize - FOUR_PLAYER_PADDLE_OFFSET - this.paddleWidth - ballSize - offset;
                break;
        }
    }

    private checkEliminations(): void {
        const ball = this.state.ball;
        const ballSize = FOUR_PLAYER_BALL_SIZE;

        let eliminationSide: PlayerSide | null = null;

        if (ball.y < 0) eliminationSide = 'top';
        else if (ball.y + ballSize > this.boardSize) eliminationSide = 'bottom';
        else if (ball.x < 0) eliminationSide = 'left';
        else if (ball.x + ballSize > this.boardSize) eliminationSide = 'right';

        if (eliminationSide && this.state.activePlayers.has(eliminationSide)){
            this.handleLifeLoss(eliminationSide);
        }
    }

    private handleLifeLoss(side: PlayerSide): void {
        const player = this.state.players[side];
        player.lives -= 1;

        if (player.lives <= 0){
            this.eliminatePlayer(side);
        } else {
            this.resetBall();
        }
    }

    private eliminatePlayer(side: PlayerSide): void {
        this.state.players[side].isEliminated = true;
        this.state.activePlayers.delete(side);
        this.resetBall();
    }

    private resetBall(): void {
        const center = this.boardSize / 2;
        this.state.ball = {
            x: center - FOUR_PLAYER_BALL_SIZE / 2,
            y: center - FOUR_PLAYER_BALL_SIZE / 2
        };
        this.state.ballVelocity = this.getRandomInitialVelocity();
        this.lastPaddleHit = null;
    }

    private checkWinCondition(): void {
        if (this.state.activePlayers.size === 1){
            const winner = Array.from(this.state.activePlayers)[0];
            this.state.winner = winner;
            console.log(` ${this.state.players[winner].name} wins the game!`);
        }
    }

    public movePaddle(side: PlayerSide, direction: "UP" | "DOWN" | "LEFT" | "RIGHT"): void {
        if (this.state.players[side].isEliminated) return; // eliminated players can't move paddles

        const paddle = this.state.players[side].position;
        const speed = FOUR_PLAYER_PADDLE_SPEED;

        if (side === 'top' || side === 'bottom') {
            if (direction === "LEFT") {
                // paddle.x -= speed;
                // paddle.x = Math.max(FOUR_PLAYER_PADDLE_OFFSET, Math.min(this.boardSize - FOUR_PLAYER_PADDLE_OFFSET - this.paddleLength, paddle.x));
                paddle.x = Math.max(0, paddle.x - speed);
            } else if (direction === "RIGHT") {
                paddle.x = Math.min(this.boardSize - this.paddleLength, paddle.x + speed);
            }
        } else {
            if (direction === "UP") {
                paddle.y = Math.max(0, paddle.y - speed);
            } else if (direction === "DOWN") {
                paddle.y = Math.min(this.boardSize - this.paddleLength, paddle.y + speed);
            }
        }
    }

    public restart(playerNames: { top: string; bottom: string; left: string; right: string }): void {
        this.state = this.initGame(playerNames);
        this.lastPaddleHit = null;
    }

    public getBoardSize(): number {
        return this.boardSize;
    }

    public getPaddleDimensions():{ length: number; width: number } {
        return { length: this.paddleLength, width: this.paddleWidth };
    }

    public getStartingLives(): number {
        return this.STARTING_LIVES;
    }

}