import { t } from "../lang";

export type VisualMatch = {p1: string | null, p2: string | null, winner: string | null};

export class TournamentManager {
    public visualBracket: VisualMatch[][] = [];
    public tournamentPlayers: string[] = [];
    public tournamentBracket: {player1: string, player2: string}[] = [];
    public tournamentWinner: string[] = [];
    public currentMatchIndex = 0;
    public tournamentRound = 1;
    public tournamentSize = 4;

    constructor() {}

    public setupTournament(count: number, currentUsername: string, container: HTMLElement) {
        const playerInput = container.querySelector("#playerInputs")!;
        playerInput.innerHTML = "";

        const firstInputWrapper = document.createElement("div");
        const firstInput = document.createElement("input");
        firstInput.type = "text";
        firstInput.placeholder = currentUsername;
        firstInput.value = currentUsername;
        firstInput.id = `player1`;
        firstInput.disabled = true;
        firstInput.style.cssText = "padding: 10px; background: #333; color:#888; border: 2px solid #555; border-radius: 5px; font-family: monospace; cursor: not-allowed; unicode-bidi: plaintext;";

        const error1= document.createElement("span");
        error1.id = "error1";
        error1.style.cssText = "color: #ff4444; font-size: 12px; margin-top: 5px; display: none;";
        firstInputWrapper.appendChild(firstInput);
        firstInputWrapper.appendChild(error1);
        playerInput.appendChild(firstInputWrapper);

        for (let i = 2; i <= count; i++){
            const inputWrapper = document.createElement("div");

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `${t("player_name_placeholder")} ${i}`;
            input.id = `player${i}`;
            input.maxLength = 15;
            input.style.cssText = "padding: 10px; background: #222; color:#fff; border: 2px solid #555; border-radius: 5px; font-family: monospace; unicode-bidi: plaintext;";
            const errorSpan= document.createElement("span");
            errorSpan.id = `error${i}`;
            errorSpan.style.cssText = "color: #ff4444; font-size: 12px; margin-top: 5px; display: none;";
            inputWrapper.appendChild(input);
            inputWrapper.appendChild(errorSpan);
            playerInput.appendChild(inputWrapper);
        }

        for (let i = 1; i <= count; i++){
            const errorSpan = container.querySelector(`#error${i}`) as HTMLElement;
            if (errorSpan) {
                errorSpan.style.display = "none";
                errorSpan.innerText = '';
            }
        }
    }

    public startTournament(container: HTMLElement): boolean {
        this.tournamentPlayers = [];
        const nameSet = new Set<string>();

        for (let i =1; i <= this.tournamentSize; i++){
            const errorSpan = container.querySelector(`#error${i}`) as HTMLElement;
            if (errorSpan) {
                errorSpan.style.display = "none";
                errorSpan.innerText = '';
            }
        }

        for (let i = 1; i <= this.tournamentSize; i++){
            const input = container.querySelector(`#player${i}`) as HTMLInputElement; 
            const name = input.value.trim() || `${t("player_name_placeholder")} ${i}`;
            if (nameSet.has(name)){
                const errorSpan = container.querySelector(`#error${i}`) as HTMLElement;
                if (errorSpan) {
                    errorSpan.innerText = t("error_duplicate_name");
                    errorSpan.style.display = "block";
                }
                return false;
            }
            nameSet.add(name);
            this.tournamentPlayers.push(name);
        }

        this.tournamentBracket = [];
        // Shuffle
        for (let i = this.tournamentPlayers.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [this.tournamentPlayers[i], this.tournamentPlayers[j]] = [this.tournamentPlayers[j], this.tournamentPlayers[i]];
        }
        
        for (let i = 0; i < this.tournamentPlayers.length; i += 2){
            this.tournamentBracket.push({player1: this.tournamentPlayers[i], player2: this.tournamentPlayers[i+1]});
        }

        this.visualBracket = [];
        let round1Matches: VisualMatch[] = [];
        for (let i = 0; i < this.tournamentPlayers.length; i += 2) {
            round1Matches.push({ p1: this.tournamentPlayers[i], p2: this.tournamentPlayers[i+1], winner: null });
        }
        this.visualBracket.push(round1Matches);

        let nextCount = round1Matches.length / 2;
        while (nextCount >= 1) {
            let roundMatches: VisualMatch[] = [];
            for (let k = 0; k < nextCount; k++) {
                roundMatches.push({ p1: "TBD", p2: "TBD", winner: null });
            }
            this.visualBracket.push(roundMatches);
            nextCount /= 2;
        }

        this.currentMatchIndex = 0;
        this.tournamentWinner = [];
        this.tournamentRound = 1;
        return true;
    }

public renderBracket(container: HTMLElement) {
    const bracketContainer = container.querySelector('#bracketContainer') as HTMLElement;
    bracketContainer.innerHTML = ''; 

    bracketContainer.querySelectorAll('.bracket-line').forEach(el => el.remove());

    bracketContainer.style.width = '100%';
    bracketContainer.style.transform = 'none';
    bracketContainer.style.position = 'relative';
    (bracketContainer as HTMLElement).style.direction = 'ltr';

    
    bracketContainer.classList.remove('tournament-4', 'tournament-8');
    bracketContainer.classList.add(`tournament-${this.tournamentSize}`);

    const leftContainer = document.createElement('div');
    leftContainer.className = 'bracket-side-left';
    leftContainer.style.display = 'flex';
    leftContainer.style.flexDirection = 'row';
    leftContainer.style.alignItems = 'center';
    leftContainer.style.gap = this.tournamentSize === 8 ? '30px' : '40px';

    const rightContainer = document.createElement('div');
    rightContainer.className = 'bracket-side-right';
    rightContainer.style.display = 'flex';
    rightContainer.style.flexDirection = 'row-reverse';
    rightContainer.style.alignItems = 'center';
    rightContainer.style.gap = this.tournamentSize === 8 ? '30px' : '40px';

    const centerContainer = document.createElement('div');
    centerContainer.className = 'bracket-center';
    centerContainer.style.display = 'flex';
    centerContainer.style.flexDirection = 'column';
    centerContainer.style.justifyContent = 'center';
    centerContainer.style.alignItems = 'center';
    centerContainer.style.margin = '0 20px';
    centerContainer.style.position = 'relative'; 

    const roundsCount = this.visualBracket.length;
    const finalRoundIdx = roundsCount - 1;

    for (let r = 0; r < finalRoundIdx; r++) {
        const roundMatches = this.visualBracket[r];
        const half = Math.ceil(roundMatches.length / 2);
        const matches = roundMatches.slice(0, half);
        const col = this.createBracketColumn(matches, r, 'left');
        leftContainer.appendChild(col);
    }

    for (let r = 0; r < finalRoundIdx; r++) {
        const roundMatches = this.visualBracket[r];
        const half = Math.ceil(roundMatches.length / 2);
        const matches = roundMatches.slice(half);
        const col = this.createBracketColumn(matches, r, 'right');
        rightContainer.appendChild(col);
    }

    const finalMatch = this.visualBracket[finalRoundIdx][0];
    
    const finalBox = document.createElement('div');
    finalBox.className = 'final-box';
    
    const titleDiv = document.createElement('div');
    titleDiv.style.fontSize = '10px';
    titleDiv.style.marginBottom = '2px';
    titleDiv.textContent = t("final");

    const p1Div = document.createElement('div');
    p1Div.style.fontSize = '14px';
    p1Div.dir = 'auto';
    p1Div.textContent = finalMatch.p1 || '?';

    const vsDiv = document.createElement('div');
    vsDiv.style.fontSize = '10px';
    vsDiv.style.color = '#888';
    vsDiv.textContent = 'VS';

    const p2Div = document.createElement('div');
    p2Div.style.fontSize = '14px';
    p2Div.dir = 'auto';
    p2Div.textContent = finalMatch.p2 || '?';

    finalBox.appendChild(titleDiv);
    finalBox.appendChild(p1Div);
    finalBox.appendChild(vsDiv);
    finalBox.appendChild(p2Div);
    if (finalMatch.winner) {
        finalBox.style.boxShadow = "0 0 20px rgba(255, 215, 0, 0.4)";
        finalBox.style.borderColor = "gold";
        finalBox.style.background = "#332200";
    }
    centerContainer.appendChild(finalBox);
    
    if (finalMatch.winner) {
        const winnerDisplay = document.createElement('div');
        winnerDisplay.style.position = 'absolute';
        winnerDisplay.style.bottom = '260px';
        winnerDisplay.style.left = '50%';
        winnerDisplay.style.width = '300%';
        winnerDisplay.style.transform = 'translateX(-50%)';
        winnerDisplay.style.textAlign = 'center';
        winnerDisplay.style.pointerEvents = 'none';
        const label = document.createElement('div');
        label.style.fontSize = '12px';
        label.style.color = 'gold';
        // Only apply letter-spacing for non-RTL languages (breaks Arabic connected script)
        if (document.documentElement.dir !== 'rtl') {
            label.style.letterSpacing = '2px';
        }
        label.style.marginBottom = '5px';
        label.textContent = t('tournament_winner_label');

        const winnerName = document.createElement('div');
        winnerName.style.fontSize = '28px';
        winnerName.style.color = '#fff';
        winnerName.style.fontWeight = 'bold';
        winnerName.style.textShadow = '0 0 15px gold';
        winnerName.textContent = `👑 ${finalMatch.winner} 👑`;

        winnerDisplay.appendChild(label);
        winnerDisplay.appendChild(winnerName);
        centerContainer.appendChild(winnerDisplay);
    }

    bracketContainer.appendChild(leftContainer);
    bracketContainer.appendChild(centerContainer);
    bracketContainer.appendChild(rightContainer);

    // Draw lines after a delay to ensure layout is complete
    setTimeout(() => {
        this.drawBracketLines(bracketContainer);
    }, 150);
}

    private drawBracketLines(container: HTMLElement) {
        // Don't draw any lines - we'll use CSS instead
        // Add connector classes to match boxes
        
        const leftSide = container.querySelector('.bracket-side-left');
        const rightSide = container.querySelector('.bracket-side-right');
        
        if (leftSide) {
            leftSide.querySelectorAll('.match-box').forEach(box => {
                (box as HTMLElement).classList.add('connector-right');
            });
        }
        
        if (rightSide) {
            rightSide.querySelectorAll('.match-box').forEach(box => {
                (box as HTMLElement).classList.add('connector-left');
            });
        }
    }

    private createBracketColumn(matches: VisualMatch[], roundIdx: number, side: 'left'|'right') {
        const col = document.createElement('div');
        col.className = 'bracket-column';
        col.setAttribute('data-side', side);
        
        matches.forEach((match, idx) => {
            let actualMatchIdx = idx;
            if (side === 'right') {
                const totalInRound = this.visualBracket[roundIdx].length;
                const half = Math.ceil(totalInRound / 2);
                actualMatchIdx = idx + half;
            }
            const box = this.createMatchBox(match, roundIdx, actualMatchIdx, side);
            col.appendChild(box);
        });
        return col;
    }

    private createMatchBox(match: VisualMatch, roundIdx: number, matchIdx: number, side: 'left'|'right') {
        const box = document.createElement('div');
        box.className = 'match-box';
        box.setAttribute('data-side', side);
        
        // Smaller boxes for 8-player
        if (this.tournamentSize === 8) {
            box.style.width = '100px';
            box.style.fontSize = '10px';
        }
        
        const isActive = (roundIdx === this.tournamentRound - 1) && (matchIdx === this.currentMatchIndex);
        if (isActive) box.classList.add('active');

        const p1 = document.createElement('div');
        p1.className = 'player-slot';
        p1.dir = 'auto';
        p1.style.textAlign = 'center';
        p1.innerText = match.p1 || 'TBD';
        if (match.winner === match.p1 && match.winner) p1.classList.add('winner');

        const p2 = document.createElement('div');
        p2.className = 'player-slot';
        p2.dir = 'auto';
        p2.style.textAlign = 'center';
        p2.innerText = match.p2 || 'TBD';
        if (match.winner === match.p2 && match.winner) p2.classList.add('winner');

        box.appendChild(p1);
        box.appendChild(p2);

        return box;
    }

}
