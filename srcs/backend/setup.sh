#!/bin/bash

# setup script for backend microservices
echo "🚀 starting transcendence backend services..."
echo ""

# changes to backend directory
cd "$(dirname "$0")"

# checks if dependencies installed
if [ ! -d "node_modules" ]; then
  echo "📦 installing backend dependencies..."
  npm install
  echo ""
fi

# checks if ws gateway deps installed
if [ ! -d "ws-gateway/node_modules" ]; then
  echo "📦 installing ws gateway dependencies..."
  cd ws-gateway
  npm install
  cd ..
  echo ""
fi

# checks if prisma client generated
if [ ! -d "node_modules/@prisma/client" ] || [ ! -d "node_modules/.prisma" ]; then
  echo "🗄️  generating prisma client..."
  npm run prisma:generate
  echo ""
fi

# checks if database exists
if [ ! -f "prisma/dev.db" ]; then
  echo "🗄️  creating database..."
  npm run prisma:push
  echo ""
fi

echo "✅ setup complete!"
echo ""
echo "to start all services with docker:"
echo "  docker-compose up --build"
echo ""
echo "or run services individually:"
echo "  npx tsx auth/server.ts     # auth on port 3001"
echo "  npx tsx user/server.ts     # user on port 3002"
echo "  npx tsx game/server.ts     # game on port 3003"
echo "  npx tsx ws-gateway/src/main.ts  # websocket on port 3004"
echo ""
echo "health check endpoints:"
echo "  auth:  http://localhost:3001/auth/health"
echo "  user:  http://localhost:3002/user/health"
echo "  game:  http://localhost:3003/game/health"
echo "  ws:    http://localhost:3004/ws/health"
echo ""
