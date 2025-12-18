import { t } from "../lang";
import { meRequest } from "../api/auth";
import { getGameHistory } from "../api/game";

export function StatsPage() {
  return `
    <div class="cyber-grid"></div>
    <div class="page-overlay"></div>

    <div class="relative min-h-screen flex flex-col items-center pt-20 px-4">
      
      <h1 class="text-6xl md:text-7xl mb-12 font-cyber font-bold text-white tracking-tight">
        ${t("stats")}
      </h1>

      <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        <!-- Total Games -->
        <div class="glass-card p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center">
            <div class="text-[#00f3ff] mb-2">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span class="text-4xl font-cyber font-bold text-white mb-1" id="totalGames">...</span>
            <span class="text-xs text-gray-400 tracking-widest uppercase">Total Games</span>
        </div>

        <!-- Wins -->
        <div class="glass-card p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center">
            <div class="text-[#ff00ff] mb-2">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span class="text-4xl font-cyber font-bold text-white mb-1" id="totalWins">...</span>
            <span class="text-xs text-gray-400 tracking-widest uppercase">Wins</span>
        </div>

        <!-- Win Rate -->
        <div class="glass-card p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center">
            <div class="text-yellow-400 mb-2">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <span class="text-4xl font-cyber font-bold text-white mb-1" id="winRate">...</span>
            <span class="text-xs text-gray-400 tracking-widest uppercase">Win Rate</span>
        </div>

      </div>

      <!-- Match History -->
      <div class="w-full max-w-4xl glass-card p-8 rounded-xl border border-white/10">
        <h2 class="text-2xl font-cyber font-bold mb-6 text-white tracking-wide flex items-center gap-3">
            <span class="w-2 h-8 bg-[#00f3ff] rounded-sm"></span>
            MATCH HISTORY
        </h2>

        <div class="flex flex-col gap-4" id="matchHistoryList">
            <div class="text-center text-gray-500 py-8 font-mono text-sm">Loading stats...</div>
        </div>
      </div>

    </div>
  `;
}

export async function mountStatsPage() {
    const totalGamesEl = document.getElementById("totalGames");
    const totalWinsEl = document.getElementById("totalWins");
    const winRateEl = document.getElementById("winRate");
    const historyList = document.getElementById("matchHistoryList");

    try {
        const userRes = await meRequest();
        if (!userRes || !userRes.user) {
            throw new Error("User not found");
        }
        const userId = userRes.user.id;

        const data = await getGameHistory(userId);
        const { stats, matches } = data;

        if (totalGamesEl) totalGamesEl.textContent = stats.totalMatches.toString();
        if (totalWinsEl) totalWinsEl.textContent = stats.wins.toString();
        if (winRateEl) winRateEl.textContent = `${Math.round(stats.winRate)}%`;

        if (historyList) {
            if (matches.length === 0) {
                historyList.innerHTML = `<div class="text-center text-gray-500 py-8 font-mono text-sm">No matches played yet.</div>`;
            } else {
                historyList.innerHTML = '';
                matches.forEach((match: any) => {
                    const date = new Date(match.playedAt).toLocaleDateString();
                    const result = match.won ? "WIN" : "LOSS";
                    const score = `${match.userScore} - ${match.opponentScore}`;
                    const opponentName = match.opponent || "Unknown";

                    const matchEl = document.createElement('div');
                    matchEl.className = "flex items-center justify-between p-4 bg-black/30 rounded border border-white/5 hover:border-white/20 transition group";

                    const leftDiv = document.createElement('div');
                    leftDiv.className = "flex items-center gap-4";

                    const avatarDiv = document.createElement('div');
                    avatarDiv.className = "w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold text-gray-400 border border-white/10";
                    avatarDiv.textContent = opponentName.substring(0, 2).toUpperCase();

                    const infoDiv = document.createElement('div');
                    
                    const nameDiv = document.createElement('div');
                    nameDiv.className = "text-white font-bold tracking-wide group-hover:text-[#00f3ff] transition-colors";
                    nameDiv.textContent = opponentName;

                    const dateDiv = document.createElement('div');
                    dateDiv.className = "text-xs text-gray-500 font-mono";
                    dateDiv.textContent = date;

                    infoDiv.appendChild(nameDiv);
                    infoDiv.appendChild(dateDiv);
                    leftDiv.appendChild(avatarDiv);
                    leftDiv.appendChild(infoDiv);

                    const rightDiv = document.createElement('div');
                    rightDiv.className = "flex items-center gap-6";

                    const scoreDiv = document.createElement('div');
                    scoreDiv.className = "font-cyber text-xl tracking-widest text-white";
                    scoreDiv.textContent = score;

                    const resultDiv = document.createElement('div');
                    resultDiv.className = `px-3 py-1 rounded text-xs font-bold tracking-wider ${result === 'WIN' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`;
                    resultDiv.textContent = result;

                    rightDiv.appendChild(scoreDiv);
                    rightDiv.appendChild(resultDiv);

                    matchEl.appendChild(leftDiv);
                    matchEl.appendChild(rightDiv);
                    
                    historyList.appendChild(matchEl);
                });
            }
        }

    } catch (error) {
        console.error("Failed to load stats:", error);
        if (historyList) {
            historyList.innerHTML = `<div class="text-center text-red-400 py-8 font-mono text-sm">Failed to load stats.</div>`;
        }
    }
}
