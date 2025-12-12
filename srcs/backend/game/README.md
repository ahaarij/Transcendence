# Game Microservice

## Overview
handles game match recording and player statistics tracking

## Database Schema

### Match Table
stores every game match result
- `userId` - who played the match
- `opponentId` - opponent username or "AI"
- `userSide` - 1 for left paddle, 2 for right paddle
- `userScore` - final score for user
- `opponentScore` - final score for opponent
- `didUserWin` - true if user won
- `gameMode` - "PvP", "PvAI", or "Tournament"
- `tournamentSize` - optional, 4 or 8 players
- `tournamentRound` - optional, which tournament round
- `isEliminated` - optional, if user was eliminated
- `playedAt` - timestamp of match

## API Endpoints

### POST /game/match
records a match result after game ends

**request body:**
```json
{
  "userId": 1,
  "userSide": 1,
  "opponentId": "AI",
  "userScore": 11,
  "opponentScore": 5,
  "didUserWin": true,
  "gameMode": "PvAI"
}
```

**response:**
```json
{
  "message": "match recorded successfully",
  "match": {
    "id": 42,
    "playedAt": "2025-12-12T10:30:00.000Z"
  }
}
```

### GET /game/history/:userId
gets last 50 matches for a user

**response:**
```json
{
  "stats": {
    "totalMatches": 25,
    "wins": 18,
    "losses": 7,
    "winRate": "72.0"
  },
  "matches": [
    {
      "id": 42,
      "opponent": "AI",
      "userScore": 11,
      "opponentScore": 5,
      "won": true,
      "gameMode": "PvAI",
      "playedAt": "2025-12-12T10:30:00.000Z"
    }
  ]
}
```

### GET /game/stats/:userId
gets detailed statistics for a user

**response:**
```json
{
  "totalMatches": 25,
  "wins": 18,
  "losses": 7,
  "winRate": "72.0",
  "avgScore": "9.5",
  "pvpWins": 10,
  "pvaiWins": 5,
  "tournamentWins": 3
}
```

## Setup

1. update database schema:
```bash
docker exec transcendence-backend npx prisma db push
docker exec transcendence-backend npx prisma generate
```

2. restart backend:
```bash
docker restart transcendence-backend
```

## Testing

test match recording:
```bash
curl -X POST http://localhost:3000/game/match \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "userSide": 1,
    "opponentId": "AI",
    "userScore": 11,
    "opponentScore": 5,
    "didUserWin": true,
    "gameMode": "PvAI"
  }'
```

get match history:
```bash
curl http://localhost:3000/game/history/1
```

get user stats:
```bash
curl http://localhost:3000/game/stats/1
```

## Frontend Integration

the frontend already sends match results automatically when games end. no changes needed to frontend code.

frontend sends to `/game/match` after every game in:
- `handleMatchEnd()` - for PvP and PvAI modes
- `handleTournamentEnd()` - for tournament matches

## Notes

- matches are stored in sqlite database
- match history linked to users via `userId`
- tournament matches include extra fields for bracket tracking
- AI opponent stored as string "AI" in `opponentId`
- all timestamps auto-generated with `playedAt`
