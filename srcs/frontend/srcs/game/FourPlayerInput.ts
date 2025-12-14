import { type PlayerSide } from "./types";



export class FourPlayerInput {
    private keysPressed: Set<string> = new Set();

    private readonly KEY_MAP = {
        top: {
            left: ['v', 'V'],
            right: ['b', 'B'],
        },
        bottom: {
            left: ['j', 'J'],
            right: ['k', 'K'],
        },
        left: {
            up: ['w', 'W'],
            down: ['s', 'S'],
        },
        right: {
            up: ['ArrowUp'],
            down: ['ArrowDown'],
        },
    };

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    private handleKeyDown = (e: KeyboardEvent): void => {
        if (this.isGameKey(e.key)){
            e.preventDefault();
            this.keysPressed.add(e.key);
        }
    };

    private handleKeyUp = (e: KeyboardEvent): void => {
            this.keysPressed.delete(e.key);
    };

    private isGameKey(key: string): boolean {

        const allKeys = [
            ...this.KEY_MAP.top.left,
            ...this.KEY_MAP.top.right,
            ...this.KEY_MAP.bottom.left,
            ...this.KEY_MAP.bottom.right,
            ...this.KEY_MAP.left.up,
            ...this.KEY_MAP.left.down,
            ...this.KEY_MAP.right.up,
            ...this.KEY_MAP.right.down,
        ];
        return allKeys.includes(key);
    }

    public isPressed(side: PlayerSide, direction: 'left' | 'right' | 'up' | 'down'): boolean {
        const keys = this.getKeysForControl(side, direction);
        return keys.some(key => this.keysPressed.has(key));
    }

    private getKeysForControl(side: PlayerSide, direction: 'left' | 'right' | 'up' | 'down'): string[] {
        if (side === 'top' || side === 'bottom') {
            return direction === 'left'
                ? this.KEY_MAP[side].left
                : this.KEY_MAP[side].right;
        } else {
            return direction === 'up'
                ? this.KEY_MAP[side].up
                : this.KEY_MAP[side].down;
        }
    }

    public destroy(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.keysPressed.clear();
    }

    public reset(): void {
        this.keysPressed.clear();
    }
}