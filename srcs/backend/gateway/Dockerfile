FROM node:20-alpine

WORKDIR /app

# copies package files
COPY package*.json ./

# installs dependencies
RUN npm install

# copies source code
COPY . .

# generates prisma client
RUN npx prisma generate

# exposes gateway port
EXPOSE 3000

# starts api gateway
CMD ["npx", "ts-node", "gateway/server.ts"]
