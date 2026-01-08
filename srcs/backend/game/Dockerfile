FROM node:20-alpine

# sets working directory in container
WORKDIR /app

# copies package files for dependencies
COPY package*.json ./

# installs all dependencies
RUN npm ci --only=production

# copies game service source code
COPY game/ ./game/
COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# generates prisma client for database
RUN npx prisma generate

# exposes game service port
EXPOSE 3003

# starts the game microservice
CMD ["npx", "tsx", "game/service.ts"]
