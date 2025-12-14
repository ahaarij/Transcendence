// FourPlayerSetup.ts
export class FourPlayerSetup {
    private container: HTMLElement;
    private setupScreen!: HTMLElement;
    private currentUsername: string;
    private onStart?: (names: {top: string; bottom: string; left: string; right: string}) => void;
    private onBack?: () => void;

    constructor(
        container: HTMLElement, 
        currentUsername: string,
        onStart: (names: {top: string; bottom: string; left: string; right: string}) => void,
        onBack: () => void
    ) {
        this.container = container;
        this.currentUsername = currentUsername;
        this.onStart = onStart;
        this.onBack = onBack;
        this.render();
        this.attachListeners();
    }

    private render(): void {
        this.setupScreen = document.createElement('div');
        this.setupScreen.id = 'fourPlayerSetup';
        this.setupScreen.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
            font-family: monospace;
            z-index: 100;
            min-width: 500px;
        `;

        this.setupScreen.innerHTML = `
            <h2 style="text-align: center; font-size: 32px; margin-bottom: 30px; color: #fff; text-shadow: 0 0 10px #fff;">
                4 PLAYER SETUP
            </h2>
            
            <div style="margin-bottom: 30px;">
                <!-- Player 1 (LEFT) -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #aaa; font-size: 14px;">
                        Player 1 (LEFT - W/S):
                    </label>
                    <input 
                        type="text" 
                        id="player1Name" 
                        value="${this.currentUsername}"
                        disabled
                        style="
                            width: 100%;
                            padding: 10px;
                            font-size: 16px;
                            background: #333;
                            color: #888;
                            border: 2px solid #555;
                            border-radius: 5px;
                            font-family: monospace;
                            cursor: not-allowed;
                        "
                    />
                </div>

                <!-- Player 2 (TOP) -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #aaa; font-size: 14px;">
                        Player 2 (TOP - V/B):
                    </label>
                    <input 
                        type="text" 
                        id="player2Name" 
                        placeholder="Enter alias"
                        maxlength="15"
                        style="
                            width: 100%;
                            padding: 10px;
                            font-size: 16px;
                            background: #222;
                            color: #fff;
                            border: 2px solid #555;
                            border-radius: 5px;
                            font-family: monospace;
                        "
                    />
                    <span id="error2" style="display: none; color: #ff4444; font-size: 12px; margin-top: 5px;"></span>
                </div>

                <!-- Player 3 (RIGHT) -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #aaa; font-size: 14px;">
                        Player 3 (RIGHT - ↑/↓):
                    </label>
                    <input 
                        type="text" 
                        id="player3Name" 
                        placeholder="Enter alias"
                        maxlength="15"
                        style="
                            width: 100%;
                            padding: 10px;
                            font-size: 16px;
                            background: #222;
                            color: #fff;
                            border: 2px solid #555;
                            border-radius: 5px;
                            font-family: monospace;
                        "
                    />
                    <span id="error3" style="display: none; color: #ff4444; font-size: 12px; margin-top: 5px;"></span>
                </div>

                <!-- Player 4 (BOTTOM) -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #aaa; font-size: 14px;">
                        Player 4 (BOTTOM - J/K):
                    </label>
                    <input 
                        type="text" 
                        id="player4Name" 
                        placeholder="Enter alias"
                        maxlength="15"
                        style="
                            width: 100%;
                            padding: 10px;
                            font-size: 16px;
                            background: #222;
                            color: #fff;
                            border: 2px solid #555;
                            border-radius: 5px;
                            font-family: monospace;
                        "
                    />
                    <span id="error4" style="display: none; color: #ff4444; font-size: 12px; margin-top: 5px;"></span>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; gap: 20px;">
                <button 
                    id="btnBackSetup"
                    style="
                        flex: 1;
                        padding: 15px;
                        font-size: 18px;
                        background: #444;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-family: monospace;
                        font-weight: bold;
                    "
                >
                    BACK
                </button>
                <button 
                    id="btnStartGame"
                    style="
                        flex: 2;
                        padding: 15px;
                        font-size: 18px;
                        background: white;
                        color: black;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-family: monospace;
                        font-weight: bold;
                    "
                >
                    START GAME
                </button>
            </div>
        `;

        this.container.appendChild(this.setupScreen);
    }

    private attachListeners(): void {
        const backBtn = this.setupScreen.querySelector('#btnBackSetup') as HTMLButtonElement;
        const startBtn = this.setupScreen.querySelector('#btnStartGame') as HTMLButtonElement;

        backBtn.addEventListener('click', () => {
            this.destroy();
            if (this.onBack) this.onBack();
        });

        startBtn.addEventListener('click', () => this.handleStart());

        // Real-time validation
        const player2Input = this.setupScreen.querySelector('#player2Name') as HTMLInputElement;
        const player3Input = this.setupScreen.querySelector('#player3Name') as HTMLInputElement;
        const player4Input = this.setupScreen.querySelector('#player4Name') as HTMLInputElement;

        player2Input.addEventListener('input', () => this.clearError('error2'));
        player3Input.addEventListener('input', () => this.clearError('error3'));
        player4Input.addEventListener('input', () => this.clearError('error4'));
    }

    private clearError(errorId: string): void {
        const errorSpan = this.setupScreen.querySelector(`#${errorId}`) as HTMLElement;
        errorSpan.style.display = 'none';
    }

    private showError(errorId: string, message: string): void {
        const errorSpan = this.setupScreen.querySelector(`#${errorId}`) as HTMLElement;
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }

    private handleStart(): void {
        // Clear all errors first
        this.clearError('error2');
        this.clearError('error3');
        this.clearError('error4');

        const player1 = this.currentUsername; // LEFT (W/S)
        const player2 = (this.setupScreen.querySelector('#player2Name') as HTMLInputElement).value.trim(); // TOP (V/B)
        const player3 = (this.setupScreen.querySelector('#player3Name') as HTMLInputElement).value.trim(); // RIGHT (arrows)
        const player4 = (this.setupScreen.querySelector('#player4Name') as HTMLInputElement).value.trim(); // BOTTOM (J/K)

        // Validation
        let hasError = false;

        if (!player2) {
            this.showError('error2', 'Alias required');
            hasError = true;
        }
        if (!player3) {
            this.showError('error3', 'Alias required');
            hasError = true;
        }
        if (!player4) {
            this.showError('error4', 'Alias required');
            hasError = true;
        }

        if (hasError) return;

        // Check uniqueness
        const names = [player1.toLowerCase(), player2.toLowerCase(), player3.toLowerCase(), player4.toLowerCase()];
        const uniqueNames = new Set(names);

        if (uniqueNames.size !== 4) {
            if (player2.toLowerCase() === player1.toLowerCase() || 
                names.filter(n => n === player2.toLowerCase()).length > 1) {
                this.showError('error2', 'Alias must be unique');
                hasError = true;
            }
            if (player3.toLowerCase() === player1.toLowerCase() || 
                names.filter(n => n === player3.toLowerCase()).length > 1) {
                this.showError('error3', 'Alias must be unique');
                hasError = true;
            }
            if (player4.toLowerCase() === player1.toLowerCase() || 
                names.filter(n => n === player4.toLowerCase()).length > 1) {
                this.showError('error4', 'Alias must be unique');
                hasError = true;
            }
        }

        if (hasError) return;

        // All valid - start game
        this.destroy();
        if (this.onStart) {
            this.onStart({
                left: player1,   // W/S
                top: player2,    // V/B
                right: player3,  // Arrow keys
                bottom: player4  // J/K
            });
        }
    }

    public destroy(): void {
        if (this.setupScreen && this.setupScreen.parentNode) {
            this.setupScreen.parentNode.removeChild(this.setupScreen);
        }
    }
}