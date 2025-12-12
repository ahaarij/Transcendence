import { GAME_WIDTH, GAME_HEIGHT } from "./types";
import { t } from "../lang";

export class GameUI {
    public static getHTML(): string {
        return `
        <div id="game-wrapper" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${GAME_WIDTH}px;
            height: ${GAME_HEIGHT}px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        ">
            <canvas id="pongCanvas" width="${GAME_WIDTH}" height="${GAME_HEIGHT}" style="width: 100%; height: 100%; border: 3px solid grey; background: black; display: block; box-sizing: border-box;"></canvas>
            <div id="uiLayer" style="
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                background: rgba(0,0,0,0.85); color: white; font-family: monospace; z-index: 10;
                backdrop-filter: blur(2px);
            ">
                <div id="mainMenu" style="text-align: center;">
                    <h1 style="font-size: 60px; margin-bottom: 20px; color: #fff; text-shadow: 0 0 10px #fff;">KING KONG PONG</h1>
                    <div style="margin-bottom: 20px;">
                        <p style="color: #aaa; margin-bottom: 5px;">${t("select_mode")}</p>
                        <button id="btnPvP" class="btn selected">${t("2_players")}</button>
                        <button id="btnPvAI" class="btn">${t("vs_ai")}</button>
                        <button id="btnTourney" class="btn">${t("tournament")}</button>
                    </div>
                    <div id="aiOptions" style="display: none; margin-bottom: 20px;">
                        <p style="margin-bottom: 5px; color: #aaa;">${t("player_side")}</p>
                        <button id="btnLeft" class="btn selected">${t("left")}</button>
                        <button id="btnRight" class="btn">${t("right")}</button>
                    </div>
                    <div style="margin-bottom: 30px;">
                        <p style="margin-bottom: 5px; color: #aaa;">${t("win_score")}</p>
                        <button id="score5" class="btn">5</button>
                        <button id="score11" class="btn selected">11</button>
                        <button id="score21" class="btn">21</button>
                    </div>
                    <button id="btnStart" style="padding: 15px 40px; font-size: 24px; background: white; color: black; border: none; cursor: pointer; font-weight: bold; margin-top: 20px;">${t("start_game")}</button>
                </div>

                <div id="customizationMenu" style="display: none; text-align: center; width: 400px;">
                    <h2 style="margin-bottom: 30px;">${t("game_customization")}</h2>
                    
                    <!-- Paddle Size -->
                    <div style="margin-bottom: 25px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <label>${t("paddle_size")}</label>
                            <span id="paddleSizeVal">80</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="range" id="paddleSizeSlider" min="40" max="150" value="80" style="flex-grow: 1;">
                            <input type="number" id="paddleSizeInput" min="40" max="150" value="80" style="width: 60px; background: transparent; border: 1px solid #fff; color: #fff; padding: 5px; text-align: center;">
                        </div>
                    </div>

                    <!-- Ball Speed -->
                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <label>${t("ball_speed")}</label>
                            <span id="ballSpeedVal">4</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="range" id="ballSpeedSlider" min="2" max="15" value="4" step="0.5" style="flex-grow: 1;">
                            <input type="number" id="ballSpeedInput" min="2" max="15" value="4" step="0.5" style="width: 60px; background: transparent; border: 1px solid #fff; color: #fff; padding: 5px; text-align: center;">
                        </div>
                    </div>

                    <button id="btnPlay" style="padding: 15px 40px; font-size: 24px; background: white; color: black; border: none; cursor: pointer; font-weight: bold; width: 100%;">${t("play").toUpperCase()}</button>
                    <button id="btnBackCustom" class="btn" style="margin-top: 15px; border: none; font-size: 14px;">&lt; ${t("back")}</button>
                </div>

                <div id="tournamentMenu" style="display: none; text-align: center;">
                    <h2 style="margin-bottom: 20px;">${t("tournament_registration")}</h2>
                    <div style="margin-bottom: 15px;">
                        <p style="color: #aaa; margin-bottom: 5px;">${t("players")}</p>
                        <button id="btn4Players" class="btn selected">4</button>
                        <button id="btn8Players" class="btn">8</button>
                    </div>
                    <p id="tourneyError" style="color: #ff4444; font-size: 14px; height: 20px; margin-bottom: 10px;"></p>
                    <div id="playerInputs" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;"></div>
                    <button id="btnStartTourney" class="btn" style="border-color: white;">${t("begin_tournament")}</button>
                    <br><br>
                    <button id="btnBack" class="btn" style="font-size: 12px; border: none;">&lt; ${t("back")}</button>
                </div>

                <div id="tournamentMatchScreen" style="display: none; text-align: center;">
                    <h2 style="margin-bottom: 10px; color: #aaa;">${t("tournament_round")} <span id="tourneyRoundDisplay">1</span></h2>
                    <h1 id="matchupText" style="font-size: 40px; margin-bottom: 30px;">A vs B</h1>
                    <button id="btnViewBracketMatch" class="btn" style="margin-bottom: 20px; font-size: 14px; display: block; margin-left: auto; margin-right: auto;">${t("view_bracket")}</button>
                    <button id="btnStartMatch" class="btn" style="border-color: #0f0; color: #0f0; padding: 15px 30px; font-size: 20px;">${t("start_match")}</button>
                </div>

                <div id="championScreen" style="display: none; text-align: center;">
                    <h2 style="margin-bottom: 20px; color: gold;">🏆 ${t("tournament_champion")} 🏆</h2>
                    <h1 id="championName" style="font-size: 60px; margin-bottom: 40px; color: white;">NAME</h1>
                    <button id="btnViewBracketChamp" class="btn" style="margin-bottom: 20px;">${t("view_final_bracket")}</button>
                    <br>
                    <button id="btnReturnMain" class="btn" style="padding: 15px 30px;">${t("return_to_menu")}</button>
                </div>

                <div id="bracketScreen" style="display: none; width: 100%; height: 100%; flex-direction: column; justify-content: center; align-items: center; background: rgba(0,0,0,0.95); position: absolute; top: 0; left: 0; z-index: 20;">
                    <h2 style="margin-bottom: 30px; color: #fff;">${t("tournament_bracket")}</h2>
                    <div id="bracketContainer" style="display: flex; justify-content: center; gap: 40px; width: 90%; height: 60%;"></div>
                    <button id="btnCloseBracket" class="btn" style="margin-top: 30px; border-color: #aaa; color: #aaa;">${t("close_view")}</button>
                </div>

                <div id="gameOverScreen" style="display: none; text-align: center;">
                    <h1 id="winnerText" style="font-size: 50px; margin-bottom: 20px; color: #0ff;">PLAYER 1 WINS</h1>
                    <p style="color: #aaa; margin-bottom: 30px;">${t("press_enter")}</p>
                </div>
            </div>
        </div>
        `;
    }
}
