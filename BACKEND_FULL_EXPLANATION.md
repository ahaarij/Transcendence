# Backend Full Explanation

This document provides a complete explanation of the Transcendence backend architecture, including the microservices design, API endpoints, authentication flow, and database schema.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Microservices Design](#microservices-design)
3. [Technology Stack](#technology-stack)
4. [Services Breakdown](#services-breakdown)
   - [API Gateway](#api-gateway)
   - [Auth Service](#auth-service)
   - [User Service](#user-service)
   - [Game Service](#game-service)
5. [Database Schema](#database-schema)
6. [Authentication Flow](#authentication-flow)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Password Requirements](#password-requirements)
9. [Inter-Service Communication](#inter-service-communication)
10. [Docker Deployment](#docker-deployment)
11. [Development Mode](#development-mode)
12. [Environment Variables](#environment-variables)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
│                     http://localhost:5173                        │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│                    http://localhost:3000                         │
│                                                                  │
│   • Routes requests to appropriate microservices                 │
│   • Single entry point for all API calls                         │
│   • Health check aggregation                                     │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   AUTH SERVICE  │   │   USER SERVICE  │   │   GAME SERVICE  │
│   Port: 3001    │   │   Port: 3002    │   │   Port: 3003    │
│                 │   │                 │   │                 │
│ • Registration  │   │ • User profiles │   │ • Match history │
│ • Login/Logout  │   │ • Avatar upload │   │ • Game stats    │
│ • JWT tokens    │   │ • Friend system │   │ • Record matches│
│ • 2FA (TOTP)    │   │ • User lookup   │   │                 │
│ • Google OAuth  │   │                 │   │                 │
│ • Password mgmt │   │                 │   │                 │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
                    ┌─────────────────┐
                    │   SQLite DB     │
                    │   (Prisma ORM)  │
                    │                 │
                    │ • Users         │
                    │ • Friends       │
                    │ • Matches       │
                    └─────────────────┘
```

---

## Microservices Design

The backend follows a **microservices architecture** where each service:

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | Each service handles one domain (auth, user, game) |
| **Independent Deployment** | Each service has its own Dockerfile and can be deployed separately |
| **Loose Coupling** | Services communicate via HTTP REST APIs |
| **Service Discovery** | API Gateway routes requests to service URLs via environment variables |
| **Fault Isolation** | If one service fails, others continue operating |

### Service Boundaries

```
┌──────────────────────────────────────────────────────────────┐
│  AUTH SERVICE                                                 │
│  Responsibility: Authentication & Authorization               │
│  Data Owned: JWT tokens, 2FA secrets, passwords               │
├──────────────────────────────────────────────────────────────┤
│  Endpoints: /auth/*                                           │
│  Dependencies: None (core service)                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  USER SERVICE                                                 │
│  Responsibility: User profiles & social features              │
│  Data Owned: User profiles, avatars, friend relationships     │
├──────────────────────────────────────────────────────────────┤
│  Endpoints: /user/*                                           │
│  Dependencies: Auth Service (token verification)              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  GAME SERVICE                                                 │
│  Responsibility: Game data & statistics                       │
│  Data Owned: Match records, game statistics                   │
├──────────────────────────────────────────────────────────────┤
│  Endpoints: /game/*                                           │
│  Dependencies: User Service (user lookup)                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Node.js 20 | JavaScript runtime |
| **Language** | TypeScript | Type-safe JavaScript |
| **Web Framework** | Fastify | Fast, low-overhead web framework |
| **Database** | SQLite | Lightweight, file-based database |
| **ORM** | Prisma | Type-safe database access |
| **Authentication** | JWT | Stateless authentication tokens |
| **Password Hashing** | bcryptjs | Secure password storage |
| **2FA** | TOTP (RFC 6238) | Time-based one-time passwords |
| **OAuth** | Google Auth | Third-party authentication |
| **Container** | Docker | Service containerization |

---

## Services Breakdown

### API Gateway

**Location:** `srcs/backend/gateway/server.ts`  
**Port:** 3000 (configurable via `GATEWAY_PORT`)

The API Gateway is the single entry point for all client requests. It:

- **Routes requests** to the appropriate microservice based on URL prefix
- **Handles CORS** for frontend communication
- **Aggregates health checks** from all services
- **Provides service discovery** via environment variables

```typescript
// Routing configuration
/auth/*  →  AUTH_SERVICE (http://localhost:3001)
/user/*  →  USER_SERVICE (http://localhost:3002)
/game/*  →  GAME_SERVICE (http://localhost:3003)
```

**Gateway Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Gateway health status |
| `/health/all` | GET | All services health status |

---

### Auth Service

**Location:** `srcs/backend/auth/`  
**Port:** 3001 (configurable via `AUTH_PORT`)

Handles all authentication-related functionality:

#### Features:
- **User Registration** with password validation
- **Email/Password Login** with JWT tokens
- **Google OAuth** login and registration
- **JWT Token Management** (access + refresh tokens)
- **Two-Factor Authentication** (TOTP)
- **Password Change** with validation
- **Account Deletion**

#### Files:
```
auth/
├── service.ts              # Standalone service entry point
├── server.ts               # Legacy standalone server
├── src/
│   ├── main.ts             # Route registration
│   ├── routes/
│   │   ├── register.ts     # User registration
│   │   ├── login.ts        # Email/password login
│   │   ├── google.ts       # Google OAuth
│   │   ├── session.ts      # Current user, logout, verify
│   │   ├── refresh.ts      # Token refresh
│   │   ├── twofa.ts        # 2FA enable/verify/disable
│   │   ├── password.ts     # Password change
│   │   └── delete.ts       # Account deletion
│   └── utils/
│       ├── password.ts     # Bcrypt hashing
│       ├── tokens.ts       # JWT generation/verification
│       ├── totp.ts         # TOTP generation/verification
│       └── validation.ts   # Password validation rules
```

---

### User Service

**Location:** `srcs/backend/user/`  
**Port:** 3002 (configurable via `USER_PORT`)

Manages user profiles and social features:

#### Features:
- **Profile Management** (view, update)
- **Avatar Upload** (base64 image handling)
- **Friend System** (requests, accept/reject, remove)
- **Friend Stats** (view friend's game statistics)

#### Files:
```
user/
├── service.ts              # Standalone service entry point
├── server.ts               # Legacy standalone server
└── src/
    └── main.ts             # All user routes
```

---

### Game Service

**Location:** `srcs/backend/game/`  
**Port:** 3003 (configurable via `GAME_PORT`)

Handles game data and statistics:

#### Features:
- **Match Recording** (PvP, PvAI, Tournament)
- **Match History** (last 50 matches per user)
- **Statistics** (wins, losses, win rate, by game mode)

#### Files:
```
game/
├── service.ts              # Standalone service entry point
├── server.ts               # Legacy standalone server
└── src/
    └── main.ts             # All game routes
```

---

## Database Schema

The application uses **SQLite** with **Prisma ORM**.

### User Model
```prisma
model User {
  id                String    @id @default(uuid())
  username          String    @unique
  email             String    @unique
  password          String?                    // null for Google-only users
  refreshToken      String?                    // hashed refresh token
  googleId          String?   @unique          // Google OAuth ID
  avatar            String?                    // avatar URL
  twoFactorSecret   String?                    // TOTP secret
  twoFactorEnabled  Boolean   @default(false)  // 2FA status
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  matches                    Match[]   @relation("UserMatches")
  sentFriendRequests         Friend[]  @relation("SentFriendRequests")
  receivedFriendRequests     Friend[]  @relation("ReceivedFriendRequests")
}
```

### Friend Model
```prisma
model Friend {
  id        Int       @id @default(autoincrement())
  userId    String    // sender's UUID
  friendId  String    // recipient's UUID
  status    String    @default("pending")  // "pending", "accepted", "rejected"
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // Relations
  user      User      @relation("SentFriendRequests", ...)
  friend    User      @relation("ReceivedFriendRequests", ...)
  
  @@unique([userId, friendId])  // prevents duplicates
}
```

### Match Model
```prisma
model Match {
  id               Int       @id @default(autoincrement())
  userId           String    // player's UUID
  opponentId       String    // opponent username or "AI"
  userSide         Int       // 1 = left paddle, 2 = right paddle
  userScore        Int
  opponentScore    Int
  didUserWin       Boolean
  gameMode         String    // "PvP", "PvAI", "Tournament"
  tournamentSize   Int?      // 4 or 8 players
  tournamentRound  Int?      // round number
  isEliminated     Boolean?  // tournament elimination status
  playedAt         DateTime  @default(now())
  
  // Relations
  user             User      @relation("UserMatches", ...)
}
```

---

## Authentication Flow

### Registration Flow
```
┌─────────┐         ┌─────────────┐         ┌──────────┐
│ Client  │         │ Auth Service│         │ Database │
└────┬────┘         └──────┬──────┘         └────┬─────┘
     │                     │                     │
     │ POST /auth/register │                     │
     │ {username, email,   │                     │
     │  password}          │                     │
     │────────────────────>│                     │
     │                     │                     │
     │                     │ Validate password   │
     │                     │ (8+ chars, upper,   │
     │                     │  lower, number,     │
     │                     │  special char)      │
     │                     │                     │
     │                     │ Check email/username│
     │                     │─────────────────────>
     │                     │                     │
     │                     │ Create user         │
     │                     │─────────────────────>
     │                     │                     │
     │ {accessToken,       │                     │
     │  refreshToken,      │                     │
     │  user}              │                     │
     │<────────────────────│                     │
```

### Login Flow (with 2FA)
```
┌─────────┐         ┌─────────────┐         ┌──────────┐
│ Client  │         │ Auth Service│         │ Database │
└────┬────┘         └──────┬──────┘         └────┬─────┘
     │                     │                     │
     │ POST /auth/login    │                     │
     │ {email, password}   │                     │
     │────────────────────>│                     │
     │                     │                     │
     │                     │ Find user, verify pw│
     │                     │─────────────────────>
     │                     │                     │
     │ If 2FA enabled:     │                     │
     │ {requires2FA: true} │                     │
     │<────────────────────│                     │
     │                     │                     │
     │ POST /auth/2fa/     │                     │
     │      validate       │                     │
     │ {email, code}       │                     │
     │────────────────────>│                     │
     │                     │                     │
     │                     │ Verify TOTP code    │
     │                     │─────────────────────>
     │                     │                     │
     │ {accessToken,       │                     │
     │  refreshToken}      │                     │
     │<────────────────────│                     │
```

### Token Refresh Flow
```
┌─────────┐         ┌─────────────┐         ┌──────────┐
│ Client  │         │ Auth Service│         │ Database │
└────┬────┘         └──────┬──────┘         └────┬─────┘
     │                     │                     │
     │ Access token        │                     │
     │ expired (15min)     │                     │
     │                     │                     │
     │ POST /auth/refresh  │                     │
     │ {refreshToken}      │                     │
     │────────────────────>│                     │
     │                     │                     │
     │                     │ Verify refresh token│
     │                     │ (lasts 7 days)      │
     │                     │─────────────────────>
     │                     │                     │
     │ {accessToken}       │ Generate new access │
     │<────────────────────│ token               │
```

---

## API Endpoints Reference

### Auth Service (`/auth`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/health` | GET | No | Health check |
| `/auth/register` | POST | No | Create new account |
| `/auth/login` | POST | No | Login with email/password |
| `/auth/google` | POST | No | Login with Google |
| `/auth/logout` | POST | Yes | Logout (clear refresh token) |
| `/auth/me` | GET | Yes | Get current user info |
| `/auth/verify` | GET | Yes | Verify token (internal use) |
| `/auth/refresh` | POST | No | Get new access token |
| `/auth/2fa/enable` | POST | Yes | Start 2FA setup |
| `/auth/2fa/verify` | POST | Yes | Verify & activate 2FA |
| `/auth/2fa/disable` | POST | Yes | Disable 2FA |
| `/auth/2fa/validate` | POST | No | Verify 2FA during login |
| `/auth/password/change` | POST | Yes | Change password |
| `/auth/account` | DELETE | Yes | Delete account |

### User Service (`/user`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/user/health` | GET | No | Health check |
| `/user/profile/:username` | GET | No | Get public profile |
| `/user/me` | PUT | Yes | Update own profile |
| `/user/:userId` | GET | Yes | Get user by ID (internal) |
| `/user/friends/request` | POST | Yes | Send friend request |
| `/user/friends/respond` | PUT | Yes | Accept/reject request |
| `/user/friends` | GET | Yes | List friends & requests |
| `/user/friends/:id` | DELETE | Yes | Remove friend |
| `/user/friends/:id/stats` | GET | Yes | Get friend's stats |
| `/user/friends/:id/matches` | GET | Yes | Get friend's match history |

### Game Service (`/game`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/game/health` | GET | No | Health check |
| `/game/match` | POST | No | Record match result |
| `/game/history/:userId` | GET | No | Get match history |
| `/game/stats/:userId` | GET | No | Get detailed stats |

---

## Password Requirements

Passwords must meet ALL of the following requirements:

| Requirement | Description |
|-------------|-------------|
| **Length** | Minimum 8 characters |
| **Uppercase** | At least 1 uppercase letter (A-Z) |
| **Lowercase** | At least 1 lowercase letter (a-z) |
| **Number** | At least 1 digit (0-9) |
| **Special Character** | At least 1 special character: `!@#$%^&*()_+-=[]{}|;':\",./<>?\`~` |

### Example Valid Passwords:
- `MyPass123!`
- `Secure@2024`
- `Hello_World1`

### Example Invalid Passwords:
- `password` (no uppercase, number, or special char)
- `PASSWORD123` (no lowercase or special char)
- `Pass123` (too short, no special char)

---

## Inter-Service Communication

Services communicate via HTTP REST APIs using the shared service client.

**Location:** `srcs/backend/shared/service-client.ts`

### Available Functions:

```typescript
// Verify JWT token via auth service
verifyToken(token: string): Promise<{ userId: string } | null>

// Get user by ID via user service
getUserById(userId: string, token: string): Promise<User | null>

// Get user by username via user service
getUserByUsername(username: string): Promise<User | null>

// Save match via game service
saveMatch(matchData: MatchData, token: string): Promise<boolean>

// Get match history via game service
getMatchHistory(userId: string, token: string): Promise<Match[]>

// Check service health
checkServiceHealth(serviceName: 'auth' | 'user' | 'game'): Promise<boolean>
```

### Service URLs:
```
AUTH_SERVICE_URL=http://localhost:3001  (or http://auth:3001 in Docker)
USER_SERVICE_URL=http://localhost:3002  (or http://user:3002 in Docker)
GAME_SERVICE_URL=http://localhost:3003  (or http://game:3003 in Docker)
```

---

## Docker Deployment

### Microservices Mode

Use `docker-compose.microservices.yml` for true microservices deployment:

```bash
cd srcs/backend
docker-compose -f docker-compose.microservices.yml up --build
```

This starts:
- **Gateway** on port 3000
- **Auth Service** on port 3001
- **User Service** on port 3002
- **Game Service** on port 3003

### Docker Architecture:
```
┌────────────────────────────────────────────────────┐
│                  Docker Network                     │
│                  (microservices)                    │
│                                                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │  gateway  │  │   auth    │  │   user    │       │
│  │  :3000    │──│  :3001    │  │  :3002    │       │
│  │           │  │           │  │           │       │
│  └───────────┘  └───────────┘  └───────────┘       │
│        │              │              │             │
│        │        ┌───────────┐        │             │
│        └────────│   game    │────────┘             │
│                 │  :3003    │                      │
│                 └───────────┘                      │
│                       │                            │
│                 ┌───────────┐                      │
│                 │  volumes  │                      │
│                 │ • db-data │                      │
│                 │ • uploads │                      │
│                 └───────────┘                      │
└────────────────────────────────────────────────────┘
```

---

## Development Mode

### Running All Services Together (Monolith Mode)

For development, you can run all services in a single process:

```bash
cd srcs/backend
npm run dev
```

This uses `main.ts` which registers all routes in one Fastify instance.

### Running Services Separately

Terminal 1 - Auth Service:
```bash
npx ts-node auth/service.ts
```

Terminal 2 - User Service:
```bash
npx ts-node user/service.ts
```

Terminal 3 - Game Service:
```bash
npx ts-node game/service.ts
```

Terminal 4 - API Gateway:
```bash
npx ts-node gateway/server.ts
```

---

## Environment Variables

### Required Variables:
```env
# JWT secrets (must be strong random strings)
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Optional Variables:
```env
# Service ports (defaults shown)
PORT=3000              # Monolith mode port
GATEWAY_PORT=3000      # API Gateway port
AUTH_PORT=3001         # Auth service port
USER_PORT=3002         # User service port
GAME_PORT=3003         # Game service port

# Service URLs (for inter-service communication)
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
GAME_SERVICE_URL=http://localhost:3003

# Environment
NODE_ENV=development   # or 'production'
```

---

## Shared Components

### `shared/fastify.ts`
Builds configured Fastify server with:
- CORS enabled for frontend
- 10MB body limit (for avatar uploads)
- Static file serving from `/public`

### `shared/utils/prisma.ts`
Fastify plugin that:
- Initializes Prisma client with SQLite adapter
- Decorates Fastify instance with `app.prisma`
- Handles cleanup on server close

### File Structure Overview:
```
srcs/backend/
├── main.ts                    # Monolith entry point
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── prisma.config.ts           # Prisma config
│
├── gateway/                   # API Gateway service
│   ├── server.ts              # Gateway entry point
│   └── Dockerfile
│
├── auth/                      # Auth microservice
│   ├── service.ts             # Service entry point
│   ├── Dockerfile
│   └── src/
│       ├── main.ts            # Route registration
│       ├── routes/            # Endpoint handlers
│       └── utils/             # Helper functions
│
├── user/                      # User microservice
│   ├── service.ts             # Service entry point
│   ├── Dockerfile
│   └── src/
│       └── main.ts            # All routes
│
├── game/                      # Game microservice
│   ├── service.ts             # Service entry point
│   ├── Dockerfile
│   └── src/
│       └── main.ts            # All routes
│
├── shared/                    # Shared utilities
│   ├── fastify.ts             # Server builder
│   ├── service-client.ts      # Inter-service HTTP client
│   └── utils/
│       └── prisma.ts          # Database plugin
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── dev.db                 # SQLite database file
│
├── docker-compose.yml         # Basic compose
├── docker-compose.dev.yml     # Development compose
└── docker-compose.microservices.yml  # Microservices compose
```

---

## Summary

The Transcendence backend is a **microservices-based architecture** built with:

- **Node.js + TypeScript + Fastify** for high performance
- **4 independent services** (Gateway, Auth, User, Game)
- **SQLite + Prisma** for data persistence
- **JWT + 2FA** for security
- **Docker** for containerization
- **RESTful APIs** for inter-service communication

Each service can be developed, deployed, and scaled independently while the API Gateway provides a unified entry point for clients.
