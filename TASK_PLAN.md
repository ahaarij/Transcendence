# Feature Implementation Task Plan

**Branch:** `feature/ui-polish`  
**Created:** December 24, 2025

---

## Phase 1: UI Polish (Immediate Tasks) ✅

### 1. Round Button Corners ✅
- [x] Add `border-radius` property to `.btn` class in CSS
- [x] Test button appearance in both light and dark themes
- [x] Verify all buttons (menu, game modes, tournament) have rounded corners
- [x] Check button hover states still work properly

### 2. Tournament Registration 2-Column Layout ✅
- [x] Update tournament HTML structure to use 2-column grid
- [x] Position 4 player input fields on left column
- [x] Position 4 player input fields on right column
- [x] Add CSS grid layout for responsive 2-column design
- [x] Test with 8 players (ensure all fields are accessible)
- [x] Verify validation still works for all 8 fields
- [x] Check layout responsiveness on smaller screens

### 3. Tournament Error Styling ✅
- [x] Locate current error message element in tournament setup
- [x] Match error styling to 4-player mode (color, positioning, font)
- [x] Ensure error clears properly when corrected
- [x] Test error display with various validation failures
- [x] Verify error doesn't break layout in 2-column design

### 4. 2-Player Alias Input ✅
- [x] Add Player 2 name input field to PvP mode setup
- [x] Create input validation (non-empty, unique from Player 1)
- [x] Update UI to show both player names before game starts
- [x] Pass Player 2 alias to game engine
- [x] Update `GameRenderer.ts` to display Player 2 alias instead of "Right Player"
- [x] Update `sendMatchResult()` call to include both player aliases
- [x] Test PvP game flow with custom names

---

## Phase 2: Gameplay Features (Medium Priority) ✅

### 5. Pause Functionality ✅
- [x] Add ESC key listener to detect pause request
- [x] Implement pause state in `PongEngine` (freeze game loop)
- [x] Implement pause state in `FourPlayerEngine`
- [x] Create pause menu overlay UI (semi-transparent background)
- [x] Add "PAUSED" text display
- [x] Add "Resume" button (or press ESC again)
- [x] Add "Quit to Menu" button
- [x] Wire up Resume button to unpause game
- [x] Wire up Quit button to return to main menu
- [x] Test pause/resume in 2-player mode
- [x] Test pause/resume in 4-player mode
- [x] Test pause in PvAI mode
- [x] Ensure ball doesn't move when paused
- [x] Ensure countdown doesn't run when paused
- [x] Block player input during pause
- [x] Block AI movement during pause
- [x] Preserve AI 1-second delay rhythm across pauses (timestamp adjustment)
- [x] Preserve countdown 1-second rhythm across pauses (timestamp adjustment)
- [x] Add "View Bracket" button in tournament pause menu
- [x] Hide bracket screen when resuming from pause
- [x] Reset button selections when quitting to menu
- [x] Fix pause menu button layout (vertical stacking, centered)

### 6. Bracket Connecting Lines ✅
- [x] Plan bracket visual layout (positions for matches)
- [x] Implement CSS-based connectors (::after pseudo-elements)
- [x] Draw horizontal lines from match boxes
- [x] Draw vertical lines connecting Quarterfinals to Semifinals (8-player)
- [x] Draw lines connecting Semifinals to Finals
- [x] Handle 4-player vs 8-player layouts differently
- [x] Style lines (color: #666, thickness: 2px)
- [x] Test with 4-player tournament
- [x] Test with 8-player tournament

---

## Phase 3: AI Enhancement (Advanced Features) ✅

### 7. AI Difficulty Selection UI ✅
- [x] Add difficulty buttons (Easy/Medium/Hard) to PvAI mode setup
- [x] Show difficulty options only when PvAI mode is selected
- [x] Style buttons to match existing UI (highlight selected)
- [x] Store selected difficulty in game-app state
- [x] Pass difficulty to GameAI via `setDifficulty()` method

### 8. Easy Mode (Human Error) ✅
- [x] Add random offset to AI target position (±80px error range)
- [x] Only apply error when ball is moving toward AI
- [x] Test to ensure it feels beatable but not broken

### 9. Hard Mode (Strategic Aiming) ✅
- [x] Get opponent paddle position in AI logic
- [x] Calculate target zone based on opponent position:
  - Player in bottom half → aim for top region (+aimOffset)
  - Player in top half → aim for bottom region (-aimOffset)
- [x] Handle opposite corners case (player at top but predicted at top → flip)
- [x] Use smooth aiming with aimOffset of 80px
- [x] Test to ensure AI is challenging but not impossible

#### Hard Mode - Tried & Discarded Approaches
The following strategies were tested but removed from the final implementation:

1. **Ball Speed Strategy** - Aim for walls when ball is fast to force bounces
   - Issue: Made AI less accurate, caused easy misses
   
2. **15% Random Flip** - Occasionally aim opposite direction for unpredictability
   - Issue: Made AI seem stupid rather than strategic
   
3. **Ball Landing Position Check** - Only aim away if ball is landing near player
   - Issue: Added complexity but actually made AI easier to beat
   
4. **Opposite Corners Priority** - Originally placed before player position check
   - Issue: Order matters - checking player position first works better

**Final Implementation**: Simple player position check with opposite corners fallback

---

## Bonus Features (Added During Development)

### 10. Serve Rotation System ✅
- [x] Track current server (Player 1 or Player 2)
- [x] Track serves remaining (2 per player)
- [x] Switch server after every 2 points
- [x] First serve is random (either player)
- [x] Serve direction goes toward the receiver

### 11. Random Ball Velocity ✅
- [x] Port random velocity logic from 4-player engine
- [x] Random angle between 0.3 and 0.7 radians
- [x] Consistent ball speed of 8
- [x] Ball goes in direction of receiver (not scorer)

---

## Phase 4: Internationalization & RTL Support ✅

### 12. Missing Translations ✅
- [x] Add Arabic/French translations for 4-player mode (`4_players`, `player_2_name`, etc.)
- [x] Add translations for difficulty selection (`difficulty`, `easy`, `medium`, `hard`)
- [x] Add translations for pause menu (`game_paused`, `press_esc_resume`, `resume_game`, `quit_to_menu`)
- [x] Add translations for 4-player setup (`4_player_setup`, player labels)
- [x] Add translations for game over states (`eliminated`, `winner`, `press_enter_continue`)
- [x] Add translations for win message (`player_wins` with `{name}` placeholder)
- [x] Add translation for tournament winner label (`tournament_winner_label`)

### 13. RTL Layout Fixes ✅
- [x] Fix bracket container flipping in RTL (add `direction: ltr`)
- [x] Fix 4-player grid layout in RTL (add `direction: ltr` to game grid)
- [x] Fix countdown centering (use `textAlign`/`textBaseline` in canvas)
- [x] Fix game over text order for RTL (use placeholder replacement pattern)
- [x] Fix Arabic "!" position (move to logical start for visual end in RTL)
- [x] Fix main menu button order (CSS `[dir="rtl"] #uiLayer { direction: rtl; }`)
- [x] Fix 2-player game layout (add `direction: ltr` to wrapper, keep player panels consistent)

### 14. Arabic Text Rendering ✅
- [x] Fix letter-spacing breaking Arabic connected script
- [x] Add RTL CSS rules to disable `letter-spacing` for Arabic in `style.css`
- [x] Add RTL override in `play.ts` for `#game-container h1`
- [x] Add RTL override in `game/style.css` for `#game-container h1`
- [x] Add RTL check in `TournamentManager.ts` for winner label inline style

---

## Testing & Polish

### Final Checks Before Merge
- [ ] Test all game modes (PvP, PvAI, Tournament, 4-Player)
- [ ] Verify all new features work in both light and dark themes
- [ ] Check for XSS vulnerabilities in new input fields
- [ ] Ensure all match results send correctly to backend
- [ ] Test on different screen sizes/resolutions
- [ ] Code review for consistency and best practices
- [ ] Update any relevant documentation
- [ ] Commit all changes with descriptive messages
- [ ] Merge feature branch to main

---

## Notes

- **Priority Order**: Complete Phase 1 before moving to Phase 2, complete Phase 2 before Phase 3
- **Testing**: Test each feature immediately after implementation
- **Commits**: Make atomic commits for each completed task/subtask
- **Branch Management**: Keep feature branch up to date with main if needed

---

## Quick Reference

**File Locations:**
- CSS Styles: `srcs/frontend/srcs/game/style.css` (if exists) or inline in HTML
- 2-Player Game: `srcs/frontend/srcs/game/GameManager.ts`, `GameRenderer.ts`, `PongEngine.ts`
- 4-Player Game: `srcs/frontend/srcs/game/FourPlayerManager.ts`, `FourPlayerRenderer.ts`, `FourPlayerEngine.ts`
- Tournament: `srcs/frontend/srcs/game/game-app.ts` (setupTournament method)
- API: `srcs/frontend/srcs/api/game.ts`

**Control Schemes:**
- 2-Player: Left (W/S), Right (Arrow Up/Down)
- 4-Player: Top (V/B), Bottom (J/K), Left (W/S), Right (Arrow Up/Down)
