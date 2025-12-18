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

        const tourneyError = container.querySelector("#tourneyError") as HTMLElement;
        if(tourneyError) tourneyError.innerText = "";
        
        const firstInput = document.createElement("input");
        firstInput.type = "text";
        firstInput.placeholder = currentUsername;
        firstInput.value = currentUsername;
        firstInput.id = `player1`;
        playerInput.appendChild(firstInput);

        for (let i = 2; i <= count; i++){
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `${t("player_name_placeholder")} ${i}`;
            input.id = `player${i}`;
            playerInput.appendChild(input);
        }
    }

    public startTournament(container: HTMLElement): boolean {
        this.tournamentPlayers = [];
        const nameSet = new Set<string>();
        const tourneyError = container.querySelector("#tourneyError") as HTMLElement;

        for (let i = 1; i <= this.tournamentSize; i++){
            const input = container.querySelector(`#player${i}`) as HTMLInputElement; 
            const name = input.value.trim() || `${t("player_name_placeholder")} ${i}`;
            if (nameSet.has(name)){
                tourneyError.innerText = t("error_duplicate_name");
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

        if (this.tournamentSize === 8) {
            bracketContainer.style.width = '100%';
            bracketContainer.style.transform = 'scale(0.9)'; 
        } else {
            bracketContainer.style.width = '70%';
            bracketContainer.style.transform = 'scale(1)';
        }

        const leftContainer = document.createElement('div');
        leftContainer.style.display = 'flex';
        leftContainer.style.flexDirection = 'row';
        leftContainer.style.alignItems = 'center';
        leftContainer.style.gap = '20px';

        const rightContainer = document.createElement('div');
        rightContainer.style.display = 'flex';
        rightContainer.style.flexDirection = 'row-reverse';
        rightContainer.style.alignItems = 'center';
        rightContainer.style.gap = '20px';

        const centerContainer = document.createElement('div');
        centerContainer.style.display = 'flex';
        centerContainer.style.flexDirection = 'column';
        centerContainer.style.justifyContent = 'center';
        centerContainer.style.alignItems = 'center';
        centerContainer.style.margin = '0 40px';
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
        p1Div.textContent = finalMatch.p1 || '?';

        const vsDiv = document.createElement('div');
        vsDiv.style.fontSize = '10px';
        vsDiv.style.color = '#888';
        vsDiv.textContent = 'VS';

        const p2Div = document.createElement('div');
        p2Div.style.fontSize = '14px';
        p2Div.textContent = finalMatch.p2 || '?';

        finalBox.appendChild(titleDiv);
        finalBox.appendChild(p1Div);
        finalBox.appendChild(vsDiv);
        finalBox.appendChild(p2Div);
        if (finalMatch.winner) {
            finalBox.style.boxShadow = "0 0 20px rgba(255, 215, 0, 0.4)"; // gold glow effect
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
            label.style.letterSpacing = '2px';
            label.style.marginBottom = '5px';
            label.textContent = 'TOURNAMENT WINNER';

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
    }

    private createBracketColumn(matches: VisualMatch[], roundIdx: number, side: 'left'|'right') {
        const col = document.createElement('div');
        col.className = 'bracket-column';
        
        matches.forEach((match, idx) => {
            let actualMatchIdx = idx;
            if (side === 'right') {
                const totalInRound = this.visualBracket[roundIdx].length;
                const half = Math.ceil(totalInRound / 2);
                actualMatchIdx = idx + half;
            }
            const box = this.createMatchBox(match, roundIdx, actualMatchIdx);
            col.appendChild(box);
        });
        return col;
    }

    private createMatchBox(match: VisualMatch, roundIdx: number, matchIdx: number) {
        const box = document.createElement('div');
        box.className = 'match-box';
        
        const isActive = (roundIdx === this.tournamentRound - 1) && (matchIdx === this.currentMatchIndex);
        if (isActive) box.classList.add('active');

        const p1 = document.createElement('div');
        p1.className = 'player-slot';
        p1.innerText = match.p1 || 'TBD';
        if (match.winner === match.p1 && match.winner) p1.classList.add('winner');

        const p2 = document.createElement('div');
        p2.className = 'player-slot';
        p2.innerText = match.p2 || 'TBD';
        if (match.winner === match.p2 && match.winner) p2.classList.add('winner');

        box.appendChild(p1);
        box.appendChild(p2);
        return box;
    }
}
