all: up

up:
	npx tsc
	@echo "🐳 Building and starting Transcendence..."
	cd srcs && docker-compose up --build -d
	@echo ""
	@echo "✅ Services started!"
	@echo "📱 Frontend: http://localhost:8080"
	@echo "🔐 Backend API: http://localhost:3000"
	@echo ""

down:
	@echo "🛑 Stopping all services..."
	cd srcs && docker-compose down

logs:
	cd srcs && docker-compose logs -f

restart:
	@echo "♻️  Restarting services..."
	cd srcs && docker-compose restart

clean:
	@echo "🧹 Cleaning Docker resources..."
	cd srcs && docker-compose down -v
	docker system prune -f

data:
	@echo "🗄️  Setting up database..."
	@sleep 3
	docker exec transcendence-backend npx prisma db push
	docker restart transcendence-backend
	@echo "✅ Database ready!"

status:
	cd srcs && docker-compose ps

shell-backend:
	docker exec -it transcendence-backend /bin/bash

shell-frontend:
	docker exec -it transcendence-frontend /bin/sh

re: clean all data

.PHONY: all up down logs restart clean data status shell-backend shell-frontend re