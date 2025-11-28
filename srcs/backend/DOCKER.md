# 🐳 Docker Setup Guide

## Quick Start with Docker

### 1. Build and Start All Services
```bash
cd srcs/backend
docker-compose up --build
```

### 2. Run in Background (Detached Mode)
```bash
docker-compose up -d
```

### 3. Check Status
```bash
docker-compose ps
```

### 4. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth
docker-compose logs -f user
```

### 5. Stop Services
```bash
docker-compose down
```

### 6. Stop and Remove Volumes (Clean Slate)
```bash
docker-compose down -v
```

## Test Endpoints

```bash
# Auth service
curl http://localhost:3001/auth/health

# User service
curl http://localhost:3002/user/health
```

## Docker Commands Reference

```bash
# Rebuild specific service
docker-compose build auth
docker-compose build user

# Restart specific service
docker-compose restart auth
docker-compose restart user

# Execute command in running container
docker-compose exec auth sh
docker-compose exec user sh

# View container logs
docker logs transcendence-auth
docker logs transcendence-user

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
│                                         │
│  ┌──────────────┐   ┌──────────────┐  │
│  │ Auth Service │   │ User Service │  │
│  │   Port 3001  │   │   Port 3002  │  │
│  └──────┬───────┘   └──────┬───────┘  │
│         │                  │           │
│         └──────┬───────────┘           │
│                │                       │
│        ┌───────▼────────┐              │
│        │ SQLite Volume  │              │
│        │   (Shared DB)  │              │
│        └────────────────┘              │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3001
lsof -i :3002

# Kill the process
kill -9 <PID>

# Or stop local services
pkill -f "node auth"
pkill -f "node user"
```

### Database Issues
```bash
# Remove volumes and restart
docker-compose down -v
docker-compose up --build
```

### Container Won't Start
```bash
# Check logs
docker-compose logs auth
docker-compose logs user

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Week 1 Complete! ✅

All requirements fulfilled:
- ✅ Fastify project structure
- ✅ SQLite models (Prisma)
- ✅ Auth microservice skeleton
- ✅ User microservice skeleton
- ✅ Docker + docker-compose
