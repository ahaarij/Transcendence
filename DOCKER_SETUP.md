# 42 Transcendence - Docker Setup

## Quick Start (Works on any Mac/Linux/Windows)

### 1. Start the project:
```bash
make
```

This will:
- Build Docker images for backend and frontend
- Start both services in containers
- Frontend available at: http://localhost:8080
- Backend API at: http://localhost:3000

### 2. Stop the project:
```bash
make down
```

### 3. View logs:
```bash
make logs
```

### 4. Restart services:
```bash
make restart
```

### 5. Clean everything and rebuild:
```bash
make re
```

## Available Commands

| Command | Description |
|---------|-------------|
| `make` or `make up` | Build and start all services |
| `make down` | Stop all services |
| `make logs` | View container logs |
| `make restart` | Restart services |
| `make clean` | Stop and remove all containers & volumes |
| `make status` | Show service status |
| `make shell-backend` | Open bash in backend container |
| `make shell-frontend` | Open shell in frontend container |
| `make re` | Clean and rebuild everything |

## What's Included

### Backend Container:
- Node.js 20
- TypeScript
- Fastify server
- Prisma ORM with SQLite
- JWT authentication
- All npm dependencies

### Frontend Container:
- Python HTTP server
- Your TypeScript frontend
- Serves on port 8080

## For 42 Abu Dhabi Macs

This Docker setup ensures the project runs identically on:
- ✅ 42 School Macs
- ✅ Your personal laptop
- ✅ Any Linux machine
- ✅ Windows with WSL/Docker Desktop

### Prerequisites on 42 Macs:
```bash
# Docker should already be installed
docker --version
docker-compose --version

# If not, install Docker Desktop for Mac
```

## Development Workflow

1. **First time setup:**
   ```bash
   make
   ```

2. **Make code changes:**
   - Backend code changes require: `make restart`
   - Frontend changes: Refresh browser (or `make restart`)

3. **View logs while developing:**
   ```bash
   make logs
   ```

4. **Access database (Prisma Studio):**
   ```bash
   make shell-backend
   npx prisma studio
   ```

5. **Reset everything:**
   ```bash
   make re
   ```

## Troubleshooting

**Port already in use:**
```bash
make down
# Kill any local processes
lsof -ti:3000,8080 | xargs kill -9
make
```

**Permission denied:**
```bash
sudo make
```

**Database issues:**
```bash
make shell-backend
npx prisma db push --force-reset
exit
make restart
```

**Clean slate:**
```bash
make clean
make
```

## Environment Variables

Create `.env` in `srcs/backend/` for production:
```bash
JWT_ACCESS_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
PORT=3000
NODE_ENV=production
```

## Network

All services run in a Docker network `transcendence-network`:
- Backend: `backend:3000`
- Frontend: `frontend:8080`
- Containers can communicate with each other by service name

## Data Persistence

SQLite database is persisted in a Docker volume `backend-data`, so your data survives container restarts.

---

**Ready to go!** Just run `make` and open http://localhost:8080 in your browser! 🚀
