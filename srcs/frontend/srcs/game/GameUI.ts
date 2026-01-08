import { GAME_WIDTH, GAME_HEIGHT } from "./types";
import { t } from "../lang";

export class GameUI {
    public static getHTML(): string {
        return `
        <style>
            .btn {
                padding: 10px 20px;
                margin: 0 5px;
                border: 1px solid #fff;
                background: transparent;
                color: #fff;
                cursor: pointer;
                font-family: monospace;
                transition: all 0.2s;
                border-radius: 8px;
            }
            .btn:hover {
                background: rgba(255,255,255,0.1);
            }
            .btn.selected {
                background: #fff;
                color: #000;
            }
            /* Reset direction for UI layer to follow document direction */
            #uiLayer {
                direction: ltr;
            }
            [dir="rtl"] #uiLayer {
                direction: rtl;
            }
        </style>
        <div id= "game-container-wrapper" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: grid;
            grid-template-columns: 200px ${GAME_WIDTH}px 200px;
            grid-template-areas: 'left-player canvas right-player';
            gap: 20px;
            align-items: center;
            direction: ltr;
        ">
            <div id="leftPlayerInfo" style="
                grid-area: left-player;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                display: none;
            ">
                <div id="leftPlayerName" style="font-size: 20px; font-weight: bold; margin-bottom: 10px;"></div>
                <div id="leftPlayerControls" style="font-size: 14px;">W / S</div>
            </div>

        <div id="game-wrapper" style="
            grid-area: canvas;
            position: relative;
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
                        <button id="btnMultiplayer" class="btn">${t("4_players")}</button>
                    </div>
                    <div id="pvpOptions" style="display: block; margin-bottom: 20px;">
                        <p style="margin-bottom: 5px; color: #aaa;">${t("player_2_name")}</p>
                        <input type="text" id="player2NameInput" placeholder="${t("player_name_placeholder")} 2" maxlength="15" style="padding: 10px 20px; width: 250px; background: #222; color:#fff; border: 2px solid #555; border-radius: 5px; font-family: monospace; text-align: center;">
                        <div id="player2Error" style="color: #ff4444; font-size: 12px; margin-top: 5px; display: none;"></div>
                    </div>
                    <div id="aiOptions" style="display: none; margin-bottom: 20px;">
                        <p style="margin-bottom: 5px; color: #aaa;">${t("player_side")}</p>
                        <button id="btnLeft" class="btn selected">${t("left")}</button>
                        <button id="btnRight" class="btn">${t("right")}</button>
                        <div style="margin-top: 15px;">
                            <p style="margin-bottom: 5px; color: #aaa;">${t("difficulty")}</p>
                            <button id="btnEasy" class="btn">${t("easy")}</button>
                            <button id="btnMedium" class="btn selected">${t("medium")}</button>
                            <button id="btnHard" class="btn">${t("hard")}</button>
                        </div>
                    </div>
                    <div style="margin-bottom: 30px;">
                        <p style="margin-bottom: 5px; color: #aaa;">${t("win_score")}</p>
                        <button id="score5" class="btn">5</button>
                        <button id="score11" class="btn selected">11</button>
                        <button id="score21" class="btn">21</button>
                    </div>
                    <button id="btnStart" style="padding: 15px 40px; font-size: 24px; background: white; color: black; border: none; cursor: pointer; font-weight: bold; margin-top: 20px; border-radius: 8px;">${t("start_game")}</button>
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

                    <button id="btnPlay" style="padding: 15px 40px; font-size: 24px; background: white; color: black; border: none; cursor: pointer; font-weight: bold; width: 100%; border-radius: 8px;">${t("play").toUpperCase()}</button>
                    <button id="btnBackCustom" class="btn" style="margin-top: 15px; border: none; font-size: 14px;">&lt; ${t("back")}</button>
                </div>

                <div id="tournamentMenu" style="display: none; text-align: center; padding: 20px; max-width: 700px;">
                    <h2 style="margin-bottom: 20px;">${t("tournament_registration")}</h2>
                    <div style="margin-bottom: 15px;">
                        <p style="color: #aaa; margin-bottom: 5px;">${t("players")}</p>
                        <button id="btn4Players" class="btn selected">4</button>
                        <button id="btn8Players" class="btn">8</button>
                    </div>
                    <div id="playerInputs" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;"></div>
                    <button id="btnStartTourney" class="btn" style="border-color: white;">${t("begin_tournament")}</button>
                    <br><br>
                    <button id="btnBack" class="btn" style="font-size: 12px; border: none;">&lt; ${t("back")}</button>
                </div>

                <div id="tournamentMatchScreen" style="display: none; text-align: center;">
                    <h2 style="margin-bottom: 10px; color: #aaa;">${t("tournament_round")} <span id="tourneyRoundDisplay">1</span></h2>
                    <h1 id="matchupText" style="font-size: 40px; margin-bottom: 30px; color: white; direction: ltr;">A vs B</h1>
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
                    <h1 id="winnerText" style="font-size: 50px; margin-bottom: 20px; color: #0ff; unicode-bidi: plaintext;">PLAYER 1 WINS</h1>
                    <p style="color: #aaa; margin-bottom: 30px;">${t("press_enter")}</p>
                </div>

                <div id="pauseMenu" style="display: none; text-align: center;">
                    <h1 style= "font-size: 60px; margin-bottom: 30px; color: #fff; text-shadow: 0 0 10px #fff;">${t("game_paused")}</h1>
                    <p style="color: #aaa; margin-bottom: 20px;">${t("press_esc_resume")}</p>
                    <button id="btnViewBracketPause" class="btn" style="padding: 15px 40px; margin-bottom: 15px; font-size: 16px; display: none; margin-left: auto; margin-right: auto;">${t("view_bracket")}</button>
                    <button id="btnResume" class="btn" style="padding: 15px 40px; font-size: 20px; border-color: #0f0; color: #0f0; margin-bottom: 15px;">${t("resume_game")}</button>
                    <button id="btnQuit" class="btn" style="padding: 15px 40px; font-size: 20px; border-color: #f00; color: #f00;">${t("quit_to_menu")}</button></button>
                    </div>
            </div>
            </div>
            <div id="rightPlayerInfo" style="
                grid-area: right-player;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                display: none;
            ">
                <div id="rightPlayerName" style="font-size: 20px; font-weight: bold; margin-bottom: 10px;"></div>
                <div id="rightPlayerControls" style="font-size: 14px;">↑ / ↓</div>
            </div>
        </div>
        `;
    }
}
