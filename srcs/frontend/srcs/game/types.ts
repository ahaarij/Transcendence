export interface Point{
    x: number;
    y: number;
}

export interface GameState{
    p1score: number;
    p2score: number;
    ball: Point;
    ballVelocity: Point;
    p1: Point;
    p2: Point;
    winner: 0 | 1 | 2;
}

export interface MatchPayload{
    userId: number;
    userSide: 1 | 2;  // 1 for left, 2 for right, since vsAi you can choose side
    opponentId: string;
    userScore: number;
    opponentScore: number;
    didUserWin: boolean;
    gameMode: 'PvP' | 'PvAI' | 'Tournament'; // might add one more later for 4 player pong

    tournamentSize?: number;
    tournamentRound?: number;
    isEliminated?: boolean; // maybe change it late to eliminatedBy?: string; and store who eliminated the user or null/undefined if not eliminated
}

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 80;
export const BALL_SIZE = 10;
export const PADDLE_SPEED = 7;
export const BALL_SPEED = 4;
export const PADDLE_OFFSET = 1;
