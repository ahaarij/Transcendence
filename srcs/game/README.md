# King Kong Pong 🏓

A modern, feature-rich Pong game built with TypeScript and Vite. This classic arcade game includes multiple game modes, AI opponent, and tournament system.

## 🎮 Features

### Game Modes
- **Player vs Player (PvP)**: Classic two-player mode with local multiplayer
- **Player vs AI**: Challenge an intelligent AI opponent with predictive ball tracking
- **Tournament Mode**: Organize tournaments with 4 or 8 players, complete with bracket system

### Gameplay Features
- Dynamic ball physics with speed acceleration on paddle hits
- Angle-based ball deflection based on paddle impact position
- Smooth paddle movement and responsive controls
- Customizable winning scores (5, 11, or 21 points)
- Countdown timer before match starts
- Visual net separator and score display
- Game over screen with winner announcement

### AI Features
- Predictive ball trajectory calculation
- Wall bounce prediction for accurate positioning
- Dynamic difficulty with configurable refresh rate
- Smart positioning when ball is moving away

## 🏗️ Architecture

### Project Structure
```
game/
├── src/
│   ├── main.ts           # Game loop, UI, input handling, and AI logic
│   ├── PongEngine.ts     # Core game engine with physics and collision detection
│   ├── types.ts          # TypeScript interfaces and game constants
│   └── style.css         # Game styling
├── index.html            # Entry HTML file
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

### Core Components

#### `PongEngine.ts`
The heart of the game, handling:
- **Game State Management**: Tracks ball position, paddle positions, scores, and winner
- **Physics Engine**: Ball movement, velocity calculations, and boundary detection
- **Collision Detection**: Precise paddle-ball collision with angle-based deflection
- **Speed Mechanics**: Progressive speed increase (10% per hit) with max cap at 15
- **Win Condition**: Checks and updates winner when score threshold is reached

#### `main.ts`
Manages the game flow and user interaction:
- **Game Loop**: RequestAnimationFrame-based rendering at ~60 FPS
- **State Machine**: Handles MENU, COUNTDOWN, PLAYING, and GAMEOVER states
- **UI System**: Layered canvas (game) and HTML overlay (menus)
- **Input System**: Keyboard event handling for both players
- **AI Logic**: Predictive algorithm with configurable refresh rate
- **Tournament System**: Bracket generation, match progression, and winner tracking

#### `types.ts`
Defines the game's data structures:
- Game state interface with ball, paddles, scores, and winner
- Point interface for 2D coordinates
- Game constants (dimensions, speeds, sizes)

## 🎯 How It Works

### Game Physics
1. **Ball Movement**: Position updated each frame based on velocity vector
2. **Wall Collision**: Ball velocity inverted on top/bottom wall hits
3. **Paddle Collision**:
   - Calculates impact point relative to paddle center
   - Converts to angle (±45° max)
   - Applies speed multiplier (10% increase per hit)
   - Caps maximum speed to prevent impossible gameplay
4. **Scoring**: Ball passing left/right boundaries awards points to opposite player

### AI Algorithm
The AI uses a sophisticated prediction system:
1. **Ball Tracking**: Monitors ball position and velocity
2. **Trajectory Prediction**: Calculates ball's Y-position at paddle's X-coordinate
3. **Bounce Simulation**: Accounts for top/bottom wall reflections
4. **Positioning**: Moves paddle to intercept predicted position
5. **Refresh Rate**: Updates target every 1000ms to simulate reaction time

### Tournament System
1. **Registration**: Players enter names (or use default "Player N")
2. **Bracket Generation**: Pairs players for matches (4 or 8 player brackets)
3. **Match Execution**: Sequential matches with 5-point winning score
4. **Progression**: Winners advance to next round
5. **Championship**: Final winner announced after all rounds

## 🚀 How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the game directory:
```bash
cd srcs/game
```

2. Install dependencies:
```bash
npm install
```

### Running the Game

#### Development Mode
Start the development server with hot reload:
```bash
npm run dev
```
The game will be available at `http://localhost:5173` (default Vite port)

#### Production Build
Build the optimized production version:
```bash
npm run build
```
Output will be in the `dist/` directory.

#### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

## 🎮 Controls

### Player 1 (Left Paddle)
- **W**: Move up
- **S**: Move down

### Player 2 (Right Paddle)
- **↑ (Arrow Up)**: Move up
- **↓ (Arrow Down)**: Move down

### Menu Navigation
- **Mouse Click**: Select options and start game
- **Enter**: Return to menu from game over screen

## ⚙️ Game Constants

Default values defined in `types.ts`:
- Game Width: 800px
- Game Height: 600px
- Paddle Size: 10px × 70px
- Ball Size: 10px
- Paddle Speed: 7 pixels/frame
- Ball Initial Speed: 4 pixels/frame
- Ball Max Speed: 15 pixels/frame
- Speed Multiplier: 1.1 (10% increase per hit)

## 🎨 Customization

### Modifying Game Constants
Edit values in `src/types.ts` to adjust gameplay:
```typescript
export const BALL_SPEED = 4;      // Initial ball speed
export const PADDLE_SPEED = 7;    // Paddle movement speed
export const PADDLE_HEIGHT = 70;  // Paddle size
```

### Adjusting AI Difficulty
In `src/main.ts`, modify:
```typescript
const AI_REFRESH_RATE = 1000;  // AI decision interval (ms)
// Add error margin for easier AI:
const errorMargin = 60;
const randomErr = (Math.random() - 0.5) * errorMargin;
aiTargetY = predictedY - PADDLE_HEIGHT / 2 + randomErr;
```

## 🛠️ Technology Stack

- **TypeScript**: Type-safe JavaScript for robust code
- **Vite**: Fast build tool and development server
- **Canvas API**: 2D rendering for game graphics
- **HTML5/CSS3**: Modern web technologies for UI

## 📝 Development Notes

- The game uses `requestAnimationFrame` for smooth 60 FPS rendering
- Physics calculations account for delta time variations
- Collision detection prevents ball tunneling through paddles
- Tournament mode automatically handles bracket progression
- AI prediction includes multi-bounce calculation for accuracy

## 🐛 Known Issues

- Tournament requires page reload after completion
- Input fields in tournament mode may capture game controls (fixed with focus detection)

## 🔮 Future Enhancements

Potential improvements:
- Sound effects and background music
- Power-ups and obstacles
- Online multiplayer support
- Customizable themes and colors
- Statistics tracking and leaderboards
- Replay system
- Configurable AI difficulty levels in UI

---

**Enjoy playing King Kong Pong!** 🎉
