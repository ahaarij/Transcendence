# week 4 implementation summary

## completed features

### 1. 2fa authentication (totp)
implemented complete two factor authentication using totp codes

**new files:**
- [auth/src/utils/totp.ts](srcs/backend/auth/src/utils/totp.ts) - totp generation and verification
- [auth/src/routes/twofa.ts](srcs/backend/auth/src/routes/twofa.ts) - 2fa endpoints

**features:**
- qr code generation for authenticator apps
- 6 digit totp codes that change every 30 seconds
- setup flow: enable → scan qr → verify → activate
- login flow: password → 2fa code → access
- disable 2fa with password and code verification

**database changes:**
- added `twoFactorSecret` field to store totp secret
- added `twoFactorEnabled` boolean flag

**endpoints:**
- `POST /auth/2fa/enable` - starts 2fa setup
- `POST /auth/2fa/verify` - activates 2fa
- `POST /auth/2fa/disable` - turns off 2fa
- `POST /auth/2fa/validate` - validates code during login

### 2. microservices architecture
split backend into 4 separate services with proper separation

#### auth service (port 3001)
handles all authentication
- user registration and login
- jwt tokens
- google oauth
- 2fa management
- token verification for other services

#### user service (port 3002)
manages user data
- profile viewing and editing
- avatar uploads
- username changes

#### game service (port 3003)
records game data
- match recording
- match history
- player statistics

#### websocket gateway (port 3004)
real time communication
- websocket connections
- player movement broadcasting
- game state sync
- join/leave notifications

### 3. internal service communication
services can talk to each other through internal network

**new file:**
- [shared/service-client.ts](srcs/backend/shared/service-client.ts) - service communication utilities

**functions:**
- `verifyToken()` - checks tokens with auth service
- `getUserById()` - gets user from user service
- `getUserByUsername()` - finds user by name
- `saveMatch()` - saves match to game service
- `getMatchHistory()` - gets match history
- `checkServiceHealth()` - health checks

### 4. code comments
added brief lowercase comments throughout backend explaining what each function and code block does

**style used:**
```typescript
// generates totp secret for 2fa setup
export async function generateTOTPSecret() {
  // creates new totp instance with settings
  const totp = new OTPAuth.TOTP({
    issuer: 'Transcendence',  // app name in authenticator
    // more code...
  });
}
```

all files updated with comments:
- auth service routes and utils
- user service routes
- game service routes
- websocket gateway
- shared utilities
- main entry points
- dockerfiles

### 5. docker setup
updated docker compose with all services

**services in docker-compose.yml:**
- auth service on port 3001
- user service on port 3002
- game service on port 3003
- websocket gateway on port 3004

all services:
- share sqlite database through volume
- communicate through internal network
- have health checks
- restart automatically

### 6. documentation
created comprehensive readme

**new file:**
- [backend/README.md](srcs/backend/README.md) - full microservices documentation

covers:
- service descriptions
- all endpoints
- internal communication
- running instructions
- environment variables
- 2fa implementation
- health checks

## file structure

```
backend/
├── auth/
│   ├── src/
│   │   ├── main.ts          # auth route registration
│   │   ├── routes/
│   │   │   ├── register.ts  # user registration
│   │   │   ├── login.ts     # login with 2fa check
│   │   │   ├── refresh.ts   # token refresh
│   │   │   ├── google.ts    # google oauth
│   │   │   ├── session.ts   # logout and current user
│   │   │   └── twofa.ts     # NEW: 2fa endpoints
│   │   └── utils/
│   │       ├── password.ts  # password hashing
│   │       ├── tokens.ts    # jwt tokens
│   │       └── totp.ts      # NEW: totp generation
│   ├── server.ts            # NEW: auth entry point
│   └── Dockerfile           # auth container
├── user/
│   ├── src/
│   │   └── main.ts          # user routes
│   ├── server.ts            # NEW: user entry point
│   └── Dockerfile           # user container
├── game/
│   ├── src/
│   │   └── main.ts          # game routes
│   ├── server.ts            # NEW: game entry point
│   └── Dockerfile           # game container
├── ws-gateway/              # NEW: websocket service
│   ├── src/
│   │   └── main.ts          # websocket handler
│   ├── package.json
│   └── Dockerfile
├── shared/
│   ├── fastify.ts           # server config
│   ├── service-client.ts    # NEW: service communication
│   └── utils/
│       └── prisma.ts        # database plugin
├── prisma/
│   └── schema.prisma        # updated with 2fa fields
├── docker-compose.yml       # updated with all services
├── package.json             # updated with new scripts
├── README.md                # NEW: documentation
└── setup.sh                 # updated setup script
```

## how to use

### setup
```bash
cd srcs/backend
./setup.sh
```

### run with docker
```bash
docker-compose up --build
```

### run services individually
```bash
npm run dev:auth  # auth on 3001
npm run dev:user  # user on 3002
npm run dev:game  # game on 3003
npm run dev:ws    # websocket on 3004
```

### test 2fa flow
1. register account: `POST /auth/register`
2. login to get token: `POST /auth/login`
3. enable 2fa: `POST /auth/2fa/enable` with token
4. scan qr code with google authenticator
5. verify setup: `POST /auth/2fa/verify` with code
6. logout and login again
7. enter password, get "requires2FA" response
8. complete login: `POST /auth/2fa/validate` with code

## environment variables needed

```env
JWT_ACCESS_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_key
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

## dependencies added
- `otpauth` - totp generation
- `qrcode` - qr code images
- `axios` - service communication
- `@fastify/websocket` - websocket support (in ws-gateway)

## next steps
- connect frontend to 2fa endpoints
- implement websocket connection in game
- add service to service authentication
- setup api gateway for routing
- add monitoring and logging
