all: up

up:
	@echo "🐳 Building and starting Transcendence..."
	cd srcs && docker-compose --env-file ../.env up --build -d
	@echo ""
	@echo "✅ Services started!"
	@echo "📱 Frontend: http://localhost:8080"
	@echo "🔐 Backend API: http://localhost:3000"
	@echo ""

down:
	@echo "🛑 Stopping all services..."
	cd srcs && docker-compose --env-file ../.env down

logs:
	cd srcs && docker-compose --env-file ../.env logs -f

restart:
	@echo "♻️  Restarting services..."
	cd srcs && docker-compose --env-file ../.env restart

clean:
	@echo "🧹 Cleaning Docker resources..."
	cd srcs && docker-compose --env-file ../.env down -v
	docker system prune -f

data:
	@echo "🗄️  Setting up database..."
	@sleep 3
# 	@ping -n 4 127.0.0.1 > nul // this to make work on windows
	docker exec transcendence-backend npx prisma db push
	docker restart transcendence-backend
	@echo "✅ Database ready!"

status:
	cd srcs && docker-compose --env-file ../.env ps

shell-backend:
	docker exec -it transcendence-backend /bin/bash

shell-frontend:
	docker exec -it transcendence-frontend /bin/sh

re: clean all data

.PHONY: all up down logs restart clean data status shell-backend shell-frontend re