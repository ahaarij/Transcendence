# auth service dockerfile
FROM node:20-alpine

# sets working directory
WORKDIR /app

# copies package files
COPY package*.json ./

# installs dependencies
RUN npm ci --only=production

# copies all needed source code
COPY auth/ ./auth/
COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# generates prisma client (dummy DATABASE_URL for build time only)
ENV DATABASE_URL="file:/app/data/dev.db"
RUN npx prisma generate

# exposes auth service port
EXPOSE 3001

# starts auth microservice
CMD ["npx", "tsx", "auth/service.ts"]
