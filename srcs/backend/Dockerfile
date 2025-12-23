FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including tsx for running TypeScript)
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./

# Set DATABASE_URL for Prisma during build
ENV DATABASE_URL="file:./prisma/dev.db"

RUN npx prisma generate

COPY . .

# Ensure prisma schema is in place after COPY . .
COPY prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
