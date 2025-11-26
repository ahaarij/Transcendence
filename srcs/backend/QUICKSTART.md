# Quick Start Guide

## 🎯 Week 1 - Member A Tasks ✅

All Week 1 tasks are complete!

- ✅ Setup Fastify project structure
- ✅ Setup SQLite models (Prisma)  
- ✅ Create Auth microservice skeleton
- ✅ Create User microservice skeleton
- ✅ Working database connection

## 🚀 Quick Start

### 1. First Time Setup
```bash
cd srcs/backend
./setup.sh
```

### 2. Start Services

**Terminal 1 (Auth Service):**
```bash
npm run auth
```

**Terminal 2 (User Service):**
```bash
npm run user
```

### 3. Test Services
```bash
curl http://localhost:3001/auth/health
curl http://localhost:3002/user/health
```

Expected response:
```json
{"status":"ok","service":"auth"}
{"status":"ok","service":"user"}
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `README.md` | Complete documentation with detailed explanations |
| `auth/src/main.js` | Authentication service (port 3001) |
| `user/src/main.js` | User management service (port 3002) |
| `shared/fastify.js` | Reusable Fastify server builder |
| `shared/utils/prisma.js` | Database connection plugin |
| `prisma/schema.prisma` | Database schema definition |
| `.env` | Environment variables (DATABASE_URL) |
| `package.json` | Dependencies and npm scripts |

## 🔧 Useful Commands

```bash
# Start auth service
npm run auth

# Start user service  
npm run user

# Regenerate Prisma Client
npm run prisma:generate

# Sync database schema
npm run prisma:push

# Open database browser
npm run prisma:studio

# Stop all services
pkill -f "node auth"
pkill -f "node user"
```

## 📊 Architecture

```
Frontend (Member B)  ←→  Backend Services (Member A)  ←→  SQLite Database
                          ├─ Auth Service (3001)
                          ├─ User Service (3002)
                          └─ [Game Service (3003)] Week 3
```

## 🗓️ Next Steps (Week 2)

### Auth Service
- [ ] Implement `/auth/register` endpoint
- [ ] Implement `/auth/login` endpoint  
- [ ] Add password hashing (bcrypt)
- [ ] Generate JWT tokens
- [ ] Add refresh token flow
- [ ] Implement Google Sign-In

### User Service
- [ ] Implement `/users/me` (get profile)
- [ ] Implement `/users/me` PATCH (update profile)
- [ ] Implement `/users/:id` (get any user)
- [ ] Add avatar upload endpoint
- [ ] Add user search

### Database
- [ ] Add username, displayName fields
- [ ] Add googleId for OAuth
- [ ] Add language preference
- [ ] Add avatar URL field

## 📖 Full Documentation

See `README.md` for complete file-by-file explanations!

## ❓ Troubleshooting

**Services won't start:**
```bash
# Check if ports are in use
lsof -i :3001
lsof -i :3002

# Kill existing processes
pkill -f node
```

**Database errors:**
```bash
# Regenerate everything
npm run prisma:generate
npm run prisma:push
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📞 Need Help?

1. Check `README.md` for detailed explanations
2. Review error messages carefully
3. Ask teammates (Member B/C)
4. Check official docs:
   - Fastify: https://www.fastify.io/
   - Prisma: https://www.prisma.io/docs

---

**Status**: Week 1 Complete ✅  
**Ready for**: Week 2 development
