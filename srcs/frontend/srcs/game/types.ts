export interface Point {
    x: number;
    y: number;
}

export interface GameState {
    p1score: number;
    p2score: number;
    ball: Point;
    ballVelocity: Point;
    p1: Point;
    p2: Point;
    winner: 0 | 1 | 2;
}

export interface PlayerState {
    name: string;
    position: Point;
    isEliminated: boolean;
    eliminationOrder: number; // maybe not needed
    lives: number;
}

/**
 * -players: object with 4 players positioned on each side of the board
 * -ball: current position of the ball
 * -ballVelocity: current velocity of the ball
 * -winner: which player won the game (top, bottom, left, right) or null if no winner yet
 * -activePlayers: set of active players (top, bottom, left, right) not eliminated
 */
export interface FourPlayerGameState  {
    players: {
        top: PlayerState;
        bottom: PlayerState;
        left: PlayerState;
        right: PlayerState;
    };
    ball: Point;
    ballVelocity: Point;
    winner: 'top' | 'bottom' | 'left' | 'right' | null;
    activePlayers: Set<'top' | 'bottom' | 'left' | 'right'>;
}

export type PlayerSide = 'left' | 'right' | 'top' | 'bottom';

export interface MatchPayload {
    userId: string;  // uuid string for security
    userSide: 1 | 2;  // 1 for left, 2 for right, since vsAi you can choose side
    opponentId: string;
    userScore: number;
    opponentScore: number;
    didUserWin: boolean;
    gameMode: 'PvP' | 'PvAI' | 'Tournament' | 'FourPlayer'; // might add one more later for 4 player pong

    tournamentSize?: number;
    tournamentRound?: number;
    isEliminated?: boolean; // maybe change it late to eliminatedBy?: string; and store who eliminated the user or null/undefined if not eliminated

    //optional only for four player mode // can add more later if needed
    livesRemaining?: number;
}

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 80;
export const BALL_SIZE = 10;
export const PADDLE_SPEED = 7;
export const BALL_SPEED = 4;
export const PADDLE_OFFSET = 1;


export const FOUR_PLAYER_BOARD_SIZE = 600;
export const FOUR_PLAYER_PADDLE_LENGTH = 80;
export const FOUR_PLAYER_PADDLE_WIDTH = 10;
export const FOUR_PLAYER_BALL_SIZE = 10;
export const FOUR_PLAYER_PADDLE_SPEED = 6;
export const FOUR_PLAYER_BALL_SPEED = 4;
export const FOUR_PLAYER_PADDLE_OFFSET = 10;