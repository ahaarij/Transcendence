FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --only=production

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npx prisma generate

COPY main.ts ./
COPY shared ./shared
COPY auth ./auth
COPY user ./user
COPY .env* ./

RUN mkdir -p /app/prisma

RUN npx prisma db push --skip-generate || true

EXPOSE 3000

CMD ["npm", "start"]
