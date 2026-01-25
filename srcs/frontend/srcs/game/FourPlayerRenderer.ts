import { 
    type FourPlayerGameState, 
    type PlayerSide,
    FOUR_PLAYER_BOARD_SIZE,
    FOUR_PLAYER_PADDLE_LENGTH,
    FOUR_PLAYER_PADDLE_WIDTH,
    FOUR_PLAYER_BALL_SIZE,
    FOUR_PLAYER_PADDLE_OFFSET
} from "./types";
import { t } from "../lang";

export class FourPlayerRenderer {
    private context: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private boardSize: number = FOUR_PLAYER_BOARD_SIZE;

    private readonly BOARD_COLOR: string = "#1a1a1a";
    private readonly PADDLE_COLOR: string = "#ffffff";
    private readonly PADDLE_ELIMINATED_COLOR: string = "#444444";
    private readonly BALL_COLOR: string = "#ffff00";
    private readonly TEXT_COLOR: string = "#ffffff";
    private readonly LIFE_FULL_COLOR: string = "#00ff00";
    private readonly LIFE_LOST_COLOR: string = "#333333";

       private isRTL(text: string): boolean {
        const rtlPattern = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
        return rtlPattern.test(text);
    }

    constructor(canvas: HTMLCanvasElement) {
        this.context = canvas;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get canvas context");
        }
        this.ctx = context;
        this.context.width = this.boardSize;
        this.context.height = this.boardSize;
    }

    public render(state: FourPlayerGameState): void {
        this.clearCanvas();
        this.drawBoard();
        this.drawCenterLines();
        this.drawPaddles(state);
        this.drawBall(state.ball.x, state.ball.y);
    }

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.context.width, this.context.height);
    }

    private drawBoard(): void {
        this.ctx.fillStyle = this.BOARD_COLOR;
        this.ctx.fillRect(0, 0, this.boardSize, this.boardSize);
        this.ctx.strokeStyle = "#666666";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(1, 1, this.boardSize - 2, this.boardSize - 2);
    }

    private drawCenterLines(): void {
        this.ctx.strokeStyle = "#333333";
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        const center = this.boardSize / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(center, 0);
        this.ctx.lineTo(center, this.boardSize);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, center);
        this.ctx.lineTo(this.boardSize, center);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    private drawPaddles(state: FourPlayerGameState): void {
        this.drawPaddle(
            state.players.top.position.x,
            state.players.top.position.y,
            FOUR_PLAYER_PADDLE_WIDTH,
            FOUR_PLAYER_PADDLE_LENGTH,
            state.players.top.isEliminated
        );

        this.drawPaddle(
            state.players.bottom.position.x,
            state.players.bottom.position.y,
            FOUR_PLAYER_PADDLE_WIDTH,
            FOUR_PLAYER_PADDLE_LENGTH,
            state.players.bottom.isEliminated
        );

        this.drawPaddle(
            state.players.left.position.x,
            state.players.left.position.y,
            FOUR_PLAYER_PADDLE_LENGTH,
            FOUR_PLAYER_PADDLE_WIDTH,
            state.players.left.isEliminated
        );

        this.drawPaddle(
            state.players.right.position.x,
            state.players.right.position.y,
            FOUR_PLAYER_PADDLE_LENGTH,
            FOUR_PLAYER_PADDLE_WIDTH,
            state.players.right.isEliminated
        );
    }

    private drawPaddle(x: number, y: number, height: number, width: number, isEliminated: boolean): void {
        if (isEliminated) {
            return;
        }

        this.ctx.fillStyle = this.PADDLE_COLOR;
        this.ctx.fillRect(x, y, width, height);

        this.ctx.shadowColor = this.PADDLE_COLOR;
        this.ctx.shadowBlur = 5;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.shadowBlur = 0;

    }

    private drawBall(x: number, y: number): void {
        this.ctx.fillStyle = this.BALL_COLOR;
        this.ctx.fillRect(x, y, FOUR_PLAYER_BALL_SIZE, FOUR_PLAYER_BALL_SIZE);

        this.ctx.shadowColor = this.BALL_COLOR;
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(x, y, FOUR_PLAYER_BALL_SIZE, FOUR_PLAYER_BALL_SIZE);
        this.ctx.shadowBlur = 0;
    }

    private drawPlayerInfo(state: FourPlayerGameState): void {
        this.ctx.font = "14px monospace";
        this.ctx.fillStyle = this.TEXT_COLOR;

        const center = this.boardSize / 2;
        const margin = 30;

        //Top player
        this.drawPlayerInfoAt(
            state.players.top,
            'top',
            center,
            margin,
            'center'
        );
        //Bottom player
        this.drawPlayerInfoAt(
            state.players.bottom,
            'bottom',
            center,
            this.boardSize - margin,
            'center'
        );
        //Left player
        this.ctx.save();// save the current context state
        this.ctx.translate(margin, center); // move the origin to the left center
        this.ctx.rotate(-Math.PI / 2); // rotate 90 degrees counter-clockwise
        this.drawPlayerInfoAt(
            state.players.left,
            'left',
            0,
            0,
            'center'
        );
        this.ctx.restore(); // restore the context to its original state
        //Right player
        this.ctx.save();
        this.ctx.translate(this.boardSize - margin, center); // move the origin to the right center
        this.ctx.rotate(Math.PI / 2); // rotate 90 degrees clockwise
        this.drawPlayerInfoAt(
            state.players.right,
            'right',
            0,
            0,
            'center'
        );
        this.ctx.restore();
    }

    private drawPlayerInfoAt(
        player: { name: string; lives: number; isEliminated: boolean },
        side: PlayerSide,
        x: number,
        y: number,
        align: 'left' | 'center' | 'right'
    ): void {
        this.ctx.textAlign = align;

        if (player.isEliminated) {
            this.ctx.fillStyle = this.PADDLE_ELIMINATED_COLOR;
            this.ctx.fillText(`${player.name} - ELIMINATED`, x, y);
        } else {
            this.ctx.fillStyle = this.TEXT_COLOR;
            this.ctx.fillText(player.name, x, y);
            this.drawLives(player.lives, x, y + 15, align);
            this.drawControls(side, x, y + 30, align);
        }
    }

    private drawControls(side: PlayerSide, x: number, y: number, align: 'left' | 'center' | 'right'): void {
        this.ctx.fillStyle = "888888";
        this.ctx.font = "10px monospace";
        this.ctx.textAlign = align;

        let controlText = ""; // Default empty

        switch (side) {
            case 'top':
                controlText = "J/K";
                break;
            case 'bottom':
                controlText = "V/B";
                break;
            case 'left':
                controlText = "W/S";
                break;
            case 'right':
                controlText = "↑/↓";
                break;
        }
        this.ctx.fillText(controlText, x, y);
    }

    private drawLives(lives: number, x: number, y: number, align: 'left' | 'center' | 'right'): void {
        const hearSize = 8;
        const spacing = 12;
        const maxLives = 3;

        let startX = x;
        if (align === 'center') {
            startX = x -((maxLives * spacing) / 2);
        } else if (align === 'right') {
            startX = x - (maxLives * spacing);
        }
        for (let i = 0; i < maxLives; i++) {
            const heartX = startX + (i * spacing);

            if (i < lives) {
                this.ctx.fillStyle = this.LIFE_FULL_COLOR;
            } else {
                this.ctx.fillStyle = this.LIFE_LOST_COLOR;
            }
            this.ctx.fillRect(heartX, y, hearSize, hearSize);
        }
    }

       public drawWinner(winnerName: string): void {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(0, 0, this.boardSize, this.boardSize);

        const center = this.boardSize / 2;

        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 48px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(t("winner"), center, center - 40);

        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "bold 36px monospace";
        this.ctx.direction = this.isRTL(winnerName) ? 'rtl' : 'ltr';
        this.ctx.fillText(winnerName, center, center + 10);
        this.ctx.direction = 'ltr'; // Reset to default

        this.ctx.fillStyle = "#AAAAAA";
        this.ctx.font = "18px monospace";
        this.ctx.fillText(t("press_enter_continue"), center, center + 60);
    }

    public drawCountdown(count: number): void {
        const center = this.boardSize / 2;

        this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        this.ctx.font = "bold 120px monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        if (count > 0) {
            this.ctx.fillText(count.toString(), center, center);
        } else {
            this.ctx.fillStyle = "#00FF00";
            this.ctx.fillText("GO!", center, center);
        }

        this.ctx.textBaseline = "alphabetic";
    }
}