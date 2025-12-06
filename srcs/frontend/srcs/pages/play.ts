import { GameApp } from "../game/game-app.js";

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
    `;
    document.head.appendChild(style);

    gameApp = new GameApp(container);
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
