FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including tsx for running TypeScript)
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY .env* ./

# Set DATABASE_URL for Prisma during build
ENV DATABASE_URL="file:./prisma/dev.db"

RUN npx prisma generate

COPY main.ts ./
COPY shared ./shared
COPY auth ./auth
COPY user ./user

RUN mkdir -p /app/prisma

# Push database schema at startup, not build time
RUN npx prisma db push --skip-generate || true

EXPOSE 3000

CMD ["npm", "start"]
