# user service dockerfile
FROM node:20-alpine

# sets working directory
WORKDIR /app

# copies package files
COPY package*.json ./

# installs dependencies
RUN npm ci --only=production

# copies all needed source code
COPY user/ ./user/
COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# generates prisma client
RUN npx prisma generate

# exposes user service port
EXPOSE 3002

# starts user microservice
CMD ["npx", "tsx", "user/service.ts"]
