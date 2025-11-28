# User Service Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY user/ ./user/
COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY .env ./

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3002

# Start service
CMD ["node", "user/src/main.js"]
