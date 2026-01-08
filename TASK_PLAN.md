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

## Phase 2: Gameplay Features (Medium Priority)

### 5. Pause Functionality
- [x] Add ESC key listener to detect pause request
- [x] Implement pause state in `PongEngine` (freeze game loop)
- [ ] Implement pause state in `FourPlayerEngine`
- [x] Create pause menu overlay UI (semi-transparent background)
- [x] Add "PAUSED" text display
- [x] Add "Resume" button (or press ESC again)
- [x] Add "Quit to Menu" button
- [x] Wire up Resume button to unpause game
- [x] Wire up Quit button to return to main menu
- [x] Test pause/resume in 2-player mode
- [ ] Test pause/resume in 4-player mode
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

### 6. Bracket Connecting Lines
- [ ] Plan bracket visual layout (positions for matches)
- [ ] Implement SVG or Canvas overlay for lines
- [ ] Draw lines connecting Round 1 → Quarterfinals
- [ ] Draw lines connecting Quarterfinals → Semifinals
- [ ] Draw lines connecting Semifinals → Finals
- [ ] Update line positions dynamically based on player count
- [ ] Style lines (color, thickness) to match theme
- [ ] Test with 8-player tournament
- [ ] Test theme switching (ensure lines update color)

---

## Phase 3: AI Enhancement (Advanced Features)

### 7. AI Aiming (Trajectory Prediction)
- [ ] Create ball trajectory prediction function
- [ ] Calculate where ball will intersect with AI paddle's Y position
- [ ] Update AI paddle movement to target predicted position
- [ ] Add smoothing to AI movement (avoid instant snapping)
- [ ] Test AI performance against human player
- [ ] Fine-tune AI speed to be beatable but challenging
- [ ] Ensure AI doesn't have perfect accuracy (add slight error)

### 8. AI Difficulty Levels
- [ ] Create difficulty selection UI (Easy/Medium/Hard buttons)
- [ ] Define AI parameters for each difficulty:
  - **Easy**: Slow reaction, large random errors, misses occasionally
  - **Medium**: Current AI behavior (moderate prediction, some errors)
  - **Hard**: Fast reaction, accurate prediction, minimal errors
- [ ] Implement difficulty-based AI speed adjustment
- [ ] Implement difficulty-based error margin adjustment
- [ ] Add difficulty parameter to AI engine initialization
- [ ] Update match result payload to include AI difficulty
- [ ] Test each difficulty level for balanced gameplay
- [ ] Add difficulty display in game UI
- [ ] Save selected difficulty preference (optional)

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
