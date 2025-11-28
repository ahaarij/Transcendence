# Docker Development Environment

## Quick Start (Mac/Linux)

### 1. Start the container:
```bash
./dev.sh start
```

### 2. Open an interactive terminal:
```bash
./dev.sh shell
```

Inside the container, you can run all npm commands:
```bash
npm start              # Start the server
npm install <package>  # Install packages
npm run prisma:studio  # Open Prisma Studio
```

## Available Commands

| Command | Description |
|---------|-------------|
| `./dev.sh start` | Start the development container |
| `./dev.sh stop` | Stop the container |
| `./dev.sh shell` | Open bash terminal in container |
| `./dev.sh logs` | View container logs |
| `./dev.sh restart` | Restart the container |
| `./dev.sh rebuild` | Rebuild and restart |
| `./dev.sh npm <cmd>` | Run npm command in container |
| `./dev.sh prisma <cmd>` | Run Prisma command in container |

## Examples

**Start development environment:**
```bash
./dev.sh start
./dev.sh shell
```

**Install a package:**
```bash
./dev.sh npm install bcryptjs
```

**Run Prisma Studio:**
```bash
./dev.sh prisma studio
```

**View logs:**
```bash
./dev.sh logs
```

## Features

✅ Hot reload - Code changes are reflected automatically
✅ Full npm access - All npm commands available
✅ Interactive terminal - Get a bash shell inside the container
✅ Volume mounting - Your code is mounted from host to container
✅ Port forwarding - Server accessible at http://localhost:3000

## Windows Users (WSL)

If you're using WSL, the script works the same way:
```bash
./dev.sh start
./dev.sh shell
```

## Troubleshooting

**Port already in use:**
```bash
./dev.sh stop
# Kill any local npm processes
pkill node
./dev.sh start
```

**Need to rebuild:**
```bash
./dev.sh rebuild
```

**Container not responding:**
```bash
./dev.sh stop
docker system prune -f
./dev.sh start
```
