import { GameApp } from "../game/game-app";
import { meRequest } from "../api/auth.ts";

let gameApp: GameApp | null = null;

export function PlayPage() {
  return `
    <div class="w-full h-full flex items-center justify-center bg-gray-900">
      <div id="game-container" class="w-full h-full"></div>
    </div>
  `;
}

export function mountPlayPage() {
  const container = document.getElementById("game-container");
  if (container) {
    const style = document.createElement('style');
    style.id = 'game-styles';
    style.innerHTML = `
      /* Scoped to #game-container to avoid polluting global styles */
      #game-container {
        height: 100%;
        width: 100%;
        background-color: #222;
        color: white;
        font-family: 'Courier New', Courier, monospace;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
      #game-container h1 {
        margin-top: 0;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 5px;
      }
      #game-container canvas {
        box-shadow: none; 
        display: block;
        border: 4px solid #444;
        background-color: black;
      }
      .btn {
          padding: 10px 20px;
          margin: 0 5px;
          border: 1px solid #fff;
          background: transparent;
          color: #fff;
          cursor: pointer;
          font-family: monospace;
          transition: all 0.2s;
      }
      .btn:hover {
          background: rgba(255,255,255,0.1);
      }
      .btn.selected {
          background: #fff;
          color: #000;
      }
      
            /* Input Fields (Fixes white background issue) */
      #game-container input { 
          padding: 8px; 
          background: #222; 
          border: 1px solid #555; 
          color: white; 
          font-family: monospace; 
          text-align: center; 
          width: 200px; /* Fixed width to prevent stretching when encountering an error*/
          margin: 0 auto; /* keep it centered if the container grows wider */
      }

      /* Bracket Layout */
      .bracket-column { 
          display: flex; 
          flex-direction: column; 
          justify-content: space-around; 
          height: 100%; 
          align-items: center; 
      }
      
      /* Match Boxes (The Rectangles) */
      .match-box { 
          background: #222; 
          border: 1px solid #555; 
          width: 120px; 
          text-align: center; 
          position: relative; 
          margin: 5px 0; 
          z-index: 2;
      }
      .match-box.active { 
          border-color: #0f0; 
          box-shadow: 0 0 8px rgba(0, 255, 0, 0.4); 
      }
      
      /* Player Slots inside Match Box */
      .player-slot { 
          padding: 4px; 
          border-bottom: 1px solid #444; 
          font-size: 11px; 
          height: 18px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          overflow: hidden; 
          white-space: nowrap; 
      }
      .player-slot:last-child { 
          border-bottom: none; 
      }
      .player-slot.winner { 
          background: #004400; 
          color: #fff; 
          font-weight: bold; 
      }
      
      /* Grand Final Box */
      .final-box { 
          border: 2px solid gold; 
          padding: 10px; 
          width: 140px; 
          text-align: center; 
          color: gold; 
          background: #220000; 
          font-weight: bold; 
          z-index: 2; 
      }
    `;
    document.head.appendChild(style);

    meRequest().then(res => {
      const username = res.user?.username || 'Player 1';
      console.log('Welcome ', username);
      gameApp = new GameApp(container, username);
    })
    .catch((err) => {
      console.error('Error fetching user data: ', err);
      gameApp = new GameApp(container, 'Player 1');
    });
    // gameApp = new GameApp(container);
  }
}

export function unmountPlayPage() {
    if (gameApp) {
        gameApp.destroy();
        gameApp = null;
    }
    const style = document.getElementById('game-styles');
    if (style) {
        style.remove();
    }
}
