# week 4 testing guide

## quick start

### 1. setup backend
```bash
cd srcs/backend
./setup.sh
```

### 2. start services
choose one option:

**option a: docker (recommended)**
```bash
docker-compose up --build
```

**option b: individual terminals**
```bash
# terminal 1
npm run dev:auth

# terminal 2
npm run dev:user

# terminal 3
npm run dev:game

# terminal 4
npm run dev:ws
```

## testing 2fa

### 1. register account
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

save the `accessToken` from response

### 2. enable 2fa
```bash
curl -X POST http://localhost:3001/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

response includes:
- `qrCode` - data url for qr image
- `secret` - backup totp secret

### 3. scan qr code
- open google authenticator or authy app
- scan the qr code from response
- or manually enter the secret

### 4. verify and activate
```bash
curl -X POST http://localhost:3001/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "code": "123456"
  }'
```

use 6 digit code from authenticator app

### 5. test login with 2fa
```bash
# step 1: login with password
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

response will be:
```json
{
  "requires2FA": true,
  "email": "test@example.com",
  "message": "enter 2fa code to complete login"
}
```

```bash
# step 2: complete login with 2fa code
curl -X POST http://localhost:3001/auth/2fa/validate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

now you get tokens and full access

### 6. disable 2fa
```bash
curl -X POST http://localhost:3001/auth/2fa/disable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "code": "123456",
    "password": "password123"
  }'
```

## testing microservices

### health checks
```bash
# check all services are running
curl http://localhost:3001/auth/health
curl http://localhost:3002/user/health
curl http://localhost:3003/game/health
curl http://localhost:3004/ws/health
```

all should return:
```json
{"status": "ok", "service": "service-name"}
```

### user service
```bash
# get public profile
curl http://localhost:3002/user/profile/testuser

# update own profile (needs token)
curl -X PUT http://localhost:3002/user/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "username": "newusername"
  }'
```

### game service
```bash
# record match
curl -X POST http://localhost:3003/game/match \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "userSide": 1,
    "opponentId": "AI",
    "userScore": 5,
    "opponentScore": 3,
    "didUserWin": true,
    "gameMode": "PvAI"
  }'

# get match history
curl http://localhost:3003/game/history/1

# get stats
curl http://localhost:3003/game/stats/1
```

### websocket gateway
```javascript
// connect to websocket in browser console
const ws = new WebSocket('ws://localhost:3004/ws/game');

// authenticate
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_ACCESS_TOKEN'
  }));
};

// handle messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('received:', data);
};

// send game move
ws.send(JSON.stringify({
  type: 'game:move',
  data: { x: 100, y: 200 }
}));
```

## testing internal communication

services can talk to each other:

### example: user service calls auth service
when user service receives request with token, it can verify with auth service:
```typescript
const result = await verifyToken(token);
// returns { userId: 1 } if valid
```

### example: game service gets user info
```typescript
const user = await getUserById(userId, token);
// returns user object from user service
```

## troubleshooting

### services not starting
```bash
# check if ports are in use
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3004

# kill processes if needed
kill -9 PID
```

### database issues
```bash
# reset database
cd srcs/backend
rm prisma/dev.db
npx prisma db push
```

### missing dependencies
```bash
cd srcs/backend
npm install
cd ws-gateway
npm install
```

### docker issues
```bash
# rebuild containers
docker-compose down -v
docker-compose up --build

# check logs
docker-compose logs auth
docker-compose logs user
docker-compose logs game
docker-compose logs ws-gateway
```

## common errors

### "missing environment variables"
create `.env` file in `srcs/backend/`:
```env
JWT_ACCESS_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### "invalid verification code"
- codes expire every 30 seconds
- make sure device time is synced
- try next code if current one expired

### "prisma client not generated"
```bash
cd srcs/backend
npx prisma generate
```

### websocket connection failed
- make sure ws gateway is running on port 3004
- check if token is valid
- verify auth service is accessible

## success checklist

- [ ] all 4 services start without errors
- [ ] health checks return ok
- [ ] can register new user
- [ ] can login and get tokens
- [ ] can enable 2fa and scan qr code
- [ ] authenticator app shows 6 digit codes
- [ ] can verify 2fa code
- [ ] login requires 2fa code after enabling
- [ ] can complete login with 2fa code
- [ ] can disable 2fa
- [ ] can get user profile
- [ ] can record game match
- [ ] can get match history
- [ ] can connect to websocket
- [ ] websocket authentication works
