# backend microservices architecture

this backend is split into separate microservices for better scalability and organization

## services

### 1. auth service (port 3001)
handles all authentication stuff
- user registration and login
- jwt token creation and verification
- google oauth integration
- 2fa with totp codes
- refresh token management

**endpoints:**
- `POST /auth/register` - creates new account
- `POST /auth/login` - logs in user
- `POST /auth/logout` - logs out user
- `GET /auth/me` - gets current user
- `POST /auth/refresh` - refreshes access token
- `POST /auth/google` - google login
- `POST /auth/2fa/enable` - starts 2fa setup
- `POST /auth/2fa/verify` - activates 2fa
- `POST /auth/2fa/disable` - turns off 2fa
- `POST /auth/2fa/validate` - verifies 2fa code during login
- `GET /auth/verify` - internal endpoint for token verification

### 2. user service (port 3002)
manages user profiles and data
- profile viewing and editing
- avatar uploads
- username changes

**endpoints:**
- `GET /user/profile/:username` - gets public profile
- `PUT /user/me` - updates own profile
- `GET /user/:userId` - gets user by id (internal)

### 3. game service (port 3003)
records and retrieves game data
- match recording after games
- match history tracking
- player statistics calculation

**endpoints:**
- `POST /game/match` - saves match result
- `GET /game/history/:userId` - gets match history
- `GET /game/stats/:userId` - gets player stats

### 4. websocket gateway (port 3004)
handles real time game communication
- websocket connections for multiplayer
- player movement broadcasting
- game state synchronization
- player join/leave notifications

**websocket endpoint:**
- `ws://localhost:3004/ws/game` - game websocket connection

## internal communication

services communicate with each other using http requests through the internal docker network

**service client utilities** (`shared/service-client.ts`):
- `verifyToken()` - verifies jwt with auth service
- `getUserById()` - gets user from user service
- `getUserByUsername()` - finds user by username
- `saveMatch()` - saves match to game service
- `getMatchHistory()` - gets matches from game service
- `checkServiceHealth()` - checks if service is running

## running the services

### development mode
```bash
# install dependencies
npm install

# run database migrations
npm run prisma:push

# start all services
docker-compose up --build
```

### accessing services
- auth: http://localhost:3001
- user: http://localhost:3002
- game: http://localhost:3003
- websocket: ws://localhost:3004

## environment variables

create a `.env` file with these variables:
```
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## database

all services share a single sqlite database through docker volumes
- database file: `./prisma/dev.db`
- schema: `./prisma/schema.prisma`

## 2fa implementation

the auth service supports totp based 2fa
1. user enables 2fa and gets qr code
2. user scans qr code with authenticator app
3. user verifies setup with 6 digit code
4. on login, user enters password then 2fa code
5. user can disable 2fa with password and code

## health checks

each service has a health check endpoint:
- `GET /auth/health` - returns `{status: "ok", service: "auth"}`
- `GET /user/health` - returns `{status: "ok", service: "user"}`
- `GET /game/health` - returns `{status: "ok", service: "game"}`
- `GET /ws/health` - returns `{status: "ok", service: "ws-gateway"}`
