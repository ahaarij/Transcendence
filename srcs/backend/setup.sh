#!/bin/bash

echo "🚀 Starting Transcendence Backend Services..."
echo ""

# Change to backend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/@prisma/client" ] || [ ! -d "node_modules/.prisma" ]; then
  echo "🗄️  Generating Prisma Client..."
  npm run prisma:generate
  echo ""
fi

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
  echo "🗄️  Creating database..."
  npm run prisma:push
  echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "To start the services:"
echo "  Terminal 1: npm run auth"
echo "  Terminal 2: npm run user"
echo ""
echo "Or run them in background:"
echo "  node auth/src/main.js &"
echo "  node user/src/main.js &"
echo ""
echo "Health check endpoints:"
echo "  Auth:  http://localhost:3001/auth/health"
echo "  User:  http://localhost:3002/user/health"
echo ""
