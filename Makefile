all: up

ssl:
	@echo "🔒 Generating SSL certificates..."
	@cd srcs/nginx && ./generate-ssl-cert.sh
	@echo ""

up: ssl
	@echo "🐳 Building and starting Transcendence..."
	cd srcs && docker compose --env-file ../.env up --build -d
	@echo ""
	@echo "✅ Services started!"
	@echo "🌐 Frontend: https://localhost:8443"
	@echo "🔐 Backend API: https://localhost:8443"
	@echo "⚠️  Note: Accept browser security warning for self-signed certificate"
	@echo ""

down:
	@echo "🛑 Stopping all services..."
	cd srcs && docker compose --env-file ../.env down

logs:
	cd srcs && docker compose --env-file ../.env logs -f

restart:
	@echo "♻️  Restarting services..."
	cd srcs && docker compose --env-file ../.env restart

clean:
	@echo "🧹 Cleaning Docker resources..."
	cd srcs && docker compose --env-file ../.env down -v
	docker system prune -f

fclean: clean
	@echo "🗑️  Removing SSL certificates..."
	rm -f srcs/nginx/ssl/server.crt srcs/nginx/ssl/server.key
	@echo "✅ Full clean complete!"

data:
	@echo "🗄️  Setting up database..."
	@sleep 3
# 	@ping -n 4 127.0.0.1 > nul // this to make work on windows
	docker exec transcendence-backend npx prisma db push --accept-data-loss
	docker restart transcendence-backend
	@echo "✅ Database ready!"

status:
	cd srcs && docker compose --env-file ../.env ps

shell-backend:
	docfclean all data

.PHONY: all ssl up down logs restart clean f
	docker exec -it transcendence-frontend /bin/sh

re: clean all data

.PHONY: all up down logs restart clean data status shell-backend shell-frontend re