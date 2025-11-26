# 🚀 Transcendence Backend - Week 1 Complete Setup Guide
## Member A (Backend) - Architecture Documentation

**Project**: Transcendence Pong Game
**Module**: Backend Microservices
**Tech Stack**: Fastify, SQLite (via Prisma), Node.js
**Status**: ✅ Week 1 Complete

---

## 📋 Table of Contents

1. [Project Structure](#-project-structure)
2. [Installation & Setup](#-installation--setup)
3. [File-by-File Explanation](#-file-by-file-explanation)
4. [Running the Services](#-running-the-services)
5. [API Endpoints](#-api-endpoints)
6. [Database Schema](#-database-schema)
7. [Development Roadmap](#-development-roadmap)
8. [Troubleshooting](#-troubleshooting)

---

## 📁 Project Structure

```
backend/
├── auth/                      # Authentication microservice
│   └── src/
│       ├── main.js            # Auth service entry point
│       └── main.ts            # TypeScript version (optional)
│
├── user/                      # User management microservice
│   └── src/
│       ├── main.js            # User service entry point
│       └── main.ts            # TypeScript version (optional)
│
├── shared/                    # Shared code between services
│   ├── fastify.js             # Fastify server builder
│   ├── fastify.ts             # TypeScript version
│   └── utils/
│       ├── prisma.js          # Prisma database plugin
│       └── prisma.ts          # TypeScript version
│
├── prisma/                    # Database configuration
│   ├── schema.prisma          # Database schema definition
│   ├── dev.db                 # SQLite database file (generated)
│   └── migrations/            # Database migrations (auto-generated)
│
├── node_modules/              # Dependencies (auto-generated)
├── generated/                 # Prisma generated code (auto-generated)
├── .env                       # Environment variables
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies and scripts
├── prisma.config.ts          # Prisma 7 configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file!
```

---

## 🔧 Installation & Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Terminal**: Bash, Zsh, or similar

### Step 1: Install Dependencies

```bash
cd /path/to/Transcendence/srcs/backend
npm install
```

**What this does:**
- Installs all packages listed in `package.json`
- Downloads Fastify, Prisma, and all related dependencies
- Sets up better-sqlite3 for SQLite database access

### Step 2: Initialize Database

```bash
npm run prisma:push
npm run prisma:generate
```

**What this does:**
- `prisma:push`: Creates the SQLite database file and tables based on `schema.prisma`
- `prisma:generate`: Generates the Prisma Client code for TypeScript/JavaScript

### Step 3: Verify Setup

```bash
# Check if database was created
ls -la prisma/dev.db

# You should see the database file
```

---

## 📝 File-by-File Explanation

### Root Level Files

#### `package.json`
**Purpose**: Manages project dependencies and npm scripts

**Key Sections:**
```json
{
  "dependencies": {
    "@fastify/cors": "^11.1.0",       // CORS support for cross-origin requests
    "@fastify/jwt": "^10.0.0",        // JWT authentication (Week 2)
    "@prisma/client": "^7.0.0",       // Prisma database client
    "fastify": "^5.6.2",              // Fast web framework
    "fastify-plugin": "^5.0.1",       // Plugin system for Fastify
    "better-sqlite3": "^7.6.2"        // SQLite3 driver
  },
  "devDependencies": {
    "prisma": "^7.0.0",               // Prisma CLI tool
    "nodemon": "^3.1.11",             // Auto-restart on file changes
    "typescript": "^5.9.3"            // TypeScript compiler
  },
  "scripts": {
    "auth": "nodemon auth/src/main.js",     // Run auth service with auto-reload
    "user": "nodemon user/src/main.js",     // Run user service with auto-reload
    "prisma:push": "npx prisma db push",    // Sync database schema
    "prisma:studio": "npx prisma studio",   // Open database GUI
    "prisma:generate": "npx prisma generate" // Generate Prisma Client
  }
}
```

**Usage:**
- `npm run auth` - Starts the authentication service on port 3001
- `npm run user` - Starts the user service on port 3002
- `npm run prisma:studio` - Opens visual database browser

---

#### `.env`
**Purpose**: Stores environment variables (secrets, database URLs)

```bash
DATABASE_URL="file:./prisma/dev.db"
```

**What each line means:**
- `DATABASE_URL`: Path to the SQLite database file
  - `file:`: Protocol indicating local file
  - `./prisma/dev.db`: Relative path from backend folder

**Important**: Never commit this file with real secrets!

---

#### `tsconfig.json`
**Purpose**: TypeScript compiler configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",              // Use modern JavaScript features
    "module": "commonjs",            // Use Node.js module system
    "strict": true,                  // Enable all strict type-checking
    "esModuleInterop": true,         // Better ES6 module compatibility
    "skipLibCheck": true,            // Skip checking .d.ts files (faster)
    "outDir": "dist",                // Output compiled JS to dist/
    "moduleResolution": "node"       // Resolve modules like Node.js
  }
}
```

**Why these settings:**
- `commonjs`: Required for Node.js compatibility
- `strict`: Catches more bugs at compile time
- `esModuleInterop`: Allows `import` statements to work properly

---

#### `prisma.config.ts`
**Purpose**: Prisma 7 configuration file (replaces old .env approach)

```typescript
import "dotenv/config";                    // Load .env variables
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",          // Where schema file is located
  migrations: {
    path: "prisma/migrations",             // Where to store migration files
  },
  datasource: {
    url: env("DATABASE_URL"),              // Database connection URL
  },
});
```

**What's new in Prisma 7:**
- Configuration moved from `.env` to TypeScript file
- More programmatic control over settings
- Better TypeScript integration

---

### Database Files

#### `prisma/schema.prisma`
**Purpose**: Defines your database structure (tables, relationships)

```prisma
generator client {
  provider = "prisma-client-js"            // Generate JavaScript/TypeScript client
}

datasource db {
  provider = "sqlite"                      // Use SQLite database
}

// User table - stores all user accounts
model User {
  id        Int      @id @default(autoincrement())  // Auto-incrementing primary key
  email     String   @unique                         // Unique email address
  password  String?                                  // Password hash (nullable for OAuth)
  createdAt DateTime @default(now())                // Auto-set creation timestamp
}
```

**Understanding the syntax:**
- `model User`: Creates a table called "User"
- `@id`: Marks this field as the primary key
- `@default(autoincrement())`: Automatically generates increasing IDs
- `@unique`: Ensures no duplicate emails
- `String?`: The `?` means this field can be null
- `@default(now())`: Automatically sets current date/time

**Why this structure:**
- Simple for Week 1
- Will be expanded in Week 2 with more fields (username, avatar, etc.)
- Will add Game model in Week 3

---

### Shared Code

#### `shared/fastify.js`
**Purpose**: Creates a configured Fastify server instance

```javascript
const Fastify = require("fastify");              // Import Fastify framework
const cors = require("@fastify/cors");           // Import CORS plugin

function buildServer() {
  // Create Fastify instance with logging enabled
  const app = Fastify({ logger: true });

  // Register CORS plugin (allows frontend to make requests)
  app.register(cors, { origin: "*" });           // "*" = allow all origins (dev only!)

  return app;                                    // Return configured server
}

module.exports = { buildServer };                // Export for use in services
```

**Line-by-line breakdown:**
1. **`Fastify({ logger: true })`**: Creates server with built-in logging
   - Logs every request/response
   - Shows timing information
   - Helps with debugging

2. **`app.register(cors, { origin: "*" })`**: Enables Cross-Origin Resource Sharing
   - Allows frontend (React/Vue/etc) to call your API
   - `"*"` means allow ALL origins (⚠️ change in production!)
   - Required for frontend-backend communication

3. **`module.exports`**: Makes function available to other files

**Why a builder function:**
- Reusable across multiple services
- Consistent configuration
- Easy to add more plugins later (JWT, cookies, etc.)

---

#### `shared/utils/prisma.js`
**Purpose**: Prisma database plugin for Fastify

```javascript
const fp = require("fastify-plugin");                          // Plugin wrapper
const { PrismaClient } = require("@prisma/client");          // Prisma ORM
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const Database = require("better-sqlite3");                   // SQLite driver

// STEP 1: Create SQLite database connection
const db = new Database("./prisma/dev.db");

// STEP 2: Create Prisma adapter for SQLite
const adapter = new PrismaBetterSqlite3(db);

// STEP 3: Create Prisma Client with adapter
const prisma = new PrismaClient({ adapter });

// STEP 4: Export as Fastify plugin
module.exports = fp(async (fastify) => {
  // Add `prisma` to fastify instance
  fastify.decorate("prisma", prisma);
  
  // Clean up connection when server closes
  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
```

**Detailed explanation:**

**STEP 1 - Create SQLite Connection:**
```javascript
const db = new Database("./prisma/dev.db");
```
- Opens the SQLite database file
- Creates it if it doesn't exist
- Returns a database handle

**STEP 2 - Create Adapter:**
```javascript
const adapter = new PrismaBetterSqlite3(db);
```
- **Why needed**: Prisma 7 requires an adapter to connect to databases
- **What it does**: Translates Prisma queries to SQLite commands
- **Alternative**: For PostgreSQL, you'd use a different adapter

**STEP 3 - Create Prisma Client:**
```javascript
const prisma = new PrismaClient({ adapter });
```
- Creates the main Prisma object
- Passes the SQLite adapter
- Now you can use `prisma.user.findMany()`, etc.

**STEP 4 - Fastify Plugin:**
```javascript
fastify.decorate("prisma", prisma);
```
- **`decorate`**: Adds property to Fastify instance
- Now in routes you can do: `fastify.prisma.user.create(...)`
- Available everywhere in your app

```javascript
fastify.addHook("onClose", async () => {
  await prisma.$disconnect();
});
```
- **`addHook`**: Runs code at specific lifecycle events
- **`onClose`**: Triggered when server shuts down
- **`$disconnect()`**: Closes database connection properly
- Prevents database locks and corruption

---

### Microservices

#### `auth/src/main.js`
**Purpose**: Authentication microservice entry point

```javascript
const { buildServer } = require("../../shared/fastify");     // Get server builder
const jwt = require("@fastify/jwt");                         // JWT plugin
const prismaPlugin = require("../../shared/utils/prisma");   // Database plugin

async function start() {
  // STEP 1: Create Fastify server
  const app = buildServer();

  // STEP 2: Register JWT plugin
  await app.register(jwt, { secret: "dev-secret" });

  // STEP 3: Register Prisma database plugin
  await app.register(prismaPlugin);

  // STEP 4: Define health check endpoint
  app.get("/auth/health", async () => ({ 
    status: "ok", 
    service: "auth" 
  }));

  // STEP 5: Start listening for requests
  try {
    await app.listen({ port: 3001, host: "0.0.0.0" });
    console.log("✅ Auth service running on http://localhost:3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();  // Run the function
```

**Detailed breakdown:**

**STEP 1 - Create Server:**
```javascript
const app = buildServer();
```
- Calls our shared builder function
- Returns configured Fastify instance
- Already has CORS enabled

**STEP 2 - JWT Plugin:**
```javascript
await app.register(jwt, { secret: "dev-secret" });
```
- **`jwt`**: JSON Web Tokens for authentication
- **`secret`**: Key used to sign tokens (⚠️ use env variable in production!)
- **Week 2**: Will use this to create login tokens

**STEP 3 - Database Plugin:**
```javascript
await app.register(prismaPlugin);
```
- Adds `app.prisma` for database access
- Connects to SQLite
- **Week 2**: Will use for user lookups

**STEP 4 - Health Check:**
```javascript
app.get("/auth/health", async () => ({ 
  status: "ok", 
  service: "auth" 
}));
```
- **`app.get`**: Defines a GET endpoint
- **`/auth/health`**: URL path
- **`async () => {}`**: Handler function
- Returns JSON: `{"status":"ok","service":"auth"}`
- Used to check if service is running

**STEP 5 - Start Server:**
```javascript
await app.listen({ port: 3001, host: "0.0.0.0" });
```
- **`port: 3001`**: Listen on port 3001
- **`host: "0.0.0.0"`**: Accept connections from anywhere
  - Required for Docker
  - `localhost` would only accept local connections

**Error Handling:**
```javascript
try { ... } catch (err) {
  app.log.error(err);
  process.exit(1);
}
```
- If server fails to start, log error and exit
- `process.exit(1)`: Exit code 1 = error

---

#### `user/src/main.js`
**Purpose**: User management microservice

```javascript
const { buildServer } = require("../../shared/fastify");
const prismaPlugin = require("../../shared/utils/prisma");

async function start() {
  const app = buildServer();

  // Register database plugin
  await app.register(prismaPlugin);

  // Health check endpoint
  app.get("/user/health", async () => ({ 
    status: "ok", 
    service: "user" 
  }));

  // Start server on port 3002
  try {
    await app.listen({ port: 3002, host: "0.0.0.0" });
    console.log("✅ User service running on http://localhost:3002");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
```

**Key differences from auth service:**
1. **No JWT plugin**: User service doesn't authenticate, just manages data
2. **Port 3002**: Different port so both can run simultaneously
3. **Different endpoint**: `/user/health` instead of `/auth/health`

**Week 2 additions will include:**
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile
- `GET /users/:id` - Get any user by ID
- `POST /users/me/avatar` - Upload avatar

---

## 🏃 Running the Services

### Method 1: Development Mode (with nodemon)

**Terminal 1 - Auth Service:**
```bash
npm run auth
```

**Terminal 2 - User Service:**
```bash
npm run user
```

**What you'll see:**
```
[nodemon] starting `node auth/src/main.js`
{"level":30,"time":1732645678,"msg":"Server listening at http://localhost:3001"}
✅ Auth service running on http://localhost:3001
```

**Advantages:**
- Auto-restarts when you edit files
- Fast development workflow
- See logs in real-time

### Method 2: Direct Execution

**Auth Service:**
```bash
node auth/src/main.js
```

**User Service:**
```bash
node user/src/main.js
```

**When to use:**
- Quick testing
- Production deployment
- When nodemon causes issues

### Method 3: Background Processes

```bash
node auth/src/main.js &
node user/src/main.js &
```

**To stop:**
```bash
# Find process IDs
ps aux | grep "node auth"
ps aux | grep "node user"

# Kill them
kill <PID>
```

---

## 🔌 API Endpoints

### Auth Service (Port 3001)

#### `GET /auth/health`
**Purpose**: Check if auth service is running

**Request:**
```bash
curl http://localhost:3001/auth/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "auth"
}
```

**Use case**: Health checks, monitoring, Docker readiness probes

---

### User Service (Port 3002)

#### `GET /user/health`
**Purpose**: Check if user service is running

**Request:**
```bash
curl http://localhost:3002/user/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "user"
}
```

---

## 🗄️ Database Schema

### Current Schema (Week 1)

**User Table:**
| Column    | Type     | Constraints | Description |
|-----------|----------|-------------|-------------|
| id        | INTEGER  | PRIMARY KEY, AUTO INCREMENT | Unique user ID |
| email     | TEXT     | UNIQUE, NOT NULL | User's email |
| password  | TEXT     | NULLABLE | Password hash |
| createdAt | DATETIME | DEFAULT NOW | Account creation time |

### Planned Additions (Week 2+)

**Week 2 - User System:**
- `username` - Display name
- `displayName` - Full name
- `avatar` - Profile picture URL
- `googleId` - Google OAuth ID
- `language` - Preferred language

**Week 3 - Game History:**
- New `Game` table
- `player1Id`, `player2Id` - Foreign keys to User
- `player1Score`, `player2Score` - Match results
- `isAiGame` - Boolean for AI matches

**Week 4 - 2FA:**
- `twoFactorEnabled` - Boolean
- `twoFactorSecret` - TOTP secret key

---

## 📅 Development Roadmap

### ✅ Week 1 - COMPLETED
- [x] Fastify project structure
- [x] SQLite database with Prisma
- [x] Auth service skeleton
- [x] User service skeleton
- [x] Health check endpoints
- [x] Database connection working

### 🚧 Week 2 - User System + Google Auth
- [ ] Full signup/login logic in Auth service
- [ ] Password hashing with bcrypt
- [ ] JWT token issuing
- [ ] Refresh token flow
- [ ] Google Sign-In server verification
- [ ] User CRUD endpoints in User service
- [ ] Profile updates (username, avatar, language)

### 🚧 Week 3 - Game Integration
- [ ] Game microservice
- [ ] Store match results in database
- [ ] Link games to users
- [ ] Match history endpoint
- [ ] WebSocket server (for real-time gameplay)

### 🚧 Week 4 - Security + Polish
- [ ] 2FA implementation (TOTP)
- [ ] Split into true microservices
- [ ] Service-to-service authentication
- [ ] Rate limiting
- [ ] Input validation
- [ ] Error handling middleware

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Find process using the port
lsof -i :3001

# Kill it
kill -9 <PID>

# Or use different port in .env
AUTH_PORT=3011
```

---

### Database Lock Error

**Error:**
```
SqliteError: database is locked
```

**Solution:**
```bash
# Close all connections
pkill -f node

# Delete lock file
rm prisma/dev.db-journal

# Restart services
```

---

### Prisma Client Not Generated

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
cd /path/to/backend
npm run prisma:generate
```

---

### Module Not Found

**Error:**
```
Cannot find module '../../shared/fastify'
```

**Solution:**
- Check your current directory with `pwd`
- Make sure you're running from `/backend` folder
- Check file paths are correct

---

## 📚 Additional Resources

### Fastify Documentation
- Official Docs: https://www.fastify.io/
- Plugins: https://www.fastify.io/ecosystem/
- Best Practices: https://www.fastify.io/docs/latest/Guides/

### Prisma Documentation
- Getting Started: https://www.prisma.io/docs/getting-started
- Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- Prisma 7 Changes: https://www.prisma.io/docs/guides/upgrade-guides/upgrading-to-prisma-7

### SQLite
- SQL Syntax: https://www.sqlite.org/lang.html
- CLI Tools: https://www.sqlite.org/cli.html

---

## 👤 Credits

**Team Member**: Member A (Backend)
**Project**: 42 Transcendence
**Date**: November 2025
**Status**: Week 1 Complete ✅

---

## 📞 Need Help?

If you're stuck:
1. Check this README thoroughly
2. Read error messages carefully
3. Try the troubleshooting section
4. Ask your teammates (Member B, Member C)
5. Check official documentation links above

**Happy coding! 🚀**

# Navigate to backend
cd srcs/backend

# Start auth service
npm run auth

# In another terminal, test it
curl http://localhost:3001/auth/health
# Response: {"status":"ok","service":"auth"}

# Start user service
npm run user

# Test it
curl http://localhost:3002/user/health
# Response: {"status":"ok","service":"user"}